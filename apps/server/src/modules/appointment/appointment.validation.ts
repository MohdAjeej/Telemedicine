import { body, param, query } from 'express-validator';

export const bookAppointmentValidation = [
  body('doctorId').isMongoId().withMessage('Invalid doctor id'),
  body('hospitalId').isMongoId().withMessage('Invalid hospital id'),
  body('scheduledStart').isISO8601().withMessage('A valid start time is required'),
  body('scheduledEnd').optional().isISO8601().withMessage('Invalid end time'),
  body('reasonForVisit').trim().notEmpty().withMessage('Please describe the reason for your visit'),
  body('patientId').isMongoId().withMessage('Invalid patient id'),
];

export const rescheduleAppointmentValidation = [
  body('scheduledStart').isISO8601().withMessage('A valid start time is required'),
  body('scheduledEnd').optional().isISO8601().withMessage('Invalid end time'),
];

export const cancelAppointmentValidation = [
  body('reason').optional().trim(),
];

export const appointmentIdValidation = [param('id').isMongoId().withMessage('Invalid appointment id')];

export const listAppointmentsValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'cancelled', 'completed', 'no_show'])
    .withMessage('Invalid status'),
];
