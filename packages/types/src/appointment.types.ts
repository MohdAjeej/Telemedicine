import type { BaseEntity } from './common.types';

export type AppointmentType = 'in_person' | 'video';
export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';

export interface Appointment extends BaseEntity {
  patientId: string;
  doctorId: string;
  hospitalId: string;
  healthOfficerId?: string;
  scheduledStart: string;
  scheduledEnd: string;
  type: AppointmentType;
  status: AppointmentStatus;
  reasonForVisit: string;
  notes?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  createdBy: string;
}
