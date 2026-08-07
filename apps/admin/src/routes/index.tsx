import { createBrowserRouter } from 'react-router-dom';
import RootLayout from '../layouts/RootLayout';
import AuthLayout from '../layouts/AuthLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import GuestOnlyRoute from '../components/GuestOnlyRoute';
import NotFoundPage from '../pages/NotFound';
import LoginPage from '../features/auth/pages/LoginPage';
import HandoffPage from '../features/auth/pages/HandoffPage';
import { adminRoutes } from './adminRoutes';

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      {
        element: <GuestOnlyRoute />,
        children: [{ element: <AuthLayout />, children: [{ path: 'login', element: <LoginPage /> }] }],
      },
      // Not behind GuestOnlyRoute/ProtectedRoute — it must work whether or not this
      // browser already has an (unrelated) session, since it's establishing a new one.
      { element: <AuthLayout />, children: [{ path: 'handoff', element: <HandoffPage /> }] },
      {
        element: <ProtectedRoute />,
        children: [{ element: <AdminLayout />, children: adminRoutes }],
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
