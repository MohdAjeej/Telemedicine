import type { CorsOptions } from 'cors';
import { env, isProduction } from './env';

const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

// Vite picks the next free port (5173 -> 5174 -> 5175 -> ...) whenever an
// earlier dev server instance is still running, which otherwise means
// updating CLIENT_URL by hand every time. Also allow private LAN IPs so the
// dev server can be reached from other devices (e.g. a phone) on the same
// network. Non-production only.
const isLocalDevOrigin = (origin: string) =>
  /^https?:\/\/(localhost|127\.0\.0\.1|(10|192\.168)\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}):\d+$/.test(
    origin,
  );

export const isAllowedOrigin = (origin: string) =>
  allowedOrigins.includes(origin) || (!isProduction && isLocalDevOrigin(origin));

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
