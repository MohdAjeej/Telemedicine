import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '@telemedicine/ui';
import { useGetMeQuery } from '../features/auth/authApi';
import { useAppSelector } from '../app/hooks';

export default function ProtectedRoute() {
  const location = useLocation();
  const hasAccessToken = useAppSelector((state) => Boolean(state.auth.accessToken));
  const { isLoading, isError } = useGetMeQuery(undefined, { skip: !hasAccessToken });

  if (!hasAccessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return <LoadingSpinner fullHeight label="Loading your workspace..." />;
  }

  if (isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
