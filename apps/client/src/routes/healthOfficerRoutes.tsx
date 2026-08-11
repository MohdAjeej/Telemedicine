import type { RouteObject } from 'react-router-dom';
import HealthOfficerDashboardPage from '../pages/health-officer/HealthOfficerDashboardPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import BookAppointmentForPatientPage from '../features/appointment/pages/BookAppointmentForPatientPage';
import HealthOfficerProfilePage from '../features/healthOfficer/pages/HealthOfficerProfilePage';
import PatientIntakePage from '../pages/health-officer/PatientIntakePage';
import PrescriptionsPage from '../pages/health-officer/PrescriptionsPage';
import TestResultsPage from '../pages/health-officer/TestResultsPage';

export const healthOfficerRoutes: RouteObject[] = [
  { index: true, element: <HealthOfficerDashboardPage /> },
  { path: 'register-patient', element: <PatientIntakePage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'appointments/book', element: <BookAppointmentForPatientPage /> },
  { path: 'intake/vitals', element: <PatientIntakePage /> },
  { path: 'prescriptions', element: <PrescriptionsPage /> },
  { path: 'test-results', element: <TestResultsPage /> },
  { path: 'profile', element: <HealthOfficerProfilePage /> },
];
