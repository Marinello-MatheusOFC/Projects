import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, KeyRound } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { DEMO_USERS, isDemoConfigured } from '@/lib/auth-demo';

export default function UserLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile, loading: authLoading, isAuthenticated, signIn, signInDemo, signInWithGoogle } = useAuth();
  const demoAvailable = isDemoConfigured();

  useEffect(() => {
    if (!authLoading && isAuthenticated && profile) {
      if (profile.role === 'admin' || profile.role === 'superadmin') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/minha-conta', { replace: true });
      }
    }
  }, [authLoading, isAuthenticated, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        navigate('/minha-conta', { replace: true });
        return;
      }

      if (demoAvailable) {
        const demoResult = await signInDemo(email, password);
        if (demoResult.success) {
          navigate('/minha-conta', { replace: true });
          return;
        }
        setError(demoResult.error ?? 'E-mail ou senha inválidos.');
        return;
      }

      setError(result.error ?? 'E-mail ou senha inválidos.');
    } catch {
      if (demoAvailable) {
        const demoResult = await signInDemo(email, password);
        if (demoResult.success) {
          navigate('/minha-conta', { replace: true });
          return;
        }
        setError(demoResult.error ?? 'E-mail ou senha inválidos.');
        return;
      }
      setError('Não foi possível entrar. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await signInWithGoogle();
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch {
      setError('Não foi possível entrar com Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demo: { email: string; password: string }) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const demoUsers = DEMO_USERS.filter((u) => u.role === 'user');

  return (
    <div className="auth-page">
      <div className="auth-card-wrap">
        <div className="auth-card">
          <div className="auth-logo-row">
            <Logo size="md" />
          </div>

          <h1 className="auth-title">Entrar na sua conta</h1>
          <p className="auth-subtitle">
            Acesse sua conta para acompanhar suas candidaturas.
          </p>

          {demoAvailable && demoUsers.length > 0 && (
            <Alert
              type="info"
              title="Modo Demonstração"
              message={
                <>
                  Use a conta abaixo para testar sem conexão com o banco.
                  <div className="demo-credential-list" role="list">
                    {demoUsers.map((u) => (
                      <button
                        key={u.email}
                        type="button"
                        className="demo-credential-chip"
                        onClick={() => fillCredentials({ email: u.email, password: u.password })}
                        role="listitem"
                      >
                        <KeyRound size={14} aria-hidden="true" />
                        <span className="demo-credential-text">
                          <strong>Usuário Demo</strong>
                          <span className="demo-credential-login">{u.email}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              }
            />
          )}

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              autoFocus
            />
            <div className="auth-password-wrap">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Sua senha"
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            </div>
            <Button type="submit" loading={loading} fullWidth size="lg">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <div className="auth-divider">
            <span>ou</span>
          </div>

          <Button
            type="button"
            variant="outline"
            fullWidth
            size="lg"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="auth-google-btn"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continuar com Google
          </Button>

          <div className="auth-footer">
            <p>
              Não tem uma conta?{' '}
              <Link to="/cadastrar">Cadastre-se</Link>
            </p>
          </div>

          <Link to="/" className="auth-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
