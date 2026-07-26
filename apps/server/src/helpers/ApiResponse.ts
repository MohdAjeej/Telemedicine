import type { Response } from 'express';
import { HTTP_STATUS } from '../constants/httpStatus';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode: number = HTTP_STATUS.OK,
  meta?: Record<string, unknown>,
): void {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  });
}
