import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { ApiError } from '../../helpers/ApiError';
import { reportService } from './report.service';

/** Every report is scoped to the caller's own hospital — this route is admin-only (see report.routes.ts). */
function requireHospitalId(req: Request): string {
  if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');
  return req.user!.hospitalId;
}

export const reportController = {
  summary: asyncHandler(async (req: Request, res: Response) => {
    const hospitalId = await requireHospitalId(req);
    const summary = await reportService.summary(hospitalId);
    sendSuccess(res, summary);
  }),

  appointmentsByStatus: asyncHandler(async (req: Request, res: Response) => {
    const hospitalId = await requireHospitalId(req);
    const data = await reportService.appointmentsByStatus(hospitalId);
    sendSuccess(res, data);
  }),

  appointmentsOverTime: asyncHandler(async (req: Request, res: Response) => {
    const hospitalId = await requireHospitalId(req);
    const days = req.query.days ? Number(req.query.days) : undefined;
    const data = await reportService.appointmentsOverTime(hospitalId, days);
    sendSuccess(res, data);
  }),

  doctorUtilization: asyncHandler(async (req: Request, res: Response) => {
    const hospitalId = await requireHospitalId(req);
    const data = await reportService.doctorUtilization(hospitalId);
    sendSuccess(res, data);
  }),

  patientDemographics: asyncHandler(async (req: Request, res: Response) => {
    const hospitalId = await requireHospitalId(req);
    const data = await reportService.patientDemographics(hospitalId);
    sendSuccess(res, data);
  }),
};
