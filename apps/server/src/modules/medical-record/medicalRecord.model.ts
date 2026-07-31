import { Schema, model, type HydratedDocument } from 'mongoose';

export type MedicalRecordType = 'lab' | 'imaging' | 'note' | 'discharge_summary';

export interface MedicalRecordDocument {
  _id: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  type: MedicalRecordType;
  title: string;
  description?: string;
  fileUrl?: string;
  uploadedBy: Schema.Types.ObjectId;
  recordDate: Date;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedMedicalRecord = HydratedDocument<MedicalRecordDocument>;

const medicalRecordSchema = new Schema<MedicalRecordDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    type: { type: String, enum: ['lab', 'imaging', 'note', 'discharge_summary'], required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    recordDate: { type: Date, default: () => new Date() },
    tags: { type: [String], default: [] },
  },
  { timestamps: true },
);

export const MedicalRecordModel = model<MedicalRecordDocument>('MedicalRecord', medicalRecordSchema);
