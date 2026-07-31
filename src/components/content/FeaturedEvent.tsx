import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Clock, MapPin } from 'lucide-react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import type { EventWithImage } from '@/services/events';
import { formatMonthShort, formatDayNumber, formatTime } from '@/lib/format';

function eventLocation(event: EventWithImage): string {
  return event.location_name ?? event.address ?? '';
}

export function FeaturedEvent({ event }: { event: EventWithImage }) {
  const location = eventLocation(event);
  return (
    <article className="featured-event">
      <Link
        to={`/eventos/${event.slug}`}
        className="featured-event__media"
        tabIndex={-1}
        aria-hidden="true"
      >
        <ResponsivePicture
          src={event.image}
          alt={event.title}
          objectFit="cover"
          objectPosition="center 45%"
          width={960}
          height={640}
          priority
          fallback="event"
        />
      </Link>
      <div className="featured-event__panel">
        <div className="featured-event__date" aria-hidden="true">
          <span className="featured-event__day">{formatDayNumber(event.start_at)}</span>
          <span className="featured-event__month">{formatMonthShort(event.start_at)}</span>
        </div>
        <span className="featured-event__kicker">
          <Calendar size={14} aria-hidden="true" /> Próximo encontro
        </span>
        <h2>
          <Link to={`/eventos/${event.slug}`}>{event.title}</Link>
        </h2>
        {event.summary && <p>{event.summary}</p>}
        <div className="featured-event__meta">
          <span>
            <Clock size={14} aria-hidden="true" />
            {formatTime(event.start_at)}
          </span>
          {location && (
            <span>
              <MapPin size={14} aria-hidden="true" />
              {location}
            </span>
          )}
        </div>
        <Link to={`/eventos/${event.slug}`} className="featured-event__link">
          Ver detalhes do evento <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
