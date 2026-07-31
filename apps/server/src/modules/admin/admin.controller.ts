import type { Request, Response } from 'express';
import type { Role } from '@telemedicine/constants';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { adminService } from './admin.service';

/** Every admin route below is authenticated + authorize('admin') gated (see admin.routes.ts) — the JWT always carries hospitalId for that role once issued. */
function requireHospitalId(req: Request): string {
  if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');
  return req.user!.hospitalId;
}

export const adminController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    const admins = await adminService.list(requireHospitalId(req));
    sendSuccess(res, admins);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.getById(req.params.id, requireHospitalId(req));
    sendSuccess(res, admin);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.getByUserId(req.user!.id);
    sendSuccess(res, admin);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await adminService.remove(req.params.id, requireHospitalId(req));
    sendSuccess(res, null, 'Admin deleted');
  }),

  listUsers: asyncHandler(async (req: Request, res: Response) => {
    const result = await adminService.listUsers({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      role: req.query.role as Role | undefined,
      status: req.query.status as 'active' | 'suspended' | undefined,
      search: req.query.search as string | undefined,
      hospitalId: requireHospitalId(req),
    });
    sendSuccess(res, result.items, 'Users fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  updateUserStatus: asyncHandler(async (req: Request, res: Response) => {
    const user = await adminService.updateUserStatus(req.params.userId, req.body.status);
    sendSuccess(res, user, 'User status updated');
  }),

  updatePermissions: asyncHandler(async (req: Request, res: Response) => {
    const admin = await adminService.updatePermissions(req.params.userId, req.body.permissions);
    sendSuccess(res, admin, 'Permissions updated');
  }),
};
