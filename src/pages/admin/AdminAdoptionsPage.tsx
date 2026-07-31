import { useEffect, useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
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
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fetchAdminAnimals, type AnimalWithImages } from '@/services/animals';
import {
  fetchAdoptionApplications,
  fetchAdoptionHistory,
  updateAdoptionStatus,
} from '@/services/applications';
import type { AdoptionApplication, AdoptionStatus, AdoptionStatusHistory } from '@/types';
import { adoptionStatusLabels } from '@/utils';
import { formatDate } from '@/lib/format';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

function adoptionBadgeVariant(status: AdoptionStatus): BadgeVariant {
  switch (status) {
    case 'approved':
    case 'completed':
      return 'success';
    case 'rejected':
      return 'error';
    case 'under_review':
    case 'contacted':
    case 'interview':
      return 'info';
    case 'new':
      return 'warning';
    default:
      return 'default';
  }
}

const statusOptions = Object.entries(adoptionStatusLabels).map(([value, label]) => ({
  value,
  label,
}));

function booleanLabel(value: boolean): string {
  return value ? 'Sim' : 'Não';
}

export default function AdminAdoptionsPage() {
  const { profile } = useAuth();
  const [applications, setApplications] = useState<AdoptionApplication[] | null>(null);
  const [animals, setAnimals] = useState<AnimalWithImages[]>([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<AdoptionApplication | null>(null);
  const [history, setHistory] = useState<AdoptionStatusHistory[]>([]);
  const [updating, setUpdating] = useState(false);
  const [actionError, setActionError] = useState(false);

  useEffect(() => {
    document.title = 'Adoções — SOS Focinho Carente';
    let active = true;
    Promise.all([fetchAdoptionApplications(), fetchAdminAnimals()])
      .then(([apps, animalList]) => {
        if (active) {
          setApplications(apps);
          setAnimals(animalList);
        }
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
    Promise.all([fetchAdoptionApplications(), fetchAdminAnimals()])
      .then(([apps, animalList]) => {
        setApplications(apps);
        setAnimals(animalList);
      })
      .catch(() => setError(true));
  };

  const filtered = useMemo(() => {
    if (!applications) return [];
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter(
      (a) =>
        a.applicant_name.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query),
    );
  }, [applications, search]);

  const animalName = (animalId: string): string => {
    const found = animals.find((a) => a.id === animalId);
    return found ? found.name : `${animalId.slice(0, 8)}...`;
  };

  const openDetail = async (app: AdoptionApplication) => {
    setDetail(app);
    setHistory([]);
    setActionError(false);
    try {
      const entries = await fetchAdoptionHistory(app.id);
      setHistory(entries);
    } catch {
      setHistory([]);
    }
  };

  const handleStatusChange = async (app: AdoptionApplication, newStatus: AdoptionStatus) => {
    setUpdating(true);
    setActionError(false);
    try {
      await updateAdoptionStatus(app.id, newStatus, null, profile?.full_name ?? undefined);
      const entries = await fetchAdoptionHistory(app.id);
      setHistory(entries);
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

  if (error) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Solicitações de Adoção</h2>
        <ErrorState message="Não foi possível carregar as solicitações." onRetry={load} />
      </div>
    );
  }

  if (applications === null) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Solicitações de Adoção</h2>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Solicitações de Adoção</h2>
      <p className="admin-page-subtitle">
        Acompanhe e atualize o andamento das solicitações de adoção.
      </p>

      {applications.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <Input
              label="Buscar solicitação"
              id="search-adoption"
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
          title="Nenhuma solicitação de adoção"
          description="As solicitações enviadas pelo formulário de adoção aparecerão aqui."
        />
      ) : (
        <Table<AdoptionApplication>
          columns={[
            {
              key: 'applicant_name',
              header: 'Nome',
              render: (a) => <strong>{a.applicant_name}</strong>,
            },
            { key: 'animal_id', header: 'Animal', render: (a) => animalName(a.animal_id) },
            { key: 'city', header: 'Cidade', render: (a) => a.city || '—' },
            { key: 'created_at', header: 'Data', render: (a) => formatDate(a.created_at) },
            {
              key: 'status',
              header: 'Status',
              render: (a) => (
                <Badge variant={adoptionBadgeVariant(a.status)}>
                  {adoptionStatusLabels[a.status] ?? a.status}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (a) => (
                <Button variant="outline" size="sm" onClick={() => openDetail(a)}>
                  <Eye size={14} aria-hidden="true" />
                  Detalhes
                </Button>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(a) => a.id}
          emptyMessage="Nenhuma solicitação encontrada para a busca."
        />
      )}

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Solicitação de ${detail.applicant_name}` : 'Solicitação'}
        size="lg"
      >
        {detail && (
          <div>
            <dl className="detail-list" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="detail-row">
                <dt>Animal</dt>
                <dd>{animalName(detail.animal_id)}</dd>
              </div>
              <div className="detail-row">
                <dt>E-mail</dt>
                <dd>{detail.applicant_email}</dd>
              </div>
              <div className="detail-row">
                <dt>Telefone</dt>
                <dd>{detail.applicant_phone || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Cidade</dt>
                <dd>{detail.city || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Tipo de moradia</dt>
                <dd>{detail.housing_type || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Telas de proteção</dt>
                <dd>{booleanLabel(detail.has_protective_screens)}</dd>
              </div>
              <div className="detail-row">
                <dt>Outros animais</dt>
                <dd>{booleanLabel(detail.has_other_animals)}</dd>
              </div>
              <div className="detail-row">
                <dt>Família de acordo</dt>
                <dd>{booleanLabel(detail.household_agreement)}</dd>
              </div>
              <div className="detail-row">
                <dt>Disponibilidade</dt>
                <dd>{detail.availability || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Recebida em</dt>
                <dd>{formatDate(detail.created_at)}</dd>
              </div>
            </dl>

            <p style={{ color: 'var(--color-text-secondary)' }}>
              <strong style={{ color: 'var(--color-text)' }}>Motivo da solicitação:</strong>{' '}
              {detail.reason}
            </p>

            {detail.internal_notes && (
              <p style={{ color: 'var(--color-text-secondary)' }}>
                <strong style={{ color: 'var(--color-text)' }}>Notas internas:</strong>{' '}
                {detail.internal_notes}
              </p>
            )}

            <div className="admin-form" style={{ marginTop: 'var(--space-5)' }}>
              {actionError && (
                <Alert
                  type="error"
                  message="Não foi possível atualizar o status da solicitação."
                />
              )}
              <Select
                label="Status"
                value={detail.status}
                disabled={updating}
                options={statusOptions}
                onChange={(e) => handleStatusChange(detail, e.target.value as AdoptionStatus)}
              />

              {history.length > 0 && (
                <div style={{ marginTop: 'var(--space-5)' }}>
                  <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>
                    Histórico de status
                  </h3>
                  <dl className="detail-list">
                    {history.map((entry) => (
                      <div key={entry.id} className="detail-row">
                        <dt>
                          {formatDate(entry.created_at)}
                          <br />
                          <span style={{ color: 'var(--color-text-muted)' }}>
                            {adoptionStatusLabels[entry.previous_status ?? ''] ?? '—'} →{' '}
                            {adoptionStatusLabels[entry.new_status] ?? entry.new_status}
                          </span>
                          {entry.note && (
                            <span style={{ color: 'var(--color-text-muted)' }}> · {entry.note}</span>
                          )}
                        </dt>
                        <dd style={{ fontSize: 'var(--text-xs)' }}>{entry.changed_by}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
