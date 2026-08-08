import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../../services/apiClient';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/admin/auth/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}