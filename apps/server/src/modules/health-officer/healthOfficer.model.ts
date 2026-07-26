import { Schema, model, type HydratedDocument } from 'mongoose';

export interface HealthOfficerDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  hospitalId?: Schema.Types.ObjectId;
  assignedClinic?: string;
  certifications: string[];
  employeeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedHealthOfficer = HydratedDocument<HealthOfficerDocument>;

const healthOfficerSchema = new Schema<HealthOfficerDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', index: true },
    assignedClinic: { type: String },
    certifications: { type: [String], default: [] },
    employeeId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const HealthOfficerModel = model<HealthOfficerDocument>('HealthOfficer', healthOfficerSchema);
