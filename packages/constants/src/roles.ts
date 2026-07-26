export const ROLES = {
  ADMIN: 'admin',
  DOCTOR: 'doctor',
  HEALTH_OFFICER: 'health_officer',
  PATIENT: 'patient',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  doctor: 'Doctor',
  health_officer: 'Health Officer',
  patient: 'Patient',
};

export const ROLE_DASHBOARD_PATH: Record<Role, string> = {
  admin: '/app/admin',
  doctor: '/app/doctor',
  health_officer: '/app/health-officer',
  patient: '/app/patient',
};
