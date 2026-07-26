import { UserModel, type HydratedUser } from './user.model';
import { SessionModel, type HydratedSession } from './session.model';

export const authRepository = {
  createUser(input: {
    email: string;
    passwordHash: string;
    role: string;
    firstName: string;
    lastName: string;
    phone?: string;
    emailVerificationTokenHash: string;
    emailVerificationExpires: Date;
  }): Promise<HydratedUser> {
    return UserModel.create(input);
  },

  findUserByEmail(email: string, withPassword = false): Promise<HydratedUser | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (withPassword) {
      query.select('+passwordHash');
    }
    return query.exec();
  },

  findUserById(id: string): Promise<HydratedUser | null> {
    return UserModel.findById(id).exec();
  },

  async findManyUsers(query: {
    page?: number;
    limit?: number;
    role?: string;
    status?: string;
    search?: string;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const filter: Record<string, unknown> = {};

    if (query.role) filter.role = query.role;
    if (query.status) filter.status = query.status;
    if (query.search) {
      const pattern = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ firstName: pattern }, { lastName: pattern }, { email: pattern }];
    }

    const [items, total] = await Promise.all([
      UserModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .exec(),
      UserModel.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
  },

  deleteUser(id: string): Promise<HydratedUser | null> {
    return UserModel.findByIdAndDelete(id).exec();
  },

  setUserStatus(id: string, status: 'pending' | 'active' | 'suspended'): Promise<HydratedUser | null> {
    return UserModel.findByIdAndUpdate(id, { status }, { new: true }).exec();
  },

  findUserByVerificationTokenHash(hash: string): Promise<HydratedUser | null> {
    return UserModel.findOne({
      emailVerificationTokenHash: hash,
      emailVerificationExpires: { $gt: new Date() },
    })
      .select('+emailVerificationTokenHash +emailVerificationExpires')
      .exec();
  },

  findUserByResetTokenHash(hash: string): Promise<HydratedUser | null> {
    return UserModel.findOne({
      resetPasswordTokenHash: hash,
      resetPasswordExpires: { $gt: new Date() },
    })
      .select('+resetPasswordTokenHash +resetPasswordExpires')
      .exec();
  },

  createSession(input: {
    userId: string;
    refreshTokenHash: string;
    jti: string;
    family: string;
    userAgent?: string;
    ip?: string;
    issuedAt: Date;
    expiresAt: Date;
  }): Promise<HydratedSession> {
    return SessionModel.create(input);
  },

  findSessionByJti(jti: string): Promise<HydratedSession | null> {
    return SessionModel.findOne({ jti }).exec();
  },

  async revokeSession(sessionId: string, replacedBy?: string): Promise<void> {
    await SessionModel.updateOne(
      { _id: sessionId },
      { revokedAt: new Date(), ...(replacedBy ? { replacedBy } : {}) },
    );
  },

  async revokeFamily(family: string): Promise<void> {
    await SessionModel.updateMany(
      { family, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  },

  async revokeAllSessionsForUser(userId: string): Promise<void> {
    await SessionModel.updateMany(
      { userId, revokedAt: { $exists: false } },
      { revokedAt: new Date() },
    );
  },
};
