import { Link } from 'react-router-dom';
import { RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ServerErrorPage() {
  return (
    <div className="error-page">
      <div className="error-code">500</div>
      <h1 className="error-title">Erro interno do servidor</h1>
      <p className="error-description">
        Algo deu errado. Tente novamente em alguns instantes.
      </p>
      <div className="final-cta-actions">
        <Button onClick={() => window.location.reload()}>
          <RotateCcw size={18} aria-hidden="true" />
          Tentar novamente
        </Button>
        <Link to="/">
          <Button variant="outline">
            <Home size={18} aria-hidden="true" />
            Ir para o início
          </Button>
        </Link>
      </div>
    </div>
  );
}
