import { SOCKET_EVENTS } from '@telemedicine/constants';
import { getSocketServer } from '../../sockets/socket.server';
import { logger } from '../../utils/logger';
import type { HydratedNotification } from './notification.model';

export function emitNotification(notification: HydratedNotification): void {
  try {
    getSocketServer().to(`user:${notification.userId.toString()}`).emit(SOCKET_EVENTS.NOTIFICATION_NEW, notification);
  } catch (error) {
    logger.warn(`Skipped socket emit (notification:new): ${(error as Error).message}`);
  }
}
