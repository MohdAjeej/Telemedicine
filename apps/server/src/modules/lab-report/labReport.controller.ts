import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { assertOwnHospital } from '../../helpers/hospitalScope';
import { patientRepository } from '../patient/patient.repository';
import { labReportService } from './labReport.service';

export const labReportController = {
  request: asyncHandler(async (req: Request, res: Response) => {
    const report = await labReportService.request({ ...req.body, requestedBy: req.user!.id });
    sendSuccess(res, report, 'Lab test requested', HTTP_STATUS.CREATED);
  }),

  uploadOwnReport: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No report file was uploaded');
    const report = await labReportService.selfUpload(req.user!.id, req.body.testType, req.file.buffer);
    sendSuccess(res, report, 'Test report uploaded', HTTP_STATUS.CREATED);
  }),

  listForPatient: asyncHandler(async (req: Request, res: Response) => {
    let patientId = req.query.patientId as string | undefined;
    if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      patientId = patient?._id.toString();
    } else if (req.user!.role === 'admin' && patientId) {
      const patient = await patientRepository.findById(patientId);
      assertOwnHospital(req.user!, patient?.hospitalId);
    }
    if (!patientId) throw ApiError.badRequest('patientId query parameter is required');
    const reports = await labReportService.listForPatient(patientId);
    sendSuccess(res, reports);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const report = await labReportService.getById(req.params.id);
    assertOwnHospital(req.user!, report.hospitalId);
    sendSuccess(res, report);
  }),

  updateResult: asyncHandler(async (req: Request, res: Response) => {
    const report = await labReportService.updateResult(req.params.id, req.body);
    sendSuccess(res, report, 'Lab report updated');
  }),

  uploadReport: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No report file was uploaded');
    const report = await labReportService.uploadReport(req.params.id, req.file.buffer);
    sendSuccess(res, report, 'Test report uploaded');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const existing = await labReportService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    await labReportService.remove(req.params.id);
    sendSuccess(res, null, 'Lab report deleted');
  }),
};
