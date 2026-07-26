import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { authorize } from '../../middlewares/role.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { settingsController } from './settings.controller';
import { updateSettingsValidation } from './settings.validation';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/', settingsController.get);
router.patch('/', updateSettingsValidation, validateRequest, settingsController.update);

export default router;
