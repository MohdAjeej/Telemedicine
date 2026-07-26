import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { prescriptionController } from './prescription.controller';
import {
  createPrescriptionValidation,
  listPrescriptionsValidation,
  prescriptionIdValidation,
} from './prescription.validation';

const router = Router();

router.use(authenticate);

router.get('/', listPrescriptionsValidation, validateRequest, prescriptionController.list);
router.post('/', authorize('doctor'), createPrescriptionValidation, validateRequest, prescriptionController.create);
router.get('/:id', prescriptionIdValidation, validateRequest, prescriptionController.getById);
router.post(
  '/:id/cancel',
  authorize('doctor'),
  prescriptionIdValidation,
  validateRequest,
  prescriptionController.cancel,
);

export default router;
