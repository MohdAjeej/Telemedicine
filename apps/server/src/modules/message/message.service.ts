import { ApiError } from '../../helpers/ApiError';
import { messageRepository } from './message.repository';
import { emitNewMessage } from './message.socket';

export const messageService = {
  async startConversation(userId: string, otherUserId: string) {
    return messageRepository.findOrCreateConversation([userId, otherUserId]);
  },

  async listConversations(userId: string) {
    return messageRepository.listConversationsForUser(userId);
  },

  async send(conversationId: string, senderId: string, content: string, attachments?: string[]) {
    const conversation = await messageRepository.findConversationById(conversationId);
    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (!conversation.participants.map(String).includes(senderId)) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }

    const message = await messageRepository.createMessage({ conversationId, senderId, content, attachments });

    const recipientId = conversation.participants.map(String).find((id) => id !== senderId);
    if (recipientId) emitNewMessage(recipientId, message);

    return message;
  },

  async listMessages(conversationId: string, userId: string) {
    const conversation = await messageRepository.findConversationById(conversationId);
    if (!conversation) throw ApiError.notFound('Conversation not found');
    if (!conversation.participants.map(String).includes(userId)) {
      throw ApiError.forbidden('You are not a participant in this conversation');
    }
    return messageRepository.listMessages(conversationId);
  },

  async markRead(conversationId: string, userId: string) {
    await messageRepository.markConversationRead(conversationId, userId);
  },
};
