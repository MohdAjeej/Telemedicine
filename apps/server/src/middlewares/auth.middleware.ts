import type { NextFunction, Request, Response } from 'express';
import type { Role } from '@telemedicine/constants';
import { ApiError } from '../helpers/ApiError';
import { asyncHandler } from '../helpers/asyncHandler';
import { verifyAccessToken } from '../utils/jwt';

export interface AuthenticatedUser {
  id: string;
  role: Role;
  jti: string;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Authentication token missing');
    }

    const token = header.slice('Bearer '.length);

    try {
      const payload = verifyAccessToken(token);
      req.user = { id: payload.sub, role: payload.role, jti: payload.jti };
      next();
    } catch {
      throw ApiError.unauthorized('Invalid or expired token');
    }
  },
);
