import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';

const navItems = [
  { to: '/adocao', label: 'Conhecer animais' },
  { to: '/como-ajudar', label: 'Como ajudar' },
  { to: '/sobre', label: 'Sobre' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/noticias', label: 'Notícias' },
  { to: '/contato', label: 'Contato' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLElement>(null);
  const { isAuthenticated, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const menuButton = menuButtonRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        close();
        return;
      }
      if (event.key === 'Tab') {
        const drawer = drawerRef.current;
        if (!drawer) return;
        const focusables = Array.from(
          drawer.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
        );
        if (focusables.length === 0) return;
        const first = focusables[0] as HTMLElement;
        const last = focusables[focusables.length - 1] as HTMLElement;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
      menuButton?.focus();
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [isOpen]);

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo" aria-label="SOS Focinho Carente — Início">
          <Logo size="sm" />
        </Link>

        <button
          ref={menuButtonRef}
          className="header-menu-btn"
          onClick={isOpen ? close : open}
          aria-expanded={isOpen}
          aria-controls="main-nav"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>

        <nav className="header-nav" aria-label="Navegação principal">
          <ul className="header-nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `header-nav-link ${isActive ? 'header-nav-link--active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-cta">
          {isAuthenticated && profile ? (
            <div className="header-user-menu">
              <Link to="/minha-conta" className="header-user-link">
                <User size={16} aria-hidden="true" />
                <span className="header-user-name">{profile.full_name.split(' ')[0]}</span>
              </Link>
              <button
                type="button"
                className="header-user-btn"
                onClick={async () => {
                  await signOut();
                  navigate('/', { replace: true });
                }}
                aria-label="Sair da conta"
              >
                <LogOut size={16} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <div className="header-auth-links">
              <Link to="/entrar" className="header-auth-link">
                Entrar
              </Link>
              <Link to="/cadastrar" className="btn btn--primary btn--sm">
                Cadastrar
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Drawer mobile */}
      {isOpen && (
        <div className="header-drawer-layer">
          <div className="header-drawer-backdrop" onClick={close} aria-hidden="true" />
          <nav
            id="main-nav"
            ref={drawerRef}
            className="header-drawer"
            aria-label="Menu principal"
            aria-modal="true"
            role="dialog"
          >
            <div className="header-drawer-head">
              <span className="header-drawer-title">Menu</span>
              <button
                ref={closeButtonRef}
                className="header-menu-btn header-drawer-close"
                onClick={close}
                aria-label="Fechar menu"
              >
                <X size={22} aria-hidden="true" />
              </button>
            </div>
            <ul className="header-drawer-list">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `header-drawer-link ${isActive ? 'header-drawer-link--active' : ''}`
                    }
                    onClick={close}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
            <div className="header-drawer-footer">
              {isAuthenticated && profile ? (
                <div className="header-drawer-auth">
                  <Link to="/minha-conta" className="btn btn--primary btn--full" onClick={close}>
                    Minha Conta
                  </Link>
                  <button
                    type="button"
                    className="btn btn--outline btn--full"
                    onClick={async () => {
                      await signOut();
                      close();
                      navigate('/', { replace: true });
                    }}
                  >
                    <LogOut size={16} aria-hidden="true" />
                    Sair da conta
                  </button>
                </div>
              ) : (
                <div className="header-drawer-auth">
                  <Link to="/entrar" className="btn btn--outline btn--full" onClick={close}>
                    Entrar
                  </Link>
                  <Link to="/cadastrar" className="btn btn--primary btn--full" onClick={close}>
                    Cadastrar
                  </Link>
                </div>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
