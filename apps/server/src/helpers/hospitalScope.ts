import type { Role } from '@telemedicine/constants';
import { ApiError } from './ApiError';

/**
 * Extracts a plain ObjectId hex string from a `hospitalId`-ish value that may
 * be a raw ObjectId or a populated Hospital document (several repository
 * `findById`/`findByUserId` methods populate `hospitalId`). Mongoose
 * documents have their own `toString()`/`String()` coercion that
 * pretty-prints the whole document, so naively stringifying a populated ref
 * silently produces garbage instead of the id.
 */
export function toHospitalIdString(value: unknown): string | undefined {
  if (!value) return undefined;
  const ref = value as { _id?: unknown };
  return ref._id ? String(ref._id) : String(value);
}

/**
 * Guards single-record reads/mutations (getById/update/remove) that the *list*
 * endpoints already scope by hospital but that were otherwise reachable by
 * anyone who could guess/obtain another hospital's record id. Only enforced
 * for the `admin` role — other roles that reach these routes (e.g. a doctor
 * viewing a patient) are governed by their own route-level `authorize(...)`
 * checks, not hospital ownership.
 */
export function assertOwnHospital(
  actor: { role: Role; hospitalId?: string },
  recordHospitalId: unknown,
  message = 'You do not have access to this record',
): void {
  if (actor.role !== 'admin') return;
  if (!actor.hospitalId || toHospitalIdString(recordHospitalId) !== actor.hospitalId) {
    throw ApiError.forbidden(message);
  }
}
