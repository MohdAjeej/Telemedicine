import { Schema, model, type HydratedDocument } from 'mongoose';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface PrescriptionDocument {
  _id: Schema.Types.ObjectId;
  consultationId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  comorbidity?: string;
  complaints?: string;
  allergy?: string;
  otherIllness?: string;
  chiefComplaints?: string;
  symptoms?: string;
  medications: Medication[];
  advice?: string;
  provisionalDiagnosis?: string;
  finalDiagnosis?: string;
  clinicalFindings?: string;
  labTests: string[];
  followUpDate?: Date;
  issuedAt: Date;
  pdfUrl?: string;
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedPrescription = HydratedDocument<PrescriptionDocument>;

const medicationSchema = new Schema<Medication>(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    durationDays: { type: Number, required: true },
    instructions: { type: String },
  },
  { _id: false },
);

const prescriptionSchema = new Schema<PrescriptionDocument>(
  {
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    comorbidity: { type: String },
    complaints: { type: String },
    allergy: { type: String },
    otherIllness: { type: String },
    chiefComplaints: { type: String },
    symptoms: { type: String },
    medications: { type: [medicationSchema], default: [] },
    advice: { type: String },
    provisionalDiagnosis: { type: String },
    finalDiagnosis: { type: String },
    clinicalFindings: { type: String },
    labTests: { type: [String], default: [] },
    followUpDate: { type: Date },
    issuedAt: { type: Date, default: () => new Date() },
    pdfUrl: { type: String },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  },
  { timestamps: true },
);

export const PrescriptionModel = model<PrescriptionDocument>('Prescription', prescriptionSchema);
