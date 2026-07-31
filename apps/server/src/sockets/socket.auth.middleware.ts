import type { Socket } from 'socket.io';
import { verifyAccessToken } from '../utils/jwt';

export interface SocketAuthData {
  id: string;
  role: string;
  hospitalId?: string;
}

export interface SocketData {
  user?: SocketAuthData;
}

/** Socket type carrying our typed `data.user`, used across all socket handlers. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AppSocket = Socket<any, any, any, SocketData>;

export function socketAuthMiddleware(socket: AppSocket, next: (err?: Error) => void): void {
  const token = socket.handshake.auth?.token as string | undefined;

  if (!token) {
    next(new Error('Authentication token missing'));
    return;
  }

  try {
    const payload = verifyAccessToken(token);
    socket.data.user = { id: payload.sub, role: payload.role, hospitalId: payload.hospitalId };
    next();
  } catch {
    next(new Error('Invalid or expired token'));
  }
}
