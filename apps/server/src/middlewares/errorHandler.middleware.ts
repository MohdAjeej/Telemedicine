import type { NextFunction, Request, Response } from 'express';
import { ApiError } from '../helpers/ApiError';
import { HTTP_STATUS } from '../constants/httpStatus';
import { isProduction } from '../config/env';
import { logger } from '../utils/logger';

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message = err instanceof Error ? err.message : 'Something went wrong';

  if (statusCode >= HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    logger.error(`${req.method} ${req.originalUrl} - ${message}`, { stack: (err as Error)?.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} - ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(isApiError && err.errors ? { errors: err.errors } : {}),
    ...(!isProduction && err instanceof Error ? { stack: err.stack } : {}),
  });
}
