import { Schema, model, type HydratedDocument } from 'mongoose';

export interface HealthOfficerDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
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
    // Auto-assigned to the creating Admin's own hospital (see healthOfficer.service.ts create()).
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    assignedClinic: { type: String },
    certifications: { type: [String], default: [] },
    employeeId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true },
);

export const HealthOfficerModel = model<HealthOfficerDocument>('HealthOfficer', healthOfficerSchema);
