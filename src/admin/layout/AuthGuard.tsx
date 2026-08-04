import type { PropsWithChildren } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../services/apiClient";

export function AuthGuard({ children }: PropsWithChildren) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
}
