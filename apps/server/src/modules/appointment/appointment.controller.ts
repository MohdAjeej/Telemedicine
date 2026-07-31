import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { HTTP_STATUS } from '../../constants/httpStatus';
import type { AppointmentStatus } from './appointment.model';
import { appointmentService } from './appointment.service';

export const appointmentController = {
  book: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.book(req.user!.id, req.user!.role, req.body);
    sendSuccess(res, appointment, 'Appointment requested', HTTP_STATUS.CREATED);
  }),

  list: asyncHandler(async (req: Request, res: Response) => {
    const result = await appointmentService.list(
      { userId: req.user!.id, role: req.user!.role, hospitalId: req.user!.hospitalId },
      {
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        status: req.query.status as AppointmentStatus | undefined,
        from: req.query.from as string | undefined,
        to: req.query.to as string | undefined,
      },
    );
    sendSuccess(res, result.items, 'Appointments fetched', HTTP_STATUS.OK, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  }),

  getById: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.getById(req.params.id);
    sendSuccess(res, appointment);
  }),

  confirm: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.confirm(req.params.id, req.user!.id);
    sendSuccess(res, appointment, 'Appointment confirmed');
  }),

  complete: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.complete(req.params.id, req.user!.id);
    sendSuccess(res, appointment, 'Appointment marked as completed');
  }),

  markNoShow: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.markNoShow(req.params.id, req.user!.id);
    sendSuccess(res, appointment, 'Appointment marked as no-show');
  }),

  cancel: asyncHandler(async (req: Request, res: Response) => {
    const appointment = await appointmentService.cancel(req.params.id, req.user!.id, req.body?.reason);
    sendSuccess(res, appointment, 'Appointment cancelled');
  }),
};
