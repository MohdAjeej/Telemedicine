import { body, param, query } from 'express-validator';

export const recordVitalValidation = [
  body('patientId').isMongoId().withMessage('Invalid patient id'),
  body('bloodPressureSystolic').optional().isInt({ min: 0 }),
  body('bloodPressureDiastolic').optional().isInt({ min: 0 }),
  body('heartRate').optional().isInt({ min: 0 }),
  body('temperature').optional().isFloat({ min: 0 }),
  body('respiratoryRate').optional().isInt({ min: 0 }),
  body('oxygenSaturation').optional().isFloat({ min: 0, max: 100 }),
  body('weight').optional().isFloat({ min: 0 }),
  body('height').optional().isFloat({ min: 0 }),
  body('bloodSugar').optional().isFloat({ min: 0 }),
  body('age').optional().isInt({ min: 0, max: 150 }),
  body('gender').optional().isIn(['male', 'female', 'other']),
  body('hemoglobin').optional().isFloat({ min: 0, max: 30 }),
  body('comorbidity').optional().trim(),
  body('complaints').optional().trim(),
  body('symptoms').optional().trim(),
];

export const vitalIdValidation = [param('id').isMongoId().withMessage('Invalid vital id')];

export const listVitalsValidation = [query('patientId').isMongoId().withMessage('patientId is required')];
