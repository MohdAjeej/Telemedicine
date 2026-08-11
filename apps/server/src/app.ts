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
import { isProduction } from './config/env';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(
    helmet({
      // helmet's default HSTS header goes out over plain HTTP just as readily as
      // HTTPS. In dev, the client app runs on its own HTTPS origin
      // (vite-plugin-mkcert) and proxies /api straight through to this server,
      // so the browser sees that header arrive over a genuinely secure connection
      // to hostname "localhost" — and Chrome's HSTS cache is host-only, ignoring
      // port. That poisons every OTHER localhost port (e.g. the Admin Console on
      // :5184, plain HTTP) into being silently upgraded to https:// and failing
      // with "didn't send any data", since nothing is listening for TLS there.
      hsts: isProduction,
    }),
  );
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
