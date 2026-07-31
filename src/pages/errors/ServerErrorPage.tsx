import { Link } from 'react-router-dom';

export default function ServerErrorPage() {
  return (
    <div className="error-page">
      <div className="container">
        <div className="error-code" aria-hidden="true">
          500
        </div>
        <h1 className="error-title">Erro interno do servidor</h1>
        <p className="error-description">
          Não foi possível processar sua solicitação. Tente novamente mais tarde.
        </p>
        <div className="error-actions">
          <Link to="/" className="btn btn--primary">
            Voltar para o início
          </Link>
          <Link to="/contato" className="btn btn--outline">
            Fale conosco
          </Link>
        </div>
      </div>
    </div>
  );
}
