import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { patientRepository } from '../patient/patient.repository';
import { labReportService } from './labReport.service';

export const labReportController = {
  request: asyncHandler(async (req: Request, res: Response) => {
    const report = await labReportService.request({ ...req.body, requestedBy: req.user!.id });
    sendSuccess(res, report, 'Lab test requested', HTTP_STATUS.CREATED);
  }),

  listForPatient: asyncHandler(async (req: Request, res: Response) => {
    let patientId = req.query.patientId as string | undefined;
    if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      patientId = patient?._id.toString();
    }
    if (!patientId) throw ApiError.badRequest('patientId query parameter is required');
    const reports = await labReportService.listForPatient(patientId);
    sendSuccess(res, reports);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const report = await labReportService.getById(req.params.id);
    sendSuccess(res, report);
  }),

  updateResult: asyncHandler(async (req: Request, res: Response) => {
    const report = await labReportService.updateResult(req.params.id, req.body);
    sendSuccess(res, report, 'Lab report updated');
  }),
};
