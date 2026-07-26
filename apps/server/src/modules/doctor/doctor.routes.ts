import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { doctorController } from './doctor.controller';
import {
  createDoctorValidation,
  doctorIdValidation,
  listDoctorsValidation,
  updateDoctorValidation,
} from './doctor.validation';

const router = Router();

router.use(authenticate);

router.get('/', listDoctorsValidation, validateRequest, doctorController.list);
router.get('/me', authorize('doctor'), doctorController.getMe);
router.patch('/me', authorize('doctor'), updateDoctorValidation, validateRequest, doctorController.updateMe);
router.get('/:id', doctorIdValidation, validateRequest, doctorController.getById);

router.post('/', authorize('admin'), createDoctorValidation, validateRequest, doctorController.create);
router.patch(
  '/:id',
  authorize('admin'),
  doctorIdValidation,
  updateDoctorValidation,
  validateRequest,
  doctorController.update,
);
router.delete('/:id', authorize('admin'), doctorIdValidation, validateRequest, doctorController.remove);

export default router;
