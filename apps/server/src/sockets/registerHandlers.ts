import type { Server } from 'socket.io';
import { logger } from '../utils/logger';
import type { AppSocket } from './socket.auth.middleware';

export type SocketHandlerRegistrar = (io: Server, socket: AppSocket) => void;

const registrars: SocketHandlerRegistrar[] = [];

/**
 * Feature modules (e.g. appointment.socket.ts, message.socket.ts) call this
 * at import time to register their per-connection handler setup, so
 * socket.server.ts doesn't need to know about every feature module.
 */
export function registerSocketHandler(registrar: SocketHandlerRegistrar): void {
  registrars.push(registrar);
}

export function attachAllHandlers(io: Server, socket: AppSocket): void {
  for (const registrar of registrars) {
    try {
      registrar(io, socket);
    } catch (error) {
      logger.error(`Socket handler registration failed: ${(error as Error).message}`);
    }
  }
}
