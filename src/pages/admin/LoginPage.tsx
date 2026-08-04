import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Lock, Eye, EyeOff, RefreshCw, KeyRound, AlertTriangle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { Logo } from '@/components/ui/Logo';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Profile } from '@/types';
import { DEMO_USERS, isDemoConfigured } from '@/lib/auth-demo';

interface LoginLocationState {
  from?: { pathname: string };
  reason?: 'no-access' | 'expired' | 'inactive';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedDemoFallback, setUsedDemoFallback] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { profile, loading: authLoading, isAdmin, signInDemo } = useAuth();
  const state = (location.state ?? {}) as LoginLocationState;
  const from = state.from?.pathname?.startsWith('/admin') ? state.from.pathname : '/admin';

  const demoAvailable = useMemo(() => isDemoConfigured(), []);
  const expiredQuery = searchParams.get('expired') === '1';

  useEffect(() => {
    if (!authLoading && profile && isAdmin) {
      navigate(from, { replace: true });
    }
  }, [authLoading, profile, isAdmin, navigate, from]);

  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise.then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        },
      );
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice(null);
    setLoading(true);
    setUsedDemoFallback(false);

    let authenticated = false;

    try {
      const timeoutMs = demoAvailable ? 3000 : 15000;
      const { data, error: signInError } = await withTimeout(
        supabase.auth.signInWithPassword({
          email,
          password,
        }),
        timeoutMs,
      );

      if (!signInError && data.user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        const profileResult = profileData as Profile | null;

        if (
          !profileResult ||
          !profileResult.active ||
          (profileResult.role !== 'admin' && profileResult.role !== 'superadmin')
        ) {
          await supabase.auth.signOut();
          setError('Este usuário não tem permissão para acessar o painel administrativo.');
          setLoading(false);
          return;
        }

        authenticated = true;
        navigate(from, { replace: true });
        return;
      }

      if (signInError && !demoAvailable) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }
    } catch {
      if (!demoAvailable) {
        setError('Não foi possível entrar. Verifique sua conexão e tente novamente.');
        setLoading(false);
        return;
      }
    }

    if (!authenticated && demoAvailable) {
      setUsedDemoFallback(true);
      const result = await signInDemo(email, password);
      if (result.success) {
        navigate(from, { replace: true });
        return;
      }
      setError(result.error ?? 'E-mail ou senha inválidos.');
      setLoading(false);
      return;
    }

    if (!authenticated) {
      setError('Não foi possível entrar. Verifique sua conexão e tente novamente.');
      setLoading(false);
    }
  };

  const handleReload = () => {
    setError('');
    setNotice(null);
    setUsedDemoFallback(false);
    setEmail('');
    setPassword('');
    window.location.reload();
  };

  const fillCredentials = (demo: { email: string; password: string }) => {
    setEmail(demo.email);
    setPassword(demo.password);
  };

  const showExpired = expiredQuery || state.reason === 'expired';

  return (
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <div className="admin-login-brand-logo">
            <Logo size="md" />
          </div>
          <h2>Painel administrativo</h2>
          <p>
            Gerencie adoções, eventos, notícias, brechó, mensagens e voluntários com
            segurança e organização.
          </p>
          <div className="admin-login-photo" aria-hidden="true">
            <img
              src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=900&q=80"
              alt="Cachorro domesticado olhando para a câmera"
              loading="lazy"
            />
          </div>
          <span className="admin-login-brand-badge">
            <Lock size={14} aria-hidden="true" />
            Área restrita para a equipe
          </span>
        </div>
      </div>

      <div className="admin-login-card-wrap">
        <div className="admin-login-card">
          <div className="admin-login-logo-row">
            <Logo size="md" />
          </div>

          <h1 className="admin-login-title">Acessar o painel</h1>
          <p className="admin-login-subtitle">Entre com suas credenciais para continuar.</p>

          {demoAvailable && (
            <Alert
              type="info"
              title="Modo Demonstração disponível"
              message={
                <>
                  Use as contas abaixo para testar o painel sem conexão com o banco. Suas alterações
                  serão locais.
                  <div className="demo-credential-list" role="list">
                    {DEMO_USERS.map((u) => (
                      <button
                        key={u.email}
                        type="button"
                        className="demo-credential-chip"
                        onClick={() => fillCredentials({ email: u.email, password: u.password })}
                        role="listitem"
                      >
                        <KeyRound size={14} aria-hidden="true" />
                        <span className="demo-credential-text">
                          <strong>
                            {u.role === 'superadmin' ? 'Superadmin' : 'Admin'} Demo
                          </strong>
                          <span className="demo-credential-login">{u.email}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              }
            />
          )}

          {usedDemoFallback && (
            <Alert
              type="warning"
              icon={<AlertTriangle size={16} aria-hidden="true" />}
              message="Banco indisponível. Usando sessão de demonstração local."
            />
          )}

          {notice && <Alert type="info" message={notice} onClose={() => setNotice(null)} />}

          {state.reason === 'inactive' && (
            <Alert
              type="warning"
              message="Seu acesso está desativado. Fale com o superadministrador."
            />
          )}
          {showExpired && (
            <Alert type="info" message="Sua sessão expirou. Entre novamente para continuar." />
          )}

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="seu@email.com"
              autoFocus
              aria-describedby="email-hint"
            />
            <div className="admin-login-password-wrap">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="Sua senha"
                aria-describedby="password-hint"
              />
              <button
                type="button"
                className="admin-login-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                aria-pressed={showPassword}
              >
                {showPassword ? (
                  <EyeOff size={18} aria-hidden="true" />
                ) : (
                  <Eye size={18} aria-hidden="true" />
                )}
              </button>
            </div>
            <Button type="submit" loading={loading} fullWidth size="lg">
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReload}
              disabled={loading}
              className="admin-login-reload"
            >
              <RefreshCw size={16} aria-hidden="true" />
              Recarregar
            </Button>
          </form>

          <Link to="/" className="admin-login-back">
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar para o site
          </Link>
        </div>
      </div>
    </div>
  );
}
