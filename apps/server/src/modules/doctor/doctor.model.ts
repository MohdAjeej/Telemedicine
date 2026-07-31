import { Schema, model, type HydratedDocument } from 'mongoose';

export interface DoctorAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface DoctorDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  specialization: string[];
  licenseNumber?: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  availability: DoctorAvailabilitySlot[];
  rating: number;
  bio?: string;
  department?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedDoctor = HydratedDocument<DoctorDocument>;

const availabilitySlotSchema = new Schema<DoctorAvailabilitySlot>(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    slotDurationMinutes: { type: Number, default: 30 },
  },
  { _id: false },
);

const doctorSchema = new Schema<DoctorDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    // Auto-assigned to the creating Admin's own hospital — never chosen by
    // the caller (see doctor.service.ts create()).
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    specialization: { type: [String], default: [] },
    licenseNumber: { type: String, unique: true, sparse: true },
    qualifications: { type: [String], default: [] },
    experienceYears: { type: Number, default: 0 },
    consultationFee: { type: Number, default: 0 },
    availability: { type: [availabilitySlotSchema], default: [] },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    bio: { type: String },
    department: { type: String },
    age: { type: Number, min: 0, max: 150 },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String },
    address: { type: String },
  },
  { timestamps: true },
);

export const DoctorModel = model<DoctorDocument>('Doctor', doctorSchema);
