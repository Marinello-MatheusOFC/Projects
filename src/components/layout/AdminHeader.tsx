import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, ExternalLink, LogOut, Menu, Plus } from 'lucide-react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { canAccessModule } from '@/features/auth/permissions';
import { Button } from '@/components/ui/Button';

interface BreadcrumbItem {
  label: string;
  to?: string;
}

const SEGMENT_LABELS: Record<string, string> = {
  admin: 'Painel',
  animais: 'Animais',
  novo: 'Novo',
  nova: 'Nova',
  editar: 'Editar',
  adocoes: 'Adoções',
  eventos: 'Eventos',
  noticias: 'Notícias',
  produtos: 'Brechó',
  galeria: 'Galeria',
  mensagens: 'Mensagens',
  voluntarios: 'Voluntários',
  configuracoes: 'Configurações',
  usuarios: 'Usuários',
  auditoria: 'Auditoria',
};

interface ContextualAction {
  label: string;
  to: string;
  module: 'animais' | 'eventos' | 'noticias' | 'produtos' | 'galeria';
}

const CONTEXTUAL_ACTIONS: ContextualAction[] = [
  { label: 'Cadastrar animal', to: '/admin/animais/novo', module: 'animais' },
  { label: 'Criar evento', to: '/admin/eventos/novo', module: 'eventos' },
  { label: 'Escrever notícia', to: '/admin/noticias/novo', module: 'noticias' },
  { label: 'Adicionar produto', to: '/admin/produtos/novo', module: 'produtos' },
  { label: 'Criar álbum', to: '/admin/galeria/novo', module: 'galeria' },
];

function segmentLabel(segment: string, index: number, segments: string[]): string {
  const known = SEGMENT_LABELS[segment];
  if (known) return known;
  const prev = segments[index - 1];
  if (prev && SEGMENT_LABELS[prev]) return 'Detalhes';
  return segment;
}

function buildBreadcrumb(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [{ label: 'Painel', to: '/admin' }];
  let current = '';
  segments.forEach((seg, index) => {
    if (seg === 'admin') return;
    current = `${current}/${seg}`;
    items.push({ label: segmentLabel(seg, index, segments), to: `/admin${current}` });
  });
  return items;
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? '';
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : '';
  return `${first}${last}`.toUpperCase() || 'AD';
}

interface AdminHeaderProps {
  onMenuClick: () => void;
  menuButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export function AdminHeader({ onMenuClick, menuButtonRef }: AdminHeaderProps) {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const crumbs = buildBreadcrumb(location.pathname);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login', { replace: true });
  };

  const name = profile?.full_name ?? 'Administrador';
  const role = profile?.role === 'superadmin' ? 'Superadmin' : 'Admin';
  const canManageSettings = canAccessModule('configuracoes', profile);

  const contextualAction = useMemo<ContextualAction | null>(() => {
    const path = location.pathname;
    for (const action of CONTEXTUAL_ACTIONS) {
      const prefix = `/admin/${action.module}`;
      if (path === prefix || path.startsWith(`${prefix}/`)) {
        if (canAccessModule(action.module, profile)) {
          return action;
        }
      }
    }
    return null;
  }, [location.pathname, profile]);

  return (
    <header className="admin-header">
      <button
        ref={menuButtonRef}
        type="button"
        className="admin-header-menu"
        onClick={onMenuClick}
        aria-label="Abrir menu de navegação"
        aria-expanded={false}
        aria-controls="admin-sidebar"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      <nav className="admin-breadcrumb" aria-label="Você está em">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
              {index > 0 && (
                <span className="admin-breadcrumb-sep" aria-hidden="true">
                  /
                </span>
              )}
              {isLast || !crumb.to ? (
                <span className="admin-breadcrumb-current" aria-current={isLast ? 'page' : undefined}>
                  {crumb.label}
                </span>
              ) : (
                <Link to={crumb.to}>{crumb.label}</Link>
              )}
            </span>
          );
        })}
      </nav>

      <div className="admin-header-right">
        {contextualAction && (
          <Link to={contextualAction.to} style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md" loading={false} className="admin-header-cta">
              <Plus size={18} aria-hidden="true" />
              <span>{contextualAction.label}</span>
            </Button>
          </Link>
        )}

        <div className="admin-user-menu" ref={menuRef}>
          <button
            type="button"
            className="admin-user-trigger"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="admin-user-avatar" aria-hidden="true">
              {initialsOf(name)}
            </span>
            <span className="admin-user-meta">
              <span className="admin-user-name">{name}</span>
              <span className="admin-user-role">{role}</span>
            </span>
            <ChevronDown size={18} className="admin-user-chevron" aria-hidden="true" />
          </button>

          {menuOpen && (
            <div className="admin-user-panel" role="menu" aria-label="Menu do usuário">
              <Link
                to="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-user-panel-item"
                role="menuitem"
              >
                <ExternalLink size={18} aria-hidden="true" />
                Ver site
              </Link>
              {canManageSettings && (
                <Link to="/admin/configuracoes" className="admin-user-panel-item" role="menuitem">
                  Configurações
                </Link>
              )}
              <button
                type="button"
                className="admin-user-panel-item admin-user-panel-item--danger"
                role="menuitem"
                onClick={handleSignOut}
              >
                <LogOut size={18} aria-hidden="true" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
