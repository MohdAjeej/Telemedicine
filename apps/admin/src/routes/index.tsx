import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestOnlyRoute from '../components/GuestOnlyRoute';
import NotFoundPage from '../pages/NotFound';
import LoginPage from '../features/auth/pages/LoginPage';
import { adminRoutes } from './adminRoutes';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <GuestOnlyRoute />,
        children: [{ element: <AuthLayout />, children: [{ path: 'login', element: <LoginPage /> }] }],
      },
      {
        element: <ProtectedRoute />,
        children: [{ element: <AdminLayout />, children: adminRoutes }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
