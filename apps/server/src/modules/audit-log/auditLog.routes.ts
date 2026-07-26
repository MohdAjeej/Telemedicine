import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { auditLogController } from './auditLog.controller';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', auditLogController.list);

export default router;
