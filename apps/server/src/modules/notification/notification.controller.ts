import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { notificationService } from './notification.service';

export const notificationController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const unreadOnly = req.query.unread === 'true';
    const notifications = await notificationService.listForUser(req.user!.id, unreadOnly);
    sendSuccess(res, notifications);
  }),

  unreadCount: asyncHandler(async (req: Request, res: Response) => {
    const count = await notificationService.unreadCount(req.user!.id);
    sendSuccess(res, { count });
  }),

  markRead: asyncHandler(async (req: Request, res: Response) => {
    const notification = await notificationService.markRead(req.params.id, req.user!.id);
    sendSuccess(res, notification, 'Notification marked as read');
  }),

  markAllRead: asyncHandler(async (req: Request, res: Response) => {
    await notificationService.markAllRead(req.user!.id);
    sendSuccess(res, null, 'All notifications marked as read');
  }),
};
