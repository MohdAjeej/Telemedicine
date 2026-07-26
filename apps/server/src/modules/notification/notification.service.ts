import { notificationRepository } from './notification.repository';
import { emitNotification } from './notification.socket';

export const notificationService = {
  async notify(input: {
    userId: string;
    type: string;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }) {
    const notification = await notificationRepository.create(input);
    emitNotification(notification);
    return notification;
  },

  async listForUser(userId: string, unreadOnly: boolean) {
    return notificationRepository.findForUser(userId, unreadOnly);
  },

  async unreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  async markRead(id: string, userId: string) {
    return notificationRepository.markRead(id, userId);
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllRead(userId);
  },
};
