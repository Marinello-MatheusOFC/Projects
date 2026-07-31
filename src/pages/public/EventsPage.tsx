import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { fetchEvents, type EventWithImage } from '@/services/events';
import { formatShortDate } from '@/lib/format';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function eventLocation(event: EventWithImage): string {
  return event.location_name ?? event.address ?? '';
}

function eventStatus(event: EventWithImage): { label: string; mod: string } {
  if (event.isCancelled) return { label: 'Cancelado', mod: 'event-card-status--past' };
  if (event.isUpcoming) return { label: 'Em breve', mod: 'event-card-status--upcoming' };
  return { label: 'Encerrado', mod: 'event-card-status--past' };
}

function renderEventCard(event: EventWithImage) {
  const status = eventStatus(event);
  const location = eventLocation(event);
  return (
    <article key={event.slug} className="event-card">
      <span className={`event-card-status ${status.mod}`}>{status.label}</span>
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
            {formatShortDate(event.start_at)} · {formatTime(event.start_at)}
          </span>
          {location && (
            <span className="event-card-location">
              <MapPin size={14} aria-hidden="true" />
              {location}
            </span>
          )}
        </div>
        {event.summary && <p>{event.summary}</p>}
        <Link to={`/eventos/${event.slug}`} className="news-card-link">
          Ver detalhes <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventWithImage[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = 'Eventos — SOS Focinho Carente';
  }, []);

  useEffect(() => {
    let active = true;
    setEvents(null);
    setError(false);
    fetchEvents()
      .then((result) => {
        if (active) setEvents(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const upcoming = (events ?? [])
    .filter((event) => event.isUpcoming && !event.isCancelled)
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  const past = (events ?? [])
    .filter((event) => event.isPast || event.isCancelled)
    .sort((a, b) => new Date(b.start_at).getTime() - new Date(a.start_at).getTime());

  return (
    <div>
      <PageHeader
        eyebrow="Agenda"
        title="Eventos"
        subtitle="Participe das nossas campanhas e eventos beneficentes."
        media={{
          src: '/images/demo/adoption-event.jpg',
          alt: 'Evento de adoção da ONG',
          objectPosition: 'center 50%',
          fallback: 'event',
        }}
      />

      <section className="section">
        <div className="container">
          <div className="section-intro">
            <h2>Próximos eventos</h2>
            <p>Venha fazer parte. Sua presença faz toda a diferença para os animais.</p>
          </div>
          {error ? (
            <ErrorState
              message="Não conseguimos carregar os eventos agora."
              onRetry={() => setAttempt((value) => value + 1)}
            />
          ) : events === null ? (
            <div className="events-list" aria-label="Carregando eventos">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : upcoming.length > 0 ? (
            <div className="events-list">{upcoming.map(renderEventCard)}</div>
          ) : (
            <EmptyState
              title="Nenhum evento em breve"
              description="Em breve divulgaremos novas datas. Acompanhe nossas redes sociais."
            />
          )}
        </div>
      </section>

      {!error && events !== null && past.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-intro">
              <h2>Eventos anteriores</h2>
              <p>Relembre as edições passadas das nossas ações.</p>
            </div>
            <div className="events-list">{past.map(renderEventCard)}</div>
          </div>
        </section>
      )}
    </div>
  );
}
