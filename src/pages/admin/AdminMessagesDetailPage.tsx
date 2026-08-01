import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Archive, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchContactMessage,
  updateContactMessageStatus,
  deleteContactMessage,
} from '@/services/applications';
import { logAudit } from '@/services/audit';
import { formatDateTime } from '@/utils/format';
import type { ContactMessage, ContactMessageStatus } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

function messageBadge(status: ContactMessageStatus): { label: string; variant: BadgeVariant } {
  switch (status) {
    case 'new':
      return { label: 'Nova', variant: 'warning' };
    case 'read':
      return { label: 'Lida', variant: 'info' };
    case 'archived':
      return { label: 'Arquivada', variant: 'default' };
  }
}

export default function AdminMessagesDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [message, setMessage] = useState<ContactMessage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    setError(false);
    fetchContactMessage(id)
      .then((data) => {
        if (active) setMessage(data);
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
    document.title = 'Mensagem — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  useEffect(() => {
    if (message && message.status === 'new') {
      void updateContactMessageStatus(message.id, 'read').then(() => {
        setMessage((prev) => (prev ? { ...prev, status: 'read' } : prev));
      });
    }
  }, [message]);

  const handleArchive = async () => {
    if (!message) return;
    setBusy(true);
    setActionError(false);
    try {
      await updateContactMessageStatus(message.id, 'archived');
      await logAudit('arquivar', 'contact_message', message.id);
      setMessage({ ...message, status: 'archived' });
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!message) return;
    setBusy(true);
    setActionError(false);
    try {
      await deleteContactMessage(message.id);
      await logAudit('excluir', 'contact_message', message.id);
      setConfirmDelete(false);
      setMessage(null);
    } catch {
      setActionError(true);
      setConfirmDelete(false);
    } finally {
      setBusy(false);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <ErrorState message="Não foi possível carregar a mensagem." onRetry={load} />
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

  if (!message) {
    return (
      <div className="admin-page">
        <EmptyState
          title="Mensagem não encontrada"
          description="A mensagem pode ter sido excluída ou o endereço está incorreto."
          action={
            <Link to="/admin/mensagens">
              <Button>Voltar para Mensagens</Button>
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
          <h1 className="admin-page-title">{message.subject || 'Mensagem sem assunto'}</h1>
          <p className="admin-page-subtitle">
            {message.name} · Recebida em {formatDateTime(message.created_at)}
          </p>
        </div>
        <div className="admin-page-actions">
          <Link to="/admin/mensagens">
            <Button variant="ghost">
              <ArrowLeft size={18} aria-hidden="true" />
              Voltar
            </Button>
          </Link>
          {message.status !== 'archived' && (
            <Button variant="outline" loading={busy} onClick={handleArchive}>
              <Archive size={18} aria-hidden="true" />
              Arquivar
            </Button>
          )}
          <Button variant="danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
            <Trash2 size={18} aria-hidden="true" />
            Excluir
          </Button>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message="Não foi possível concluir a ação." onClose={() => setActionError(false)} />
        </div>
      )}

      <div className="admin-detail-grid">
        <div className="admin-detail-side">
          <div className="admin-card">
            <h2 className="admin-card-title">Remetente</h2>
            <ul className="admin-detail-list">
              <li>
                <span className="admin-detail-key">Nome</span>
                <span className="admin-detail-value">{message.name}</span>
              </li>
              <li>
                <span className="admin-detail-key">E-mail</span>
                <span className="admin-detail-value">{message.email}</span>
              </li>
              <li>
                <span className="admin-detail-key">Telefone</span>
                <span className="admin-detail-value">{message.phone || '—'}</span>
              </li>
              <li>
                <span className="admin-detail-key">Status</span>
                <span className="admin-detail-value">
                  <Badge variant={messageBadge(message.status).variant}>
                    {messageBadge(message.status).label}
                  </Badge>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="admin-detail-main">
          <div className="admin-card">
            <h2 className="admin-card-title">Conteúdo da mensagem</h2>
            <div className="admin-detail-prose" style={{ whiteSpace: 'pre-wrap' }}>
              {message.message}
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title="Excluir mensagem"
        message={
          <>
            Tem certeza que deseja excluir permanentemente a mensagem de{' '}
            <strong>{message.name}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={busy}
        onConfirm={handleDelete}
      />
    </div>
  );
}
