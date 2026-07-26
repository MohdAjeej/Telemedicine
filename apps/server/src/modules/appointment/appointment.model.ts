import { Schema, model, type HydratedDocument } from 'mongoose';

export type AppointmentType = 'in_person' | 'video';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface AppointmentDocument {
  _id: Schema.Types.ObjectId;
  patientId: Schema.Types.ObjectId;
  doctorId: Schema.Types.ObjectId;
  hospitalId: Schema.Types.ObjectId;
  healthOfficerId?: Schema.Types.ObjectId;
  scheduledStart: Date;
  scheduledEnd: Date;
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit: string;
  notes?: string;
  cancelledBy?: Schema.Types.ObjectId;
  cancellationReason?: string;
  createdBy: Schema.Types.ObjectId;
  videoRoomId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedAppointment = HydratedDocument<AppointmentDocument>;

const appointmentSchema = new Schema<AppointmentDocument>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },
    hospitalId: { type: Schema.Types.ObjectId, ref: 'Hospital', required: true, index: true },
    healthOfficerId: { type: Schema.Types.ObjectId, ref: 'HealthOfficer' },
    scheduledStart: { type: Date, required: true },
    scheduledEnd: { type: Date, required: true },
    type: { type: String, enum: ['in_person', 'video'], required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show'],
      default: 'pending',
      index: true,
    },
    reasonForVisit: { type: String, required: true },
    notes: { type: String },
    cancelledBy: { type: Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    videoRoomId: { type: String },
  },
  { timestamps: true },
);

appointmentSchema.index({ doctorId: 1, scheduledStart: 1 });

export const AppointmentModel = model<AppointmentDocument>('Appointment', appointmentSchema);
