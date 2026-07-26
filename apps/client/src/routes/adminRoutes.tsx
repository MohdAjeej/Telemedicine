import type { RouteObject } from 'react-router-dom';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import NotificationCenterPage from '../pages/admin/NotificationCenterPage';
import HospitalListPage from '../features/hospital/pages/HospitalListPage';
import DoctorListPage from '../features/doctor/pages/DoctorListPage';
import HealthOfficerListPage from '../features/healthOfficer/pages/HealthOfficerListPage';
import PatientListPage from '../features/patient/pages/PatientListPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import UserManagementPage from '../features/admin/pages/UserManagementPage';
import SettingsPage from '../features/settings/pages/SettingsPage';

export const adminRoutes: RouteObject[] = [
  { index: true, element: <AdminDashboardPage /> },
  { path: 'hospitals', element: <HospitalListPage /> },
  { path: 'doctors', element: <DoctorListPage /> },
  { path: 'health-officers', element: <HealthOfficerListPage /> },
  { path: 'patients', element: <PatientListPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'analytics', element: <AnalyticsPage /> },
  { path: 'audit-logs', element: <AuditLogsPage /> },
  { path: 'users', element: <UserManagementPage /> },
  { path: 'notifications', element: <NotificationCenterPage /> },
  { path: 'settings', element: <SettingsPage /> },
];
