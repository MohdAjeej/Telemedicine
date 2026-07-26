import { body, param, query } from 'express-validator';

export const createAdminValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
];

export const adminIdValidation = [param('id').isMongoId().withMessage('Invalid admin id')];

export const listUsersValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('role').optional().isIn(['admin', 'doctor', 'health_officer', 'patient']).withMessage('Invalid role'),
  query('status').optional().isIn(['pending', 'active', 'suspended']).withMessage('Invalid status'),
];

export const updateUserStatusValidation = [
  param('userId').isMongoId().withMessage('Invalid user id'),
  body('status').isIn(['pending', 'active', 'suspended']).withMessage('Invalid status'),
];

export const updatePermissionsValidation = [
  param('userId').isMongoId().withMessage('Invalid user id'),
  body('permissions').isArray().withMessage('Permissions must be an array'),
  body('permissions.*').isString(),
];
