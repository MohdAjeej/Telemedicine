import { ConversationModel, MessageModel, type HydratedConversation, type HydratedMessage } from './message.model';

export const messageRepository = {
  async findOrCreateConversation(participantIds: string[]): Promise<HydratedConversation> {
    const sorted = [...participantIds].sort();
    const existing = await ConversationModel.findOne({
      participants: { $all: sorted, $size: sorted.length },
    }).exec();
    if (existing) return existing;
    return ConversationModel.create({ participants: sorted });
  },

  listConversationsForUser(userId: string): Promise<HydratedConversation[]> {
    return ConversationModel.find({ participants: userId })
      .populate('participants')
      .sort({ lastMessageAt: -1 })
      .exec();
  },

  findConversationById(id: string): Promise<HydratedConversation | null> {
    return ConversationModel.findById(id).exec();
  },

  async createMessage(input: {
    conversationId: string;
    senderId: string;
    content: string;
    attachments?: string[];
  }): Promise<HydratedMessage> {
    const message = await MessageModel.create(input);
    await ConversationModel.findByIdAndUpdate(input.conversationId, { lastMessageAt: new Date() });
    return message;
  },

  listMessages(conversationId: string, limit = 50): Promise<HydratedMessage[]> {
    return MessageModel.find({ conversationId })
      .populate('senderId')
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  },

  markConversationRead(conversationId: string, userId: string): Promise<void> {
    return MessageModel.updateMany(
      { conversationId, senderId: { $ne: userId }, readAt: { $exists: false } },
      { readAt: new Date() },
    ).then(() => undefined);
  },
};
