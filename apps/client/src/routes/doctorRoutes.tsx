import type { RouteObject } from 'react-router-dom';
import DoctorDashboardPage from '../pages/doctor/DoctorDashboardPage';
import AppointmentListPage from '../features/appointment/pages/AppointmentListPage';
import PatientListPage from '../features/patient/pages/PatientListPage';
import DoctorProfilePage from '../features/doctor/pages/DoctorProfilePage';
import VideoConsultationPage from '../pages/shared/VideoConsultationPage';
import SimpleVideoTestPage from '../pages/shared/SimpleVideoTestPage';
import ConsultationsListPage from '../pages/doctor/ConsultationsListPage';
import ConsultationPage from '../pages/doctor/ConsultationPage';
import StartConsultationPage from '../pages/doctor/StartConsultationPage';
import CreatePrescriptionPage from '../pages/doctor/CreatePrescriptionPage';
import DoctorPrescriptionsPage from '../features/prescription/pages/DoctorPrescriptionsPage';
import RequestLabTestPage from '../pages/doctor/RequestLabTestPage';

export const doctorRoutes: RouteObject[] = [
  { index: true, element: <DoctorDashboardPage /> },
  { path: 'appointments', element: <AppointmentListPage /> },
  { path: 'patients', element: <PatientListPage /> },
  { path: 'consultations', element: <ConsultationsListPage /> },
  { path: 'consultations/start', element: <StartConsultationPage /> },
  { path: 'consultations/:id', element: <ConsultationPage /> },
  { path: 'prescriptions', element: <DoctorPrescriptionsPage /> },
  { path: 'prescriptions/create', element: <CreatePrescriptionPage /> },
  { path: 'lab-reports/request', element: <RequestLabTestPage /> },
  { path: 'video/:appointmentId', element: <VideoConsultationPage /> },
  { path: 'video-test/:appointmentId', element: <SimpleVideoTestPage /> },
  { path: 'profile', element: <DoctorProfilePage /> },
];
