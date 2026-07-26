import type { BaseEntity } from './common.types';

export interface PlatformSettings extends BaseEntity {
  platformName: string;
  supportEmail: string;
  defaultAppointmentSlotMinutes: number;
  maintenanceMode: boolean;
}
