import { Schema, model, type HydratedDocument } from 'mongoose';

export interface SessionDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  refreshTokenHash: string;
  jti: string;
  family: string;
  userAgent?: string;
  ip?: string;
  issuedAt: Date;
  expiresAt: Date;
  revokedAt?: Date;
  replacedBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedSession = HydratedDocument<SessionDocument>;

const sessionSchema = new Schema<SessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    jti: { type: String, required: true, unique: true },
    family: { type: String, required: true, index: true },
    userAgent: { type: String },
    ip: { type: String },
    issuedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date },
    replacedBy: { type: Schema.Types.ObjectId, ref: 'Session' },
  },
  { timestamps: true },
);

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const SessionModel = model<SessionDocument>('Session', sessionSchema);
