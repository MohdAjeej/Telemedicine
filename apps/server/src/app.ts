import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.config';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { sanitizeRequest } from './middlewares/sanitize.middleware';
import { globalRateLimiter } from './middlewares/rateLimiter.middleware';
import { notFound } from './middlewares/notFound.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import apiRouter from './routes';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(cors(corsOptions));
  app.use(compression());
  app.use(requestLogger);
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true, limit: '2mb' }));
  app.use(cookieParser());
  app.use(sanitizeRequest);
  app.use(globalRateLimiter);

  app.use('/api/v1', apiRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
