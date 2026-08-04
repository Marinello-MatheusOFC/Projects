import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, FileText, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/feedback/Alert';
import { EmptyState } from '@/components/feedback/EmptyState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fetchUserAdoptionApplications, type UserAdoptionApplication } from '@/services/user-applications';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  new: { label: 'Enviada', color: 'var(--color-info)', icon: <Clock size={16} /> },
  under_review: { label: 'Em análise', color: 'var(--color-warning)', icon: <AlertCircle size={16} /> },
  contacted: { label: 'Contato', color: 'var(--color-info)', icon: <Clock size={16} /> },
  interview: { label: 'Entrevista', color: 'var(--color-primary)', icon: <Clock size={16} /> },
  approved: { label: 'Aprovada', color: 'var(--color-success)', icon: <CheckCircle size={16} /> },
  rejected: { label: 'Não aprovada', color: 'var(--color-error)', icon: <XCircle size={16} /> },
  cancelled: { label: 'Cancelada', color: 'var(--color-text-tertiary)', icon: <XCircle size={16} /> },
  completed: { label: 'Concluída', color: 'var(--color-success)', icon: <CheckCircle size={16} /> },
};

const defaultStatus = { label: 'Enviada', color: 'var(--color-info)', icon: <Clock size={16} /> };

function getStatusStyle(status: string) {
  return statusConfig[status] ?? defaultStatus;
}

export default function UserDashboardPage() {
  const { user, profile, signOut, loading: authLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<UserAdoptionApplication[] | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/entrar', { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (!user) return;

    let active = true;
    setLoading(true);

    fetchUserAdoptionApplications(user.id)
      .then((data) => {
        if (active) {
          setApplications(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError('Não foi possível carregar suas candidaturas.');
          setLoading(false);
        }
      });

    return () => { active = false; };
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  if (authLoading || !profile) {
    return (
      <div className="page-loading" role="status" aria-label="Carregando...">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        tone="green"
        eyebrow="Minha Conta"
        title={`Olá, ${profile.full_name}`}
        subtitle="Acompanhe suas candidaturas de adoção e gerencie seus dados."
      />

      <section className="section">
        <div className="container">
          <div className="user-dashboard">
            <div className="user-dashboard-sidebar">
              <div className="user-profile-card">
                <div className="user-profile-avatar">
                  <User size={32} aria-hidden="true" />
                </div>
                <h2 className="user-profile-name">{profile.full_name}</h2>
                <p className="user-profile-email">{user?.email}</p>
                <p className="user-profile-role">Conta pessoal</p>
              </div>

              <Button
                variant="outline"
                fullWidth
                onClick={handleSignOut}
                className="user-signout-btn"
              >
                <LogOut size={16} aria-hidden="true" />
                Sair da conta
              </Button>
            </div>

            <div className="user-dashboard-main">
              <div className="user-section-header">
                <h2 className="user-section-title">
                  <FileText size={20} aria-hidden="true" />
                  Minhas candidaturas
                </h2>
                <Link to="/adocao">
                  <Button variant="primary" size="sm">
                    Nova candidatura
                  </Button>
                </Link>
              </div>

              {error && <Alert type="error" message={error} onClose={() => setError('')} />}

              {loading ? (
                <div className="user-applications-loading">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="user-application-skeleton" />
                  ))}
                </div>
              ) : applications && applications.length > 0 ? (
                <div className="user-applications-list">
                  {applications.map((app) => {
                    const statusStyle = getStatusStyle(app.status);
                    return (
                      <div key={app.id} className="user-application-card">
                        <div className="user-application-info">
                          <h3 className="user-application-animal">
                            {app.animal_name ?? 'Animal'}
                          </h3>
                          <p className="user-application-date">
                            Enviada em {new Date(app.created_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        <div
                          className="user-application-status"
                          style={{ color: statusStyle.color }}
                        >
                          {statusStyle.icon}
                          <span>{statusStyle.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="Nenhuma candidatura ainda"
                  description="Quando você se candidatar para adotar um animal, suas candidaturas aparecerão aqui."
                  action={
                    <Link to="/adocao">
                      <Button variant="primary">Conhecer animais</Button>
                    </Link>
                  }
                />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
