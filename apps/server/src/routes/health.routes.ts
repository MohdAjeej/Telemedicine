import { Router } from 'express';
import { sendSuccess } from '../helpers/ApiResponse';
import { asyncHandler } from '../helpers/asyncHandler';

const router = Router();

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    sendSuccess(res, {
      status: 'ok',
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    });
  }),
);

export default router;
