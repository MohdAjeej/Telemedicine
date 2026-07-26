import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import { env } from '../config/env';

export async function hashValue(value: string): Promise<string> {
  return bcrypt.hash(value, env.BCRYPT_SALT_ROUNDS);
}

export async function compareValue(value: string, hash: string): Promise<boolean> {
  return bcrypt.compare(value, hash);
}

/**
 * Deterministic (non-bcrypt) hash for opaque single-use tokens (email
 * verification, password reset, refresh-token-at-rest) that need to be
 * looked up by exact match rather than verified against a candidate —
 * bcrypt's per-hash random salt makes it unsuitable for that lookup.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateOpaqueToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
