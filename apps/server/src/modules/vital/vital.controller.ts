import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { patientRepository } from '../patient/patient.repository';
import { vitalService } from './vital.service';

export const vitalController = {
  record: asyncHandler(async (req: Request, res: Response) => {
    const vital = await vitalService.record({ ...req.body, recordedBy: req.user!.id });
    sendSuccess(res, vital, 'Vitals recorded', HTTP_STATUS.CREATED);
  }),

  listForPatient: asyncHandler(async (req: Request, res: Response) => {
    let patientId = req.query.patientId as string | undefined;
    if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      patientId = patient?._id.toString();
    }
    if (!patientId) {
      throw ApiError.badRequest('patientId query parameter is required');
    }
    const vitals = await vitalService.listForPatient(patientId);
    sendSuccess(res, vitals);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const vital = await vitalService.getById(req.params.id);
    sendSuccess(res, vital);
  }),
};
