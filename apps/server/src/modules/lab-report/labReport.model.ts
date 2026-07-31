import { Schema, model, type HydratedDocument } from 'mongoose';

export type LabReportStatus = 'requested' | 'in_progress' | 'completed';

export interface LabReportDocument {
  _id: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  requestedBy: Schema.Types.ObjectId;
  testType: string;
  status: LabReportStatus;
  resultFileUrl?: string;
  resultSummary?: string;
  requestedAt: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedLabReport = HydratedDocument<LabReportDocument>;

const labReportSchema = new Schema<LabReportDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    testType: { type: String, required: true },
    status: { type: String, enum: ['requested', 'in_progress', 'completed'], default: 'requested' },
    resultFileUrl: { type: String },
    resultSummary: { type: String },
    requestedAt: { type: Date, default: () => new Date() },
    completedAt: { type: Date },
  },
  { timestamps: true },
);

export const LabReportModel = model<LabReportDocument>('LabReport', labReportSchema);
