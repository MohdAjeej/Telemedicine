import { Schema, model, type HydratedDocument } from 'mongoose';
import type { Role } from '@telemedicine/constants';

export interface UserDocument {
  _id: Schema.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: 'pending' | 'active' | 'suspended';
  emailVerificationTokenHash?: string;
  emailVerificationExpires?: Date;
  resetPasswordTokenHash?: string;
  resetPasswordExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedUser = HydratedDocument<UserDocument>;

const userSchema = new Schema<UserDocument>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['admin', 'doctor', 'health_officer', 'patient'],
      required: true,
      index: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    isEmailVerified: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'active', 'suspended'], default: 'pending' },
    emailVerificationTokenHash: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    resetPasswordTokenHash: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>('User', userSchema);
