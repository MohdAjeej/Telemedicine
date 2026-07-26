import { body, param, query } from 'express-validator';

export const createPatientValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
];

export const updatePatientValidation = [
  body('dateOfBirth').optional().isISO8601().withMessage('Invalid date of birth'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('assignedDoctorId').optional().isMongoId().withMessage('Invalid doctor id'),
];

export const patientIdValidation = [param('id').isMongoId().withMessage('Invalid patient id')];

export const listPatientsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
