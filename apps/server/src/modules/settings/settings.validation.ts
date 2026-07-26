import { body } from 'express-validator';

export const updateSettingsValidation = [
  body('platformName').optional().trim().isLength({ min: 1, max: 120 }),
  body('supportEmail').optional().isEmail().withMessage('A valid support email is required'),
  body('defaultAppointmentSlotMinutes').optional().isInt({ min: 5, max: 240 }),
  body('maintenanceMode').optional().isBoolean(),
];
