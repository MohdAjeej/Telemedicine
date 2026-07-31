import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { assertOwnHospital } from '../../helpers/hospitalScope';
import { patientService } from './patient.service';

export const patientController = {
  /** Admin or Health Officer front-desk registration — hospital is always the caller's own, never chosen by them. */
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user!.hospitalId) throw ApiError.forbidden('Your staff profile is not linked to a hospital');

    const patient = await patientService.create(req.body, req.user!.hospitalId);
    sendSuccess(res, patient, 'Patient registered', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    // An admin only ever manages their own hospital — force the scope from the
    // signed JWT claim rather than trusting a client-supplied hospitalId (which
    // would otherwise leak every hospital's patients to any admin). Other roles
    // keep the existing caller-supplied hospitalId behavior.
    let hospitalId = req.query.hospitalId as string | undefined;
    if (req.user!.role === 'admin') {
      if (!req.user!.hospitalId) throw ApiError.forbidden('Your account is not linked to a hospital');
      hospitalId = req.user!.hospitalId;
    }

    const result = await patientService.list({
      page: req.query.page ? Number(req.query.page) : undefined,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      hospitalId,
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
    assertOwnHospital(req.user!, patient.hospitalId);
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
    const existing = await patientService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    const patient = await patientService.updateById(req.params.id, req.body);
    sendSuccess(res, patient, 'Patient updated');
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    const existing = await patientService.getById(req.params.id);
    assertOwnHospital(req.user!, existing.hospitalId);
    await patientService.remove(req.params.id);
    sendSuccess(res, null, 'Patient deleted');
  }),
};
