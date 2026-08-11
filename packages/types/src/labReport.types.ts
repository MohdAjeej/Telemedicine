import type { BaseEntity } from './common.types';

export type LabReportStatus = 'requested' | 'in_progress' | 'completed';

export interface LabReport extends BaseEntity {
  patientId: string;
  requestedBy: string;
  uploadedBy?: string;
  testType: string;
  status: LabReportStatus;
  resultFileUrl?: string;
  resultSummary?: string;
  requestedAt: string;
  completedAt?: string;
}
