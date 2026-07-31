import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { AdoptionForm } from '@/features/adoption/components/AdoptionForm';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

interface AnimalData {
  name: string;
  species: string;
  sex: string;
  size: string;
  age: string;
  status: 'available' | 'in_process' | 'adopted';
  mainImage: string;
  thumbs: string[];
  story: string;
  traits: { label: string; value: string }[];
  personality: string[];
  idealHome: string;
}

const animals: Record<string, AnimalData> = {
  luna: {
    name: 'Luna',
    species: 'Cachorro',
    sex: 'Fêmea',
    size: 'Médio',
    age: '3 anos',
    status: 'available',
    mainImage: '/images/demo/animal-dog-01.jpg',
    thumbs: ['/images/demo/animal-dog-01.jpg', '/images/demo/animal-paw.jpg', '/images/demo/care-volunteer.jpg'],
    story: 'Luna foi encontrada em uma área de risco, magra e assustada. Com cuidado e paciência, ela se transformou em uma cachorra doce e confiante. Hoje busca um lar onde possa receber o carinho que merece.',
    traits: [
      { label: 'Vacinado', value: 'Sim' },
      { label: 'Castrado', value: 'Sim' },
      { label: 'Vermifugado', value: 'Sim' },
      { label: 'Microchip', value: 'Sim' },
    ],
    personality: ['Dócil', 'Brincalhona', 'Sociável com outros cães', 'Aceita gatos'],
    idealHome: 'Casa com quintal ou apartamento com passeios diários. Família com ou sem crianças.',
  },
  toddy: {
    name: 'Toddy',
    species: 'Cachorro',
    sex: 'Macho',
    size: 'Pequeno',
    age: '1 ano',
    status: 'available',
    mainImage: '/images/demo/animal-cat-02.jpg',
    thumbs: ['/images/demo/animal-cat-02.jpg', '/images/demo/animal-paw.jpg', '/images/demo/care-volunteer.jpg'],
    story: 'Toddy foi resgatado ainda filhote, abandonado em uma caixa. Cresceu saudável e cheio de energia. É um cão extremamente apegado aos humanos e adora estar no colo.',
    traits: [
      { label: 'Vacinado', value: 'Sim' },
      { label: 'Castrado', value: 'Sim' },
      { label: 'Vermifugado', value: 'Sim' },
      { label: 'Microchip', value: 'Não' },
    ],
    personality: ['Apegado', 'Energético', 'Aprende rápido', 'Late pouco'],
    idealHome: 'Apartamento ou casa pequena. Ótimo para quem busca um companheiro de colo.',
  },
  mel: {
    name: 'Mel',
    species: 'Gato',
    sex: 'Fêmea',
    size: 'Pequeno',
    age: '2 anos',
    status: 'available',
    mainImage: '/images/demo/animal-cat-01.jpg',
    thumbs: ['/images/demo/animal-cat-01.jpg', '/images/demo/hero-cat.jpg', '/images/demo/animal-paw.jpg'],
    story: 'Mel foi resgatada de uma situação de maus-tratos. Com o tempo, aprendeu a confiar novamente. É uma gata calma, observadora e muito carinhosa depois que se sente segura.',
    traits: [
      { label: 'Vacinado', value: 'Sim' },
      { label: 'Castrado', value: 'Sim' },
      { label: 'Vermifugado', value: 'Sim' },
      { label: 'Microchip', value: 'Sim' },
    ],
    personality: ['Calma', 'Carinhosa', 'Independente', 'Aceita outros gatos'],
    idealHome: 'Apartamento telado ou casa segura. Lar tranquilo sem crianças muito pequenas.',
  },
  thor: {
    name: 'Thor',
    species: 'Cachorro',
    sex: 'Macho',
    size: 'Grande',
    age: '4 anos',
    status: 'in_process',
    mainImage: '/images/demo/hero-dog.jpg',
    thumbs: ['/images/demo/hero-dog.jpg', '/images/demo/animal-paw.jpg', '/images/demo/care-volunteer.jpg'],
    story: 'Thor foi abandonado após passar a vida inteira em corrente. Apesar do porte grande, é um cão extremamente dócil e protetor. Está em processo de avaliação com uma família.',
    traits: [
      { label: 'Vacinado', value: 'Sim' },
      { label: 'Castrado', value: 'Sim' },
      { label: 'Vermifugado', value: 'Sim' },
      { label: 'Microchip', value: 'Sim' },
    ],
    personality: ['Protetor', 'Dócil', 'Calmo', 'Bom com crianças'],
    idealHome: 'Casa com quintal espaçoso. Família com experiência com cães de grande porte.',
  },
  pipoca: {
    name: 'Pipoca',
    species: 'Gato',
    sex: 'Fêmea',
    size: 'Pequeno',
    age: '8 meses',
    status: 'available',
    mainImage: '/images/demo/hero-cat.jpg',
    thumbs: ['/images/demo/hero-cat.jpg', '/images/demo/animal-cat-01.jpg', '/images/demo/animal-paw.jpg'],
    story: 'Pipoca nasceu na própria ONG, filha de uma gata resgatada. É brincalhona, curiosa e adora explorar. Está pronta para encontrar um lar amoroso.',
    traits: [
      { label: 'Vacinado', value: 'Sim' },
      { label: 'Castrado', value: 'Ainda não' },
      { label: 'Vermifugado', value: 'Sim' },
      { label: 'Microchip', value: 'Sim' },
    ],
    personality: ['Brincalhona', 'Curiosa', 'Sociável', 'Ama carinho'],
    idealHome: 'Apartamento telado. Família com tempo para brincadeiras e interação.',
  },
  bolinha: {
    name: 'Bolinha',
    species: 'Cachorro',
    sex: 'Macho',
    size: 'Médio',
    age: '5 anos',
    status: 'available',
    mainImage: '/images/demo/animal-dog-01.jpg',
    thumbs: ['/images/demo/animal-dog-01.jpg', '/images/demo/community-event.jpg', '/images/demo/animal-paw.jpg'],
    story: 'Bolinha viveu na rua por anos antes de ser resgatado. Apesar do passado difícil, é um cão grato e amoroso. Tem energia moderada e adora caminhadas.',
    traits: [
      { label: 'Vacinado', value: 'Sim' },
      { label: 'Castrado', value: 'Sim' },
      { label: 'Vermifugado', value: 'Sim' },
      { label: 'Microchip', value: 'Sim' },
    ],
    personality: ['Calmo', 'Agradecido', 'Sociável', 'Obediente'],
    idealHome: 'Casa ou apartamento. Ideal para quem busca um companheiro tranquilo para caminhadas.',
  },
};

