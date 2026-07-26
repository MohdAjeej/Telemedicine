import crypto from 'node:crypto';
import ms from 'ms';
import type { Role } from '@telemedicine/constants';
import { ApiError } from '../../helpers/ApiError';
import { compareValue, generateOpaqueToken, hashToken, hashValue } from '../../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { sendPasswordResetEmail, sendVerificationEmail, sendWelcomeSetPasswordEmail } from '../../utils/mailer';
import { recordAuditLog } from '../audit-log/auditLog.service';
import { env } from '../../config/env';
import { authRepository } from './auth.repository';
import type { HydratedUser } from './user.model';
import type { LoginInput, RegisterInput, RequestMeta, SanitizedUser, TokenPair } from './auth.types';

const EMAIL_VERIFICATION_TTL_MS = ms('24h');
const RESET_PASSWORD_TTL_MS = ms('1h');

function sanitizeUser(user: HydratedUser): SanitizedUser {
  return {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    isEmailVerified: user.isEmailVerified,
    status: user.status,
  };
}

async function issueTokenPair(
  userId: string,
  role: Role,
  meta: RequestMeta,
  family: string = crypto.randomUUID(),
): Promise<TokenPair & { jti: string }> {
  const jti = crypto.randomUUID();
  const refreshToken = signRefreshToken({ sub: userId, jti, family });
  const accessToken = signAccessToken({ sub: userId, role, jti });

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
  async register(input: RegisterInput, meta: RequestMeta): Promise<SanitizedUser> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const passwordHash = await hashValue(input.password);
    const verificationToken = generateOpaqueToken();

    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      emailVerificationTokenHash: hashToken(verificationToken),
      emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });

    await sendVerificationEmail(user.email, verificationToken);
    await recordAuditLog({
      actorId: user._id.toString(),
      action: 'user.register',
      entityType: 'User',
      entityId: user._id.toString(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return sanitizeUser(user);
  },

  /**
   * Admin-initiated account creation (Doctor/Patient/Health Officer
   * management screens). The account is created with a random unusable
   * password and an immediate "set your password" link, rather than the
   * admin choosing or seeing a password on the user's behalf.
   */
  async provisionAccount(input: {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: Role;
  }): Promise<SanitizedUser> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const placeholderPassword = generateOpaqueToken();
    const passwordHash = await hashValue(placeholderPassword);

    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      role: input.role,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      emailVerificationTokenHash: hashToken(generateOpaqueToken()),
      emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
    });

    const setPasswordToken = generateOpaqueToken();
    user.resetPasswordTokenHash = hashToken(setPasswordToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_PASSWORD_TTL_MS);
    await user.save();

    await sendWelcomeSetPasswordEmail(user.email, setPasswordToken);

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

    const { jti: _jti, ...tokens } = await issueTokenPair(user._id.toString(), user.role, meta);

    user.lastLoginAt = new Date();
    await user.save();

    await recordAuditLog({
      actorId: user._id.toString(),
      action: 'user.login',
      entityType: 'User',
      entityId: user._id.toString(),
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return { user: sanitizeUser(user), tokens };
  },

  async refresh(refreshToken: string, meta: RequestMeta): Promise<TokenPair> {
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

    const { jti: _newJti, ...tokens } = await issueTokenPair(
      user._id.toString(),
      user.role,
      meta,
      session.family,
    );
    const newSession = await authRepository.findSessionByJti(_newJti);
    await authRepository.revokeSession(session._id.toString(), newSession?._id.toString());

    return tokens;
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

  async forgotPassword(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      // Do not reveal whether the email is registered.
      return;
    }

    const resetToken = generateOpaqueToken();
    user.resetPasswordTokenHash = hashToken(resetToken);
    user.resetPasswordExpires = new Date(Date.now() + RESET_PASSWORD_TTL_MS);
    await user.save();

    await sendPasswordResetEmail(user.email, resetToken);
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await authRepository.findUserByResetTokenHash(hashToken(token));
    if (!user) {
      throw ApiError.badRequest('Invalid or expired password reset token');
    }

    user.passwordHash = await hashValue(newPassword);
    user.resetPasswordTokenHash = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // A password reset invalidates every existing session as a precaution.
    await authRepository.revokeAllSessionsForUser(user._id.toString());
  },

  async verifyEmail(token: string): Promise<void> {
    const user = await authRepository.findUserByVerificationTokenHash(hashToken(token));
    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    if (user.status === 'pending') {
      user.status = 'active';
    }
    user.emailVerificationTokenHash = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
  },

  async getMe(userId: string): Promise<SanitizedUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }
    return sanitizeUser(user);
  },

  /** Compensating action if profile-document creation fails right after provisionAccount(). */
  async deleteAccount(userId: string): Promise<void> {
    await authRepository.deleteUser(userId);
    await authRepository.revokeAllSessionsForUser(userId);
  },

  async setAccountStatus(
    userId: string,
    status: 'pending' | 'active' | 'suspended',
  ): Promise<SanitizedUser> {
    const user = await authRepository.setUserStatus(userId, status);
    if (!user) throw ApiError.notFound('User not found');
    if (status === 'suspended') {
      await authRepository.revokeAllSessionsForUser(userId);
    }
    return sanitizeUser(user);
  },
};
