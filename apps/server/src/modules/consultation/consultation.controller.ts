import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { doctorRepository } from '../doctor/doctor.repository';
import { patientRepository } from '../patient/patient.repository';
import { consultationService } from './consultation.service';

export const consultationController = {
  start: asyncHandler(async (req: Request, res: Response) => {
    const consultation = await consultationService.start(req.body.appointmentId, req.body.chiefComplaint);
    sendSuccess(res, consultation, 'Consultation started', HTTP_STATUS.CREATED);
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

    const result = await consultationService.list(filter);
    sendSuccess(res, result.items, 'Consultations fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const consultation = await consultationService.getById(req.params.id);
    sendSuccess(res, consultation);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const consultation = await consultationService.update(req.params.id, req.body);
    sendSuccess(res, consultation, 'Consultation updated');
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const consultation = await consultationService.complete(req.params.id);
    sendSuccess(res, consultation, 'Consultation completed');
  }),
};
