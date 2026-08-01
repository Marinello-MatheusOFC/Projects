import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { NewsEmptyState } from '@/components/content/NewsEmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { fetchNews, type NewsWithImage } from '@/services/news';
import { formatDate } from '@/lib/format';

export default function NewsPage() {
  const [news, setNews] = useState<NewsWithImage[] | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    document.title = 'Notícias — SOS Focinho Carente';
  }, []);

  useEffect(() => {
    let active = true;
    setNews(null);
    setError(false);
    fetchNews()
      .then((result) => {
        if (active) setNews(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const featured = news ? news[0] : null;
  const rest = news ? news.slice(1) : [];

  return (
    <div>
      <PageHeader
        eyebrow="Blog da ONG"
        title="Notícias"
        subtitle="Acompanhe as novidades da SOS Focinho Carente."
        media={{
          src: '/images/demo/animal-cat-01.jpg',
          alt: 'Registro de um momento da ONG',
          objectPosition: 'center 50%',
          fallback: 'news',
        }}
      />

      <section className="section section--cream">
        <div className="container">
          {error ? (
            <ErrorState
              message="Não conseguimos carregar as notícias agora."
              onRetry={() => setAttempt((value) => value + 1)}
            />
          ) : news === null ? (
            <div className="news-list" aria-label="Carregando notícias">
              {Array.from({ length: 6 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </div>
          ) : news.length === 0 ? (
            <NewsEmptyState
              image="/images/demo/animal-cat-01.jpg"
              imageAlt="Registro de um momento da ONG"
            />
          ) : (
            featured && (
              <article className="featured-card">
                <div className="featured-card-image">
                  <ResponsivePicture
                    src={featured.image}
                    alt={featured.title}
                    objectFit="cover"
                    width={1200}
                    height={675}
                    fallback="news"
                  />
                </div>
                <div className="featured-card-body">
                  <span className="news-card-date">
                    <Calendar size={14} aria-hidden="true" style={{ verticalAlign: 'middle', marginRight: '0.25rem' }} />
                    {formatDate(featured.published_at)}
                  </span>
                  <h2>{featured.title}</h2>
                  {featured.excerpt && <p>{featured.excerpt}</p>}
                  <Link to={`/noticias/${featured.slug}`} className="news-card-link">
                    Ler notícia completa <ArrowRight size={16} aria-hidden="true" />
                  </Link>
                </div>
              </article>
            )
          )}
        </div>
      </section>

      {!error && news !== null && rest.length > 0 && (
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
                        fallback="news"
                      />
                    </div>
                  </Link>
                  <div className="news-card-body">
                    <span className="news-card-date">{formatDate(item.published_at)}</span>
                    <h3>
                      <Link to={`/noticias/${item.slug}`}>{item.title}</Link>
                    </h3>
                    {item.excerpt && <p>{item.excerpt}</p>}
                    <Link to={`/noticias/${item.slug}`} className="news-card-link">
                      Ler notícia completa <ArrowRight size={16} aria-hidden="true" />
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
