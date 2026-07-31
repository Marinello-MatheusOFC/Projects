import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function ServerErrorPage() {
  return (
    <div className="error-page">
      <div className="error-code">500</div>
      <h1 className="error-title">Erro interno do servidor</h1>
      <p className="error-description">
        Não foi possível processar sua solicitação. Tente novamente mais tarde.
      </p>
      <div className="final-cta-actions">
        <Link to="/">
          <Button>
            Voltar para o início
          </Button>
        </Link>
        <Link to="/contato">
          <Button variant="outline">
            Fale conosco
          </Button>
        </Link>
      </div>
    </div>
  );
}
