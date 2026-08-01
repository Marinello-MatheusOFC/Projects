import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  PawPrint,
  Calendar,
  Newspaper,
  ShoppingBag,
  Images,
  HeartHandshake,
  Mail,
  Users,
  Settings,
  Shield,
  ScrollText,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth.ts';
import { canAccessModule, type AdminModule } from '@/features/auth/permissions';
import { supabase } from '@/lib/supabase';

type CountKey = 'adocoes' | 'mensagens' | 'voluntarios';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  module: AdminModule;
  end?: boolean;
  countKey?: CountKey;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Conteúdo',
    items: [
      { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, module: 'dashboard', end: true },
      { to: '/admin/animais', label: 'Animais', icon: PawPrint, module: 'animais' },
      { to: '/admin/eventos', label: 'Eventos', icon: Calendar, module: 'eventos' },
      { to: '/admin/noticias', label: 'Notícias', icon: Newspaper, module: 'noticias' },
      { to: '/admin/produtos', label: 'Brechó', icon: ShoppingBag, module: 'produtos' },
      { to: '/admin/galeria', label: 'Galeria', icon: Images, module: 'galeria' },
    ],
  },
  {
    title: 'Atendimento',
    items: [
      { to: '/admin/adocoes', label: 'Adoções', icon: HeartHandshake, module: 'adocoes', countKey: 'adocoes' },
      { to: '/admin/mensagens', label: 'Mensagens', icon: Mail, module: 'mensagens', countKey: 'mensagens' },
      { to: '/admin/voluntarios', label: 'Voluntários', icon: Users, module: 'voluntarios', countKey: 'voluntarios' },
    ],
  },
  {
    title: 'Sistema',
    items: [
      { to: '/admin/configuracoes', label: 'Configurações', icon: Settings, module: 'configuracoes' },
      { to: '/admin/usuarios', label: 'Usuários', icon: Shield, module: 'usuarios' },
      { to: '/admin/auditoria', label: 'Auditoria', icon: ScrollText, module: 'auditoria' },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
}

const COUNT_QUERIES: { key: CountKey; run: () => PromiseLike<{ count: number | null }> }[] = [
  {
    key: 'adocoes',
    run: () =>
      supabase
        .from('adoption_applications')
        .select('id', { count: 'exact', head: true })
        .in('status', ['new', 'under_review']),
  },
  {
    key: 'mensagens',
    run: () =>
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }).eq('status', 'new'),
  },
  {
    key: 'voluntarios',
    run: () =>
      supabase
        .from('volunteer_applications')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'new'),
  },
];

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const location = useLocation();
  const { profile, signOut } = useAuth();
  const [counts, setCounts] = useState<Partial<Record<CountKey, number>>>({});

  useEffect(() => {
    let active = true;
    const run = async () => {
      const results: Partial<Record<CountKey, number>> = {};
      await Promise.all(
        COUNT_QUERIES.map(async ({ key, run: q }) => {
          try {
            const { count } = await q();
            if (active && typeof count === 'number') results[key] = count;
          } catch {
            // contadores são informativos — falha silenciosa
          }
        }),
      );
      if (active) setCounts(results);
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const visibleGroups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => canAccessModule(item.module, profile)),
  })).filter((group) => group.items.length > 0);

  return (
    <aside
      className={`admin-sidebar ${open ? 'admin-sidebar--open' : ''}`}
      aria-label="Menu administrativo"
    >
      <div className="admin-sidebar-header">
        <Link to="/admin" className="admin-sidebar-logo" onClick={onClose} aria-label="Painel administrativo — SOS Focinho Carente">
          <span className="admin-sidebar-logo-mark">
            <Logo size="sm" showText={false} />
          </span>
          <span className="admin-sidebar-logo-text">
            <span className="admin-sidebar-logo-title">Painel</span>
            <span className="admin-sidebar-logo-sub">Administrativo</span>
          </span>
        </Link>
      </div>

      <nav aria-label="Navegação administrativa" className="admin-sidebar-nav">
        {visibleGroups.map((group) => (
          <div key={group.title} className="admin-sidebar-group">
            <span className="admin-sidebar-group-title">{group.title}</span>
            <ul className="admin-sidebar-nav-list">
              {group.items.map((item) => {
                const isActive = item.end
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
                const count = item.countKey ? counts[item.countKey] : undefined;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      onClick={onClose}
                      className={`admin-sidebar-link ${isActive ? 'admin-sidebar-link--active' : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <item.icon size={20} className="admin-sidebar-icon" aria-hidden="true" />
                      <span>{item.label}</span>
                      {typeof count === 'number' && count > 0 && (
                        <span className="admin-sidebar-count" title={`${count} pendente(s)`}>
                          {count}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <Link to="/" className="admin-sidebar-link" target="_blank" rel="noopener noreferrer" title="Ver site">
          <ExternalLink size={20} className="admin-sidebar-icon" aria-hidden="true" />
          <span>Ver site</span>
        </Link>
        <button
          className="admin-sidebar-link admin-sidebar-logout"
          onClick={signOut}
          title="Sair"
        >
          <LogOut size={20} className="admin-sidebar-icon" aria-hidden="true" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}
