import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

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

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="header-logo" aria-label="SOS Focinho Carente — Início">
          <Logo size="sm" />
        </Link>

        <button
          className="header-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-controls="main-nav"
          aria-label={isOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <nav
          id="main-nav"
          className={`header-nav ${isOpen ? 'header-nav--open' : ''}`}
          aria-label="Navegação principal"
        >
          <ul className="header-nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `header-nav-link ${isActive ? 'header-nav-link--active' : ''}`
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-cta">
          <Link to="/adocao" className="btn btn--primary btn--sm">
            Quero adotar
          </Link>
        </div>
      </div>
    </header>
  );
}
