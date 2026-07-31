import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { newsList } from '@/data/news';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function formatDate(iso: string) {
  const date = new Date(`${iso}T12:00:00`);
  return `${date.getDate()} de ${monthNames[date.getMonth()]} de ${date.getFullYear()}`;
}

export default function NewsPage() {
  const featured = newsList[0];
  const rest = newsList.slice(1);

  if (!featured) {
    return null;
  }

  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/community-event.jpg"
            alt="Notícias da ONG"
            objectFit="cover"
            objectPosition="center 50%"
            priority
            width={1920}
            height={600}
            fallback="gallery"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <h1 className="page-hero-title">Notícias</h1>
          <p className="page-hero-subtitle">
            Acompanhe as novidades da SOS Focinho Carente.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <article className="featured-card">
            <div className="featured-card-image">
              <ResponsivePicture
                src={featured.image}
                alt={featured.title}
                objectFit="cover"
                width={1200}
                height={675}
                fallback="gallery"
              />
            </div>
            <div className="featured-card-body">
              <span className="news-card-date">
                <Calendar size={14} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                {formatDate(featured.date)}
              </span>
              <span className="news-card-category">{featured.category}</span>
              <h2>{featured.title}</h2>
              <p>{featured.summary}</p>
              <Link to={`/noticias/${featured.slug}`} className="news-card-link">
                Ler notícia completa <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <h2>Todas as notícias</h2>
            <p>Fique por dentro de tudo que acontece na nossa ONG.</p>
          </div>
          <div className="news-list">
            {rest.map((item) => (
              <article key={item.slug} className="news-card">
                <Link to={`/noticias/${item.slug}`} className="news-card-image-link" tabIndex={-1}>
                  <div className="news-card-image">
                    <ResponsivePicture
                      src={item.image}
                      alt={item.title}
                      objectFit="cover"
                      width={800}
                      height={500}
                      fallback="gallery"
                    />
                  </div>
                </Link>
                <div className="news-card-body">
                  <span className="news-card-date">{formatDate(item.date)}</span>
                  <span className="news-card-category">{item.category}</span>
                  <h3>
                    <Link to={`/noticias/${item.slug}`}>{item.title}</Link>
                  </h3>
                  <p>{item.summary}</p>
                  <Link to={`/noticias/${item.slug}`} className="news-card-link">
                    Ler notícia completa <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
