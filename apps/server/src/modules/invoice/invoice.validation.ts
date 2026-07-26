import { body, param } from 'express-validator';

export const createInvoiceValidation = [
  body('patientId').isMongoId().withMessage('Invalid patient id'),
  body('items').isArray({ min: 1 }).withMessage('At least one line item is required'),
  body('items.*.description').trim().notEmpty().withMessage('Item description is required'),
  body('items.*.amount').isFloat({ min: 0 }).withMessage('Item amount must be a positive number'),
  body('dueDate').isISO8601().withMessage('A valid due date is required'),
];

export const invoiceIdValidation = [param('id').isMongoId().withMessage('Invalid invoice id')];
