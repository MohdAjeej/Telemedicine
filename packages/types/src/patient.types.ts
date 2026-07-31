import type { Address, BaseEntity } from './common.types';

export interface Patient extends BaseEntity {
  userId: string;
  hospitalId: string;
  age: number;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: Address;
  emergencyContact?: { name: string; phone: string; relation: string };
  insuranceInfo?: { provider: string; policyNumber: string };
  allergies: string[];
  chronicConditions: string[];
  assignedDoctorId?: string;
}
