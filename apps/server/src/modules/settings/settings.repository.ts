import { SettingsModel, type HydratedSettings } from './settings.model';

export interface UpdateSettingsInput {
  platformName?: string;
  supportEmail?: string;
  defaultAppointmentSlotMinutes?: number;
  maintenanceMode?: boolean;
}

export const settingsRepository = {
  async getSettings(): Promise<HydratedSettings> {
    const existing = await SettingsModel.findOne().exec();
    if (existing) return existing;
    return SettingsModel.create({});
  },

  async updateSettings(input: UpdateSettingsInput): Promise<HydratedSettings> {
    // Upsert against an always-matching filter so there is ever only one
    // document, whether or not getSettings() has been called yet.
    return SettingsModel.findOneAndUpdate(
      {},
      { $set: input },
      { new: true, upsert: true, setDefaultsOnInsert: true },
    ).exec();
  },
};
