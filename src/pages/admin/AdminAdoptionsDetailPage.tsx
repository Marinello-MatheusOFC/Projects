import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import {
  fetchAdoptionApplication,
  fetchAdoptionHistory,
  updateAdoptionStatus,
} from '@/services/applications';
import { logAudit } from '@/services/audit';
import { adoptionStatusLabels } from '@/utils';
import { formatDateTime } from '@/lib/format';
import type { AdoptionApplication, AdoptionStatus, AdoptionStatusHistory } from '@/types';

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

const HOUSING_LABELS: Record<string, string> = {
  house: 'Casa',
  apartment: 'Apartamento',
  other: 'Outro',
};

export default function AdminAdoptionsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { profile } = useAuth();
  const [application, setApplication] = useState<AdoptionApplication | null>(null);
  const [history, setHistory] = useState<AdoptionStatusHistory[]>([]);
  const [animalName, setAnimalName] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [status, setStatus] = useState<AdoptionStatus>('new');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileNames, setProfileNames] = useState<Record<string, string>>({});

  const load = useCallback(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(false);
    Promise.all([fetchAdoptionApplication(id), fetchAdoptionHistory(id)])
      .then(([app, entries]) => {
        if (!active) return;
        if (!app) {
          setApplication(null);
          return;
        }
        setApplication(app);
        setStatus(app.status);
        setNote(app.internal_notes ?? '');
        setHistory(entries);
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
    document.title = 'Solicitação de adoção — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    const ids = Array.from(new Set(history.map((h) => h.changed_by).filter(Boolean)));
    if (ids.length === 0) return;
    let active = true;
    (async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('id', ids);
        if (!active || !data) return;
        const map: Record<string, string> = {};
        for (const p of data) {
          if (p.full_name) map[p.id] = p.full_name;
        }
        setProfileNames(map);
      } catch {
        /* nome de quem alterou é opcional */
      }
    })();
    return () => {
      active = false;
    };
  }, [history]);

  useEffect(() => {
    if (!application || !application.animal_id) return;
    let active = true;
    const run = async () => {
      try {
        const { data } = await supabase
          .from('animals')
          .select('name')
          .eq('id', application.animal_id)
          .maybeSingle();
        if (active && data) setAnimalName((data as { name: string }).name);
      } catch {
        /* nome do animal é opcional */
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [application]);

  const handleSave = async () => {
    if (!application) return;
    setSaving(true);
    setSaveError(false);
    setSaved(false);
    try {
      await updateAdoptionStatus(application.id, status, note || null, profile?.id ?? undefined);
      await logAudit('atualizar_status', 'adoption_application', application.id, {
        previous_status: application.status,
        new_status: status,
      });
      setApplication({ ...application, status, internal_notes: note || null });
      const entries = await fetchAdoptionHistory(application.id);
      setHistory(entries);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 4000);
    } catch {
      setSaveError(true);
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <ErrorState message="Não foi possível carregar a solicitação." onRetry={load} />
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
          title="Solicitação não encontrada"
          description="A solicitação pode ter sido removida ou o endereço está incorreto."
          action={
            <Link to="/admin/adocoes">
              <Button>Voltar para Adoções</Button>
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
          <h1 className="admin-page-title">Solicitação de {application.applicant_name}</h1>
          <p className="admin-page-subtitle">
            {animalName || 'Animal'} · Recebida em {formatDateTime(application.created_at)}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/adocoes">
            <Button variant="ghost">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Button>
          </Link>
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
              <Badge variant={adoptionBadgeVariant(application.status)}>
                {adoptionStatusLabels[application.status] ?? application.status}
              </Badge>
            </div>
            <div className="admin-detail-section">
              <Select
                label="Alterar status"
                value={status}
                disabled={saving}
                options={statusOptions}
                onChange={(e) => setStatus(e.target.value as AdoptionStatus)}
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
            <h2 className="admin-card-title">Candidato(a)</h2>
            <ul className="admin-detail-list">
              <li>
                <span className="admin-detail-key">E-mail</span>
                <span className="admin-detail-value">{application.applicant_email}</span>
              </li>
              <li>
                <span className="admin-detail-key">Telefone</span>
                <span className="admin-detail-value">{application.applicant_phone || '—'}</span>
              </li>
              <li>
                <span className="admin-detail-key">Cidade</span>
                <span className="admin-detail-value">{application.city || '—'}</span>
              </li>
              <li>
                <span className="admin-detail-key">Moradia</span>
                <span className="admin-detail-value">
                  {HOUSING_LABELS[application.housing_type] ?? application.housing_type}
                </span>
              </li>
              <li>
                <span className="admin-detail-key">Telas de proteção</span>
                <span className="admin-detail-value">{booleanLabel(application.has_protective_screens)}</span>
              </li>
              <li>
                <span className="admin-detail-key">Outros animais</span>
                <span className="admin-detail-value">{booleanLabel(application.has_other_animals)}</span>
              </li>
              <li>
                <span className="admin-detail-key">Família de acordo</span>
                <span className="admin-detail-value">{booleanLabel(application.household_agreement)}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="admin-detail-main">
          <div className="admin-card">
            <h2 className="admin-card-title">Solicitação</h2>
            <div className="admin-detail-prose">
              <p><strong>Motivo:</strong> {application.reason}</p>
              <p><strong>Disponibilidade:</strong> {application.availability}</p>
            </div>
          </div>

          <div className="admin-card">
            <h2 className="admin-card-title">Histórico de status</h2>
            {history.length === 0 ? (
              <p className="admin-card-subtitle">Nenhuma alteração registrada até o momento.</p>
            ) : (
              <ul className="admin-timeline">
                {history.map((entry) => (
                  <li key={entry.id}>
                    <div className="admin-timeline-time">{formatDateTime(entry.created_at)}</div>
                    <div className="admin-timeline-action">
                      {adoptionStatusLabels[entry.previous_status ?? ''] ?? '—'} →{' '}
                      {adoptionStatusLabels[entry.new_status] ?? entry.new_status}
                    </div>
                    {entry.note && <div className="admin-timeline-detail">{entry.note}</div>}
                    <div className="admin-timeline-detail">
                      por{' '}
                      {profileNames[entry.changed_by] ??
                        (entry.changed_by ? entry.changed_by.slice(0, 8) : '—')}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
