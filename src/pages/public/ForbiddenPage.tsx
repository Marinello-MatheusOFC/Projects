import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="error-page">
      <div className="error-code">403</div>
      <h1 className="error-title">Acesso negado</h1>
      <p className="error-description">
        Você não tem permissão para acessar esta página.
      </p>
      <div className="final-cta-actions">
        <Link to="/">
          <Button>
            <Home size={18} aria-hidden="true" />
            Ir para o início
          </Button>
        </Link>
        <Link to="/contato">
          <Button variant="outline">
            <ArrowLeft size={18} aria-hidden="true" />
            Entrar em contato
          </Button>
        </Link>
      </div>
    </div>
  );
}
