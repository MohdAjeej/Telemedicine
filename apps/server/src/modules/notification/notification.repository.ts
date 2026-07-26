import { NotificationModel, type HydratedNotification } from './notification.model';

export const notificationRepository = {
  create(input: {
    userId: string;
    type: string;
    title: string;
    body: string;
    relatedEntityType?: string;
    relatedEntityId?: string;
  }): Promise<HydratedNotification> {
    return NotificationModel.create(input);
  },

  async findForUser(userId: string, unreadOnly: boolean, limit = 30) {
    const filter: Record<string, unknown> = { userId };
    if (unreadOnly) filter.isRead = false;
    return NotificationModel.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
  },

  countUnread(userId: string): Promise<number> {
    return NotificationModel.countDocuments({ userId, isRead: false }).exec();
  },

  markRead(id: string, userId: string): Promise<HydratedNotification | null> {
    return NotificationModel.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true }).exec();
  },

  markAllRead(userId: string): Promise<void> {
    return NotificationModel.updateMany({ userId, isRead: false }, { isRead: true }).then(() => undefined);
  },
};
