import { Schema, model, type HydratedDocument } from 'mongoose';

export interface ConversationDocument {
  _id: Schema.Types.ObjectId;
  participants: Schema.Types.ObjectId[];
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedConversation = HydratedDocument<ConversationDocument>;

const conversationSchema = new Schema<ConversationDocument>(
  {
    participants: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

conversationSchema.index({ participants: 1 });

export const ConversationModel = model<ConversationDocument>('Conversation', conversationSchema);

export interface MessageDocument {
  _id: Schema.Types.ObjectId;
  conversationId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  content: string;
  attachments: string[];
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedMessage = HydratedDocument<MessageDocument>;

const messageSchema = new Schema<MessageDocument>(
  {
    conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: { type: [String], default: [] },
    readAt: { type: Date },
  },
  { timestamps: true },
);

export const MessageModel = model<MessageDocument>('Message', messageSchema);
