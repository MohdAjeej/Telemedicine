import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { socketServerOptions } from '../config/socket.config';
import { socketAuthMiddleware, type SocketData } from './socket.auth.middleware';
import { attachAllHandlers } from './registerHandlers';
import { logger } from '../utils/logger';
// Side-effect import: registers the WebRTC signaling relay via registerSocketHandler.
import '../modules/video/video.socket';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AppServer = Server<any, any, any, SocketData>;

let ioInstance: AppServer | null = null;

export function initSocketServer(httpServer: HttpServer): AppServer {
  const io: AppServer = new Server(httpServer, socketServerOptions);

  io.use(socketAuthMiddleware);

  io.on('connection', (socket) => {
    const user = socket.data.user;
    logger.info(`Socket connected: ${socket.id} (user ${user?.id ?? 'unknown'})`);

    if (user?.id) {
      socket.join(`user:${user.id}`);
    }

    attachAllHandlers(io, socket);

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  ioInstance = io;
  return io;
}

export function getSocketServer(): AppServer {
  if (!ioInstance) {
    throw new Error('Socket server has not been initialized yet');
  }
  return ioInstance;
}
