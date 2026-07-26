import type { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins = env.CLIENT_URL.split(',').map((origin) => origin.trim());

export const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
};
