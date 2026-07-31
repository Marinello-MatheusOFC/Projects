import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  HeartHandshake,
  Calendar,
  Newspaper,
  ShoppingBag,
  Mail,
  Users,
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';

const sidebarItems = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/animais', label: 'Animais', icon: PawPrint },
  { to: '/admin/adocoes', label: 'Adoções', icon: HeartHandshake },
  { to: '/admin/eventos', label: 'Eventos', icon: Calendar },
  { to: '/admin/noticias', label: 'Notícias', icon: Newspaper },
  { to: '/admin/produtos', label: 'Brechó', icon: ShoppingBag },
  { to: '/admin/mensagens', label: 'Mensagens', icon: Mail },
  { to: '/admin/voluntarios', label: 'Voluntários', icon: Users },
  { to: '/admin/configuracoes', label: 'Configurações', icon: Settings },
  { to: '/admin/usuarios', label: 'Usuários', icon: Shield },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { signOut } = useAuth();

  return (
    <aside
      className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}
      aria-label="Menu administrativo"
    >
      <div className="admin-sidebar-header">
        <Link to="/admin" className="admin-sidebar-logo" aria-label="Painel administrativo">
          <Logo size="sm" showText={false} />
        </Link>
        <button
          className="admin-sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav aria-label="Navegação administrativa">
        <ul className="admin-sidebar-nav">
          {sidebarItems.map((item) => {
            const isActive = item.end
              ? location.pathname === item.to
              : location.pathname.startsWith(item.to);
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={`admin-sidebar-link ${isActive ? 'admin-sidebar-link--active' : ''}`}
                  title={collapsed ? item.label : undefined}
                >
                  <item.icon size={20} aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-link" title="Ver site">
          <ExternalLink size={20} aria-hidden="true" />
          {!collapsed && <span>Ver site</span>}
        </Link>
        <button
          className="admin-sidebar-link admin-sidebar-logout"
          onClick={signOut}
          title="Sair"
        >
          <LogOut size={20} aria-hidden="true" />
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
