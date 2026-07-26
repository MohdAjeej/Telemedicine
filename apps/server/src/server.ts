import http from 'node:http';
import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase } from './database/connection';
import { initSocketServer } from './sockets/socket.server';
import { logger } from './utils/logger';
import { scheduleAppointmentReminders } from './cron/appointmentReminder.cron';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);

  initSocketServer(httpServer);
  scheduleAppointmentReminders();

  httpServer.listen(env.PORT, () => {
    logger.info(`Server listening on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    httpServer.close(() => process.exit(0));
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error(`Failed to start server: ${(error as Error).message}`);
  process.exit(1);
});
