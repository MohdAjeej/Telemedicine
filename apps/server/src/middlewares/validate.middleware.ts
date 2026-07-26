import type { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../helpers/ApiError';

export function validateRequest(req: Request, _res: Response, next: NextFunction): void {
  const result = validationResult(req);
  if (result.isEmpty()) {
    next();
    return;
  }

  const errors = result.array().map((error) => ({
    field: 'path' in error ? String(error.path) : undefined,
    message: error.msg as string,
  }));

  next(ApiError.unprocessable('Validation failed', errors));
}
