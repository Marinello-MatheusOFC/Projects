import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Trash2, Users } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Alert } from '@/components/feedback/Alert';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchVolunteerApplications,
  deleteVolunteerApplication,
} from '@/services/applications';
import { logAudit } from '@/services/audit';
import type { VolunteerApplication, VolunteerStatus } from '@/types';
import { truncate } from '@/lib/format';
import { formatDate } from '@/lib/format';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

const volunteerStatusLabels: Record<VolunteerStatus, string> = {
  new: 'Nova',
  under_review: 'Em análise',
  contacted: 'Contato realizado',
  approved: 'Aprovada',
  rejected: 'Recusada',
  archived: 'Arquivada',
};

function volunteerBadgeVariant(status: VolunteerStatus): BadgeVariant {
  switch (status) {
    case 'approved':
      return 'success';
    case 'rejected':
      return 'error';
    case 'under_review':
    case 'contacted':
      return 'info';
    case 'new':
      return 'warning';
    default:
      return 'default';
  }
}

export default function AdminVolunteersPage() {
  const [applications, setApplications] = useState<VolunteerApplication[] | null>(null);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<VolunteerApplication | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.title = 'Voluntários — SOS Focinho Carente';
    let active = true;
    fetchVolunteerApplications()
      .then((data) => {
        if (active) setApplications(data);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const load = () => {
    setError(false);
    setApplications(null);
    fetchVolunteerApplications()
      .then(setApplications)
      .catch(() => setError(true));
  };

  const filtered = useMemo(() => {
    if (!applications) return [];
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter(
      (a) =>
        a.name.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query),
    );
  }, [applications, search]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    setActionError(false);
    try {
      await deleteVolunteerApplication(confirmDelete.id);
      await logAudit('excluir', 'volunteer_application', confirmDelete.id, { name: confirmDelete.name });
      setApplications((prev) => (prev ? prev.filter((a) => a.id !== confirmDelete.id) : prev));
      setConfirmDelete(null);
    } catch {
      setActionError(true);
      setConfirmDelete(null);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Voluntários</h2>
        <ErrorState message="Não foi possível carregar as inscrições." onRetry={load} />
      </div>
    );
  }

  if (applications === null) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Voluntários</h2>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Voluntários</h1>
          <p className="admin-page-subtitle">
            Inscrições recebidas pelo formulário de voluntariado.
          </p>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert type="error" message="Não foi possível concluir a ação." onClose={() => setActionError(false)} />
        </div>
      )}

      {applications.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <Input
              label="Buscar voluntário"
              id="search-volunteer"
              type="search"
              placeholder="Buscar por nome ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <EmptyState
          icon={<Users size={40} aria-hidden="true" />}
          title="Nenhuma inscrição"
          description="As inscrições enviadas pelo formulário de voluntariado aparecerão aqui."
        />
      ) : (
        <Table<VolunteerApplication>
          columns={[
            {
              key: 'name',
              header: 'Nome',
              render: (a) => <Link to={`/admin/voluntarios/${a.id}`}><strong>{a.name}</strong></Link>,
            },
            { key: 'city', header: 'Cidade', render: (a) => a.city || '—' },
            { key: 'availability', header: 'Disponibilidade', render: (a) => a.availability || '—' },
            {
              key: 'interests',
              header: 'Interesses',
              render: (a) => (a.interests ? truncate(a.interests, 40) : '—'),
            },
            { key: 'created_at', header: 'Data', render: (a) => formatDate(a.created_at) },
            {
              key: 'status',
              header: 'Status',
              render: (a) => (
                <Badge variant={volunteerBadgeVariant(a.status)}>
                  {volunteerStatusLabels[a.status]}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (a) => (
                <div className="admin-table-actions">
                  <Link
                    to={`/admin/voluntarios/${a.id}`}
                    className="admin-icon-btn"
                    aria-label={`Abrir inscrição de ${a.name}`}
                    title="Abrir inscrição"
                  >
                    <Eye size={18} aria-hidden="true" />
                  </Link>
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    aria-label={`Excluir inscrição de ${a.name}`}
                    title="Excluir"
                    onClick={() => setConfirmDelete(a)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(a) => a.id}
          emptyMessage="Nenhuma inscrição encontrada para a busca."
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Excluir inscrição"
        message={
          <>
            Tem certeza que deseja excluir permanentemente a inscrição de{' '}
            <strong>{confirmDelete?.name}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={busy}
        onConfirm={handleDelete}
      />
    </div>
  );
}
