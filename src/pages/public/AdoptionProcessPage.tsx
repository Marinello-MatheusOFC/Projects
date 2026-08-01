import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/layout/PageHeader';

const steps = [
  { title: 'Manifestação de Interesse', desc: 'Preencha o formulário de interesse indicando o animal desejado e suas informações básicas.' },
  { title: 'Análise Inicial', desc: 'Nossa equipe analisa as informações fornecidas e verifica a compatibilidade com o perfil do animal.' },
  { title: 'Entrevista', desc: 'Realizamos uma conversa para conhecer melhor o adotante e esclarecer dúvidas sobre o processo.' },
  { title: 'Acompanhamento Pós-Adoção', desc: 'Após a adoção, mantemos contato para garantir o bem-estar do animal e oferecer suporte.' },
];

export default function AdoptionProcessPage() {
  useEffect(() => {
    document.title = 'Processo de Adoção — SOS Focinho Carente';
  }, []);

  return (
    <div>
      <PageHeader
        tone="green"
        eyebrow="Adoção responsável"
        title="Processo de Adoção"
        subtitle="Conheça as etapas do nosso processo de adoção responsável."
        media={{
          src: '/images/demo/animal-cat-02.jpg',
          alt: 'Gato acolhido aguardando uma adoção responsável',
          objectPosition: 'center 50%',
          fallback: 'cat',
        }}
      />

      <section className="section section--cream">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">Passo a passo</span>
            <h2>Como funciona a adoção</h2>
            <p>
              Cada etapa é pensada para garantir um encontro seguro e duradouro entre
              você e o animal.
            </p>
          </div>

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

      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <span className="eyebrow">Dúvidas</span>
            <h2>Quer saber mais?</h2>
            <p>
              Se tiver perguntas sobre o processo, fale com a nossa equipe. Teremos
              prazer em ajudar você e o animal a se encontrarem.
            </p>
          </div>
          <div className="section-actions">
            <Link to="/contato">
              <Button>Fale conosco</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
