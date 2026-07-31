import { body, param, query } from 'express-validator';
import { SPECIALTIES } from '@telemedicine/constants';

export const createDoctorValidation = [
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
  body('specialization')
    .isArray({ min: 1 })
    .withMessage('At least one specialization is required'),
  body('specialization.*').isIn(SPECIALTIES).withMessage('Invalid specialization'),
];

export const updateDoctorValidation = [
  body('experienceYears').optional().isInt({ min: 0 }).withMessage('Invalid experience years'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Invalid consultation fee'),
  body('specialization').optional().isArray({ min: 1 }).withMessage('At least one specialization is required'),
  body('specialization.*').optional().isIn(SPECIALTIES).withMessage('Invalid specialization'),
  body('qualifications').optional().isArray().withMessage('Qualifications must be an array'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Invalid age'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('bloodGroup').optional().trim(),
  body('address').optional().trim(),
];

export const doctorIdValidation = [param('id').isMongoId().withMessage('Invalid doctor id')];

export const listDoctorsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
