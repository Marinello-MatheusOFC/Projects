import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function ProductDetailPage() {
  useParams<{ slug: string }>();

  return (
    <div className="product-detail-page">
      <section className="section">
        <div className="container">
          <Link to="/brecho" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para o brechó
          </Link>
          <div className="product-detail-empty">
            <h1>Produto não encontrado</h1>
            <p>O produto que você procura não está disponível.</p>
            <Link to="/brecho">Ver todos os produtos</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
