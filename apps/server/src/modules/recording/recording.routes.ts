import { Router } from 'express';
import { ROLES } from '@telemedicine/constants';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { videoUpload } from '../../config/multer.config';
import { recordingController } from './recording.controller';
import { appointmentIdParamValidation } from './recording.validation';

const router = Router();

router.use(authenticate, authorize(ROLES.DOCTOR, ROLES.HEALTH_OFFICER));

router.post(
  '/:appointmentId',
  appointmentIdParamValidation,
  validateRequest,
  videoUpload.single('video'),
  recordingController.create,
);

router.get('/:appointmentId', appointmentIdParamValidation, validateRequest, recordingController.listForAppointment);

export default router;
