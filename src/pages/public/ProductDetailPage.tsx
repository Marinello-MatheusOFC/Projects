import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ProductDetailPage() {
  useParams<{ slug: string }>();

  return (
    <div>
      <section className="section">
        <div className="container">
          <Link to="/brecho" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para o brechó
          </Link>
          <div className="empty-state">
            <h1 className="empty-state-title">Produto não encontrado</h1>
            <p className="empty-state-description">O produto que você procura não está disponível.</p>
            <Link to="/brecho">
              <Button variant="outline">Ver todos os produtos</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
