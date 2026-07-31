import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { hospitalController } from './hospital.controller';
import {
  createHospitalValidation,
  hospitalIdValidation,
  listHospitalsValidation,
  updateHospitalValidation,
} from './hospital.validation';

const router = Router();

// Deliberately public (no authenticate): the Patient registration form needs
// to populate its Hospital dropdown before the visitor has an account.
// Hospital directory info (name/type/contact) isn't sensitive.
router.get('/', listHospitalsValidation, validateRequest, hospitalController.list);
router.get('/:id', hospitalIdValidation, validateRequest, hospitalController.getById);

router.post(
  '/',
  authenticate,
  authorize('admin'),
  createHospitalValidation,
  validateRequest,
  hospitalController.create,
);
router.patch(
  '/:id',
  authenticate,
  authorize('admin'),
  updateHospitalValidation,
  validateRequest,
  hospitalController.update,
);
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  hospitalIdValidation,
  validateRequest,
  hospitalController.remove,
);

export default router;
