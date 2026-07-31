import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { eventsList } from '@/data/events';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
}

const statusLabels: Record<string, string> = {
  upcoming: 'Em breve',
  ongoing: 'Acontecendo',
  past: 'Encerrado',
};

export default function EventsPage() {
  const upcoming = eventsList.filter((e) => e.status !== 'past');
  const past = eventsList.filter((e) => e.status === 'past');

  const renderEvent = (event: (typeof eventsList)[number]) => (
    <article key={event.slug} className="event-card">
      <span className={`event-card-status event-card-status--${event.status}`}>
        {statusLabels[event.status]}
      </span>
      <Link to={`/eventos/${event.slug}`} className="event-card-image-link" tabIndex={-1}>
        <div className="event-card-image">
          <ResponsivePicture
            src={event.image}
            alt={event.title}
            objectFit="cover"
            width={800}
            height={500}
            fallback="event"
          />
        </div>
      </Link>
      <div className="event-card-body">
        <h3>
          <Link to={`/eventos/${event.slug}`}>{event.title}</Link>
        </h3>
        <div className="event-card-meta">
          <span className="event-card-date">
            <Calendar size={14} aria-hidden="true" />
            {formatDate(event.date)} · {event.time}
          </span>
          <span className="event-card-location">
            <MapPin size={14} aria-hidden="true" />
            {event.location}
          </span>
        </div>
        <p>{event.summary}</p>
        <Link to={`/eventos/${event.slug}`} className="news-card-link">
          Ver detalhes <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/community-event.jpg"
            alt="Evento da ONG"
            objectFit="cover"
            objectPosition="center 50%"
            priority
            width={1920}
            height={600}
            fallback="event"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <h1 className="page-hero-title">Eventos</h1>
          <p className="page-hero-subtitle">
            Participe das nossas campanhas e eventos beneficentes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Próximos eventos</h2>
            <p>Venha fazer parte. Sua presença faz toda a diferença para os animais.</p>
          </div>
          <div className="events-list">{upcoming.map(renderEvent)}</div>
        </div>
      </section>

      {past.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-intro">
              <h2>Eventos anteriores</h2>
              <p>Relembre as edições passadas das nossas ações.</p>
            </div>
            <div className="events-list">{past.map(renderEvent)}</div>
          </div>
        </section>
      )}
    </div>
  );
}
