import { body, param, query } from 'express-validator';

export const createDoctorValidation = [
  body('email').isEmail().withMessage('A valid email is required'),
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('hospitalId').optional().isMongoId().withMessage('Invalid hospital id'),
  body('specialization').optional().isArray().withMessage('Specialization must be an array'),
];

export const updateDoctorValidation = [
  body('hospitalId').optional().isMongoId().withMessage('Invalid hospital id'),
  body('experienceYears').optional().isInt({ min: 0 }).withMessage('Invalid experience years'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Invalid consultation fee'),
];

export const doctorIdValidation = [param('id').isMongoId().withMessage('Invalid doctor id')];

export const listDoctorsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
