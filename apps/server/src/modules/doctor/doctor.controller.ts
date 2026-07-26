import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { doctorService } from './doctor.service';

export const doctorController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorService.create(req.body);
    sendSuccess(res, doctor, 'Doctor created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await doctorService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      hospitalId: req.query.hospitalId as string | undefined,
      specialization: req.query.specialization as string | undefined,
    });
    sendSuccess(res, result.items, 'Doctors fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorService.getById(req.params.id);
    sendSuccess(res, doctor);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorService.getByUserId(req.user!.id);
    sendSuccess(res, doctor);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorService.updateOwnProfile(req.user!.id, req.body);
    sendSuccess(res, doctor, 'Profile updated');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const doctor = await doctorService.updateById(req.params.id, req.body);
    sendSuccess(res, doctor, 'Doctor updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await doctorService.remove(req.params.id);
    sendSuccess(res, null, 'Doctor deleted');
  }),
};
