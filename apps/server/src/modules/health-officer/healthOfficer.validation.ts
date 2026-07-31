import { body, param, query } from 'express-validator';

export const createHealthOfficerValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
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
];

export const updateHealthOfficerValidation = [
  body('certifications').optional().isArray().withMessage('Certifications must be an array'),
];

export const healthOfficerIdValidation = [param('id').isMongoId().withMessage('Invalid health officer id')];

export const listHealthOfficersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
