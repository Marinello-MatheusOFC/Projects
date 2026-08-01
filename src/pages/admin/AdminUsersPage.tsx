import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { formatDate } from '@/lib/format';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

function roleBadge(role: Profile['role']): { label: string; variant: BadgeVariant } {
  return role === 'superadmin'
    ? { label: 'Superadmin', variant: 'success' }
    : { label: 'Admin', variant: 'info' };
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    document.title = 'Usuários — SOS Focinho Carente';
    let active = true;
    const run = async () => {
      try {
        const { data, error: err } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });
        if (!active) return;
        if (err) {
          setError(true);
          return;
        }
        setProfiles((data ?? []) as Profile[]);
      } catch {
        if (active) setError(true);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, []);

  const load = async () => {
    setError(false);
    setProfiles(null);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      setProfiles((data ?? []) as Profile[]);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Usuários</h1>
          <p className="admin-page-subtitle">Perfis com acesso ao painel administrativo.</p>
        </div>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <Alert
          type="warning"
          message="Esta página é somente leitura. A gestão de usuários é feita diretamente no painel do Supabase."
        />
      </div>

      {error ? (
        <ErrorState message="Não foi possível carregar os usuários." onRetry={load} />
      ) : profiles === null ? (
        <TableSkeleton />
      ) : profiles.length === 0 ? (
        <EmptyState title="Nenhum usuário encontrado" />
      ) : (
        <Table<Profile>
          columns={[
            { key: 'full_name', header: 'Nome', render: (p) => <strong>{p.full_name}</strong> },
            {
              key: 'role',
              header: 'Papel',
              render: (p) => (
                <Badge variant={roleBadge(p.role).variant}>{roleBadge(p.role).label}</Badge>
              ),
            },
            {
              key: 'active',
              header: 'Ativo',
              render: (p) => (
                <Badge variant={p.active ? 'success' : 'default'}>
                  {p.active ? 'Sim' : 'Não'}
                </Badge>
              ),
            },
            { key: 'created_at', header: 'Criado em', render: (p) => formatDate(p.created_at) },
          ]}
          data={profiles}
          keyExtractor={(p) => p.id}
        />
      )}
    </div>
  );
}
