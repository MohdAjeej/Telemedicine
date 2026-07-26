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

router.use(authenticate);

router.get('/', listHospitalsValidation, validateRequest, hospitalController.list);
router.get('/:id', hospitalIdValidation, validateRequest, hospitalController.getById);

router.post(
  '/',
  authorize('admin'),
  createHospitalValidation,
  validateRequest,
  hospitalController.create,
);
router.patch(
  '/:id',
  authorize('admin'),
  updateHospitalValidation,
  validateRequest,
  hospitalController.update,
);
router.delete('/:id', authorize('admin'), hospitalIdValidation, validateRequest, hospitalController.remove);

export default router;
