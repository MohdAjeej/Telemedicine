import { settingsRepository, type UpdateSettingsInput } from './settings.repository';

export const settingsService = {
  async get() {
    return settingsRepository.getSettings();
  },

  async update(input: UpdateSettingsInput) {
    return settingsRepository.updateSettings(input);
  },
};
