import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AdoptionForm } from '@/features/adoption/components/AdoptionForm';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { fetchAnimalBySlug, fetchAdoptableAnimals, type AnimalWithImages } from '@/services/animals';
import { resolveImageUrl } from '@/lib/images';
import { speciesLabel, sexLabel, sizeLabel, animalStatusLabel } from '@/lib/format';

function getStatus(status: AnimalWithImages['status']): { label: string; variant: 'success' | 'warning' | 'default' } {
  switch (status) {
    case 'available': return { label: 'Disponível', variant: 'success' };
    case 'in_process': return { label: 'Em processo', variant: 'warning' };
    case 'adopted': return { label: 'Adotado', variant: 'default' };
    case 'archived': return { label: 'Arquivado', variant: 'default' };
    default: return { label: 'Disponível', variant: 'success' };
  }
}

function buildTraits(animal: AnimalWithImages) {
  const traits: { label: string; value: string }[] = [];
  if (animal.age_text) traits.push({ label: 'Idade', value: animal.age_text });
  traits.push({ label: 'Vacinado', value: animal.vaccinated ? 'Sim' : 'Não' });
  traits.push({ label: 'Castrado', value: animal.neutered ? 'Sim' : 'Não' });
  traits.push({ label: 'Necessidades especiais', value: animal.special_needs ? 'Sim' : 'Não' });
  return traits;
}

function personalityList(animal: AnimalWithImages): string[] {
  const raw = animal.personality?.split(',').map((s) => s.trim()).filter(Boolean) ?? [];
  return raw.length > 0 ? raw : ['Personalidade em observação'];
}

