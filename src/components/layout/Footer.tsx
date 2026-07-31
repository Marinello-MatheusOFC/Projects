import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { fetchOrgInfo, type OrgInfo } from '@/services/settings';

const socialLinks: {
  key: keyof OrgInfo['social'];
  href: (url: string) => string;
  label: string;
  icon: typeof Instagram;
}[] = [
  { key: 'instagram', href: (u) => (u.startsWith('http') ? u : `https://instagram.com/${u}`), label: 'Instagram', icon: Instagram },
  { key: 'facebook', href: (u) => (u.startsWith('http') ? u : `https://facebook.com/${u}`), label: 'Facebook', icon: Facebook },
  { key: 'youtube', href: (u) => (u.startsWith('http') ? u : `https://youtube.com/@${u}`), label: 'YouTube', icon: Youtube },
];

let orgInfoCache: OrgInfo | null = null;
let orgInfoPromise: Promise<OrgInfo> | null = null;

function getOrgInfo(): Promise<OrgInfo> {
  if (orgInfoCache) return Promise.resolve(orgInfoCache);
  if (!orgInfoPromise) {
    orgInfoPromise = fetchOrgInfo()
      .then((info) => {
        orgInfoCache = info;
        return info;
      })
      .finally(() => {
        orgInfoPromise = null;
      });
  }
  return orgInfoPromise;
}

export function Footer() {
  const [org, setOrg] = useState<OrgInfo | null>(orgInfoCache);

  useEffect(() => {
    let active = true;
    getOrgInfo().then((info) => {
      if (active) setOrg(info);
    });
    return () => {
      active = false;
    };
  }, []);

  const contacts = org?.contacts;
  const hasContacts = contacts && (contacts.email || contacts.phone || contacts.whatsapp || contacts.address);
  const socials = org?.social;

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
            {socials && (
              <div className="footer-social">
                {socialLinks
                  .filter((s) => socials[s.key])
                  .map(({ key, href, label, icon: Icon }) => (
                    <a
                      key={key}
                      href={href(socials[key]!)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      title={label}
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  ))}
              </div>
            )}
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

        {hasContacts && (
          <div className="footer-contact-row">
            {contacts.email && (
              <span>
                <Mail size={14} aria-hidden="true" /> <a href={`mailto:${contacts.email}`}>{contacts.email}</a>
              </span>
            )}
            {contacts.phone && (
              <span>
                <Phone size={14} aria-hidden="true" /> <a href={`tel:${contacts.phone}`}>{contacts.phone}</a>
              </span>
            )}
            {contacts.whatsapp && (
              <span>
                <MessageCircle size={14} aria-hidden="true" /> <a href={`https://wa.me/${contacts.whatsapp}`}>WhatsApp</a>
              </span>
            )}
            {contacts.address && (
              <span><MapPin size={14} aria-hidden="true" /> {contacts.address}</span>
            )}
          </div>
        )}

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
