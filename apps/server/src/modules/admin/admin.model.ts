import { Schema, model, type HydratedDocument } from 'mongoose';

export interface AdminDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  permissions: string[];
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedAdmin = HydratedDocument<AdminDocument>;

const adminSchema = new Schema<AdminDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    permissions: { type: [String], default: [] },
    department: { type: String },
  },
  { timestamps: true },
);

export const AdminModel = model<AdminDocument>('Admin', adminSchema);
