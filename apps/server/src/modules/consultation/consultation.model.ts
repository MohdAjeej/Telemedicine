import { Schema, model, type HydratedDocument } from 'mongoose';

export type ConsultationStatus = 'in_progress' | 'completed';

export interface ConsultationDocument {
  _id: Schema.Types.ObjectId;
  appointmentId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  startedAt: Date;
  endedAt?: Date;
  chiefComplaint?: string;
  diagnosis?: string;
  notes?: string;
  status: ConsultationStatus;
  followUpRequired: boolean;
  followUpDate?: Date;
  videoRoomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedConsultation = HydratedDocument<ConsultationDocument>;

const consultationSchema = new Schema<ConsultationDocument>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true, unique: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    startedAt: { type: Date, required: true },
    endedAt: { type: Date },
    chiefComplaint: { type: String },
    diagnosis: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    followUpRequired: { type: Boolean, default: false },
    followUpDate: { type: Date },
    videoRoomId: { type: String },
  },
  { timestamps: true },
);

export const ConsultationModel = model<ConsultationDocument>('Consultation', consultationSchema);
