import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, HandHeart, Heart, HeartHandshake, Home, Megaphone } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchOrgInfo, type OrgInfo } from '@/services/settings';

const helpImages = [
  '/images/demo/animal-cat-04.jpg',
  '/images/demo/shelter-space.jpg',
  '/images/demo/volunteer-care.jpg',
  '/images/demo/animal-bunny.jpg',
  '/images/demo/adoption-event.jpg',
  '/images/demo/volunteer-team.jpg',
];

const helpOptions = [
  { title: 'Adoção Responsável', desc: 'Abra seu lar para um animal resgatado e transforme duas vidas. Conheça quem espera por você e entenda cada etapa do processo.', link: '/adocao', label: 'Conhecer animais', Icon: HeartHandshake },
  { title: 'Lar Temporário', desc: 'Ofereça um abrigo temporário até que o animal encontre um lar definitivo.', link: '/contato', label: 'Quero ajudar', Icon: Home },
  { title: 'Voluntariado', desc: 'Contribua com seu tempo e talento. Há muitas formas de participar.', link: '/voluntariado', label: 'Seja voluntário', Icon: HandHeart },
  { title: 'Doação Financeira', desc: 'Ajude a cobrir custos com alimentação, veterinário e manutenção.', link: '/contato', label: 'Como doar', Icon: Heart },
  { title: 'Divulgação', desc: 'Compartilhe nossos animais e campanhas. A divulgação salva vidas.', link: '/adocao', label: 'Ajudar divulgando', Icon: Megaphone },
  { title: 'Participar de Eventos', desc: 'Participe de eventos e campanhas beneficentes da ONG.', link: '/eventos', label: 'Ver eventos', Icon: CalendarDays },
];

export default function HowToHelpPage() {
  const [org, setOrg] = useState<OrgInfo | null>(null);

  useEffect(() => {
    document.title = 'Como ajudar — SOS Focinho Carente';
    let active = true;
    fetchOrgInfo().then((info) => {
      if (active) setOrg(info);
    });
    return () => {
      active = false;
    };
  }, []);

  const pixKey = org?.pix?.pix_key?.trim() || '';
  const pixOwner = org?.pix?.pix_owner?.trim() || '';

  return (
    <div>
      <PageHeader
        tone="yellow"
        eyebrow="Como ajudar"
        title="Existem muitas formas de ajudar"
        subtitle="Cada gesto — grande ou pequeno — faz diferença na vida de um animal."
        media={{
          src: '/images/demo/animal-puppy.jpg',
          alt: 'Filhote esperando por um lar',
          objectPosition: 'center 50%',
          fallback: 'help',
        }}
      />

      <section className="section section--cream">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">Participe</span>
            <h2>Escolha como ajudar</h2>
            <p>Todas as formas de apoio são bem-vindas e fazem a diferença.</p>
          </div>
          <div className="help-list">
            {helpOptions.map((item, i) => (
              <div key={i} className={`help-card ${i === 0 ? 'help-card--featured' : ''}`}>
                <div className="help-card-image">
                  <ResponsivePicture
                    src={helpImages[i]}
                    alt={item.title}
                    objectFit="cover"
                    objectPosition="center 50%"
                    width={i === 0 ? 1200 : 600}
                    height={i === 0 ? 514 : 338}
                    fallback="help"
                  />
                </div>
                <div className="help-card-body">
                  <span className="help-card-icon" aria-hidden="true">
                    <item.Icon size={24} strokeWidth={1.9} />
                  </span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                  <Link to={item.link}>
                    {item.label} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--vivid-red">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">Doações</span>
            <h2>Informações de Doação</h2>
            <p>Os dados bancários serão disponibilizados pela ONG em breve.</p>
          </div>

          {pixKey && (
            <div style={{ maxWidth: 560, margin: '0 auto var(--space-8)' }}>
              <Alert
                type="info"
                message={pixOwner ? `PIX (${pixOwner}): ${pixKey}` : `PIX: ${pixKey}`}
              />
            </div>
          )}

          <div className="section-actions" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/voluntariado">
              <Button>Ser voluntário</Button>
            </Link>
            <Link to="/contato">
              <Button variant="outline">Fale conosco</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
