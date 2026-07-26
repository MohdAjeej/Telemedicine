import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { env } from '../../config/env';
import { isProduction } from '../../config/env';
import { authService } from './auth.service';

function requestMeta(req: Request) {
  return { ip: req.ip, userAgent: req.headers['user-agent'] };
}

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: 'strict' as const,
  path: '/api/v1/auth',
};

function setRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(env.REFRESH_COOKIE_NAME, refreshToken, REFRESH_COOKIE_OPTIONS);
}

function clearRefreshCookie(res: Response): void {
  res.clearCookie(env.REFRESH_COOKIE_NAME, REFRESH_COOKIE_OPTIONS);
}

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.register(req.body, requestMeta(req));
    sendSuccess(
      res,
      { user },
      'Registration successful. Please check your email to verify your account.',
      HTTP_STATUS.CREATED,
    );
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token missing');
    }

    const tokens = await authService.refresh(refreshToken, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { accessToken: tokens.accessToken }, 'Token refreshed');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
    await authService.logout(refreshToken);
    clearRefreshCookie(res);
    sendSuccess(res, null, 'Logged out');
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, 'If that email is registered, a reset link has been sent.');
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.resetPassword(req.params.token, req.body.password);
    sendSuccess(res, null, 'Password has been reset. Please log in again.');
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    await authService.verifyEmail(req.params.token);
    sendSuccess(res, null, 'Email verified successfully');
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  }),
};
