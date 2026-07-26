import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { reportService } from './report.service';

export const reportController = {
  summary: asyncHandler(async (_req: Request, res: Response) => {
    const summary = await reportService.summary();
    sendSuccess(res, summary);
  }),

  appointmentsByStatus: asyncHandler(async (_req: Request, res: Response) => {
    const data = await reportService.appointmentsByStatus();
    sendSuccess(res, data);
  }),

  appointmentsOverTime: asyncHandler(async (req: Request, res: Response) => {
    const days = req.query.days ? Number(req.query.days) : undefined;
    const data = await reportService.appointmentsOverTime(days);
    sendSuccess(res, data);
  }),

  doctorUtilization: asyncHandler(async (req: Request, res: Response) => {
    const data = await reportService.doctorUtilization(req.query.hospitalId as string | undefined);
    sendSuccess(res, data);
  }),

  patientDemographics: asyncHandler(async (_req: Request, res: Response) => {
    const data = await reportService.patientDemographics();
    sendSuccess(res, data);
  }),
};
