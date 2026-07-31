import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const steps = [
  { title: 'Manifestação de Interesse', desc: 'Preencha o formulário de interesse indicando o animal desejado e suas informações básicas.' },
  { title: 'Análise Inicial', desc: 'Nossa equipe analisa as informações fornecidas e verifica a compatibilidade com o perfil do animal.' },
  { title: 'Entrevista', desc: 'Realizamos uma conversa para conhecer melhor o adotante e esclarecer dúvidas sobre o processo.' },
  { title: 'Acompanhamento Pós-Adoção', desc: 'Após a adoção, mantemos contato para garantir o bem-estar do animal e oferecer suporte.' },
];

export default function AdoptionProcessPage() {
  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/animal-cat-02.jpg"
            alt="Processo de adoção responsável"
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
          <h1 className="page-hero-title">Processo de Adoção</h1>
          <p className="page-hero-subtitle">
            Conheça as etapas do nosso processo de adoção responsável.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="journey-steps" style={{ maxWidth: 640, margin: '0 auto' }}>
            {steps.map((step, i) => (
              <div key={i} className="journey-step">
                <div className="journey-step-num">{i + 1}</div>
                <div className="journey-step-body">
                  <h4>{step.title}</h4>
                  <p>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
            <p style={{ marginBottom: 'var(--space-4)' }}>
              As etapas podem variar conforme cada caso. Nosso objetivo é garantir uma adoção responsável e duradoura.
            </p>
            <Link to="/adocao">
              <Button variant="outline">
                Conhecer animais disponíveis <ArrowRight size={16} aria-hidden="true" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
