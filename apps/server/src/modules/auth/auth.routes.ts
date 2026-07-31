import { Router } from 'express';
import { authController } from './auth.controller';
import {
  changePasswordValidation,
  loginValidation,
  registerAdminValidation,
  registerValidation,
  updateMeValidation,
} from './auth.validation';
import { validateRequest } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRouteLimiter } from './auth.middleware';

const router = Router();

// Patient self-registration.
router.post(
  '/register',
  authRouteLimiter,
  registerValidation,
  validateRequest,
  authController.register,
);
// Admin self-registration — creates the Hospital in the same step.
router.post(
  '/register-admin',
  authRouteLimiter,
  registerAdminValidation,
  validateRequest,
  authController.registerAdmin,
);
router.post('/login', authRouteLimiter, loginValidation, validateRequest, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, updateMeValidation, validateRequest, authController.updateMe);
router.patch(
  '/password',
  authenticate,
  changePasswordValidation,
  validateRequest,
  authController.changePassword,
);

export default router;
