import { body } from 'express-validator';

const passwordRules = (field = 'password') =>
  body(field)
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number');

/** Public self-registration is patient-only — role is never client-supplied. */
export const registerValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  passwordRules(),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().trim(),
  body('age').isInt({ min: 0, max: 150 }).withMessage('A valid age is required').toInt(),
  body('hospitalId').isMongoId().withMessage('Please select a hospital'),
];

export const registerAdminValidation = [
  body('hospitalName').trim().notEmpty().withMessage('Hospital name is required'),
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  passwordRules(),
];

export const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const adminHandoffExchangeValidation = [
  body('ticket').notEmpty().withMessage('Ticket is required'),
];

export const updateMeValidation = [
  body('firstName').optional().trim().notEmpty().withMessage('First name cannot be empty'),
  body('lastName').optional().trim().notEmpty().withMessage('Last name cannot be empty'),
  body('phone').optional().trim(),
];

export const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  passwordRules('newPassword'),
];
