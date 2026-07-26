import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { consultationController } from './consultation.controller';
import {
  consultationIdValidation,
  listConsultationsValidation,
  startConsultationValidation,
  updateConsultationValidation,
} from './consultation.validation';

const router = Router();

router.use(authenticate);

router.get('/', listConsultationsValidation, validateRequest, consultationController.list);
router.post('/', authorize('doctor'), startConsultationValidation, validateRequest, consultationController.start);
router.get('/:id', consultationIdValidation, validateRequest, consultationController.getById);
router.patch(
  '/:id',
  authorize('doctor'),
  consultationIdValidation,
  updateConsultationValidation,
  validateRequest,
  consultationController.update,
);
router.post(
  '/:id/complete',
  authorize('doctor'),
  consultationIdValidation,
  validateRequest,
  consultationController.complete,
);

export default router;
