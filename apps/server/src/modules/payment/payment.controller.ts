import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { patientRepository } from '../patient/patient.repository';
import { paymentService } from './payment.service';

export const paymentController = {
  pay: asyncHandler(async (req: Request, res: Response) => {
    const patient = await patientRepository.findByUserId(req.user!.id);
    if (!patient) throw ApiError.notFound('Complete your patient profile before making a payment');

    const payment = await paymentService.pay({ ...req.body, patientId: patient._id.toString() });
    sendSuccess(res, payment, 'Payment successful', HTTP_STATUS.CREATED);
  }),

  listForPatient: asyncHandler(async (req: Request, res: Response) => {
    let patientId = req.query.patientId as string | undefined;
    if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      patientId = patient?._id.toString();
    }
    if (!patientId) throw ApiError.badRequest('patientId query parameter is required');
    const payments = await paymentService.listForPatient(patientId);
    sendSuccess(res, payments);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const payment = await paymentService.getById(req.params.id);
    sendSuccess(res, payment);
  }),
};
