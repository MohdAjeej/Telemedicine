import { Schema, model, type HydratedDocument } from 'mongoose';

export interface SettingsDocument {
  _id: Schema.Types.ObjectId;
  platformName: string;
  supportEmail: string;
  defaultAppointmentSlotMinutes: number;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type HydratedSettings = HydratedDocument<SettingsDocument>;

const settingsSchema = new Schema<SettingsDocument>(
  {
    platformName: { type: String, default: 'Telemedicine Platform' },
    supportEmail: { type: String, default: 'support@telemedicine.local' },
    defaultAppointmentSlotMinutes: { type: Number, default: 30, min: 5, max: 240 },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Enforced as a true singleton: every write targets the same document,
// created lazily on first read (see settings.repository.ts).
export const SettingsModel = model<SettingsDocument>('Settings', settingsSchema);
