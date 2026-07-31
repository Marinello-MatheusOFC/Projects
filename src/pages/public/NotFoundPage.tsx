import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="error-page">
      <div className="error-code">404</div>
      <h1 className="error-title">Esse caminho não levou a nenhum focinho por aqui.</h1>
      <p className="error-description">
        A página que você procura não existe ou foi movida.
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
