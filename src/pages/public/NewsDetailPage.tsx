import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function NewsDetailPage() {
  useParams<{ slug: string }>();

  return (
    <div className="news-detail-page">
      <section className="section">
        <div className="container">
          <Link to="/noticias" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para notícias
          </Link>
          <div className="news-detail-empty">
            <h1>Notícia não encontrada</h1>
            <p>A notícia que você procura não está disponível.</p>
            <Link to="/noticias">Ver todas as notícias</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
