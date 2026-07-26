import type { BaseEntity } from './common.types';

export type ConsultationStatus = 'in_progress' | 'completed';

export interface Consultation extends BaseEntity {
  appointmentId: string;
  doctorId: string;
  patientId: string;
  startedAt: string;
  endedAt?: string;
  chiefComplaint?: string;
  diagnosis?: string;
  notes?: string;
  status: ConsultationStatus;
  followUpRequired: boolean;
  followUpDate?: string;
  videoRoomId?: string;
}
