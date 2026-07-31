import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { ApiError } from '../../helpers/ApiError';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { hospitalService } from './hospital.service';

/** An admin may only ever modify their own hospital — never one chosen by request param. */
function requireOwnHospital(req: Request): void {
  if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');
  if (req.user!.hospitalId !== req.params.id) {
    throw ApiError.forbidden('You can only manage your own hospital');
  }
}

export const hospitalController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const hospital = await hospitalService.create(req.body);
    sendSuccess(res, hospital, 'Hospital created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await hospitalService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      search: req.query.search as string | undefined,
      status: req.query.status as 'active' | 'inactive' | undefined,
    });
    sendSuccess(res, result.items, 'Hospitals fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const hospital = await hospitalService.getById(req.params.id);
    sendSuccess(res, hospital);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    await requireOwnHospital(req);
    const hospital = await hospitalService.update(req.params.id, req.body);
    sendSuccess(res, hospital, 'Hospital updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await requireOwnHospital(req);
    await hospitalService.remove(req.params.id);
    sendSuccess(res, null, 'Hospital deleted');
  }),
};
