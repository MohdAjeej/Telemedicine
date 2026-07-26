import type { BaseEntity } from './common.types';

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number;
  instructions?: string;
}

export type PrescriptionStatus = 'active' | 'completed' | 'cancelled';

export interface Prescription extends BaseEntity {
  consultationId: string;
  doctorId: string;
  patientId: string;
  medications: Medication[];
  issuedAt: string;
  pdfUrl?: string;
  status: PrescriptionStatus;
}
