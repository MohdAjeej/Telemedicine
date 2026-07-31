import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { assertOwnHospital } from '../../helpers/hospitalScope';
import { healthOfficerService } from './healthOfficer.service';

export const healthOfficerController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');

    const officer = await healthOfficerService.create(req.body, req.user!.hospitalId);
    sendSuccess(res, officer, 'Health officer created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    // This route is admin-only (see healthOfficer.routes.ts) — always scope to the
    // caller's own hospital via the signed JWT claim, never a client-supplied hospitalId.
    if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');

    const result = await healthOfficerService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      hospitalId: req.user!.hospitalId,
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
    assertOwnHospital(req.user!, officer.hospitalId);
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
    const existing = await healthOfficerService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    const officer = await healthOfficerService.updateById(req.params.id, req.body);
    sendSuccess(res, officer, 'Health officer updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const existing = await healthOfficerService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    await healthOfficerService.remove(req.params.id);
    sendSuccess(res, null, 'Health officer deleted');
  }),
};
