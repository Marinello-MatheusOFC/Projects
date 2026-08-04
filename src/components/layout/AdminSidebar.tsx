import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';

import { NavLink } from 'react-router-dom';

import {
  LayoutDashboard,
  PawPrint,
  CalendarDays,
  Newspaper,
  ShoppingBag,
  Images,
  HeartHandshake,
  MessageCircle,
  Users,
  Settings,
  ShieldPlus,
  ScrollText,
  LogOut,
  ExternalLink,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

import type { LucideIcon } from 'lucide-react';

import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRole } from '@/hooks/admin/useRole';

import {
  canAccessModule,
  type AdminModule,
} from '@/features/auth/permissions';

import { supabase } from '@/lib/supabase';

type CountKey =
  | 'adocoes'
  | 'mensagens'
  | 'voluntarios';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  module: AdminModule;
  end?: boolean;
  countKey?: CountKey;
  superadminOnly?: boolean;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: 'Visão Geral',
    items: [
      {
        to: '/admin',
        label: 'Dashboard',
        icon: LayoutDashboard,
        module: 'dashboard',
        end: true,
      },
    ],
  },
  {
    title: 'Conteúdo',
    items: [
      {
        to: '/admin/animais',
        label: 'Animais',
        icon: PawPrint,
        module: 'animais',
      },
      {
        to: '/admin/eventos',
        label: 'Eventos',
        icon: CalendarDays,
        module: 'eventos',
      },
      {
        to: '/admin/noticias',
        label: 'Notícias',
        icon: Newspaper,
        module: 'noticias',
      },
      {
        to: '/admin/produtos',
        label: 'Brechó',
        icon: ShoppingBag,
        module: 'produtos',
      },
      {
        to: '/admin/galeria',
        label: 'Galeria',
        icon: Images,
        module: 'galeria',
      },
    ],
  },
  {
    title: 'Atendimento',
    items: [
      {
        to: '/admin/adocoes',
        label: 'Solicitações de adoção',
        icon: HeartHandshake,
        module: 'adocoes',
        countKey: 'adocoes',
      },
      {
        to: '/admin/mensagens',
        label: 'Mensagens',
        icon: MessageCircle,
        module: 'mensagens',
        countKey: 'mensagens',
      },
      {
        to: '/admin/voluntarios',
        label: 'Voluntários',
        icon: Users,
        module: 'voluntarios',
        countKey: 'voluntarios',
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        to: '/admin/configuracoes',
        label: 'Configurações',
        icon: Settings,
        module: 'configuracoes',
      },
      {
        to: '/admin/usuarios',
        label: 'Usuários',
        icon: ShieldPlus,
        module: 'usuarios',
        superadminOnly: true,
      },
      {
        to: '/admin/auditoria',
        label: 'Auditoria',
        icon: ScrollText,
        module: 'auditoria',
      },
    ],
  },
];

interface AdminSidebarProps {
  open: boolean;
  onClose: () => void;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  menuButtonRef?: RefObject<HTMLElement | null>;
}

const COUNT_QUERIES: {
  key: CountKey;
  run: () => PromiseLike<{
    count: number | null;
  }>;
}[] = [
  {
    key: 'adocoes',

    run: () =>
      supabase
        .from('adoption_applications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .in('status', [
          'new',
          'under_review',
        ]),
  },
  {
    key: 'mensagens',

    run: () =>
      supabase
        .from('contact_messages')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('status', 'new'),
  },
  {
    key: 'voluntarios',

    run: () =>
      supabase
        .from('volunteer_applications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .eq('status', 'new'),
  },
];

