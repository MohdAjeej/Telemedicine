import type { RouteObject } from 'react-router-dom';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import PatientListPage from '../features/patient/pages/PatientListPage';
import DoctorProfilePage from '../features/doctor/pages/DoctorProfilePage';
import VideoConsultationPage from '../pages/shared/VideoConsultationPage';

export const doctorRoutes: RouteObject[] = [
  { index: true, element: <DoctorDashboardPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'patients', element: <PatientListPage /> },
  { path: 'video', element: <VideoConsultationPage /> },
  { path: 'profile', element: <DoctorProfilePage /> },
];
