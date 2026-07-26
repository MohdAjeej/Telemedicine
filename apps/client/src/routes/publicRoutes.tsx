import type { RouteObject } from 'react-router-dom';
import LoginPage from '../features/auth/pages/LoginPage';
import RegisterPage from '../features/auth/pages/RegisterPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';

export const publicRoutes: RouteObject[] = [
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  { path: 'forgot-password', element: <ForgotPasswordPage /> },
  { path: 'reset-password/:token', element: <ResetPasswordPage /> },
  { path: 'verify-email/:token', element: <VerifyEmailPage /> },
];
