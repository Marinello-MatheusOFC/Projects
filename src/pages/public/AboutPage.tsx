import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchOrgInfo, type OrgInfo } from '@/services/settings';

export default function AboutPage() {
  const [org, setOrg] = useState<OrgInfo | null>(null);

  useEffect(() => {
    document.title = 'Sobre — SOS Focinho Carente';
    let active = true;
    fetchOrgInfo().then((info) => {
      if (active) setOrg(info);
    });
    return () => {
      active = false;
    };
  }, []);

  const mission =
    org?.about.mission?.trim() ||
    'A SOS Focinho Carente nasceu da vontade de transformar a realidade de animais em situação de vulnerabilidade. Desde o início, nosso trabalho é movido pelo respeito e cuidado com cada vida.';

  const shortDescription =
    org?.about.short_description?.trim() ||
    'Atuamos no resgate, reabilitação e encaminhamento para adoção responsável, além de promover campanhas educativas sobre posse responsável e bem-estar animal.';

  return (
    <div>
      <PageHeader
        eyebrow="Quem somos"
        title="Sobre a SOS Focinho Carente"
        subtitle="Conheça nossa história e o trabalho que desenvolvemos pelos animais."
        media={{
          src: '/images/demo/shelter-space.jpg',
          alt: 'Espaço de acolhimento da ONG',
          objectPosition: 'center 50%',
          fallback: 'hero',
        }}
      />

      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story-image">
              <ResponsivePicture
                src="/images/demo/community-event.jpg"
                alt="Voluntários em uma atividade da ONG"
                objectFit="cover"
                objectPosition="center 40%"
                width={800}
                height={600}
                fallback="care"
              />
            </div>
            <div className="about-story-body">
              <h2>Quem é a SOS Focinho Carente</h2>
              <p>{mission}</p>
              <p>{shortDescription}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">Nossos princípios</span>
            <h2>Como trabalhamos</h2>
            <p>Princípios que guiam cada ação da nossa organização.</p>
          </div>
          <div className="about-values">
            <div className="about-value">
              <h3>Respeito aos animais</h3>
              <p>Todo animal merece dignidade, cuidado e a oportunidade de um lar seguro.</p>
            </div>
            <div className="about-value">
              <h3>Transparência</h3>
              <p>Prestação de contas clara e acesso às informações institucionais.</p>
            </div>
            <div className="about-value">
              <h3>Responsabilidade</h3>
              <p>Compromisso com a ética em todas as ações e decisões.</p>
            </div>
            <div className="about-value">
              <h3>Transformação social</h3>
              <p>Trabalhamos por uma sociedade mais consciente e compassiva.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">Participe</span>
            <h2>Faça parte</h2>
            <p>Conheça as formas de contribuir com o trabalho da SOS Focinho Carente.</p>
          </div>
          <div className="section-actions" style={{ gap: 'var(--space-3)', flexWrap: 'wrap' }}>
            <Link to="/voluntariado">
              <Button>Ser voluntário</Button>
            </Link>
            <Link to="/como-ajudar">
              <Button variant="outline">
                Como ajudar <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
