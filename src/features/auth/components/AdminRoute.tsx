import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';

interface AdminRouteProps {
  children: React.ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { isAdmin, loading, initialized, user, profile, signOut } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (initialized && !loading && user && !isAdmin) {
      void signOut();
    }
  }, [initialized, loading, user, isAdmin, signOut]);

  if (!initialized || loading) {
    return (
      <div className="page-loading" role="status" aria-label="Carregando...">
        <div className="spinner" />
        <span>Verificando acesso...</span>
      </div>
    );
  }

  if (!isAdmin) {
    const reason =
      user && !profile ? 'expired' : profile && !profile.active ? 'inactive' : 'no-access';
    return <Navigate to="/admin/login" state={{ from: location, reason }} replace />;
  }

  return <>{children}</>;
}
