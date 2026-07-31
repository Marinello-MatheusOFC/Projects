import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const animalImages = [
  '/images/demo/animal-dog-01.jpg',
  '/images/demo/animal-cat-01.jpg',
  '/images/demo/animal-dog-02.jpg',
];

const featuredAnimals = [
  { name: 'Luna', species: 'Cachorro', sex: 'Fêmea', size: 'Médio', slug: 'luna' },
  { name: 'Toddy', species: 'Cachorro', sex: 'Macho', size: 'Pequeno', slug: 'toddy' },
  { name: 'Mel', species: 'Gato', sex: 'Fêmea', size: 'Pequeno', slug: 'mel' },
];

const galleryImages = [
  '/images/demo/animal-paw.jpg',
  '/images/demo/volunteer-care.jpg',
  '/images/demo/adoption-event.jpg',
  '/images/demo/shelter-space.jpg',
];

const helpWays = [
  { title: 'Adoção Responsável', desc: 'Cada adoção muda duas vidas. Conheça quem espera por um lar.', link: '/adocao', label: 'Conhecer animais' },
  { title: 'Lar Temporário', desc: 'Ofereça abrigo temporário até a adoção definitiva.', link: '/como-ajudar', label: 'Entender como funciona' },
  { title: 'Voluntariado', desc: 'Doe tempo e cuidado. Há muitas formas de participar.', link: '/voluntariado', label: 'Ser voluntário' },
  { title: 'Doação Financeira', desc: 'Contribua com qualquer valor para manter o trabalho da ONG.', link: '/como-ajudar', label: 'Como doar' },
  { title: 'Divulgação', desc: 'Compartilhe perfis e campanhas. A divulgação também salva.', link: '/adocao', label: 'Ajudar divulgando' },
  { title: 'Eventos', desc: 'Participe de campanhas e encontros da comunidade.', link: '/eventos', label: 'Ver eventos' },
];

const journeySteps = [
  { title: 'Conheça o animal', desc: 'Explore os perfis e encontre quem combina com você.' },
  { title: 'Demonstre interesse', desc: 'Preencha o formulário com suas informações.' },
  { title: 'Conversa com a ONG', desc: 'A equipe entra em contato para conhecer você melhor.' },
  { title: 'Acompanhamento', desc: 'Mesmo após a adoção, continuamos por perto.' },
];

const galleryMoments = [
  { caption: 'Momento de cuidado' },
  { caption: 'Voluntários em ação' },
  { caption: 'Animal em acolhimento' },
  { caption: 'Campanha de adoção' },
];

