import { Router } from 'express';
import { authController } from './auth.controller';
import {
  forgotPasswordValidation,
  loginValidation,
  registerValidation,
  resetPasswordValidation,
  verifyEmailValidation,
} from './auth.validation';
import { validateRequest } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { authRouteLimiter } from './auth.middleware';

const router = Router();

router.post(
  '/register',
  authRouteLimiter,
  registerValidation,
  validateRequest,
  authController.register,
);
router.post('/login', authRouteLimiter, loginValidation, validateRequest, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.post(
  '/forgot-password',
  authRouteLimiter,
  forgotPasswordValidation,
  validateRequest,
  authController.forgotPassword,
);
router.post(
  '/reset-password/:token',
  resetPasswordValidation,
  validateRequest,
  authController.resetPassword,
);
router.post('/verify-email/:token', verifyEmailValidation, validateRequest, authController.verifyEmail);
router.get('/me', authenticate, authController.getMe);

export default router;
