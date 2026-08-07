import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { createRateLimitStore } from '../config/rateLimitStore';

export const globalRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore(),
  message: { success: false, message: 'Too many requests, please try again later.' },
});

export const authRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore(),
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Separate from authRateLimiter: a single admin sign-in makes 3 requests (login,
// ticket request, ticket exchange), so sharing the tight login budget here would
// rate-limit admins ~3x faster than everyone else for no security benefit — the
// ticket itself (a short-lived, high-entropy signed JWT) is what's actually guarding
// this surface, not request throttling.
export const adminHandoffRateLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.ADMIN_HANDOFF_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  store: createRateLimitStore(),
  message: { success: false, message: 'Too many sign-in attempts, please try again later.' },
});
