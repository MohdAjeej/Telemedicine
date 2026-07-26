import { body, param } from 'express-validator';

export const registerValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('phone').optional().trim(),
  body('role')
    .isIn(['patient', 'doctor', 'health_officer'])
    .withMessage('Role must be patient, doctor, or health_officer'),
];

export const loginValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
];

export const resetPasswordValidation = [
  param('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[a-z]/)
    .withMessage('Password must contain a lowercase letter')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter')
    .matches(/\d/)
    .withMessage('Password must contain a number'),
];

export const verifyEmailValidation = [
  param('token').notEmpty().withMessage('Verification token is required'),
];
