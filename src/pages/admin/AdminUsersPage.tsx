import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';
import { formatDate } from '@/lib/format';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const demoProfiles: Profile[] = [
  {
    id: 'demo-user-001',
    full_name: 'Marina Alves',
    role: 'superadmin',
    active: true,
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'demo-user-002',
    full_name: 'João Pereira',
    role: 'admin',
    active: true,
    created_at: '2026-03-22T00:00:00Z',
    updated_at: '2026-05-15T00:00:00Z',
  },
  {
    id: 'demo-user-003',
    full_name: 'Carla Menezes',
    role: 'admin',
    active: false,
    created_at: '2026-06-08T00:00:00Z',
    updated_at: '2026-07-20T00:00:00Z',
  },
];

function roleBadge(role: Profile['role']): { label: string; variant: BadgeVariant } {
  return role === 'superadmin'
    ? { label: 'Superadmin', variant: 'success' }
    : { label: 'Admin', variant: 'info' };
}

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [usingDemo, setUsingDemo] = useState(false);

  useEffect(() => {
    document.title = 'Usuários — SOS Focinho Carente';
    let active = true;
    const load = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*');
        if (!active) return;
        if (error || !data || data.length === 0) {
          setProfiles(demoProfiles);
          setUsingDemo(true);
          return;
        }
        setProfiles(data as Profile[]);
        setUsingDemo(false);
      } catch {
        if (active) {
          setProfiles(demoProfiles);
          setUsingDemo(true);
        }
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Usuários</h2>
      <p className="admin-page-subtitle">Perfis com acesso ao painel administrativo.</p>

      {usingDemo && (
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <Alert
            type="info"
            message="Exibindo dados de demonstração — o backend local não está disponível."
          />
        </div>
      )}

      <Alert type="warning" message="Esta página é somente leitura. A gestão de usuários é feita diretamente no painel do Supabase." />

      <div style={{ marginTop: 'var(--space-6)' }}>
        {profiles === null ? (
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
    </div>
  );
}