export default function AnimalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [showForm, setShowForm] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);
  const [animal, setAnimal] = useState<AnimalWithImages | null | undefined>(undefined);
  const [others, setOthers] = useState<AnimalWithImages[]>([]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setAnimal(undefined);
    setActiveThumb(0);
    fetchAnimalBySlug(slug).then((result) => {
      if (active) setAnimal(result);
    });
    fetchAdoptableAnimals().then((result) => {
      if (active) setOthers(result.filter((a) => a.slug !== slug).slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, [slug]);

  if (animal === undefined) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <div className="skeleton" style={{ aspectRatio: '16 / 10', marginBottom: 'var(--space-6)' }} aria-hidden="true" />
            <div className="skeleton skeleton-title" aria-hidden="true" />
            <div className="skeleton skeleton-text" aria-hidden="true" />
            <div className="skeleton skeleton-text short" aria-hidden="true" />
          </div>
        </section>
      </div>
    );
  }

  if (!animal) {
    return (
      <div>
        <section className="section section--alt">
          <div className="container">
            <Link to="/adocao" className="back-link">
              <ChevronLeft size={20} aria-hidden="true" />
              Voltar para adoção
            </Link>

            <div className="animal-not-found">
              <div className="animal-not-found-image">
                <ResponsivePicture
                  src="/images/demo/animal-dog-01.jpg"
                  alt="Animal não encontrado"
                  objectFit="cover"
                  objectPosition="center 40%"
                  width={400}
                  height={300}
                  fallback="animal"
                />
              </div>
              <h1>Animal não encontrado</h1>
              <p>O animal que você procura não está disponível ou foi removido.</p>
              <Link to="/adocao">
                <Button>Ver animais disponíveis</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const status = getStatus(animal.status);
  const thumbs = animal.images.map((img) => resolveImageUrl(img.storage_path));
  const species = speciesLabel(animal.species);
  const traitList = buildTraits(animal);
  const story = animal.history || animal.description || 'A história completa deste animal está sendo registrada pela nossa equipe. Para saber mais, entre em contato conosco.';

  return (
    <div className="animal-detail-page">
      <section className="section section--cream" style={{ paddingBottom: 0 }}>
        <div className="container">
          <Link to="/adocao" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para adoção
          </Link>
        </div>
      </section>

      <section className="section section--cream" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="container">
          <div className="animal-detail-gallery">
            <div className="animal-detail-main-image">
              <ResponsivePicture
                src={thumbs[activeThumb] ?? animal.cover}
                alt={`${animal.name} — foto principal`}
                objectFit="cover"
                objectPosition="center 40%"
                width={1200}
                height={750}
                fallback={animal.species === 'cat' ? 'cat' : 'animal'}
              />
            </div>
            {thumbs.length > 1 && (
              <div className="animal-detail-thumbs" role="tablist" aria-label="Miniaturas">
                {thumbs.map((thumbSrc, i) => (
                  <button
                    key={i}
                    className={`animal-detail-thumb ${activeThumb === i ? 'animal-detail-thumb--active' : ''}`}
                    onClick={() => setActiveThumb(i)}
                    role="tab"
                    aria-selected={activeThumb === i}
                    aria-label={`Foto ${i + 1} de ${animal.name}`}
                  >
                    <ResponsivePicture
                      src={thumbSrc}
                      alt=""
                      objectFit="cover"
                      objectPosition="center 50%"
                      width={160}
                      height={120}
                      fallback="animal"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="section section--cream" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          <div className="animal-detail-layout">
            <div className="animal-detail-main">
              <div className="animal-detail-header">
                <h1 className="animal-detail-name">{animal.name}</h1>
                <div className="animal-detail-status">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="animal-detail-tags">
                  <span className="tag tag--species">{species}</span>
                  <span className="tag tag--sex">{sexLabel(animal.sex)}</span>
                  <span className="tag tag--size">Porte {sizeLabel(animal.size)}</span>
                  {animal.age_text && <span className="tag tag--age">{animal.age_text}</span>}
                </div>
              </div>

              <div className="animal-detail-section">
                <h2>História</h2>
                <p>{story}</p>
              </div>

              <div className="animal-detail-section">
                <h2>Personalidade</h2>
                <ul className="animal-detail-personality">
                  {personalityList(animal).map((trait, i) => (
                    <li key={i} className="personality-trait">{trait}</li>
                  ))}
                </ul>
              </div>

              <div className="animal-detail-section">
                <h2>Lar ideal</h2>
                <p>{animal.compatibility_notes || 'Estamos conhecendo o melhor perfil de lar para este animal.'}</p>
              </div>
            </div>

            <aside className="animal-detail-sidebar">
              <div className="detail-card">
                <h3>Informações</h3>
                <dl className="detail-list">
                  {traitList.map((t, i) => (
                    <div key={i} className="detail-row">
                      <dt>{t.label}</dt>
                      <dd>{t.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="detail-card detail-card--cta">
                <h3>Tenho interesse</h3>
                <p>
                  O envio do formulário demonstra interesse e não confirma automaticamente a adoção.
                </p>
                <Button
                  size="lg"
                  fullWidth
                  onClick={() => setShowForm(true)}
                  disabled={animal.status === 'adopted'}
                >
                  {animal.status === 'adopted' ? 'Animal adotado' : 'Quero adotar'}
                </Button>
                {animal.status === 'in_process' && (
                  <p className="detail-note">
                    Este animal já está em processo de adoção, mas você pode manifestar interesse.
                  </p>
                )}
                <p className="detail-note" aria-hidden="true">
                  Status: {animalStatusLabel(animal.status)}
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section--yellow-soft">
          <div className="container">
            <div className="section-intro">
              <h2>Conheça outros animais</h2>
              <p>Talvez outro focinho esteja esperando por você.</p>
            </div>
            <div className="editorial-grid">
              {others.map((other) => (
                <Link
                  key={other.slug}
                  to={`/adocao/${other.slug}`}
                  className="animal-portrait"
                  aria-label={`Conhecer ${other.name}`}
                >
                  <ResponsivePicture
                    src={other.cover}
                    alt={`${other.name}, ${speciesLabel(other.species)} de porte ${sizeLabel(other.size)}`}
                    objectFit="cover"
                    objectPosition="center 40%"
                    width={800}
                    height={600}
                    fallback={other.species === 'cat' ? 'cat' : 'animal'}
                  />
                  <div className="animal-portrait-overlay" />
                  <div className="animal-portrait-info">
                    <div className="animal-portrait-name">{other.name}</div>
                    <div className="animal-portrait-meta">
                      {speciesLabel(other.species)} · {sexLabel(other.sex)} · Porte {sizeLabel(other.size)}
                    </div>
                    <span className="animal-portrait-link">
                      Conhecer {other.name} <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={`Tenho interesse em adotar ${animal.name}`}
        size="lg"
      >
        {animal && <AdoptionForm animalId={animal.id} onSuccess={() => setShowForm(false)} />}
      </Modal>
    </div>
  );
}
