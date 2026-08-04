import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchNews, fetchNewsBySlug, type NewsWithImage } from '@/services/news';
import { formatDate } from '@/lib/format';

export default function NewsDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsWithImage | null | undefined>(undefined);
  const [related, setRelated] = useState<NewsWithImage[]>([]);
  const [error, setError] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setPost(undefined);
    setError(false);
    fetchNewsBySlug(slug)
      .then((result) => {
        if (active) setPost(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    fetchNews()
      .then((result) => {
        if (active) setRelated(result.filter((item) => item.slug !== slug).slice(0, 3));
      })
      .catch(() => {
        if (active) setRelated([]);
      });
    return () => {
      active = false;
    };
  }, [slug, reloadKey]);

  useEffect(() => {
    document.title = post ? `${post.title} — SOS Focinho Carente` : 'Notícias — SOS Focinho Carente';
  }, [post]);

  if (error) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <ErrorState
              message="Não conseguimos carregar esta notícia agora."
              onRetry={() => setReloadKey((key) => key + 1)}
            />
          </div>
        </section>
      </div>
    );
  }

  if (post === undefined) {
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

  if (!post) {
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

  const paragraphs = (post.content ?? '').split('\n\n').filter(Boolean);
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <div>
      <PageHeader
        eyebrow="Notícias"
        title={post.title}
        subtitle={formatDate(post.published_at)}
        media={{
          src: post.image,
          alt: post.title,
          objectPosition: 'center 50%',
          fallback: 'news',
        }}
      />

      <section className="section section--cream">
        <div className="container" style={{ maxWidth: 780 }}>
          <Link to="/noticias" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para notícias
          </Link>

          <div className="news-detail-meta">
            <span><Calendar size={16} aria-hidden="true" /> {formatDate(post.published_at)}</span>
          </div>

          <div className="news-detail-content">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>{post.excerpt || 'Esta notícia ainda não possui conteúdo completo.'}</p>
            )}
          </div>

          <div className="news-detail-share">
            <span>Compartilhe essa história:</span>
            <div className="news-detail-share-links">
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--sm"
              >
                Facebook
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`${post.title} — ${shareUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--sm"
              >
                WhatsApp
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn--outline btn--sm"
              >
                X
              </a>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section section--alt">
          <div className="container">
            <div className="section-intro">
              <h2>Outras notícias</h2>
              <p>Continue acompanhando o trabalho da SOS Focinho Carente.</p>
            </div>
            <div className="news-list">
              {related.map((item) => (
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
                      Ler notícia completa
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
