import type { BaseEntity } from './common.types';

export type NotificationChannel = 'in_app' | 'email';

export interface Notification extends BaseEntity {
  userId: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: string;
  channel: NotificationChannel;
}
