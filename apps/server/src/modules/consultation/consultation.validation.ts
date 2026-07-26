import { body, param, query } from 'express-validator';

export const startConsultationValidation = [
  body('appointmentId').isMongoId().withMessage('Invalid appointment id'),
  body('chiefComplaint').optional().trim(),
];

export const updateConsultationValidation = [
  body('diagnosis').optional().trim(),
  body('notes').optional().trim(),
  body('followUpRequired').optional().isBoolean(),
  body('followUpDate').optional().isISO8601(),
];

export const consultationIdValidation = [param('id').isMongoId().withMessage('Invalid consultation id')];

export const listConsultationsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];
