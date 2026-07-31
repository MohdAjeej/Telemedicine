import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { assertOwnHospital } from '../../helpers/hospitalScope';
import { doctorService } from './doctor.service';

export const doctorController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');

    const doctor = await doctorService.create(req.body, req.user!.hospitalId);
    sendSuccess(res, doctor, 'Doctor created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    // An admin only ever manages their own hospital — force the scope from the
    // signed JWT claim rather than trusting a client-supplied hospitalId (which
    // would otherwise leak every hospital's doctors to any admin). Other roles
    // keep the existing caller-supplied hospitalId behavior (e.g. a health
    // officer's own booking flow).
    let hospitalId = req.query.hospitalId as string | undefined;
    if (req.user!.role === 'admin') {
      if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');
      hospitalId = req.user!.hospitalId;
    }

    const result = await doctorService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      hospitalId,
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
    assertOwnHospital(req.user!, doctor.hospitalId);
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
    const existing = await doctorService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    const doctor = await doctorService.updateById(req.params.id, req.body);
    sendSuccess(res, doctor, 'Doctor updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const existing = await doctorService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    await doctorService.remove(req.params.id);
    sendSuccess(res, null, 'Doctor deleted');
  }),
};
