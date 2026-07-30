import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

const featuredAnimals = [
  { name: 'Luna', species: 'Cachorro', sex: 'Fêmea', size: 'Médio', slug: 'luna' },
  { name: 'Toddy', species: 'Cachorro', sex: 'Macho', size: 'Pequeno', slug: 'toddy' },
  { name: 'Mel', species: 'Gato', sex: 'Fêmea', size: 'Pequeno', slug: 'mel' },
];

const waysToHelp = [
  { icon: '🏠', title: 'Adoção Responsável', desc: 'Abra seu lar para um novo amigo. Cada adoção muda duas vidas.', link: '/adocao', label: 'Conhecer animais' },
  { icon: '🛏️', title: 'Lar Temporário', desc: 'Ofereça um abrigo temporário até a adoção definitiva.', link: '/como-ajudar', label: 'Saiba mais' },
  { icon: '🤝', title: 'Voluntariado', desc: 'Doe tempo e talento para transformar vidas.', link: '/voluntariado', label: 'Seja voluntário' },
  { icon: '💰', title: 'Doação Financeira', desc: 'Contribua com qualquer valor para manter nossos projetos.', link: '/como-ajudar', label: 'Como doar' },
  { icon: '📢', title: 'Divulgação', desc: 'Compartilhe nossos animais e campanhas. A divulgação salva vidas.', link: '/como-ajudar', label: 'Ajudar divulgando' },
  { icon: '🎉', title: 'Participar de Eventos', desc: 'Participe dos nossos eventos e campanhas beneficentes.', link: '/eventos', label: 'Ver eventos' },
];

const galleryImages = [
  { id: 1, caption: 'Momento de cuidado' },
  { id: 2, caption: 'Voluntários em ação' },
  { id: 3, caption: 'Animal em acolhimento' },
  { id: 4, caption: 'Campanha de adoção' },
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
            src="/placeholder-hero.jpg"
            alt="Animal adulto olhando para a câmera com expressão tranquila"
            objectFit="cover"
            objectPosition="center 30%"
            priority
            width={1920}
            height={1080}
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
          ANIMAIS EM DESTAQUE — grid editorial
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

          <div className="featured-animals">
            {featuredAnimals.map((animal, index) => (
              <Link
                key={animal.slug}
                to={`/adocao/${animal.slug}`}
                className="animal-card"
                aria-label={`Conhecer ${animal.name}`}
              >
                <ResponsivePicture
                  src="/placeholder-animal.jpg"
                  alt={`${animal.name}, ${animal.species} de porte ${animal.size}`}
                  objectFit="cover"
                  objectPosition={index === 0 ? 'center 40%' : index === 1 ? 'center 30%' : 'center 50%'}
                  width={800}
                  height={600}
                />
                <div className="animal-card-overlay" />
                <div className="animal-card-info">
                  <div className="animal-card-name">{animal.name}</div>
                  <div className="animal-card-meta">
                    {animal.species} · {animal.sex} · Porte {animal.size}
                  </div>
                  <span className="animal-card-link">
                    Conhecer {animal.name} <ArrowRight size={14} aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HISTÓRIA INDIVIDUAL — editorial
          ═══════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="animal-story">
            <div className="animal-story-image">
              <ResponsivePicture
                src="/placeholder-story.jpg"
                alt="Animal em momento de acolhimento"
                objectFit="cover"
                objectPosition="center 50%"
                width={800}
                height={600}
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
          QUEM CUIDA
          ═══════════════════════════════════════ */}
      <section className="section">
        <div className="container">
          <div className="animal-story" style={{ direction: 'rtl' }} dir="ltr">
            <div className="animal-story-image" style={{ direction: 'ltr' }}>
              <ResponsivePicture
                src="/placeholder-about.jpg"
                alt="Voluntários em atividade de cuidado com animais"
                objectFit="cover"
                objectPosition="center 50%"
                width={800}
                height={600}
              />
            </div>
            <div className="animal-story-body" style={{ direction: 'ltr' }}>
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
          FORMAS DE AJUDAR — mural diverso
          ═══════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <h2>Formas reais de ajudar</h2>
            <p>
              Existem muitos caminhos para fazer a diferença. Cada gesto importa.
            </p>
          </div>

          <div className="ways-grid">
            {waysToHelp.map((item, i) => (
              <div key={i} className="way-item">
                <span className="way-item-icon" aria-hidden="true">{item.icon}</span>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <Link to={item.link}>{item.label} <ArrowRight size={14} aria-hidden="true" /></Link>
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
                src="/placeholder-process.jpg"
                alt="Animal sendo acolhido"
                objectFit="cover"
                objectPosition="center 50%"
                width={800}
                height={600}
              />
            </div>
            <div>
              <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-4)' }}>
                Como a adoção acontece
              </h2>
              <div className="journey-steps">
                {[
                  { num: 1, title: 'Conheça o animal', desc: 'Explore os perfis e encontre quem combina com você.' },
                  { num: 2, title: 'Demonstre interesse', desc: 'Preencha o formulário com suas informações.' },
                  { num: 3, title: 'Conversa com a ONG', desc: 'A equipe entra em contato para conhecer você melhor.' },
                  { num: 4, title: 'Acompanhamento', desc: 'Mesmo após a adoção, continuamos por perto.' },
                ].map((step) => (
                  <div key={step.num} className="journey-step">
                    <div className="journey-step-num">{step.num}</div>
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
          MOMENTOS DA ONG — mosaico
          ═══════════════════════════════════════ */}
      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <h2>Momentos da ONG</h2>
            <p>Registros de cuidado, encontros e comunidade.</p>
          </div>

          <div className="gallery-mosaic">
            {galleryImages.map((img) => (
              <div key={img.id} className="mosaic-item">
                <ResponsivePicture
                  src="/placeholder-gallery.jpg"
                  alt={img.caption}
                  objectFit="cover"
                  objectPosition="center 50%"
                  width={600}
                  height={600}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          CHAMADA FINAL
          ═══════════════════════════════════════ */}
      <section className="final-cta-section section">
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
              <Button variant="outline" size="lg">
                Ajudar a SOS Focinho Carente
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
