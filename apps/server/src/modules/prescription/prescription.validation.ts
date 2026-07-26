import { body, param, query } from 'express-validator';

export const createPrescriptionValidation = [
  body('consultationId').isMongoId().withMessage('Invalid consultation id'),
  body('medications').isArray({ min: 1 }).withMessage('At least one medication is required'),
  body('medications.*.name').trim().notEmpty().withMessage('Medication name is required'),
  body('medications.*.dosage').trim().notEmpty().withMessage('Dosage is required'),
  body('medications.*.frequency').trim().notEmpty().withMessage('Frequency is required'),
  body('medications.*.durationDays').isInt({ min: 1 }).withMessage('Duration must be a positive number of days'),
];

export const prescriptionIdValidation = [param('id').isMongoId().withMessage('Invalid prescription id')];

export const listPrescriptionsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
