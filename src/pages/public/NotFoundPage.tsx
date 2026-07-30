import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="error-page">
      <div className="error-code">404</div>
      <h1 className="error-title">Página não encontrada</h1>
      <p className="error-description">
        A página que você procura não existe ou foi movida.
      </p>
      <div className="final-cta-actions">
        <Link to="/">
          <Button>
            <Home size={18} aria-hidden="true" />
            Ir para o início
          </Button>
        </Link>
        <Link to="/adocao">
          <Button variant="outline">
            <ArrowLeft size={18} aria-hidden="true" />
            Ver animais disponíveis
          </Button>
        </Link>
      </div>
    </div>
  );
}
