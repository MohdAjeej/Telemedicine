import crypto from 'node:crypto';
import ms from 'ms';
import type { Role } from '@telemedicine/constants';
import { ApiError } from '../../helpers/ApiError';
import { compareValue, hashToken, hashValue } from '../../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { recordAuditLog } from '../audit-log/auditLog.service';
import { env } from '../../config/env';
import { hospitalRepository } from '../hospital/hospital.repository';
import { adminRepository } from '../admin/admin.repository';
import { doctorRepository } from '../doctor/doctor.repository';
import { healthOfficerRepository } from '../health-officer/healthOfficer.repository';
import { patientRepository } from '../patient/patient.repository';
import { authRepository } from './auth.repository';
import type { HydratedUser } from './user.model';
import type {
  LoginInput,
  RegisterAdminInput,
  RegisterInput,
  RequestMeta,
  SanitizedUser,
  TokenPair,
} from './auth.types';

function sanitizeUser(user: HydratedUser): SanitizedUser {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    status: user.status,
  };
}

/**
 * Extracts a plain ObjectId hex string from a `hospitalId` field that may or
 * may not have been populated into a full Hospital document by the
 * repository's `findByUserId` (doctor/patient populate it, admin/health
 * officer don't). Mongoose documents have their own `toString()` that
 * pretty-prints the whole document, so calling `.toString()` directly on a
 * populated ref silently produces garbage instead of the id.
 */
function extractHospitalId(hospitalId: unknown): string | undefined {
  if (!hospitalId) return undefined;
  const ref = hospitalId as { _id?: unknown };
  return ref._id ? String(ref._id) : String(hospitalId);
}

/**
 * Looks up the caller's hospitalId from their role-specific profile so it can
 * be embedded in the access token — the only place the JWT's hospitalId claim
 * comes from downstream (register/registerAdmin already know it directly and
 * skip this lookup).
 */
async function resolveHospitalId(userId: string, role: Role): Promise<string | undefined> {
  switch (role) {
    case 'admin': {
      const admin = await adminRepository.findByUserId(userId);
      return extractHospitalId(admin?.hospitalId);
    }
    case 'doctor': {
      const doctor = await doctorRepository.findByUserId(userId);
      return extractHospitalId(doctor?.hospitalId);
    }
    case 'health_officer': {
      const officer = await healthOfficerRepository.findByUserId(userId);
      return extractHospitalId(officer?.hospitalId);
    }
    case 'patient': {
      const patient = await patientRepository.findByUserId(userId);
      return extractHospitalId(patient?.hospitalId);
    }
    default:
      return undefined;
  }
}

async function issueTokenPair(
  userId: string,
  role: Role,
  hospitalId: string | undefined,
  meta: RequestMeta,
  family: string = crypto.randomUUID(),
): Promise<TokenPair & { jti: string }> {
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: userId, jti, family });
  const accessToken = signAccessToken({ sub: userId, role, hospitalId, jti });

  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt.getTime() + ms(env.JWT_REFRESH_EXPIRES_IN));

  await authRepository.createSession({
    userId,
    refreshTokenHash: hashToken(refreshToken),
    jti,
    family,
    userAgent: meta.userAgent,
    ip: meta.ip,
    issuedAt,
    expiresAt,
  });

  return { accessToken, refreshToken, jti };
}

