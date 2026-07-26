import type { BaseEntity } from './common.types';

export interface Conversation extends BaseEntity {
  participants: string[];
  lastMessageAt?: string;
}

export interface Message extends BaseEntity {
  conversationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  readAt?: string;
}
