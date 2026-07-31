import type { RouteObject } from 'react-router-dom';
import HealthOfficerDashboardPage from '../pages/health-officer/HealthOfficerDashboardPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import BookAppointmentForPatientPage from '../features/appointment/pages/BookAppointmentForPatientPage';
import RegisterPatientPage from '../features/patient/pages/RegisterPatientPage';
import HealthOfficerProfilePage from '../features/healthOfficer/pages/HealthOfficerProfilePage';
import RecordVitalsIntakePage from '../pages/health-officer/RecordVitalsIntakePage';
import PrescriptionsPage from '../pages/health-officer/PrescriptionsPage';
import TestResultsPage from '../pages/health-officer/TestResultsPage';
import VideoConsultationPage from '../pages/shared/VideoConsultationPage';

export const healthOfficerRoutes: RouteObject[] = [
  { index: true, element: <HealthOfficerDashboardPage /> },
  { path: 'register-patient', element: <RegisterPatientPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'appointments/book', element: <BookAppointmentForPatientPage /> },
  { path: 'intake/vitals', element: <RecordVitalsIntakePage /> },
  { path: 'prescriptions', element: <PrescriptionsPage /> },
  { path: 'test-results', element: <TestResultsPage /> },
  { path: 'video/:appointmentId', element: <VideoConsultationPage /> },
  { path: 'profile', element: <HealthOfficerProfilePage /> },
];
