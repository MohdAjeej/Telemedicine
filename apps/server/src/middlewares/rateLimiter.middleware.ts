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
