import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function EventDetailPage() {
  useParams<{ slug: string }>();

  return (
    <div className="event-detail-page">
      <section className="section">
        <div className="container">
          <Link to="/eventos" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para eventos
          </Link>
          <div className="event-detail-empty">
            <h1>Evento não encontrado</h1>
            <p>O evento que você procura não está disponível.</p>
            <Link to="/eventos">Ver todos os eventos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
