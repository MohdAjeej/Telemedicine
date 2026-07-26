import { body, param, query } from 'express-validator';

export const createHospitalValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('registrationNumber').trim().notEmpty().withMessage('Registration number is required'),
  body('type').isIn(['clinic', 'hospital', 'multi_specialty']).withMessage('Invalid hospital type'),
  body('phone').trim().notEmpty().withMessage('Phone is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('website').optional({ values: 'falsy' }).isURL().withMessage('Website must be a valid URL'),
];

export const updateHospitalValidation = [
  param('id').isMongoId().withMessage('Invalid hospital id'),
  body('type')
    .optional()
    .isIn(['clinic', 'hospital', 'multi_specialty'])
    .withMessage('Invalid hospital type'),
  body('email').optional().isEmail().withMessage('A valid email is required'),
  body('status').optional().isIn(['active', 'inactive']).withMessage('Invalid status'),
];

export const hospitalIdValidation = [param('id').isMongoId().withMessage('Invalid hospital id')];

export const listHospitalsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