function useFocusTrap(
  active: boolean,
  containerRef: RefObject<HTMLElement | null>,
  returnRef?: RefObject<HTMLElement | null>,
): void {
  useEffect(() => {
    if (!active || !containerRef.current) {
      return;
    }

    const container = containerRef.current;

    const focusable =
      container.querySelectorAll<HTMLElement>(
        [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          'not([tabindex="-1"])',
        ].join(', '),
      );

    const elements = Array.from(focusable);

    if (elements.length === 0) {
      return;
    }

    const first = elements[0]!;
    const last = elements[elements.length - 1]!;

    first.focus();

    const onKey = (
      event: KeyboardEvent,
    ): void => {
      if (event.key !== 'Tab') {
        return;
      }

      if (event.shiftKey) {
        if (
          document.activeElement === first
        ) {
          event.preventDefault();
          last.focus();
        }
      } else if (
        document.activeElement === last
      ) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener(
      'keydown',
      onKey,
    );

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const returnElement =
      returnRef?.current;

    return () => {
      document.removeEventListener(
        'keydown',
        onKey,
      );

      document.body.style.overflow =
        previousOverflow;

      if (returnElement) {
        returnElement.focus();
      }
    };
  }, [
    active,
    containerRef,
    returnRef,
  ]);
}

export function AdminSidebar({
  open,
  onClose,
  collapsed,
  onToggleCollapsed,
  menuButtonRef,
}: AdminSidebarProps) {
  const {
    profile,
    signOut,
  } = useAuth();

  const {
    isSuperadmin,
  } = useRole();

  const [counts, setCounts] = useState<
    Partial<Record<CountKey, number>>
  >({});

  const drawerRef =
    useRef<HTMLDivElement | null>(null);

  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 1023px)').matches
      : false,
  );

  useEffect(() => {
    const mql = window.matchMedia('(max-width: 1023px)');
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useFocusTrap(
    open && isMobile,
    drawerRef,
    menuButtonRef,
  );

  useEffect(() => {
    let active = true;

    const run =
      async (): Promise<void> => {
        const results: Partial<
          Record<CountKey, number>
        > = {};

        await Promise.all(
          COUNT_QUERIES.map(
            async ({
              key,
              run: query,
            }): Promise<void> => {
              try {
                const {
                  count,
                } = await query();

                if (
                  active &&
                  typeof count === 'number'
                ) {
                  results[key] = count;
                }
              } catch {
                // Contadores são apenas informativos.
              }
            },
          ),
        );

        if (active) {
          setCounts(results);
        }
      };

    void run();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!open || !isMobile) {
      return;
    }

    const onKey = (
      event: KeyboardEvent,
    ): void => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      onKey,
    );

    return () => {
      document.removeEventListener(
        'keydown',
        onKey,
      );
    };
  }, [
    open,
    onClose,
    isMobile,
  ]);

  const visibleGroups = useMemo(
    () =>
      NAV_GROUPS.map((group) => ({
        ...group,

        items: group.items.filter(
          (item) => {
            if (
              item.superadminOnly &&
              !isSuperadmin
            ) {
              return false;
            }

            return canAccessModule(
              item.module,
              profile,
            );
          },
        ),
      })).filter(
        (group) =>
          group.items.length > 0,
      ),
    [
      profile,
      isSuperadmin,
    ],
  );

  const handleSignOut =
    async (): Promise<void> => {
      await signOut();
    };

  return (
    <>
      {open && isMobile && (
        <div
          className="admin-layout__overlay"
          onClick={onClose}
          aria-hidden="true"
          style={{
            display: 'block',
            position: 'fixed',
            inset: 0,
            background:
              'rgba(38,53,45,0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 35,
          }}
        />
      )}

      <aside
        ref={drawerRef}
        className={`admin-sidebar ${
          open
            ? 'admin-sidebar--open'
            : ''
        }`}
        aria-label="Menu administrativo"
        role={
          isMobile
            ? 'dialog'
            : undefined
        }
        aria-modal={
          isMobile && open
            ? true
            : undefined
        }
      >
        <div className="admin-sidebar-header">
          <NavLink
            to="/admin"
            className="admin-sidebar-logo"
            onClick={onClose}
            aria-label="Painel administrativo - SOS Focinho Carente"
          >
            <span className="admin-sidebar-logo-mark">
              <Logo
                size="sm"
                showText={false}
              />
            </span>

            <span className="admin-sidebar-logo-text">
              <span className="admin-sidebar-logo-title">
                Painel
              </span>

              <span className="admin-sidebar-logo-sub">
                Administrativo
              </span>
            </span>
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-toggle"
            onClick={onToggleCollapsed}
            aria-label={
              collapsed
                ? 'Expandir barra lateral'
                : 'Recolher barra lateral'
            }
            aria-expanded={!collapsed}
          >
            {collapsed ? (
              <PanelLeftOpen
                size={18}
                aria-hidden="true"
              />
            ) : (
              <PanelLeftClose
                size={18}
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        <nav
          aria-label="Navegação administrativa"
          className="admin-sidebar-nav"
        >
          {visibleGroups.map((group) => (
            <div
              key={group.title}
              className="admin-sidebar-group"
            >
              <span className="admin-sidebar-group-title">
                {group.title}
              </span>

              <ul className="admin-sidebar-nav-list">
                {group.items.map((item) => {
                  const count =
                    item.countKey
                      ? counts[
                          item.countKey
                        ]
                      : undefined;

                  const ItemIcon =
                    item.icon;

                  return (
                    <li key={item.to}>
                      <NavLink
                        to={item.to}
                        end={item.end}
                        onClick={onClose}
                        className={({
                          isActive,
                        }) =>
                          `admin-sidebar-link ${
                            isActive
                              ? 'admin-sidebar-link--active'
                              : ''
                          }`
                        }
                      >
                        <ItemIcon
                          size={20}
                          className="admin-sidebar-icon"
                          aria-hidden="true"
                        />

                        <span>
                          {item.label}
                        </span>

                        {typeof count ===
                          'number' &&
                          count > 0 && (
                            <span
                              className="admin-sidebar-count"
                              title={`${count} pendente(s)`}
                            >
                              {count}
                            </span>
                          )}
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <NavLink
            to="/"
            className={({
              isActive,
            }) =>
              `admin-sidebar-link ${
                isActive
                  ? 'admin-sidebar-link--active'
                  : ''
              }`
            }
            target="_blank"
            rel="noopener noreferrer"
            title="Ver site"
          >
            <ExternalLink
              size={20}
              className="admin-sidebar-icon"
              aria-hidden="true"
            />

            <span>Ver site</span>
          </NavLink>

          <button
            type="button"
            className="admin-sidebar-link admin-sidebar-logout"
            onClick={() => {
              void handleSignOut();
            }}
            title="Sair"
          >
            <LogOut
              size={20}
              className="admin-sidebar-icon"
              aria-hidden="true"
            />

            <span>Sair</span>
          </button>
        </div>
      </aside>
    </>
  );
}