import { Schema, model, type HydratedDocument } from 'mongoose';

export interface RecordingDocument {
  _id: Schema.Types.ObjectId;
  appointmentId: Schema.Types.ObjectId;
  consultationId?: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  recordedBy: Schema.Types.ObjectId;
  fileUrl: string;
  durationSeconds?: number;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedRecording = HydratedDocument<RecordingDocument>;

const recordingSchema = new Schema<RecordingDocument>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, index: true },
    consultationId: { type: Schema.Types.ObjectId, ref: 'Consultation' },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    fileUrl: { type: String, required: true },
    durationSeconds: { type: Number },
  },
  { timestamps: true },
);

export const RecordingModel = model<RecordingDocument>('Recording', recordingSchema);
