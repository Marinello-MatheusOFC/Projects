import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/useAuth';

export default function AdminForbiddenPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="admin-layout">
      <div className="admin-main">
        <main id="admin-content" className="admin-content">
          <div className="admin-error-wrap">
            <div className="admin-error-card">
              <div className="admin-error-code" aria-hidden="true">
                403
              </div>
              <h1>Acesso não autorizado</h1>
              <p>
                {profile
                  ? 'Seu perfil não tem permissão para acessar este módulo.'
                  : 'Você precisa entrar para acessar esta área.'}
              </p>
              <div className="admin-error-actions">
                <Button variant="primary" onClick={() => navigate('/admin', { replace: true })}>
                  <Home size={18} aria-hidden="true" style={{ marginRight: '0.375rem' }} />
                  Ir para o painel
                </Button>
                <Button variant="ghost" onClick={() => navigate(-1)}>
                  <ArrowLeft size={18} aria-hidden="true" style={{ marginRight: '0.375rem' }} />
                  Voltar
                </Button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
