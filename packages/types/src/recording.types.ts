import type { BaseEntity } from './common.types';

export interface Recording extends BaseEntity {
  appointmentId: string;
  consultationId?: string;
  patientId: string;
  hospitalId: string;
  recordedBy: string;
  fileUrl: string;
  durationSeconds?: number;
}
