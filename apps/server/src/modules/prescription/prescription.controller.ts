import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { ApiError } from '../../helpers/ApiError';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { assertOwnHospital } from '../../helpers/hospitalScope';
import { doctorRepository } from '../doctor/doctor.repository';
import { patientRepository } from '../patient/patient.repository';
import { prescriptionService } from './prescription.service';

export const prescriptionController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const prescription = await prescriptionService.create(req.body);
    sendSuccess(res, prescription, 'Prescription created', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const filter: {
      doctorId?: string;
      patientId?: string;
      hospitalId?: string;
      page?: number;
      limit?: number;
    } = {
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
    };

    if (req.user!.role === 'doctor') {
      const doctor = await doctorRepository.findByUserId(req.user!.id);
      filter.doctorId = doctor?._id.toString();
      if (req.query.patientId) filter.patientId = req.query.patientId as string;
    } else if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      filter.patientId = patient?._id.toString();
    } else if (req.query.patientId) {
      // Admin / health officer supplying an explicit patientId — never trust it
      // to already belong to their own hospital, force the hospital scope too.
      if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');
      filter.patientId = req.query.patientId as string;
      filter.hospitalId = req.user!.hospitalId;
    } else {
      throw ApiError.badRequest('patientId query parameter is required');
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
    assertOwnHospital(req.user!, prescription.hospitalId);
    sendSuccess(res, prescription);
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const prescription = await prescriptionService.cancel(req.params.id);
    sendSuccess(res, prescription, 'Prescription cancelled');
  }),
};
