import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { medicalRecordController } from './medicalRecord.controller';
import { createMedicalRecordValidation, medicalRecordIdValidation } from './medicalRecord.validation';

const router = Router();

router.use(authenticate);

router.get('/', medicalRecordController.listForPatient);
router.post(
  '/',
  authorize('doctor', 'health_officer', 'admin'),
  createMedicalRecordValidation,
  validateRequest,
  medicalRecordController.create,
);
router.get('/:id', medicalRecordIdValidation, validateRequest, medicalRecordController.getById);
router.delete(
  '/:id',
  authorize('doctor', 'admin'),
  medicalRecordIdValidation,
  validateRequest,
  medicalRecordController.remove,
);

export default router;