export default function HomePage() {
  return (
    <div>

      {/* ═══════════════════════════════════════
          HERO — fotografia como protagonista
          ═══════════════════════════════════════ */}
      <section className="emotional-hero">
        <div className="emotional-hero-bg">
          <ResponsivePicture
            src="/images/demo/hero-dog.jpg"
            alt="Animal adulto olhando para a câmera com expressão tranquila"
            objectFit="cover"
            objectPosition="center 40%"
            priority
            width={1920}
            height={1080}
            fallback="hero"
          />
        </div>
        <div className="emotional-hero-overlay" />
        <div className="emotional-hero-content">
          <span className="eyebrow">SOS Focinho Carente</span>
          <h1>Todo focinho merece ser reconhecido como parte de uma família.</h1>
          <p>
            Conheça animais que esperam por cuidado, segurança e a oportunidade
            de começar uma nova história.
          </p>
          <div className="emotional-hero-actions">
            <Link to="/adocao">
              <Button size="lg">
                Conhecer os animais
              </Button>
            </Link>
            <Link to="/como-ajudar">
              <Button variant="outline" className="btn--outline-white" size="lg">
                Descobrir como ajudar
              </Button>
            </Link>
          </div>
        </div>
        <div className="emotional-hero-indicator" aria-hidden="true" />
      </section>

      {/* ═══════════════════════════════════════
          ENCONTRE UM NOVO AMIGO — grid editorial
          ═══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Encontre um novo amigo</h2>
            <p>
              Cada um deles tem nome, história e personalidade. Conheça quem está
              esperando por você.
            </p>
          </div>

          <div className="editorial-grid">
            {featuredAnimals.map((animal, index) => (
              <Link
                key={animal.slug}
                to={`/adocao/${animal.slug}`}
                className="animal-portrait"
                aria-label={`Conhecer ${animal.name}`}
              >
                <ResponsivePicture
                  src={animalImages[index]}
                  alt={`${animal.name}, ${animal.species} de porte ${animal.size}`}
                  objectFit="cover"
                  objectPosition={index === 0 ? 'center 40%' : index === 1 ? 'center 30%' : 'center 50%'}
                  width={800}
                  height={600}
                  fallback={animal.species === 'Gato' ? 'cat' : 'animal'}
                />
                <div className="animal-portrait-overlay" />
                <div className="animal-portrait-info">
                  <div className="animal-portrait-name">{animal.name}</div>
                  <div className="animal-portrait-meta">
                    {animal.species} · {animal.sex} · Porte {animal.size}
                  </div>
                  <span className="animal-portrait-link">
                    Conhecer {animal.name} <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CADA FOCINHO TEM UMA HISTÓRIA
          ═══════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="animal-story">
            <div className="animal-story-image">
              <ResponsivePicture
                src="/images/demo/care-volunteer.jpg"
                alt="Animal em momento de acolhimento"
                objectFit="cover"
                objectPosition="center 50%"
                width={800}
                height={600}
                fallback="story"
              />
            </div>
            <div className="animal-story-body">
              <h3>Cada focinho tem uma história</h3>
              <p>
                Cada animal que chega até nós carrega uma trajetória única.
                Conhecer essa história é o primeiro passo para construir uma
                nova etapa com respeito e cuidado.
              </p>
              <Link to="/adocao">
                <Button variant="outline">
                  Conhecer as histórias <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          QUEM CUIDA TAMBÉM FAZ PARTE DA HISTÓRIA
          ═══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="animal-story">
            <div className="animal-story-image">
              <ResponsivePicture
                src="/images/demo/community-event.jpg"
                alt="Voluntários em atividade de cuidado com animais"
                objectFit="cover"
                objectPosition="center 50%"
                width={800}
                height={600}
                fallback="care"
              />
            </div>
            <div className="animal-story-body">
              <h3>Quem cuida também faz parte da história</h3>
              <p>
                A SOS Focinho Carente existe por causa de pessoas que dedicam
                tempo, cuidado e respeito aos animais. Conheça nosso trabalho
                e como você pode fazer parte.
              </p>
              <Link to="/sobre">
                <Button variant="outline">
                  Conhecer a ONG <ArrowRight size={16} aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FORMAS REAIS DE AJUDAR
          ═══════════════════════════════════════ */}
      <section className="section section--warm">
        <div className="container">
          <div className="section-intro">
            <h2>Formas reais de ajudar</h2>
            <p>
              Existem muitos caminhos para fazer a diferença. Cada gesto importa.
            </p>
          </div>

          <div className="ways-mural">
            {helpWays.map((item, i) => (
              <div key={i} className="way-mural-item">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <Link to={item.link}>
                  {item.label} <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          COMO A ADOÇÃO ACONTECE
          ═══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="adoption-journey">
            <div className="adoption-journey-image">
              <ResponsivePicture
                src="/images/demo/animal-cat-02.jpg"
                alt="Animal sendo acolhido durante processo de adoção"
                objectFit="cover"
                objectPosition="center 50%"
                width={800}
                height={600}
                fallback="cat"
              />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
                Como a adoção acontece
              </h2>
              <div className="journey-steps">
                {journeySteps.map((step, i) => (
                  <div key={i} className="journey-step">
                    <div className="journey-step-num">{i + 1}</div>
                    <div className="journey-step-body">
                      <h4>{step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          MOMENTOS DA ONG
          ═══════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <h2>Momentos da ONG</h2>
            <p>Registros de cuidado, encontros e comunidade.</p>
          </div>

          <div className="community-mosaic">
            {galleryMoments.map((img, i) => (
              <div key={i} className="mosaic-item">
                <ResponsivePicture
                  src={galleryImages[i]}
                  alt={img.caption}
                  objectFit="cover"
                  objectPosition="center 50%"
                  width={600}
                  height={600}
                  fallback="gallery"
                />
                <div className="mosaic-caption">{img.caption}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CHAMADA FINAL
          ═══════════════════════════════════════ */}
      <section className="final-cta-section">
        <div className="final-cta-bg">
          <ResponsivePicture
            src="/images/demo/hero-dog.jpg"
            alt="Animal olhando para o horizonte"
            objectFit="cover"
            objectPosition="center 30%"
            width={1920}
            height={1080}
            priority
            fallback="hero"
          />
        </div>
        <div className="final-cta-overlay" />
        <div className="container">
          <h2>Talvez o próximo capítulo da história deles comece com você.</h2>
          <p>
            Seja conhecendo, adotando, ajudando ou compartilhando — você pode
            fazer parte dessa transformação.
          </p>
          <div className="final-cta-actions">
            <Link to="/adocao">
              <Button size="lg">
                Conhecer os animais
              </Button>
            </Link>
            <Link to="/como-ajudar">
              <Button variant="outline" className="btn--outline-white" size="lg">
                Ajudar a SOS Focinho Carente
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
