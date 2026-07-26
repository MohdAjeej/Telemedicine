import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { adminController } from './admin.controller';
import { adminIdValidation, createAdminValidation } from './admin.validation';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', adminController.list);
router.get('/me', adminController.getMe);
router.get('/:id', adminIdValidation, validateRequest, adminController.getById);
router.post('/', createAdminValidation, validateRequest, adminController.create);
router.delete('/:id', adminIdValidation, validateRequest, adminController.remove);

export default router;
