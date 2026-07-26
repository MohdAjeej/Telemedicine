import { Schema, model, type HydratedDocument } from 'mongoose';

export interface PatientDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: { name: string; phone: string; relation: string };
  insuranceInfo?: { provider: string; policyNumber: string };
  allergies: string[];
  chronicConditions: string[];
  assignedDoctorId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedPatient = HydratedDocument<PatientDocument>;

const patientSchema = new Schema<PatientDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },
    insuranceInfo: {
      provider: String,
      policyNumber: String,
    },
    allergies: { type: [String], default: [] },
    chronicConditions: { type: [String], default: [] },
    assignedDoctorId: { type: Schema.Types.ObjectId, ref: 'Doctor' },
  },
  { timestamps: true },
);

export const PatientModel = model<PatientDocument>('Patient', patientSchema);
