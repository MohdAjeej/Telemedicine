import type { BaseEntity } from './common.types';

export interface HealthOfficer extends BaseEntity {
  userId: string;
  hospitalId: string;
  assignedClinic: string;
  certifications: string[];
  employeeId: string;
}
