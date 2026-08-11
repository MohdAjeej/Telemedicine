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
  comorbidity?: string;
  allergy?: string;
  otherIllness?: string;
  familyHistory?: string;
  symptoms?: string;
  medications: Medication[];
  advice?: string;
  provisionalDiagnosis?: string;
  finalDiagnosis?: string;
  clinicalFindings?: string;
  labTests: string[];
  followUpDate?: string;
  issuedAt: string;
  pdfUrl?: string;
  status: PrescriptionStatus;
}
