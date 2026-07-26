import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { doctorRepository } from '../doctor/doctor.repository';
import { patientRepository } from '../patient/patient.repository';
import { prescriptionService } from './prescription.service';

export const prescriptionController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const prescription = await prescriptionService.create(req.body.consultationId, req.body.medications);
    sendSuccess(res, prescription, 'Prescription created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const filter: { doctorId?: string; patientId?: string; page?: number; limit?: number } = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    if (req.user!.role === 'doctor') {
      const doctor = await doctorRepository.findByUserId(req.user!.id);
      filter.doctorId = doctor?._id.toString();
    } else if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      filter.patientId = patient?._id.toString();
    }

    const result = await prescriptionService.list(filter);
    sendSuccess(res, result.items, 'Prescriptions fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const prescription = await prescriptionService.getById(req.params.id);
    sendSuccess(res, prescription);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const prescription = await prescriptionService.cancel(req.params.id);
    sendSuccess(res, prescription, 'Prescription cancelled');
  }),
};
