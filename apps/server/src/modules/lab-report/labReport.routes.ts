import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { upload } from '../../config/multer.config';
import { labReportController } from './labReport.controller';
import {
  labReportIdValidation,
  requestLabReportValidation,
  selfUploadLabReportValidation,
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
router.post(
  '/self-upload',
  authorize('patient'),
  // multer must run first — it's what parses the multipart body, so
  // body('testType') has nothing to validate until after it runs.
  upload.single('report'),
  selfUploadLabReportValidation,
  validateRequest,
  labReportController.uploadOwnReport,
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
router.post(
  '/:id/report',
  authorize('doctor', 'health_officer', 'admin'),
  labReportIdValidation,
  validateRequest,
  upload.single('report'),
  labReportController.uploadReport,
);
router.delete(
  '/:id',
  authorize('doctor', 'health_officer', 'admin'),
  labReportIdValidation,
  validateRequest,
  labReportController.remove,
);

export default router;
