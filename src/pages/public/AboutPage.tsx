import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

export default function AboutPage() {
  return (
    <div>
      {/* Abertura fotográfica */}
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/hero-cat.jpg"
            alt="Espaço de acolhimento da ONG"
            objectFit="cover"
            objectPosition="center 50%"
            priority
            width={1920}
            height={600}
            fallback="hero"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <h1 className="page-hero-title">Sobre a SOS Focinho Carente</h1>
          <p className="page-hero-subtitle">
            Conheça nossa história e o trabalho que desenvolvemos pelos animais.
          </p>
        </div>
      </section>

      {/* Quem é a SOS */}
      <section className="section">
        <div className="container">
          <div className="about-story">
            <div className="about-story-image">
              <ResponsivePicture
                src="/images/demo/community-event.jpg"
                alt="Atividade da ONG"
                objectFit="cover"
                objectPosition="center 40%"
                width={800}
                height={600}
                fallback="care"
              />
            </div>
            <div className="about-story-body">
              <h2>Quem é a SOS Focinho Carente</h2>
              <p>
                A SOS Focinho Carente nasceu da vontade de transformar a realidade de
                animais em situação de vulnerabilidade. Desde o início, nosso trabalho
                é movido pelo respeito e cuidado com cada vida.
              </p>
              <p>
                Atuamos no resgate, reabilitação e encaminhamento para adoção responsável,
                além de promover campanhas educativas sobre posse responsável e bem-estar animal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Como trabalhamos */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
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

      {/* Como participar */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Faça parte</h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>
            Conheça as formas de contribuir com o trabalho da SOS Focinho Carente.
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'center', flexWrap: 'wrap' }}>
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
