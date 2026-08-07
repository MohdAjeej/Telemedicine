import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { Role } from '@telemedicine/constants';

export interface AccessTokenPayload {
  sub: string;
  role: Role;
  hospitalId?: string;
  jti: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
  family: string;
}

export interface HandoffTicketPayload {
  sub: string;
  purpose: 'admin-handoff';
  jti: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN });
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}

export function signHandoffTicket(payload: HandoffTicketPayload): string {
  return jwt.sign(payload, env.ADMIN_HANDOFF_SECRET, { expiresIn: env.ADMIN_HANDOFF_EXPIRES_IN });
}

export function verifyHandoffTicket(token: string): HandoffTicketPayload {
  return jwt.verify(token, env.ADMIN_HANDOFF_SECRET) as HandoffTicketPayload;
}
