import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { AdoptionForm } from '@/features/adoption/components/AdoptionForm';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const statusLabel: Record<string, { label: string; variant: 'success' | 'warning' | 'error' | 'info' }> = {
  available: { label: 'Disponível', variant: 'success' },
  in_process: { label: 'Em processo', variant: 'warning' },
  adopted: { label: 'Adotado', variant: 'info' },
  archived: { label: 'Arquivado', variant: 'error' },
};

export default function AnimalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const hasData = false;

  if (error) {
    return (
      <div className="section">
        <div className="container">
          <ErrorState
            message="Não foi possível carregar os dados do animal."
            onRetry={() => setError(false)}
          />
        </div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <Link to="/adocao" className="back-link">
              <ChevronLeft size={20} aria-hidden="true" />
              Voltar para adoção
            </Link>

            <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center', paddingTop: 'var(--space-10)' }}>
              <ResponsivePicture
                src="/placeholder-animal.jpg"
                alt="Animal não encontrado"
                objectFit="cover"
                objectPosition="center 40%"
                width={400}
                height={300}
              />
              <h1 style={{ fontSize: 'var(--text-2xl)', marginTop: 'var(--space-6)', marginBottom: 'var(--space-2)' }}>
                Animal não encontrado
              </h1>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)' }}>
                O animal que você procura não está disponível ou foi removido.
              </p>
              <Link to="/adocao">
                <Button variant="primary">Ver animais disponíveis</Button>
              </Link>
            </div>
          </div>
        </section>

        <Modal
          isOpen={showForm}
          onClose={() => setShowForm(false)}
          title="Tenho interesse em adotar"
          size="lg"
        >
          {slug && <AdoptionForm animalSlug={slug} onSuccess={() => setShowForm(false)} />}
        </Modal>
      </div>
    );
  }

  return (
    <div>
      <section className="section">
        <div className="container">
          <Link to="/adocao" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para adoção
          </Link>

          {/* Galeria emocional */}
          <div className="animal-detail-gallery">
            <div className="animal-detail-main-image">
              <ResponsivePicture
                src="/placeholder-animal.jpg"
                alt="Fotografia principal do animal"
                objectFit="cover"
                objectPosition="center 40%"
                width={1200}
                height={750}
              />
            </div>
            <div className="animal-detail-thumbs" role="tablist" aria-label="Miniaturas">
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  className={`animal-detail-thumb ${activeThumb === i ? 'animal-detail-thumb--active' : ''}`}
                  onClick={() => setActiveThumb(i)}
                  role="tab"
                  aria-selected={activeThumb === i}
                  aria-label={`Foto ${i + 1} do animal`}
                >
                  <ResponsivePicture
                    src="/placeholder-animal.jpg"
                    alt=""
                    objectFit="cover"
                    objectPosition="center 50%"
                    width={160}
                    height={120}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Nome e status */}
          <div className="animal-detail-header">
            <h1 className="animal-detail-name">Nome do animal</h1>
            <div className="animal-detail-status">
              <Badge variant="success">Disponível</Badge>
            </div>
            <div className="animal-detail-tags">
              <span className="adoption-card-detail">Espécie</span>
              <span className="adoption-card-detail">Sexo</span>
              <span className="adoption-card-detail">Porte</span>
            </div>
          </div>

          {/* Características */}
          <div className="animal-detail-section">
            <h2>Sobre</h2>
            <p>
              Informações sobre o animal aparecerão aqui quando cadastradas pela ONG.
            </p>
          </div>

          <div className="animal-detail-section">
            <h2>Características</h2>
            <div className="animal-detail-traits">
              <div className="animal-detail-trait">
                <div className="animal-detail-trait-label">Vacinado</div>
                <div className="animal-detail-trait-value">—</div>
              </div>
              <div className="animal-detail-trait">
                <div className="animal-detail-trait-label">Castrado</div>
                <div className="animal-detail-trait-value">—</div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="animal-detail-cta">
            <h3>Tenho interesse em conhecer este animal</h3>
            <p>
              O envio do formulário demonstra interesse e não confirma automaticamente a adoção.
            </p>
            <Button size="lg" onClick={() => setShowForm(true)}>
              Tenho interesse
            </Button>
          </div>
        </div>
      </section>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Tenho interesse em adotar"
        size="lg"
      >
        {slug && <AdoptionForm animalSlug={slug} onSuccess={() => setShowForm(false)} />}
      </Modal>
    </div>
  );
}
