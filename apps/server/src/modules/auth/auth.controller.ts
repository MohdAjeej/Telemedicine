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
    const { user, tokens } = await authService.register(req.body, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Registration successful', HTTP_STATUS.CREATED);
  }),

  registerAdmin: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.registerAdmin(req.body, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Hospital registered', HTTP_STATUS.CREATED);
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  }),

  adminHandoff: asyncHandler(async (req: Request, res: Response) => {
    const ticket = await authService.createAdminHandoffTicket(req.user!.id);
    sendSuccess(res, { ticket }, 'Handoff ticket issued');
  }),

  adminHandoffExchange: asyncHandler(async (req: Request, res: Response) => {
    const { user, tokens } = await authService.exchangeAdminHandoffTicket(req.body.ticket, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Login successful');
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token missing');
    }

    const { user, tokens } = await authService.refresh(refreshToken, requestMeta(req));
    setRefreshCookie(res, tokens.refreshToken);
    sendSuccess(res, { user, accessToken: tokens.accessToken }, 'Token refreshed');
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.[env.REFRESH_COOKIE_NAME];
    await authService.logout(refreshToken);
    clearRefreshCookie(res);
    sendSuccess(res, null, 'Logged out');
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.getMe(req.user!.id);
    sendSuccess(res, user);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const user = await authService.updateMe(req.user!.id, req.body);
    sendSuccess(res, user, 'Profile updated');
  }),

  changePassword: asyncHandler(async (req: Request, res: Response) => {
    await authService.changePassword(req.user!.id, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, null, 'Password updated');
  }),
};
