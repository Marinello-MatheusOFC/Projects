import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchEventBySlug, fetchEvents, type EventWithImage } from '@/services/events';
import { formatDate, formatShortDate } from '@/lib/format';

function formatTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

function eventLocation(event: EventWithImage): string {
  return event.location_name ?? event.address ?? '';
}

function statusLabel(event: EventWithImage): string {
  if (event.isCancelled) return 'Cancelado';
  if (event.isUpcoming) return 'Em breve';
  return 'Encerrado';
}

function renderEventCard(event: EventWithImage) {
  const location = eventLocation(event);
  return (
    <article key={event.slug} className="event-card">
      <span className={`event-card-status ${event.isCancelled ? 'event-card-status--past' : event.isUpcoming ? 'event-card-status--upcoming' : 'event-card-status--past'}`}>
        {statusLabel(event)}
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

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [event, setEvent] = useState<EventWithImage | null | undefined>(undefined);
  const [others, setOthers] = useState<EventWithImage[]>([]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setEvent(undefined);
    fetchEventBySlug(slug).then((result) => {
      if (active) setEvent(result);
    });
    fetchEvents().then((result) => {
      if (active) {
        setOthers(
          result
            .filter((item) => item.slug !== slug && item.isUpcoming && !item.isCancelled)
            .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())
            .slice(0, 3),
        );
      }
    });
    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    document.title = event ? `${event.title} — SOS Focinho Carente` : 'Eventos — SOS Focinho Carente';
  }, [event]);

  if (event === undefined) {
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

  if (!event) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <Link to="/eventos" className="back-link">
              <ChevronLeft size={20} aria-hidden="true" />
              Voltar para eventos
            </Link>
            <div className="empty-state">
              <h1 className="empty-state-title">Evento não encontrado</h1>
              <p className="empty-state-description">O evento que você procura não está disponível.</p>
              <Link to="/eventos">
                <Button variant="outline">Ver todos os eventos</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const location = eventLocation(event);
  const paragraphs = (event.description ?? '').split('\n\n').filter(Boolean);
  const timeLabel = `${formatTime(event.start_at)}${event.end_at ? ` até ${formatTime(event.end_at)}` : ''}`;

  return (
    <div>
      <PageHeader
        eyebrow={statusLabel(event)}
        title={event.title}
        subtitle={`${formatDate(event.start_at)} · ${timeLabel}${location ? ` · ${location}` : ''}`}
        media={{
          src: event.image,
          alt: event.title,
          objectPosition: 'center 50%',
          fallback: 'event',
        }}
      />

      <section className="section section--cream">
        <div className="container">
          <Link to="/eventos" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para eventos
          </Link>

          <div className="event-detail-layout">
            <div className="event-detail-main">
              <div className="news-detail-meta">
                <span><Calendar size={16} aria-hidden="true" /> {formatDate(event.start_at)}</span>
                <span><Clock size={16} aria-hidden="true" /> {timeLabel}</span>
                {location && <span><MapPin size={16} aria-hidden="true" /> {location}</span>}
              </div>

              <div className="news-detail-content">
                {paragraphs.length > 0 ? (
                  paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))
                ) : (
                  <p>Em breve mais informações sobre este evento. Acompanhe nossas redes sociais!</p>
                )}
              </div>
            </div>

            <aside className="event-detail-sidebar">
              <div className="detail-card detail-card--cta">
                <h3>Quero participar!</h3>
                <p>Garanta sua presença neste evento e ajude a transformar vidas.</p>
                {event.isUpcoming ? (
                  event.external_url ? (
                    <a href={event.external_url} target="_blank" rel="noreferrer" className="btn btn--primary btn--full">
                      Confirmar presença <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ) : (
                    <Link to="/contato" className="btn btn--primary btn--full">
                      Garantir vaga <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  )
                ) : (
                  <p>
                    {event.isCancelled
                      ? 'Este evento foi cancelado.'
                      : 'Este evento já foi encerrado. Acompanhe nossas redes para os próximos!'}
                  </p>
                )}
              </div>
              <div className="detail-card">
                <h3>Informações do evento</h3>
                <dl className="detail-list">
                  <div className="detail-row">
                    <dt>Data</dt>
                    <dd>{formatDate(event.start_at)}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>Horário</dt>
                    <dd>{timeLabel}</dd>
                  </div>
                  {location && (
                    <div className="detail-row">
                      <dt>Local</dt>
                      <dd>{location}</dd>
                    </div>
                  )}
                  {event.address && (
                    <div className="detail-row">
                      <dt>Endereço</dt>
                      <dd>{event.address}</dd>
                    </div>
                  )}
                </dl>
              </div>
              <div className="detail-card">
                <h3>Sobre a ONG</h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: 'var(--leading-relaxed)' }}>
                  A SOS Focinho Carente resgata, trata e encaminha animais em situação de abandono para novos lares há mais de 10 anos.
                </p>
                <Link to="/sobre" className="news-card-link" style={{ marginTop: 'var(--space-3)' }}>
                  Conheça nossa história <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {others.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-intro">
              <h2>Outros eventos</h2>
              <p>Confira as próximas atividades da nossa agenda.</p>
            </div>
            <div className="events-list">{others.map(renderEventCard)}</div>
          </div>
        </section>
      )}
    </div>
  );
}
