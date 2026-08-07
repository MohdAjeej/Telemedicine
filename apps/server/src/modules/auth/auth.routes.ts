import { Router } from 'express';
import { authController } from './auth.controller';
import {
  adminHandoffExchangeValidation,
  changePasswordValidation,
  loginValidation,
  registerAdminValidation,
  registerValidation,
  updateMeValidation,
} from './auth.validation';
import { validateRequest } from '../../middlewares/validate.middleware';
import { authenticate } from '../../middlewares/auth.middleware';
import { adminHandoffRateLimiter, authRouteLimiter } from './auth.middleware';

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
// Hands an already-authenticated admin off from the client app's shared login page
// to the standalone Admin Console — ticket issuance requires the admin's own fresh
// access token; the exchange is public (that's the whole point) but rate-limited and
// the ticket itself is single-use and expires in ~60s (see ADMIN_HANDOFF_EXPIRES_IN).
router.post('/admin-handoff', authenticate, adminHandoffRateLimiter, authController.adminHandoff);
router.post(
  '/admin-handoff/exchange',
  adminHandoffRateLimiter,
  adminHandoffExchangeValidation,
  validateRequest,
  authController.adminHandoffExchange,
);
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
