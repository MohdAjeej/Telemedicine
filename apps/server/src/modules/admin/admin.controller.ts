import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { adminService } from './admin.service';

export const adminController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.create(req.body);
    sendSuccess(res, admin, 'Admin created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const admins = await adminService.list();
    sendSuccess(res, admins);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.getById(req.params.id);
    sendSuccess(res, admin);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.getByUserId(req.user!.id);
    sendSuccess(res, admin);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminService.remove(req.params.id);
    sendSuccess(res, null, 'Admin deleted');
  }),
};