export const authService = {
  /**
   * Public self-registration — patient only (see auth.types.ts). Creates the
   * User and Patient profile together and logs the patient in immediately:
   * this system has no email verification step to gate on.
   */
  async register(
    input: RegisterInput,
    meta: RequestMeta,
  ): Promise<{ user: SanitizedUser; tokens: TokenPair }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const hospital = await hospitalRepository.findById(input.hospitalId);
    if (!hospital) {
      throw ApiError.badRequest('Selected hospital does not exist');
    }

    const passwordHash = await hashValue(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: 'patient',
      hospitalId: input.hospitalId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    try {
      await patientRepository.create({
        userId: user._id.toString(),
        hospitalId: input.hospitalId,
        age: input.age,
      });
    } catch (error) {
      await authRepository.deleteUser(user._id.toString());
      throw error;
    }

    const { jti: _jti, ...tokens } = await issueTokenPair(
      user._id.toString(),
      user.role,
      input.hospitalId,
      meta,
    );

    await recordAuditLog({
      actorId: user._id.toString(),
      hospitalId: input.hospitalId,
      action: 'user.register',
      entityType: 'User',
      entityId: user._id.toString(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { user: sanitizeUser(user), tokens };
  },

  /**
   * Creates a new Hospital and its owning Admin account together, then logs
   * the admin in immediately. "One Admin manages exactly one Hospital" —
   * this is the only way a Hospital (and its first Admin) comes into being.
   */
  async registerAdmin(
    input: RegisterAdminInput,
    meta: RequestMeta,
  ): Promise<{ user: SanitizedUser; tokens: TokenPair }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const hospital = await hospitalRepository.create({
      name: input.hospitalName,
      registrationNumber: `HOSP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      type: 'hospital',
      phone: '',
      email: input.email,
    });

    const passwordHash = await hashValue(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: 'admin',
      hospitalId: hospital._id.toString(),
      // No name field in the registration spec — filled in later via the
      // Hospital Profile / account settings screen if the admin wants it.
      firstName: 'Hospital',
      lastName: 'Administrator',
    });

    try {
      await adminRepository.updateByUserId(user._id.toString(), {
        hospitalId: hospital._id.toString(),
        permissions: ['*'],
      });
    } catch (error) {
      await authRepository.deleteUser(user._id.toString());
      await hospitalRepository.delete(hospital._id.toString());
      throw error;
    }

    const { jti: _jti, ...tokens } = await issueTokenPair(
      user._id.toString(),
      user.role,
      hospital._id.toString(),
      meta,
    );

    await recordAuditLog({
      actorId: user._id.toString(),
      hospitalId: hospital._id.toString(),
      action: 'admin.register',
      entityType: 'Hospital',
      entityId: hospital._id.toString(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { user: sanitizeUser(user), tokens };
  },

  /**
   * Admin-initiated account creation (Doctor/Health Officer/Patient
   * management screens). The admin chooses the password directly — there is
   * no invite-email step in this system.
   */
  async provisionAccount(input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
    hospitalId: string;
  }): Promise<SanitizedUser> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashValue(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: input.role,
      hospitalId: input.hospitalId,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    return sanitizeUser(user);
  },

  async login(
    input: LoginInput,
    meta: RequestMeta,
  ): Promise<{ user: SanitizedUser; tokens: TokenPair }> {
    const user = await authRepository.findUserByEmail(input.email, true);
    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw ApiError.forbidden('This account has been suspended');
    }

    const passwordMatches = await compareValue(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const hospitalId = await resolveHospitalId(user._id.toString(), user.role);
    const { jti: _jti, ...tokens } = await issueTokenPair(
      user._id.toString(),
      user.role,
      hospitalId,
      meta,
    );

    await authRepository.touchLastLogin(user._id.toString());

    await recordAuditLog({
      actorId: user._id.toString(),
      hospitalId,
      action: 'user.login',
      entityType: 'User',
      entityId: user._id.toString(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { user: sanitizeUser(user), tokens };
  },

  async refresh(refreshToken: string, meta: RequestMeta): Promise<{ user: SanitizedUser; tokens: TokenPair }> {
    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw ApiError.unauthorized('Invalid or expired refresh token');
    }

    const session = await authRepository.findSessionByJti(payload.jti);

    if (!session || session.refreshTokenHash !== hashToken(refreshToken)) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    if (session.revokedAt) {
      // The token behind this session was already rotated out (or logged
      // out) but is being presented again — that's a signal of token theft.
      // Revoke every session in the rotation family to cut off the thief.
      await authRepository.revokeFamily(session.family);
      throw ApiError.unauthorized('Refresh token reuse detected; all sessions revoked');
    }

    if (session.expiresAt.getTime() < Date.now()) {
      throw ApiError.unauthorized('Refresh token expired');
    }

    const user = await authRepository.findUserById(session.userId.toString());
    if (!user || user.status === 'suspended') {
      throw ApiError.unauthorized('Account is not active');
    }

    const hospitalId = await resolveHospitalId(user._id.toString(), user.role);
    const { jti: _newJti, ...tokens } = await issueTokenPair(
      user._id.toString(),
      user.role,
      hospitalId,
      meta,
      session.family,
    );
    const newSession = await authRepository.findSessionByJti(_newJti);
    await authRepository.revokeSession(session._id.toString(), newSession?._id.toString());

    return { user: sanitizeUser(user), tokens };
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;

    try {
      const payload = verifyRefreshToken(refreshToken);
      const session = await authRepository.findSessionByJti(payload.jti);
      if (session && !session.revokedAt) {
        await authRepository.revokeSession(session._id.toString());
      }
    } catch {
      // Already-invalid refresh token on logout is a no-op, not an error.
    }
  },

  async getMe(userId: string): Promise<SanitizedUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return sanitizeUser(user);
  },

  /** Self-service account-detail edit (name/phone) — available to every role, unlike the role-specific /me endpoints which only touch the Doctor/Patient/HealthOfficer sub-profile. */
  async updateMe(
    userId: string,
    input: { firstName?: string; lastName?: string; phone?: string },
  ): Promise<SanitizedUser> {
    const user = await authRepository.updateUser(userId, input);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return sanitizeUser(user);
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await authRepository.findUserByIdWithPassword(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const matches = await compareValue(currentPassword, user.passwordHash);
    if (!matches) {
      throw ApiError.unauthorized('Current password is incorrect');
    }

    const passwordHash = await hashValue(newPassword);
    await authRepository.updatePassword(userId, passwordHash);
  },

  /** Compensating action if profile-document creation fails right after provisionAccount(). */
  async deleteAccount(userId: string): Promise<void> {
    await authRepository.deleteUser(userId);
    await authRepository.revokeAllSessionsForUser(userId);
  },

  async setAccountStatus(userId: string, status: 'active' | 'suspended'): Promise<SanitizedUser> {
    const user = await authRepository.setUserStatus(userId, status);
    if (!user) throw ApiError.notFound('User not found');
    if (status === 'suspended') {
      await authRepository.revokeAllSessionsForUser(userId);
    }
    return sanitizeUser(user);
  },

  /** Admin "User Management" listing — every role within the caller's own hospital, in one paginated, filterable view. */
  async listUsers(query: {
    page?: number;
    limit?: number;
    role?: Role;
    status?: 'active' | 'suspended';
    search?: string;
    hospitalId: string;
  }) {
    const result = await authRepository.findManyUsers(query);
    return { ...result, items: result.items.map(sanitizeUser) };
  },
};
