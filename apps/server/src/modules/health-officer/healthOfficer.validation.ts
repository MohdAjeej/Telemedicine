import { body, param, query } from 'express-validator';

export const createHealthOfficerValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('hospitalId').optional().isMongoId().withMessage('Invalid hospital id'),
];

export const updateHealthOfficerValidation = [
  body('hospitalId').optional().isMongoId().withMessage('Invalid hospital id'),
  body('certifications').optional().isArray().withMessage('Certifications must be an array'),
];

export const healthOfficerIdValidation = [param('id').isMongoId().withMessage('Invalid health officer id')];

export const listHealthOfficersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
