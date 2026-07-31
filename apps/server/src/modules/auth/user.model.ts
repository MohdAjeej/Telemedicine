import { Schema, model, type HydratedDocument } from 'mongoose';
import type { Role } from '@telemedicine/constants';

export interface UserDocument {
  _id: Schema.Types.ObjectId;
  email: string;
  passwordHash: string;
  role: Role;
  hospitalId: Schema.Types.ObjectId;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
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
    // Denormalized from the role-specific profile (Admin/Doctor/HealthOfficer/Patient)
    // so the User Management screen can filter by hospital in a single query.
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    avatarUrl: { type: String },
    // No email verification / password reset in this system by design — accounts
    // are active immediately on creation (self-registration or admin-created).
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    lastLoginAt: { type: Date },
  },
  { timestamps: true },
);

export const UserModel = model<UserDocument>('User', userSchema);