function getStatus(status: string) {
  switch (status) {
    case 'available': return { label: 'Disponível', variant: 'success' as const };
    case 'in_process': return { label: 'Em processo', variant: 'warning' as const };
    case 'adopted': return { label: 'Adotado', variant: 'default' as const };
    default: return { label: 'Disponível', variant: 'success' as const };
  }
}

export default function AnimalDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [showForm, setShowForm] = useState(false);
  const [activeThumb, setActiveThumb] = useState(0);

  const animal = slug ? animals[slug] : undefined;

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

  return (
    <div className="animal-detail-page">
      {/* Breadcrumb visual */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <Link to="/adocao" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para adoção
          </Link>
        </div>
      </section>

      {/* Galeria emocional */}
      <section className="section" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="container">
          <div className="animal-detail-gallery">
            <div className="animal-detail-main-image">
              <ResponsivePicture
                src={animal.thumbs[activeThumb]}
                alt={`${animal.name} — foto principal`}
                objectFit="cover"
                objectPosition="center 40%"
                width={1200}
                height={750}
                fallback={animal.species === 'Gato' ? 'cat' : 'animal'}
              />
            </div>
            <div className="animal-detail-thumbs" role="tablist" aria-label="Miniaturas">
              {animal.thumbs.map((thumbSrc, i) => (
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
                    fallback={i === 2 ? 'care' : 'animal'}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Nome, status e características */}
      <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          <div className="animal-detail-layout">
            <div className="animal-detail-main">
              <div className="animal-detail-header">
                <h1 className="animal-detail-name">{animal.name}</h1>
                <div className="animal-detail-status">
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <div className="animal-detail-tags">
                  <span className="tag tag--species">{animal.species}</span>
                  <span className="tag tag--sex">{animal.sex}</span>
                  <span className="tag tag--size">Porte {animal.size}</span>
                  <span className="tag tag--age">{animal.age}</span>
                </div>
              </div>

              <div className="animal-detail-section">
                <h2>História</h2>
                <p>{animal.story}</p>
              </div>

              <div className="animal-detail-section">
                <h2>Personalidade</h2>
                <ul className="animal-detail-personality">
                  {animal.personality.map((trait, i) => (
                    <li key={i} className="personality-trait">{trait}</li>
                  ))}
                </ul>
              </div>

              <div className="animal-detail-section">
                <h2>Lar ideal</h2>
                <p>{animal.idealHome}</p>
              </div>
            </div>

            <aside className="animal-detail-sidebar">
              <div className="detail-card">
                <h3>Informações</h3>
                <dl className="detail-list">
                  {animal.traits.map((t, i) => (
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
                  <p className="detail-note">Este animal já está em processo de adoção, mas você pode manifestar interesse.</p>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Outros animais */}
      <section className="section section--warm">
        <div className="container">
          <div className="section-intro">
            <h2>Conheça outros animais</h2>
            <p>Talvez outro focinho esteja esperando por você.</p>
          </div>
          <div className="editorial-grid">
            {Object.entries(animals)
              .filter(([key]) => key !== slug)
              .slice(0, 3)
              .map(([key, other]) => (
                <Link key={key} to={`/adocao/${key}`} className="animal-portrait" aria-label={`Conhecer ${other.name}`}>
                  <ResponsivePicture
                    src={other.mainImage}
                    alt={`${other.name}, ${other.species}`}
                    objectFit="cover"
                    objectPosition="center 40%"
                    width={800}
                    height={600}
                    fallback={other.species === 'Gato' ? 'cat' : 'animal'}
                  />
                  <div className="animal-portrait-overlay" />
                  <div className="animal-portrait-info">
                    <div className="animal-portrait-name">{other.name}</div>
                    <div className="animal-portrait-meta">{other.species} · {other.sex} · Porte {other.size}</div>
                    <span className="animal-portrait-link">
                      Conhecer {other.name} <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={`Tenho interesse em adotar ${animal.name}`}
        size="lg"
      >
        {slug && <AdoptionForm animalSlug={slug} onSuccess={() => setShowForm(false)} />}
      </Modal>
    </div>
  );
}

export type { AnimalData };
