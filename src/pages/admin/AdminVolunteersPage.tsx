import { useEffect, useMemo, useState } from 'react';
import { Eye, Trash2, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Alert } from '@/components/feedback/Alert';
import { Modal } from '@/components/ui/Modal';
import {
  fetchVolunteerApplications,
  updateVolunteerStatus,
  deleteVolunteerApplication,
} from '@/services/applications';
import type { VolunteerApplication, VolunteerStatus } from '@/types';
import { truncate } from '@/utils';
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

const statusOptions = (Object.keys(volunteerStatusLabels) as VolunteerStatus[]).map((value) => ({
  value,
  label: volunteerStatusLabels[value],
}));

export default function AdminVolunteersPage() {
  const [applications, setApplications] = useState<VolunteerApplication[] | null>(null);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<VolunteerApplication | null>(null);
  const [updating, setUpdating] = useState(false);

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

  const handleStatusChange = async (app: VolunteerApplication, newStatus: VolunteerStatus) => {
    setUpdating(true);
    setActionError(false);
    try {
      await updateVolunteerStatus(app.id, newStatus);
      setApplications((prev) =>
        prev ? prev.map((a) => (a.id === app.id ? { ...a, status: newStatus } : a)) : prev,
      );
      setDetail((prev) => (prev ? { ...prev, status: newStatus } : prev));
    } catch {
      setActionError(true);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (app: VolunteerApplication) => {
    if (!window.confirm(`Excluir a inscrição de "${app.name}"?`)) return;
    setUpdating(true);
    setActionError(false);
    try {
      await deleteVolunteerApplication(app.id);
      setApplications((prev) => (prev ? prev.filter((a) => a.id !== app.id) : prev));
      setDetail(null);
    } catch {
      setActionError(true);
    } finally {
      setUpdating(false);
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
      <h2 className="admin-page-title">Voluntários</h2>
      <p className="admin-page-subtitle">
        Inscrições recebidas pelo formulário de voluntariado.
      </p>

      {actionError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert type="error" message="Não foi possível atualizar a inscrição." />
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
            { key: 'name', header: 'Nome', render: (a) => <strong>{a.name}</strong> },
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
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" onClick={() => setDetail(a)}>
                    <Eye size={14} aria-hidden="true" />
                    Detalhes
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(a)}
                    aria-label={`Excluir inscrição de ${a.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Excluir
                  </Button>
                </div>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(a) => a.id}
          emptyMessage="Nenhuma inscrição encontrada para a busca."
        />
      )}

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Inscrição de ${detail.name}` : 'Inscrição'}
        size="lg"
      >
        {detail && (
          <div>
            <dl className="detail-list" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="detail-row">
                <dt>E-mail</dt>
                <dd>{detail.email}</dd>
              </div>
              <div className="detail-row">
                <dt>Telefone</dt>
                <dd>{detail.phone || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Cidade</dt>
                <dd>{detail.city || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Disponibilidade</dt>
                <dd>{detail.availability || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Interesses</dt>
                <dd>{detail.interests || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Recebida em</dt>
                <dd>{formatDate(detail.created_at)}</dd>
              </div>
            </dl>

            {detail.experience && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text)' }}>Experiência:</strong>{' '}
                {detail.experience}
              </p>
            )}
            {detail.message && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text)' }}>Mensagem:</strong> {detail.message}
              </p>
            )}
            {detail.internal_notes && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text)' }}>Notas internas:</strong>{' '}
                {detail.internal_notes}
              </p>
            )}

            <div className="admin-form" style={{ marginTop: 'var(--space-5)' }}>
              <Select
                label="Status"
                value={detail.status}
                disabled={updating}
                options={statusOptions}
                onChange={(e) => handleStatusChange(detail, e.target.value as VolunteerStatus)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
