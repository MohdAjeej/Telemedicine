import type { Request, Response } from 'express';
import { asyncHandler } from '../../helpers/asyncHandler';
import { sendSuccess } from '../../helpers/ApiResponse';
import { settingsService } from './settings.service';

export const settingsController = {
  get: asyncHandler(async (_req: Request, res: Response) => {
    const settings = await settingsService.get();
    sendSuccess(res, settings);
  }),

  update: asyncHandler(async (req: Request, res: Response) => {
    const settings = await settingsService.update(req.body);
    sendSuccess(res, settings, 'Settings updated');
  }),
};
