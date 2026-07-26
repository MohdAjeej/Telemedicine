import { body, param, query } from 'express-validator';

export const recordVitalValidation = [
  body('patientId').isMongoId().withMessage('Invalid patient id'),
  body('heartRate').optional().isInt({ min: 0 }),
  body('temperature').optional().isFloat({ min: 0 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('height').optional().isFloat({ min: 0 }),
];

export const vitalIdValidation = [param('id').isMongoId().withMessage('Invalid vital id')];

export const listVitalsValidation = [query('patientId').isMongoId().withMessage('patientId is required')];
