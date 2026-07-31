export type UserRole = 'admin' | 'doctor' | 'health_officer' | 'patient';
export type UserStatus = 'active' | 'suspended';

/**
 * Matches the server's `SanitizedUser` DTO exactly (apps/server/.../auth.types.ts)
 * — every `/auth/*` endpoint returns this shape, not a raw Mongo document, so
 * there is no `_id`/`createdAt`/`updatedAt` here (unlike most other shared
 * types, which do mirror BaseEntity/raw documents).
 */
export interface User {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  phone?: string;
  avatarUrl?: string;
  status: UserStatus;
}

export interface AuthTokens {
  accessToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

/** Public self-registration is patient-only. */
export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  age: number;
  hospitalId: string;
}

/** Creates a new Hospital and its owning Admin account together. */
export interface RegisterAdminPayload {
  hospitalName: string;
  email: string;
  password: string;
}
