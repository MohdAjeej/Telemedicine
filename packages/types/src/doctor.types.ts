import type { BaseEntity } from './common.types';

export interface DoctorAvailabilitySlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
}

export interface Doctor extends BaseEntity {
  userId: string;
  hospitalId: string;
  specialization: string[];
  licenseNumber: string;
  qualifications: string[];
  experienceYears: number;
  consultationFee: number;
  availability: DoctorAvailabilitySlot[];
  rating: number;
  bio?: string;
  department?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  bloodGroup?: string;
  address?: string;
}
