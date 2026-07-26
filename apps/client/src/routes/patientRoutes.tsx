import type { RouteObject } from 'react-router-dom';
import PatientDashboardPage from '../pages/patient/PatientDashboardPage';
import BookAppointmentPage from '../features/appointment/pages/BookAppointmentPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import PatientProfilePage from '../features/patient/pages/PatientProfilePage';
import VideoConsultationPage from '../pages/shared/VideoConsultationPage';
import VitalsPage from '../features/vital/pages/VitalsPage';
import PrescriptionsPage from '../features/prescription/pages/PrescriptionsPage';
import TestResultsPage from '../features/labReport/pages/TestResultsPage';
import MedicalRecordsPage from '../features/medicalRecord/pages/MedicalRecordsPage';

export const patientRoutes: RouteObject[] = [
  { index: true, element: <PatientDashboardPage /> },
  { path: 'book', element: <BookAppointmentPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'vitals', element: <VitalsPage /> },
  { path: 'medical-records', element: <MedicalRecordsPage /> },
  { path: 'test-results', element: <TestResultsPage /> },
  { path: 'prescriptions', element: <PrescriptionsPage /> },
  { path: 'video', element: <VideoConsultationPage /> },
  { path: 'profile', element: <PatientProfilePage /> },
];
