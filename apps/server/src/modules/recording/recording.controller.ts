import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { ApiError } from '../../helpers/ApiError';
import { HTTP_STATUS } from '../../constants/httpStatus';
import { recordingService } from './recording.service';

export const recordingController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) throw ApiError.badRequest('No recording file was uploaded');
    const recording = await recordingService.create({
      appointmentId: req.params.appointmentId,
      recordedBy: req.user!.id,
      buffer: req.file.buffer,
    });
    sendSuccess(res, recording, 'Recording saved', HTTP_STATUS.CREATED);
  }),

  listForAppointment: asyncHandler(async (req: Request, res: Response) => {
    const recordings = await recordingService.listForAppointment(req.params.appointmentId, req.user!.id);
    sendSuccess(res, recordings);
  }),

  remove: asyncHandler(async (req: Request, res: Response) => {
    await recordingService.remove(req.params.id, req.user!.id);
    sendSuccess(res, null, 'Recording deleted');
  }),
};
