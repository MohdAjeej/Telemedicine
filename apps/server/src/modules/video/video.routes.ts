import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { videoController } from './video.controller';
import { appointmentIdParamValidation } from './video.validation';

const router = Router();

router.use(authenticate);

router.get('/:appointmentId/room', appointmentIdParamValidation, validateRequest, videoController.getRoom);

export default router;
