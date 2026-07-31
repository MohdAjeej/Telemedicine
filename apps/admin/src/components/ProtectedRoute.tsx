import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@telemedicine/ui';
import { useGetMeQuery } from '../features/auth/authApi';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout, setUser } from '../features/auth/authSlice';

export default function ProtectedRoute() {
  const location = useLocation();
  const dispatch = useAppDispatch();
  const hasAccessToken = useAppSelector((state) => Boolean(state.auth.accessToken));
  const { data, isLoading, isError } = useGetMeQuery(undefined, { skip: !hasAccessToken });

  // Defends against a non-admin access token being presented directly (not
  // via this app's own LoginPage) — e.g. a role changed server-side after
  // login, or a stray token from another origin sharing the same browser.
  useEffect(() => {
    if (data && data.role !== 'admin') {
      dispatch(logout());
    } else if (data) {
      dispatch(setUser(data));
    }
  }, [data, dispatch]);

  if (!hasAccessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <LoadingSpinner fullHeight label="Loading your workspace..." />;
  }

  if (isError || (data && data.role !== 'admin')) {
    return (
      <Navigate to="/login" state={{ from: location, reason: 'wrong-role' }} replace />
    );
  }

  return <Outlet />;
}
