import { Navigate, Outlet } from 'react-router-dom';
import { ROLE_DASHBOARD_PATH } from '@telemedicine/constants';
import { useAppSelector } from '../app/hooks';

export default function GuestOnlyRoute() {
  const user = useAppSelector((state) => state.auth.user);

  if (user) {
    return <Navigate to={ROLE_DASHBOARD_PATH[user.role]} replace />;
  }

  return <Outlet />;
}
