import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { patientService } from './patient.service';

export const patientController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.create(req.body);
    sendSuccess(res, patient, 'Patient registered', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await patientService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      assignedDoctorId: req.query.assignedDoctorId as string | undefined,
    });
    sendSuccess(res, result.items, 'Patients fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.getById(req.params.id);
    sendSuccess(res, patient);
  }),

  getMe: asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.getByUserId(req.user!.id);
    sendSuccess(res, patient);
  }),

  updateMe: asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.updateOwnProfile(req.user!.id, req.body);
    sendSuccess(res, patient, 'Profile updated');
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientService.updateById(req.params.id, req.body);
    sendSuccess(res, patient, 'Patient updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await patientService.remove(req.params.id);
    sendSuccess(res, null, 'Patient deleted');
  }),
};
