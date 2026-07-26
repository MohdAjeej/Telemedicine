import { body, param } from 'express-validator';

export const startConversationValidation = [
  body('otherUserId').isMongoId().withMessage('Invalid user id'),
];

export const sendMessageValidation = [
  body('content').trim().notEmpty().withMessage('Message content is required'),
];

export const conversationIdValidation = [param('id').isMongoId().withMessage('Invalid conversation id')];
