import { body, param } from 'express-validator';

export const requestLabReportValidation = [
  body('patientId').isMongoId().withMessage('Invalid patient id'),
  body('testType').trim().notEmpty().withMessage('Test type is required'),
];

export const selfUploadLabReportValidation = [
  body('testType').trim().notEmpty().withMessage('Test type is required'),
];

export const updateLabReportValidation = [
  body('status').isIn(['requested', 'in_progress', 'completed']).withMessage('Invalid status'),
  body('resultSummary').optional().trim(),
];

export const labReportIdValidation = [param('id').isMongoId().withMessage('Invalid lab report id')];
