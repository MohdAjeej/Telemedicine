import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { assertOwnHospital } from '../../helpers/hospitalScope';
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
    } else if (req.user!.role === 'admin' && patientId) {
      const patient = await patientRepository.findById(patientId);
      assertOwnHospital(req.user!, patient?.hospitalId);
    }
    if (!patientId) throw ApiError.badRequest('patientId query parameter is required');
    const records = await medicalRecordService.listForPatient(patientId);
    sendSuccess(res, records);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const record = await medicalRecordService.getById(req.params.id);
    assertOwnHospital(req.user!, record.hospitalId);
    sendSuccess(res, record);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const existing = await medicalRecordService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    await medicalRecordService.remove(req.params.id);
    sendSuccess(res, null, 'Medical record deleted');
  }),
};
