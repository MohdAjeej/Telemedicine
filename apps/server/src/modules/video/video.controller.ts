import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { videoService } from './video.service';

export const videoController = {
  getRoom: asyncHandler(async (req: Request, res: Response) => {
    const room = await videoService.getRoomForAppointment(req.params.appointmentId, req.user!.id);
    sendSuccess(res, room);
  }),
};
