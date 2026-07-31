import type { Role } from '@telemedicine/constants';

/** Public self-registration is patient-only — Doctor/HealthOfficer accounts are admin-created (see doctor/health-officer modules), Admin registration goes through registerAdmin below. */
export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  age: number;
  hospitalId: string;
}

/** Creates a new Hospital and its owning Admin account together in one step. */
export interface RegisterAdminInput {
  hospitalName: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RequestMeta {
  ip?: string;
  userAgent?: string;
}

export interface SanitizedUser {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: 'active' | 'suspended';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
