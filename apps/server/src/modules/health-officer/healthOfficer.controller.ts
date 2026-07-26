import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { healthOfficerService } from './healthOfficer.service';

export const healthOfficerController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const officer = await healthOfficerService.create(req.body);
    sendSuccess(res, officer, 'Health officer created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await healthOfficerService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      hospitalId: req.query.hospitalId as string | undefined,
    });
    sendSuccess(res, result.items, 'Health officers fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const officer = await healthOfficerService.getById(req.params.id);
    sendSuccess(res, officer);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const officer = await healthOfficerService.getByUserId(req.user!.id);
    sendSuccess(res, officer);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const officer = await healthOfficerService.updateOwnProfile(req.user!.id, req.body);
    sendSuccess(res, officer, 'Profile updated');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const officer = await healthOfficerService.updateById(req.params.id, req.body);
    sendSuccess(res, officer, 'Health officer updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await healthOfficerService.remove(req.params.id);
    sendSuccess(res, null, 'Health officer deleted');
  }),
};
