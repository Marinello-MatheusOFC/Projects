import { Link } from 'react-router-dom';

export default function NotFoundErrorPage() {
  return (
    <div className="error-page">
      <div className="container">
        <div className="error-code" aria-hidden="true">
          404
        </div>
        <h1 className="error-title">Esse caminho não levou a nenhum focinho por aqui.</h1>
        <p className="error-description">
          A página que você procura não existe ou foi movida.
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
