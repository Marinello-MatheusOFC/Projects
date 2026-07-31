import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, Clock, MapPin, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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
  upcoming: 'Inscrições abertas',
  ongoing: 'Acontecendo agora',
  past: 'Encerrado',
};

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = eventsList.find((e) => e.slug === slug);

  if (!item) {
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

  const other = eventsList.filter((e) => e.slug !== item.slug && e.status !== 'past').slice(0, 3);

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src={item.image}
            alt={item.title}
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
          <p className="page-hero-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
            {statusLabels[item.status]}
          </p>
          <h1 className="page-hero-title">{item.title}</h1>
          <p className="page-hero-subtitle">{formatDate(item.date)} · {item.location}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <Link to="/eventos" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para eventos
          </Link>

          <div className="event-detail-layout">
            <div className="event-detail-main">
              <div className="news-detail-meta">
                <span><Calendar size={16} aria-hidden="true" /> {formatDate(item.date)}</span>
                <span><Clock size={16} aria-hidden="true" /> {item.time}</span>
                <span><MapPin size={16} aria-hidden="true" /> {item.location}</span>
                <span><Tag size={16} aria-hidden="true" /> {item.category}</span>
              </div>

              <div className="news-detail-content">
                {item.content.split('\n\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            <aside className="event-detail-sidebar">
              <div className="detail-card detail-card--cta">
                <h3>Quero participar!</h3>
                <p>Garanta sua presença neste evento e ajude a transformar vidas.</p>
                {item.status !== 'past' ? (
                  <a href="#" onClick={(e) => e.preventDefault()} className="btn btn--primary btn--full">
                    Confirmar presença
                  </a>
                ) : (
                  <p>Este evento já foi encerrado. Acompanhe nossas redes para os próximos!</p>
                )}
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

      {other.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-intro">
              <h2>Outros eventos</h2>
              <p>Confira as próximas atividades da nossa agenda.</p>
            </div>
            <div className="events-list">
              {other.map((e) => (
                <article key={e.slug} className="event-card">
                  <span className={`event-card-status event-card-status--${e.status}`}>
                    {statusLabels[e.status]}
                  </span>
                  <Link to={`/eventos/${e.slug}`} className="event-card-image-link" tabIndex={-1}>
                    <div className="event-card-image">
                      <ResponsivePicture
                        src={e.image}
                        alt={e.title}
                        objectFit="cover"
                        width={800}
                        height={500}
                        fallback="event"
                      />
                    </div>
                  </Link>
                  <div className="event-card-body">
                    <h3>
                      <Link to={`/eventos/${e.slug}`}>{e.title}</Link>
                    </h3>
                    <div className="event-card-meta">
                      <span className="event-card-date">
                        <Calendar size={14} aria-hidden="true" />
                        {formatDate(e.date)} · {e.time}
                      </span>
                    </div>
                    <p>{e.summary}</p>
                    <Link to={`/eventos/${e.slug}`} className="news-card-link">
                      Ver detalhes <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
