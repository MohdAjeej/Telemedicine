import { param } from 'express-validator';

export const appointmentIdParamValidation = [
  param('appointmentId').isMongoId().withMessage('Invalid appointment id'),
];

export const recordingIdValidation = [param('id').isMongoId().withMessage('Invalid recording id')];
