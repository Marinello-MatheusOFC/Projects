import { EmptyState } from '@/components/feedback/EmptyState';

export default function NewsPage() {
  return (
    <div className="news-page">
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Notícias</h1>
          <p className="page-hero-subtitle">
            Acompanhe as novidades da SOS Focinho Carente.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <EmptyState
            title="Nenhuma notícia publicada"
            description="Em breve publicaremos novidades."
          />
        </div>
      </section>
    </div>
  );
}
