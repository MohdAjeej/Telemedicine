import { body, param } from 'express-validator';

export const createMedicalRecordValidation = [
  body('patientId').isMongoId().withMessage('Invalid patient id'),
  body('type').isIn(['lab', 'imaging', 'note', 'discharge_summary']).withMessage('Invalid record type'),
  body('title').trim().notEmpty().withMessage('Title is required'),
];

export const medicalRecordIdValidation = [param('id').isMongoId().withMessage('Invalid medical record id')];
