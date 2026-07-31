import { useEffect, useMemo, useState } from 'react';
import { Eye, Mail, Trash2, Archive } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Alert } from '@/components/feedback/Alert';
import { Modal } from '@/components/ui/Modal';
import {
  fetchContactMessages,
  updateContactMessageStatus,
  deleteContactMessage,
} from '@/services/applications';
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
  const [detail, setDetail] = useState<ContactMessage | null>(null);
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
      setMessages((prev) =>
        prev ? prev.map((m) => (m.id === message.id ? { ...m, status } : m)) : prev,
      );
      setDetail((prev) => (prev && prev.id === message.id ? { ...prev, status } : prev));
    } catch {
      setActionError(true);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (message: ContactMessage) => {
    if (!window.confirm(`Excluir a mensagem de "${message.name}"?`)) return;
    setBusyId(message.id);
    setActionError(false);
    try {
      await deleteContactMessage(message.id);
      setMessages((prev) => (prev ? prev.filter((m) => m.id !== message.id) : prev));
      setDetail((prev) => (prev && prev.id === message.id ? null : prev));
    } catch {
      setActionError(true);
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
      <h2 className="admin-page-title">Mensagens</h2>
      <p className="admin-page-subtitle">Mensagens recebidas pelo formulário de contato.</p>

      {actionError && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Alert type="error" message="Não foi possível atualizar a mensagem." />
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
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  <Button variant="outline" size="sm" onClick={() => setDetail(m)}>
                    <Eye size={14} aria-hidden="true" />
                    Detalhes
                  </Button>
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
                  <Button
                    variant="danger"
                    size="sm"
                    loading={busyId === m.id}
                    onClick={() => handleDelete(m)}
                    aria-label={`Excluir mensagem de ${m.name}`}
                  >
                    <Trash2 size={14} aria-hidden="true" />
                    Excluir
                  </Button>
                </div>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(m) => m.id}
          emptyMessage="Nenhuma mensagem encontrada para a busca."
        />
      )}

      <Modal
        isOpen={!!detail}
        onClose={() => setDetail(null)}
        title={detail ? `Mensagem de ${detail.name}` : 'Mensagem'}
        size="lg"
      >
        {detail && (
          <div>
            <dl className="detail-list" style={{ marginBottom: 'var(--space-5)' }}>
              <div className="detail-row">
                <dt>Nome</dt>
                <dd>{detail.name}</dd>
              </div>
              <div className="detail-row">
                <dt>E-mail</dt>
                <dd>{detail.email}</dd>
              </div>
              <div className="detail-row">
                <dt>Telefone</dt>
                <dd>{detail.phone || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Assunto</dt>
                <dd>{detail.subject || '—'}</dd>
              </div>
              <div className="detail-row">
                <dt>Recebida em</dt>
                <dd>{formatDate(detail.created_at)}</dd>
              </div>
              <div className="detail-row">
                <dt>Status</dt>
                <dd>
                  <Badge variant={messageBadge(detail.status).variant}>
                    {messageBadge(detail.status).label}
                  </Badge>
                </dd>
              </div>
            </dl>

            <div
              style={{
                padding: 'var(--space-4)',
                background: 'var(--color-bg-alt)',
                border: '1px solid var(--color-border-light)',
                whiteSpace: 'pre-wrap',
              }}
            >
              {detail.message}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
