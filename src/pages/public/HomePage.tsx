import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { CallToAction } from '@/components/layout/CallToAction';
import { fetchFeaturedAnimals, type AnimalWithImages } from '@/services/animals';
import { fetchUpcomingEvents, type EventWithImage } from '@/services/events';
import { animalCardMeta, animalCollectionLabel, speciesLabel, sizeLabel, formatShortDate } from '@/lib/format';

const galleryMoments = [
  { src: '/images/demo/animal-paw.jpg', caption: 'Momento de cuidado' },
  { src: '/images/demo/care-volunteer.jpg', caption: 'Voluntários em ação' },
  { src: '/images/demo/adoption-event.jpg', caption: 'Campanha de adoção' },
  { src: '/images/demo/shelter-space.jpg', caption: 'Espaço de acolhimento' },
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

export default function HomePage() {
  const [animals, setAnimals] = useState<AnimalWithImages[] | null>(null);
  const [events, setEvents] = useState<EventWithImage[] | null>(null);

  useEffect(() => {
    let active = true;
    fetchFeaturedAnimals(3).then((result) => {
      if (active) setAnimals(result);
    });
    fetchUpcomingEvents().then((result) => {
      if (active) setEvents(result.slice(0, 3));
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <section className="home-hero">
        <div className="home-hero__inner">
          <div className="home-hero__content">
            <span className="home-hero__eyebrow">SOS Focinho Carente</span>
            <h1 className="home-hero__title">
              Todo focinho merece a chance de encontrar um lar.
            </h1>
            <p className="home-hero__text">
              Conheça animais que esperam por cuidado, segurança e a oportunidade
              de começar uma nova história.
            </p>
            <div className="home-hero__actions">
              <Link to="/adocao">
                <Button size="lg">Conhecer os animais</Button>
              </Link>
              <Link to="/como-ajudar">
                <Button variant="outline" size="lg">
                  Como posso ajudar?
                </Button>
              </Link>
            </div>
          </div>
          <div className="home-hero__media">
            <ResponsivePicture
              src="/images/demo/hero-dog.jpg"
              alt="Animal adulto olhando para a câmera com expressão tranquila"
              objectFit="cover"
              objectPosition="center 40%"
              priority
              width={960}
              height={720}
              fallback="hero"
            />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Encontre um novo amigo</h2>
            <p>
              Cada um deles tem nome, história e personalidade. Conheça quem está
              esperando por você.
            </p>
          </div>

          {!animals ? (
            <div className="editorial-grid" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <div key={i} className="skeleton animal-portrait" style={{ aspectRatio: '4 / 3' }} />
              ))}
            </div>
          ) : (
            <div className="editorial-grid">
              {animals.map((animal) => (
                <Link
                  key={animal.slug}
                  to={`/adocao/${animal.slug}`}
                  className="animal-portrait"
                  aria-label={`Conhecer ${animal.name}, ${animalCollectionLabel(animal.species)}`}
                >
                  <ResponsivePicture
                    src={animal.cover}
                    alt={`${animal.name}, ${speciesLabel(animal.species)} de porte ${sizeLabel(animal.size)}`}
                    objectFit="cover"
                    width={800}
                    height={600}
                    fallback={animal.species === 'cat' ? 'cat' : 'animal'}
                  />
                  <div className="animal-portrait-overlay" />
                  <div className="animal-portrait-info">
                    <div className="animal-portrait-name">{animal.name}</div>
                    <div className="animal-portrait-meta">{animalCardMeta(animal)}</div>
                    <span className="animal-portrait-link">
                      Conhecer {animal.name} <ArrowRight size={14} aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="animal-story">
            <div className="animal-story-image">
              <ResponsivePicture
                src="/images/demo/animal-dog-02.jpg"
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
              <h2 className="section-title">Como a adoção acontece</h2>
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

      {events && events.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-intro">
              <h2>Próximos eventos</h2>
              <p>Campanhas, feiras de adoção e encontros da comunidade.</p>
            </div>

            <div className="events-list">
              {events.map((event) => (
                <Link to={`/eventos/${event.slug}`} key={event.slug} className="event-card">
                  <div className="event-card-image">
                    <ResponsivePicture
                      src={event.image}
                      alt={event.title}
                      objectFit="cover"
                      width={640}
                      height={400}
                      fallback="event"
                    />
                    <span className="event-card-status event-card-status--upcoming">Em breve</span>
                  </div>
                  <div className="event-card-body">
                    <div className="event-card-meta">
                      <span className="event-card-date">
                        <Calendar size={13} aria-hidden="true" /> {formatShortDate(event.start_at)}
                      </span>
                      {event.location_name && (
                        <span className="event-card-location">
                          <MapPin size={13} aria-hidden="true" /> {event.location_name}
                        </span>
                      )}
                    </div>
                    <h3>{event.title}</h3>
                    {event.summary && <p>{event.summary}</p>}
                  </div>
                </Link>
              ))}
            </div>

            <div className="section-actions">
              <Link to="/eventos">
                <Button variant="outline">Ver todos os eventos</Button>
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Momentos da ONG</h2>
            <p>Registros de cuidado, encontros e comunidade.</p>
          </div>

          <div className="community-mosaic">
            {galleryMoments.map((img, i) => (
              <div key={i} className="mosaic-item">
                <ResponsivePicture
                  src={img.src}
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

      <CallToAction
        title="Talvez o próximo capítulo da história deles comece com você."
        description="Seja conhecendo, adotando, ajudando ou compartilhando — você pode fazer parte dessa transformação."
        actions={
          <>
            <Link to="/adocao">
              <Button size="lg">Conhecer os animais</Button>
            </Link>
            <Link to="/como-ajudar">
              <Button variant="outline" size="lg">
                Ajudar a SOS Focinho Carente
              </Button>
            </Link>
          </>
        }
      />
    </div>
  );
}
