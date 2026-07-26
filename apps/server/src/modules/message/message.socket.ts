import { SOCKET_EVENTS } from '@telemedicine/constants';
import { getSocketServer } from '../../sockets/socket.server';
import { logger } from '../../utils/logger';
import type { HydratedMessage } from './message.model';

export function emitNewMessage(recipientUserId: string, message: HydratedMessage): void {
  try {
    getSocketServer().to(`user:${recipientUserId}`).emit(SOCKET_EVENTS.MESSAGE_NEW, message);
  } catch (error) {
    logger.warn(`Skipped socket emit (message:new): ${(error as Error).message}`);
  }
}
