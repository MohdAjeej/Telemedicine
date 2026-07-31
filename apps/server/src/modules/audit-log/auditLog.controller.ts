import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { ApiError } from '../../helpers/ApiError';
import { auditLogRepository } from './auditLog.repository';

export const auditLogController = {
  list: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');

    const result = await auditLogRepository.findMany({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      hospitalId: req.user!.hospitalId,
      actorId: req.query.actorId as string | undefined,
      action: req.query.action as string | undefined,
      entityType: req.query.entityType as string | undefined,
      from: req.query.from as string | undefined,
      to: req.query.to as string | undefined,
    });
    sendSuccess(res, result.items, 'Audit logs fetched', 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),
};
