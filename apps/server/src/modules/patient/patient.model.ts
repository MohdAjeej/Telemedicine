import { Schema, model, type HydratedDocument } from 'mongoose';

export interface PatientDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  age: number;
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
    // Set once at registration (self-registration picks it from the hospital
    // dropdown; health-officer-initiated registration auto-fills their own
    // hospital) — never changed afterwards.
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    age: { type: Number, required: true, min: 0, max: 150 },
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
