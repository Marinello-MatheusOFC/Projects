import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Mail, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Alert } from '@/components/feedback/Alert';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import {
  fetchContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '@/services/applications';
import { logAudit } from '@/services/audit';
import type { ContactMessage, ContactMessageStatus } from '@/types';
import { formatDate } from '@/lib/format';

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

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[] | null>(null);
  const [error, setError] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<ContactMessage | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Mensagens — SOS Focinho Carente';
    let active = true;
    fetchContactMessages()
      .then((data) => {
        if (active) setMessages(data);
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
    setMessages(null);
    fetchContactMessages()
      .then(setMessages)
      .catch(() => setError(true));
  };

  const filtered = useMemo(() => {
    if (!messages) return [];
    const query = search.trim().toLowerCase();
    if (!query) return messages;
    return messages.filter(
      (m) =>
        m.name.toLowerCase().includes(query) ||
        m.subject.toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query),
    );
  }, [messages, search]);

  const updateStatus = async (message: ContactMessage, status: ContactMessageStatus) => {
    setBusyId(message.id);
    setActionError(false);
    try {
      await updateContactMessageStatus(message.id, status);
      await logAudit(status === 'archived' ? 'arquivar' : 'marcar_lida', 'contact_message', message.id);
      setMessages((prev) =>
        prev ? prev.map((m) => (m.id === message.id ? { ...m, status } : m)) : prev,
      );
    } catch {
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusyId(confirmDelete.id);
    setActionError(false);
    try {
      await deleteContactMessage(confirmDelete.id);
      await logAudit('excluir', 'contact_message', confirmDelete.id);
      setMessages((prev) => (prev ? prev.filter((m) => m.id !== confirmDelete.id) : prev));
      setConfirmDelete(null);
    } catch {
      setActionError(true);
      setConfirmDelete(null);
    } finally {
      setBusyId(null);
    }
  };

  if (error) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Mensagens</h2>
        <ErrorState message="Não foi possível carregar as mensagens." onRetry={load} />
      </div>
    );
  }

  if (messages === null) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Mensagens</h2>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Mensagens</h1>
          <p className="admin-page-subtitle">Mensagens recebidas pelo formulário de contato.</p>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert type="error" message="Não foi possível atualizar a mensagem." onClose={() => setActionError(false)} />
        </div>
      )}

      {messages.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <Input
              label="Buscar mensagem"
              id="search-message"
              type="search"
              placeholder="Buscar por nome, assunto ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {messages.length === 0 ? (
        <EmptyState
          icon={<Mail size={40} aria-hidden="true" />}
          title="Nenhuma mensagem"
          description="As mensagens enviadas pelo formulário de contato aparecerão aqui."
        />
      ) : (
        <Table<ContactMessage>
          columns={[
            { key: 'name', header: 'Nome', render: (m) => <strong>{m.name}</strong> },
            { key: 'subject', header: 'Assunto', render: (m) => m.subject || '—' },
            { key: 'email', header: 'E-mail', render: (m) => m.email },
            { key: 'created_at', header: 'Data', render: (m) => formatDate(m.created_at) },
            {
              key: 'status',
              header: 'Status',
              render: (m) => <Badge variant={messageBadge(m.status).variant}>{messageBadge(m.status).label}</Badge>,
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (m) => (
                <div className="admin-table-actions">
                  <Link
                    to={`/admin/mensagens/${m.id}`}
                    className="admin-icon-btn"
                    aria-label={`Abrir mensagem de ${m.name}`}
                    title="Abrir mensagem"
                  >
                    <Eye size={18} aria-hidden="true" />
                  </Link>
                  {m.status !== 'read' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={busyId === m.id}
                      onClick={() => updateStatus(m, 'read')}
                      aria-label={`Marcar mensagem de ${m.name} como lida`}
                    >
                      Marcar como lida
                    </Button>
                  )}
                  {m.status !== 'archived' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      loading={busyId === m.id}
                      onClick={() => updateStatus(m, 'archived')}
                      aria-label={`Arquivar mensagem de ${m.name}`}
                    >
                      <Archive size={14} aria-hidden="true" />
                      Arquivar
                    </Button>
                  )}
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger"
                    aria-label={`Excluir mensagem de ${m.name}`}
                    title="Excluir"
                    onClick={() => setConfirmDelete(m)}
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                </div>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(m) => m.id}
          emptyMessage="Nenhuma mensagem encontrada para a busca."
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Excluir mensagem"
        message={
          <>
            Tem certeza que deseja excluir permanentemente a mensagem de{' '}
            <strong>{confirmDelete?.name}</strong>? Essa ação não pode ser desfeita.
          </>
        }
        confirmLabel="Excluir"
        loading={busyId === confirmDelete?.id}
        onConfirm={handleDelete}
      />
    </div>
  );
}
