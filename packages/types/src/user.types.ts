import type { BaseEntity } from './common.types';

export type UserRole = 'admin' | 'doctor' | 'health_officer' | 'patient';
export type UserStatus = 'pending' | 'active' | 'suspended';

export interface User extends BaseEntity {
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  isEmailVerified: boolean;
  status: UserStatus;
  lastLoginAt?: string;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: Extract<UserRole, 'patient' | 'doctor' | 'health_officer'>;
}
