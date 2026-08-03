import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchVolunteerApplication,
  updateVolunteerStatus,
  deleteVolunteerApplication,
} from '@/services/applications';
import { logAudit } from '@/services/audit';
import { formatDateTime } from '@/lib/format';
import type { VolunteerApplication, VolunteerStatus } from '@/types';

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

export default function AdminVolunteersDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [application, setApplication] = useState<VolunteerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<VolunteerStatus>('new');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetchVolunteerApplication(id)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setApplication(null);
          return;
        }
        setApplication(data);
        setStatus(data.status);
        setNote(data.internal_notes ?? '');
      })
      .catch(() => {
        if (active) setError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    document.title = 'Inscrição de voluntário — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  const handleSave = async () => {
    if (!application) return;
    setSaving(true);
    setSaveError(false);
    setSaved(false);
    try {
      await updateVolunteerStatus(application.id, status, note || null);
      await logAudit('atualizar_status', 'volunteer_application', application.id, {
        previous_status: application.status,
        new_status: status,
      });
      setApplication({ ...application, status, internal_notes: note || null });
      setSaved(true);
      window.setTimeout(() => setSaved(false), 4000);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!application) return;
    setSaving(true);
    setSaveError(false);
    try {
      await deleteVolunteerApplication(application.id);
      await logAudit('excluir', 'volunteer_application', application.id);
      setConfirmDelete(false);
      setApplication(null);
    } catch {
      setSaveError(true);
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <ErrorState message="Não foi possível carregar a inscrição." onRetry={load} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-page">
        <TableSkeleton />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="admin-page">
        <EmptyState
          title="Inscrição não encontrada"
          description="A inscrição pode ter sido removida ou o endereço está incorreto."
          action={
            <Link to="/admin/voluntarios">
              <Button>Voltar para Voluntários</Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Inscrição de {application.name}</h1>
          <p className="admin-page-subtitle">
            Recebida em {formatDateTime(application.created_at)}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/voluntarios">
            <Button variant="ghost">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Button>
          </Link>
          <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={saving}>
            <Trash2 size={18} aria-hidden="true" />
            Excluir
          </Button>
        </div>
      </div>

      {saveError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message="Não foi possível salvar as alterações." onClose={() => setSaveError(false)} />
        </div>
      )}
      {saved && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="success" message="Status atualizado com sucesso." onClose={() => setSaved(false)} />
        </div>
      )}

      <div className="admin-detail-grid">
        <div className="admin-detail-side">
          <div className="admin-card">
            <h2 className="admin-card-title">Status</h2>
            <div className="admin-detail-hero-info" style={{ marginTop: '0.5rem' }}>
              <Badge variant={volunteerBadgeVariant(application.status)}>
                {volunteerStatusLabels[application.status]}
              </Badge>
            </div>
            <div className="admin-detail-section">
              <Select
                label="Alterar status"
                value={status}
                disabled={saving}
                options={statusOptions}
                onChange={(e) => setStatus(e.target.value as VolunteerStatus)}
              />
              <Textarea
                label="Notas internas"
                value={note}
                disabled={saving}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Anotações do atendimento..."
              />
              <Button onClick={handleSave} loading={saving} fullWidth>
                <Save size={18} aria-hidden="true" />
                Salvar
              </Button>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Contato</h2>
            <ul className="admin-detail-list">
              <li>
                <span className="admin-detail-key">E-mail</span>
                <span className="admin-detail-value">{application.email}</span>
              </li>
              <li>
                <span className="admin-detail-key">Telefone</span>
                <span className="admin-detail-value">{application.phone || '—'}</span>
              </li>
              <li>
                <span className="admin-detail-key">Cidade</span>
                <span className="admin-detail-value">{application.city || '—'}</span>
              </li>
              <li>
                <span className="admin-detail-key">Disponibilidade</span>
                <span className="admin-detail-value">{application.availability}</span>
              </li>
              <li>
                <span className="admin-detail-key">Interesses</span>
                <span className="admin-detail-value">{application.interests}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="admin-detail-main">
          <div className="admin-card">
            <h2 className="admin-card-title">Sobre o candidato(a)</h2>
            <div className="admin-detail-prose">
              {application.experience && <p><strong>Experiência:</strong> {application.experience}</p>}
              {application.message && <p><strong>Mensagem:</strong> {application.message}</p>}
              {!application.experience && !application.message && (
                <p className="admin-card-subtitle">Nenhuma informação adicional.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir inscrição"
        message={
          <>
            Tem certeza que deseja excluir permanentemente a inscrição de{' '}
            <strong>{application.name}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={saving}
        onConfirm={handleDelete}
      />
    </div>
  );
}
