import { param } from 'express-validator';

export const appointmentIdParamValidation = [
  param('appointmentId').isMongoId().withMessage('Invalid appointment id'),
];
