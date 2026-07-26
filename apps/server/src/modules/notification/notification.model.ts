import { Schema, model, type HydratedDocument } from 'mongoose';

export type NotificationChannel = 'in_app' | 'email';

export interface NotificationDocument {
  _id: Schema.Types.ObjectId;
  userId: Schema.Types.ObjectId;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: Schema.Types.ObjectId;
  channel: NotificationChannel;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedNotification = HydratedDocument<NotificationDocument>;

const notificationSchema = new Schema<NotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    relatedEntityType: { type: String },
    relatedEntityId: { type: Schema.Types.ObjectId },
    channel: { type: String, enum: ['in_app', 'email'], default: 'in_app' },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const NotificationModel = model<NotificationDocument>('Notification', notificationSchema);
