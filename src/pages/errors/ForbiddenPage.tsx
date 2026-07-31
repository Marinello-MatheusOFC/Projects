import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function ForbiddenPage() {
  return (
    <div className="error-page">
      <div className="error-code">403</div>
      <h1 className="error-title">Acesso não autorizado</h1>
      <p className="error-description">
        Você não tem permissão para acessar esta página.
      </p>
      <div className="final-cta-actions">
        <Link to="/">
          <Button>
            Voltar para o início
          </Button>
        </Link>
        <Link to="/adocao">
          <Button variant="outline">
            Conhecer os animais
          </Button>
        </Link>
      </div>
    </div>
  );
}
