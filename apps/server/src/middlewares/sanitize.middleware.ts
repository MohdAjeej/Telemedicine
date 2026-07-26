import type { NextFunction, Request, Response } from 'express';
import mongoSanitize from 'express-mongo-sanitize';

const sanitizer = mongoSanitize({ replaceWith: '_' });

export function sanitizeRequest(req: Request, res: Response, next: NextFunction): void {
  sanitizer(req, res, next);
}
