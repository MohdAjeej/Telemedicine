import type { RouteObject } from 'react-router-dom';
import PatientDashboardPage from '../pages/patient/PatientDashboardPage';
import PatientProfilePage from '../features/patient/pages/PatientProfilePage';
import VitalsPage from '../features/vital/pages/VitalsPage';
import PrescriptionsPage from '../features/prescription/pages/PrescriptionsPage';
import TestResultsPage from '../features/labReport/pages/TestResultsPage';
import ConsultationHistoryPage from '../pages/patient/ConsultationHistoryPage';
import ConsultationDetailPage from '../pages/patient/ConsultationDetailPage';

export const patientRoutes: RouteObject[] = [
  { index: true, element: <PatientDashboardPage /> },
  { path: 'consultations', element: <ConsultationHistoryPage /> },
  { path: 'consultations/:id', element: <ConsultationDetailPage /> },
  { path: 'vitals', element: <VitalsPage /> },
  { path: 'test-results', element: <TestResultsPage /> },
  { path: 'prescriptions', element: <PrescriptionsPage /> },
  { path: 'profile', element: <PatientProfilePage /> },
];
