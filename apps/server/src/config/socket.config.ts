import type { ServerOptions } from 'socket.io';
import { env } from './env';

export const socketServerOptions: Partial<ServerOptions> = {
  cors: {
    origin: env.CLIENT_URL.split(',').map((origin) => origin.trim()),
    credentials: true,
  },
  path: '/socket.io',
};
