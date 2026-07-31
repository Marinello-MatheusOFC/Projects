import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <Link to="/" className="footer-brand">
              <Logo size="sm" />
            </Link>
            <p className="footer-desc">
              Uma organização dedicada a conectar animais a lares seguros e construir
              uma comunidade mais consciente e acolhedora.
            </p>
            <div className="footer-social">
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Facebook" title="Facebook">
                <Facebook size={18} aria-hidden="true" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="Instagram" title="Instagram">
                <Instagram size={18} aria-hidden="true" />
              </a>
              <a href="#" onClick={(e) => e.preventDefault()} aria-label="YouTube" title="YouTube">
                <Youtube size={18} aria-hidden="true" />
              </a>
              <a href="mailto:contato@sosfocinhocarente.org.br" aria-label="E-mail" title="E-mail">
                <Mail size={18} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="footer-heading">Navegação</h3>
            <ul className="footer-links">
              <li><Link to="/adocao">Conhecer animais</Link></li>
              <li><Link to="/como-ajudar">Como ajudar</Link></li>
              <li><Link to="/voluntariado">Voluntariado</Link></li>
              <li><Link to="/eventos">Eventos</Link></li>
              <li><Link to="/galeria">Galeria</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="footer-heading">Institucional</h3>
            <ul className="footer-links">
              <li><Link to="/sobre">Sobre nós</Link></li>
              <li><Link to="/noticias">Notícias</Link></li>
              <li><Link to="/brecho">Brechó</Link></li>
              <li><Link to="/contato">Contato</Link></li>
            </ul>
          </div>
        </div>

        <div className="footer-contact-row">
          <span><Mail size={14} aria-hidden="true" /> contato@sosfocinhocarente.org.br</span>
          <span><Phone size={14} aria-hidden="true" /> (11) 3333-2222</span>
          <span><MapPin size={14} aria-hidden="true" /> Rua das Flores, 123 — Centro</span>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} SOS Focinho Carente</p>
          <p className="footer-disclaimer">
            Conteúdo de demonstração. As informações exibidas não representam dados oficiais da ONG.
          </p>
        </div>
      </div>
    </footer>
  );
}
