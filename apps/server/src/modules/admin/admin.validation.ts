import { body, param } from 'express-validator';

export const createAdminValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

export const adminIdValidation = [param('id').isMongoId().withMessage('Invalid admin id')];
