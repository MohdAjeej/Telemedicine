import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { validateRequest } from '../../middlewares/validate.middleware';
import { messageController } from './message.controller';
import { conversationIdValidation, sendMessageValidation, startConversationValidation } from './message.validation';

const router = Router();

router.use(authenticate);

router.get('/conversations', messageController.listConversations);
router.post('/conversations', startConversationValidation, validateRequest, messageController.startConversation);
router.get('/conversations/:id/messages', conversationIdValidation, validateRequest, messageController.listMessages);
router.post(
  '/conversations/:id/messages',
  conversationIdValidation,
  sendMessageValidation,
  validateRequest,
  messageController.send,
);
router.post('/conversations/:id/read', conversationIdValidation, validateRequest, messageController.markRead);

export default router;
