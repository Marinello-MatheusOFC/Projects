import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar, User, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
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

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const item = newsList.find((n) => n.slug === slug);

  if (!item) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <Link to="/noticias" className="back-link">
              <ChevronLeft size={20} aria-hidden="true" />
              Voltar para notícias
            </Link>
            <div className="empty-state">
              <h1 className="empty-state-title">Notícia não encontrada</h1>
              <p className="empty-state-description">A notícia que você procura não está disponível.</p>
              <Link to="/noticias">
                <Button variant="outline">Ver todas as notícias</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const related = newsList.filter((n) => n.slug !== item.slug).slice(0, 3);

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
            fallback="gallery"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <p className="page-hero-subtitle" style={{ textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: 'var(--text-xs)', marginBottom: 'var(--space-2)' }}>
            {item.category}
          </p>
          <h1 className="page-hero-title">{item.title}</h1>
          <p className="page-hero-subtitle">{formatDate(item.date)} · por {item.author}</p>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 780 }}>
          <Link to="/noticias" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para notícias
          </Link>

          <div className="news-detail-meta">
            <span><Calendar size={16} aria-hidden="true" /> {formatDate(item.date)}</span>
            <span><User size={16} aria-hidden="true" /> {item.author}</span>
            <span><Tag size={16} aria-hidden="true" /> {item.category}</span>
          </div>

          <div className="news-detail-content">
            {item.content.split('\n\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </div>

          <div className="news-detail-share">
            <span>Compartilhe essa história:</span>
            <div className="news-detail-share-links">
              <a href="#" onClick={(e) => e.preventDefault()} className="btn btn--outline btn--sm">Facebook</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="btn btn--outline btn--sm">Instagram</a>
              <a href="#" onClick={(e) => e.preventDefault()} className="btn btn--outline btn--sm">X</a>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="section-intro">
            <h2>Outras notícias</h2>
            <p>Continue acompanhando o trabalho da SOS Focinho Carente.</p>
          </div>
          <div className="news-list">
            {related.map((n) => (
              <article key={n.slug} className="news-card">
                <Link to={`/noticias/${n.slug}`} className="news-card-image-link" tabIndex={-1}>
                  <div className="news-card-image">
                    <ResponsivePicture
                      src={n.image}
                      alt={n.title}
                      objectFit="cover"
                      width={800}
                      height={500}
                      fallback="gallery"
                    />
                  </div>
                </Link>
                <div className="news-card-body">
                  <span className="news-card-date">{formatDate(n.date)}</span>
                  <h3>
                    <Link to={`/noticias/${n.slug}`}>{n.title}</Link>
                  </h3>
                  <p>{n.summary}</p>
                  <Link to={`/noticias/${n.slug}`} className="news-card-link">
                    Ler notícia completa
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
