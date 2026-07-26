import { body, param } from 'express-validator';

export const createPaymentValidation = [
  body('invoiceId').isMongoId().withMessage('Invalid invoice id'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than zero'),
  body('method').isIn(['card', 'upi', 'insurance']).withMessage('Invalid payment method'),
];

export const paymentIdValidation = [param('id').isMongoId().withMessage('Invalid payment id')];
