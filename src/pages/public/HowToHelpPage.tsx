import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const helpOptions = [
  { title: 'Adoção Responsável', desc: 'Abra seu lar para um animal resgatado e transforme duas vidas.', link: '/adocao', label: 'Conhecer animais' },
  { title: 'Lar Temporário', desc: 'Ofereça um abrigo temporário até que o animal encontre um lar definitivo.', link: '/contato', label: 'Quero ajudar' },
  { title: 'Voluntariado', desc: 'Contribua com seu tempo e talento. Há muitas formas de participar.', link: '/voluntariado', label: 'Seja voluntário' },
  { title: 'Doação Financeira', desc: 'Ajude a cobrir custos com alimentação, veterinário e manutenção.', link: '/como-ajudar', label: 'Como doar' },
  { title: 'Divulgação', desc: 'Compartilhe nossos animais e campanhas. A divulgação salva vidas.', link: '/adocao', label: 'Ajudar divulgando' },
  { title: 'Participar de Eventos', desc: 'Participe de eventos e campanhas beneficentes da ONG.', link: '/eventos', label: 'Ver eventos' },
];

export default function HowToHelpPage() {
  return (
    <div>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="adoption-header">
            <h1>Existem muitas formas de ajudar</h1>
            <p>
              Cada gesto — grande ou pequeno — faz diferença na vida de um animal.
            </p>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="help-list">
            {helpOptions.map((item, i) => (
              <div key={i} className="help-card">
                <div className="help-card-image">
                  <ResponsivePicture
                    src="/placeholder-help.jpg"
                    alt={item.title}
                    objectFit="cover"
                    objectPosition="center 50%"
                    width={600}
                    height={338}
                  />
                </div>
                <div className="help-card-body">
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

      <section className="section section--alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Informações de Doação</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', maxWidth: 500, margin: '0 auto var(--space-4)' }}>
            Os dados bancários serão disponibilizados pela ONG em breve.
          </p>
          <Link to="/contato">
            <Button variant="outline">Fale conosco</Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
