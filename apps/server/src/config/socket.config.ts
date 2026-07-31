import type { ServerOptions } from 'socket.io';
import { isAllowedOrigin } from './cors.config';

export const socketServerOptions: Partial<ServerOptions> = {
  cors: {
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  },
  path: '/socket.io',
};
