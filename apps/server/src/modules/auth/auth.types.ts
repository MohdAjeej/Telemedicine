import type { Role } from '@telemedicine/constants';

export interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Extract<Role, 'patient' | 'doctor' | 'health_officer'>;
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
  isEmailVerified: boolean;
  status: 'pending' | 'active' | 'suspended';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}
