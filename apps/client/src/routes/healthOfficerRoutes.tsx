import type { RouteObject } from 'react-router-dom';
import HealthOfficerDashboardPage from '../pages/health-officer/HealthOfficerDashboardPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import RegisterPatientPage from '../features/patient/pages/RegisterPatientPage';
import HealthOfficerProfilePage from '../features/healthOfficer/pages/HealthOfficerProfilePage';

export const healthOfficerRoutes: RouteObject[] = [
  { index: true, element: <HealthOfficerDashboardPage /> },
  { path: 'register-patient', element: <RegisterPatientPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'profile', element: <HealthOfficerProfilePage /> },
];
