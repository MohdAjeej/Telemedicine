import type { BaseEntity } from './common.types';

export interface Vital extends BaseEntity {
  patientId: string;
  recordedBy: string;
  recordedAt: string;
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
  heartRate?: number;
  temperature?: number;
  respiratoryRate?: number;
  oxygenSaturation?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  bloodSugar?: number;
  symptoms?: string;
  notes?: string;
}
