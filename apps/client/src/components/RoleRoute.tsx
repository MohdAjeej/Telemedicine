import { Navigate, Outlet } from 'react-router-dom';
import type { Role } from '@telemedicine/constants';
import { useAppSelector } from '../app/hooks';

export interface RoleRouteProps {
  allow: Role[];
}

export default function RoleRoute({ allow }: RoleRouteProps) {
  const user = useAppSelector((state) => state.auth.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allow.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
