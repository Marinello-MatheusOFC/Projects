import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/feedback/Alert';
import { Logo } from '@/components/ui/Logo';
import type { Profile } from '@/types';

interface LoginLocationState {
  from?: { pathname: string };
  reason?: 'no-access' | 'expired' | 'inactive';
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as LoginLocationState;
  const from = state.from?.pathname?.startsWith('/admin') ? state.from.pathname : '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice(null);
    setLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError || !data.user) {
        setError('E-mail ou senha inválidos.');
        setLoading(false);
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const profile = profileData as Profile | null;

      if (
        !profile ||
        !profile.active ||
        (profile.role !== 'admin' && profile.role !== 'superadmin')
      ) {
        await supabase.auth.signOut();
        setError('Este usuário não tem permissão para acessar o painel administrativo.');
        setLoading(false);
        return;
      }

      navigate(from, { replace: true });
    } catch {
      setError('Não foi possível entrar. Verifique sua conexão e tente novamente.');
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-brand">
        <div className="admin-login-brand-inner">
          <div className="admin-login-brand-logo">
            <Logo size="md" showText={false} />
            <span>SOS Focinho Carente</span>
          </div>
          <h2>Cuide do que importa: a gestão que dá novo começo.</h2>
          <p>
            Centralize adoções, eventos, notícias, brechó, mensagens e voluntários em um só
            painel — com segurança e transparência.
          </p>
          <span className="admin-login-brand-badge">
            <Lock size={14} aria-hidden="true" />
            Área restrita para a equipe
          </span>
        </div>
      </div>

      <div className="admin-login-card-wrap">
        <div className="admin-login-card">
          <div className="admin-login-logo-row">
            <Logo size="md" showText={false} />
            <span className="admin-login-logo-text">
              <strong>Painel Administrativo</strong>
              <span>SOS Focinho Carente</span>
            </span>
          </div>

          <h1 className="admin-login-title">Bem-vindo(a) de volta!</h1>
          <p className="admin-login-subtitle">Entre com suas credenciais para continuar.</p>

          {notice && <Alert type="info" message={notice} onClose={() => setNotice(null)} />}

          {state.reason === 'inactive' && (
            <Alert
              type="warning"
              message="Seu acesso está desativado. Fale com o superadministrador."
            />
          )}
          {state.reason === 'expired' && (
            <Alert type="info" message="Sua sessão expirou. Entre novamente para continuar." />
          )}

          {error && <Alert type="error" message={error} onClose={() => setError('')} />}

          <form onSubmit={handleSubmit} className="admin-login-form">
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
            <Input
              label="Senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="Sua senha"
            />
            <Button type="submit" loading={loading} fullWidth size="lg">
              Entrar
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
