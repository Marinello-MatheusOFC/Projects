import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { canAccessModule, type AdminModule } from '../permissions';

interface AdminModuleRouteProps {
  module: AdminModule;
  children: React.ReactNode;
}

export function AdminModuleRoute({ module, children }: AdminModuleRouteProps) {
  const { profile } = useAuth();
  const location = useLocation();

  if (!canAccessModule(module, profile)) {
    return <Navigate to="/admin/403" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
