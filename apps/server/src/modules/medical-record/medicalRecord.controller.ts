import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { patientRepository } from '../patient/patient.repository';
import { medicalRecordService } from './medicalRecord.service';

export const medicalRecordController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const record = await medicalRecordService.create({ ...req.body, uploadedBy: req.user!.id });
    sendSuccess(res, record, 'Medical record added', HTTP_STATUS.CREATED);
  }),

  listForPatient: asyncHandler(async (req: Request, res: Response) => {
    let patientId = req.query.patientId as string | undefined;
    if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      patientId = patient?._id.toString();
    }
    if (!patientId) throw ApiError.badRequest('patientId query parameter is required');
    const records = await medicalRecordService.listForPatient(patientId);
    sendSuccess(res, records);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const record = await medicalRecordService.getById(req.params.id);
    sendSuccess(res, record);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await medicalRecordService.remove(req.params.id);
    sendSuccess(res, null, 'Medical record deleted');
  }),
};
