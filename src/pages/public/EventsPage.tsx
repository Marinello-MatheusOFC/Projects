import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function EventsPage() {
  const loading = false;
  const error = false;

  if (error) {
    return (
      <div className="events-page">
        <section className="page-hero">
          <div className="container">
            <h1 className="page-hero-title">Eventos</h1>
          </div>
        </section>
        <section className="section">
          <div className="container">
            <ErrorState message="Não foi possível carregar os eventos." />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="events-page">
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Eventos</h1>
          <p className="page-hero-subtitle">
            Participe das nossas campanhas e eventos beneficentes.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {loading ? (
            <div className="events-grid">Carregando...</div>
          ) : (
            <EmptyState
              title="Nenhum evento publicado"
              description="Em breve divulgaremos nossos eventos."
            />
          )}
        </div>
      </section>
    </div>
  );
}
