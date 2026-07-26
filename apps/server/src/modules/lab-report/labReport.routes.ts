import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { labReportController } from './labReport.controller';
import {
  labReportIdValidation,
  requestLabReportValidation,
  updateLabReportValidation,
} from './labReport.validation';

const router = Router();

router.use(authenticate);

router.get('/', labReportController.listForPatient);
router.post(
  '/',
  authorize('doctor', 'health_officer'),
  requestLabReportValidation,
  validateRequest,
  labReportController.request,
);
router.get('/:id', labReportIdValidation, validateRequest, labReportController.getById);
router.patch(
  '/:id',
  authorize('doctor', 'health_officer', 'admin'),
  labReportIdValidation,
  updateLabReportValidation,
  validateRequest,
  labReportController.updateResult,
);

export default router;
