import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { healthOfficerController } from './healthOfficer.controller';
import {
  createHealthOfficerValidation,
  healthOfficerIdValidation,
  listHealthOfficersValidation,
  updateHealthOfficerValidation,
} from './healthOfficer.validation';

const router = Router();

router.use(authenticate);

router.get('/', authorize('admin'), listHealthOfficersValidation, validateRequest, healthOfficerController.list);
router.get('/me', authorize('health_officer'), healthOfficerController.getMe);
router.patch(
  '/me',
  authorize('health_officer'),
  updateHealthOfficerValidation,
  validateRequest,
  healthOfficerController.updateMe,
);
router.get(
  '/:id',
  authorize('admin'),
  healthOfficerIdValidation,
  validateRequest,
  healthOfficerController.getById,
);

router.post(
  '/',
  authorize('admin'),
  createHealthOfficerValidation,
  validateRequest,
  healthOfficerController.create,
);
router.patch(
  '/:id',
  authorize('admin'),
  healthOfficerIdValidation,
  updateHealthOfficerValidation,
  validateRequest,
  healthOfficerController.update,
);
router.delete(
  '/:id',
  authorize('admin'),
  healthOfficerIdValidation,
  validateRequest,
  healthOfficerController.remove,
);

export default router;
