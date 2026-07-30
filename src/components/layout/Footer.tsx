import { Link } from 'react-router-dom';
import { Mail, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-grid">
          <div>
            <div className="footer-brand">SOS Focinho Carente</div>
            <p className="footer-desc">
              Uma organização dedicada a conectar animais a lares seguros e construir
              uma comunidade mais consciente e acolhedora.
            </p>
          </div>

          <div>
            <h3 className="footer-heading">Navegação</h3>
            <ul className="footer-links">
              <li><Link to="/adocao">Conhecer animais</Link></li>
              <li><Link to="/como-ajudar">Como ajudar</Link></li>
              <li><Link to="/voluntariado">Voluntariado</Link></li>
              <li><Link to="/eventos">Eventos</Link></li>
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
