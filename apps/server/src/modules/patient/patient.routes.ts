import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { patientController } from './patient.controller';
import {
  createPatientValidation,
  listPatientsValidation,
  patientIdValidation,
  updatePatientValidation,
} from './patient.validation';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin', 'doctor', 'health_officer'), listPatientsValidation, validateRequest, patientController.list);
router.get('/me', authorize('patient'), patientController.getMe);
router.patch('/me', authorize('patient'), updatePatientValidation, validateRequest, patientController.updateMe);
router.get(
  '/:id',
  authorize('admin', 'doctor', 'health_officer'),
  patientIdValidation,
  validateRequest,
  patientController.getById,
);

router.post(
  '/',
  authorize('admin', 'health_officer'),
  createPatientValidation,
  validateRequest,
  patientController.create,
);
router.patch(
  '/:id',
  authorize('admin', 'health_officer'),
  patientIdValidation,
  updatePatientValidation,
  validateRequest,
  patientController.update,
);
router.delete('/:id', authorize('admin'), patientIdValidation, validateRequest, patientController.remove);

export default router;
