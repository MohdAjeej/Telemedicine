import type { BaseEntity } from './common.types';

export interface Vital extends BaseEntity {
  patientId: string;
  recordedBy: string;
  recordedAt: string;
  bloodPressure?: { systolic: number; diastolic: number };
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  notes?: string;
}
