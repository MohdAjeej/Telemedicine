import type { Address, BaseEntity } from './common.types';

export type HospitalType = 'clinic' | 'hospital' | 'multi_specialty';
export type HospitalStatus = 'active' | 'inactive';

export interface Hospital extends BaseEntity {
  name: string;
  registrationNumber: string;
  type: HospitalType;
  address: Address;
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  departments: string[];
  status: HospitalStatus;
  logoUrl?: string;
}
