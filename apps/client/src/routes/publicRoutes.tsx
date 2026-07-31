import type { RouteObject } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterChoicePage from '../features/auth/pages/RegisterChoicePage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import RegisterAdminPage from '../features/auth/pages/RegisterAdminPage';

export const publicRoutes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterChoicePage /> },
  { path: 'register/patient', element: <RegisterPage /> },
  { path: 'register-admin', element: <RegisterAdminPage /> },
];
