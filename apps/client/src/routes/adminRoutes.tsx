import type { RouteObject } from 'react-router-dom';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import AnalyticsPage from '../pages/admin/AnalyticsPage';
import AuditLogsPage from '../pages/admin/AuditLogsPage';
import HospitalListPage from '../features/hospital/pages/HospitalListPage';
import DoctorListPage from '../features/doctor/pages/DoctorListPage';
import HealthOfficerListPage from '../features/healthOfficer/pages/HealthOfficerListPage';
import PatientListPage from '../features/patient/pages/PatientListPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';

export const adminRoutes: RouteObject[] = [
  { index: true, element: <AdminDashboardPage /> },
  { path: 'hospitals', element: <HospitalListPage /> },
  { path: 'doctors', element: <DoctorListPage /> },
  { path: 'health-officers', element: <HealthOfficerListPage /> },
  { path: 'patients', element: <PatientListPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'analytics', element: <AnalyticsPage /> },
  { path: 'audit-logs', element: <AuditLogsPage /> },
];
