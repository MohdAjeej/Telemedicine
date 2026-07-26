import type { BaseEntity } from './common.types';

export type MedicalRecordType = 'lab' | 'imaging' | 'note' | 'discharge_summary';

export interface MedicalRecord extends BaseEntity {
  patientId: string;
  type: MedicalRecordType;
  title: string;
  description?: string;
  fileUrl?: string;
  uploadedBy: string;
  recordDate: string;
  tags: string[];
}
