import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import DoctorLayout from '../layouts/DoctorLayout';
import HealthOfficerLayout from '../layouts/HealthOfficerLayout';
import PatientLayout from '../layouts/PatientLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestOnlyRoute from '../components/GuestOnlyRoute';
import RoleRoute from '../components/RoleRoute';
import NotFoundPage from '../pages/NotFound';
import UnauthorizedPage from '../pages/Unauthorized';
import { publicRoutes } from './publicRoutes';
import { adminRoutes } from './adminRoutes';
import { doctorRoutes } from './doctorRoutes';
import { healthOfficerRoutes } from './healthOfficerRoutes';
import { patientRoutes } from './patientRoutes';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { index: true, element: <Navigate to="/login" replace /> },
      {
        element: <GuestOnlyRoute />,
        children: [{ element: <AuthLayout />, children: publicRoutes }],
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: 'app',
        element: <ProtectedRoute />,
        children: [
          {
            path: 'admin',
            element: <RoleRoute allow={['admin']} />,
            children: [{ element: <AdminLayout />, children: adminRoutes }],
          },
          {
            path: 'doctor',
            element: <RoleRoute allow={['doctor']} />,
            children: [{ element: <DoctorLayout />, children: doctorRoutes }],
          },
          {
            path: 'health-officer',
            element: <RoleRoute allow={['health_officer']} />,
            children: [{ element: <HealthOfficerLayout />, children: healthOfficerRoutes }],
          },
          {
            path: 'patient',
            element: <RoleRoute allow={['patient']} />,
            children: [{ element: <PatientLayout />, children: patientRoutes }],
          },
        ],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
