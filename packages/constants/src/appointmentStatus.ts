export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no_show',
} as const;

export type AppointmentStatusValue = (typeof APPOINTMENT_STATUS)[keyof typeof APPOINTMENT_STATUS];

export const APPOINTMENT_TYPE = {
  IN_PERSON: 'in_person',
  VIDEO: 'video',
} as const;

export type AppointmentTypeValue = (typeof APPOINTMENT_TYPE)[keyof typeof APPOINTMENT_TYPE];

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatusValue, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  cancelled: 'Cancelled',
  completed: 'Completed',
  no_show: 'No Show',
};
