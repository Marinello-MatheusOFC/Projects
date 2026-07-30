import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { LogOut, User } from 'lucide-react';

export function AdminHeader() {
  const { profile, signOut } = useAuth();

  return (
    <header className="admin-header">
      <div className="admin-header-title">
        <h1 className="admin-header-heading">Painel Administrativo</h1>
      </div>
      <div className="admin-header-user">
        <div className="admin-header-user-info">
          <User size={18} aria-hidden="true" />
          <span className="admin-header-user-name">
            {profile?.full_name ?? 'Administrador'}
          </span>
          <span className="admin-header-user-role">
            {profile?.role === 'superadmin' ? 'Superadmin' : 'Admin'}
          </span>
        </div>
        <button
          className="admin-header-logout"
          onClick={signOut}
          aria-label="Sair"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
