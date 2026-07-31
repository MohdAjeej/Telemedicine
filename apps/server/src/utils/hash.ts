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
 * Deterministic (non-bcrypt) hash for the refresh-token-at-rest — needs to
 * be looked up by exact match rather than verified against a candidate,
 * which is what bcrypt's per-hash random salt is for.
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
