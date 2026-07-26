import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { adminController } from './admin.controller';
import {
  adminIdValidation,
  createAdminValidation,
  listUsersValidation,
  updatePermissionsValidation,
  updateUserStatusValidation,
} from './admin.validation';

const router = Router();

router.use(authenticate, authorize('admin'));

// Fixed/multi-segment paths must be registered before the generic '/:id'
// catch-all below, or '/users' would be matched as id="users".
router.get('/users', listUsersValidation, validateRequest, adminController.listUsers);
router.patch(
  '/users/:userId/status',
  updateUserStatusValidation,
  validateRequest,
  adminController.updateUserStatus,
);
router.patch(
  '/users/:userId/permissions',
  updatePermissionsValidation,
  validateRequest,
  adminController.updatePermissions,
);

router.get('/', adminController.list);
router.get('/me', adminController.getMe);
router.get('/:id', adminIdValidation, validateRequest, adminController.getById);
router.post('/', createAdminValidation, validateRequest, adminController.create);
router.delete('/:id', adminIdValidation, validateRequest, adminController.remove);

export default router;
