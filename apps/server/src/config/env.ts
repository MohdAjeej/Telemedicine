import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5050),
  CLIENT_URL: z.string().default('http://localhost:5183,http://localhost:5184'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_COOKIE_NAME: z.string().default('telemedicine_refresh_token'),

  // Signs the short-lived, single-use ticket used to hand an already-authenticated
  // admin off from the client app's shared login page to the standalone Admin
  // Console without making them type their password a second time. Deliberately a
  // separate secret from JWT_ACCESS_SECRET so a handoff ticket can never be replayed
  // as a normal access token (or vice versa) even if a verifier were ever misapplied.
  ADMIN_HANDOFF_SECRET: z.string().min(10, 'ADMIN_HANDOFF_SECRET is required'),
  ADMIN_HANDOFF_EXPIRES_IN: z.string().default('60s'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),
  // A single admin sign-in burns 3 requests (login, ticket request, ticket exchange)
  // against whatever limiter guards it — sharing AUTH_RATE_LIMIT_MAX with plain
  // /login would rate-limit admins roughly 3x faster than every other role, so the
  // handoff routes get their own, more generous budget instead.
  ADMIN_HANDOFF_RATE_LIMIT_MAX: z.coerce.number().default(60),

  LOG_LEVEL: z.string().default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // Fail fast: an invalid/missing env var is a boot-time configuration error,
  // not something the app should try to run with defaults for.
  console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment configuration');
}

export const env = parsed.data;
export type Env = typeof env;
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
