import { Link } from 'react-router-dom';

export default function ForbiddenPage() {
  return (
    <div className="error-page">
      <div className="container">
        <div className="error-code" aria-hidden="true">
          403
        </div>
        <h1 className="error-title">Acesso não autorizado</h1>
        <p className="error-description">
          Você não tem permissão para acessar esta página.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn btn--primary">
            Voltar para o início
          </Link>
          <Link to="/adocao" className="btn btn--outline">
            Conhecer os animais
          </Link>
        </div>
      </div>
    </div>
  );
}
