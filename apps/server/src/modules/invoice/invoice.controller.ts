import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { ApiError } from '../../helpers/ApiError';
import { patientRepository } from '../patient/patient.repository';
import { invoiceService } from './invoice.service';

export const invoiceController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.create(req.body);
    sendSuccess(res, invoice, 'Invoice created', HTTP_STATUS.CREATED);
  }),

  listForPatient: asyncHandler(async (req: Request, res: Response) => {
    let patientId = req.query.patientId as string | undefined;
    if (req.user!.role === 'patient') {
      const patient = await patientRepository.findByUserId(req.user!.id);
      patientId = patient?._id.toString();
    }
    if (!patientId) throw ApiError.badRequest('patientId query parameter is required');
    const invoices = await invoiceService.listForPatient(patientId);
    sendSuccess(res, invoices);
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.getById(req.params.id);
    sendSuccess(res, invoice);
  }),

  void: asyncHandler(async (req: Request, res: Response) => {
    const invoice = await invoiceService.updateStatus(req.params.id, 'void');
    sendSuccess(res, invoice, 'Invoice voided');
  }),
};
