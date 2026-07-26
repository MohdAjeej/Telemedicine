import { config as loadDotenv } from 'dotenv';
import { z } from 'zod';

loadDotenv();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5000),
  CLIENT_URL: z.string().url().default('http://localhost:5173'),

  MONGO_URI: z.string().min(1, 'MONGO_URI is required'),

  JWT_ACCESS_SECRET: z.string().min(10, 'JWT_ACCESS_SECRET is required'),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET is required'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  REFRESH_COOKIE_NAME: z.string().default('telemedicine_refresh_token'),

  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),

  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.coerce.number().optional(),
  MAIL_USER: z.string().optional(),
  MAIL_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('Telemedicine Platform <no-reply@telemedicine.local>'),

  CLOUDINARY_CLOUD_NAME: z.string().optional(),
  CLOUDINARY_API_KEY: z.string().optional(),
  CLOUDINARY_API_SECRET: z.string().optional(),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX: z.coerce.number().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().default(20),

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
