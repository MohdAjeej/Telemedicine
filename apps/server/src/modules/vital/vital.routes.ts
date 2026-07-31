import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { vitalController } from './vital.controller';
import { recordVitalValidation, vitalIdValidation } from './vital.validation';

const router = Router();

router.use(authenticate);

router.get('/', vitalController.listForPatient);
router.post(
  '/',
  authorize('health_officer'),
  recordVitalValidation,
  validateRequest,
  vitalController.record,
);
router.get('/:id', vitalIdValidation, validateRequest, vitalController.getById);

export default router;
