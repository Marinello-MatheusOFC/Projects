import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw, ScrollText } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { fetchAuditLogs } from '@/services/audit';
import { formatDateTime } from '@/utils/format';
import type { AuditLog } from '@/types';

type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

function actionBadge(action: string): { label: string; variant: BadgeVariant } {
  if (action.startsWith('criar') || action === 'publicar' || action === 'restaurar') {
    return { label: action, variant: 'success' };
  }
  if (action.startsWith('excluir') || action === 'arquivar' || action === 'despublicar') {
    return { label: action, variant: 'error' };
  }
  if (action.startsWith('atualizar') || action === 'definir_capa' || action === 'upload_imagens') {
    return { label: action, variant: 'info' };
  }
  if (action.startsWith('destacar') || action === 'remover_destaque') {
    return { label: action, variant: 'warning' };
  }
  return { label: action, variant: 'default' };
}

const ENTITY_LABELS: Record<string, string> = {
  animal: 'Animal',
  adoption_application: 'Adoção',
  event: 'Evento',
  news_post: 'Notícia',
  product: 'Produto',
  gallery_album: 'Álbum',
  gallery_image: 'Foto',
  contact_message: 'Mensagem',
  volunteer_application: 'Voluntário',
  site_setting: 'Configuração',
  profile: 'Usuário',
};

function entityLabel(entityType: string): string {
  return ENTITY_LABELS[entityType] ?? entityType;
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');

  const load = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchAuditLogs(200)
      .then((data) => {
        if (active) setLogs(data);
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
  }, []);

  useEffect(() => {
    document.title = 'Auditoria — SOS Focinho Carente';
  }, []);

  useEffect(() => load(), [load]);

  const entityOptions = useMemo(() => {
    const types = Array.from(new Set(logs.map((log) => log.entity_type))).sort();
    return [
      { value: 'all', label: 'Todas as entidades' },
      ...types.map((type) => ({ value: type, label: entityLabel(type) })),
    ];
  }, [logs]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return logs.filter((log) => {
      const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
      if (!matchesEntity) return false;
      if (!term) return true;
      return (
        log.action.toLowerCase().includes(term) ||
        (log.entity_id ?? '').toLowerCase().includes(term) ||
        entityLabel(log.entity_type).toLowerCase().includes(term)
      );
    });
  }, [logs, search, entityFilter]);

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Auditoria</h1>
          <p className="admin-page-subtitle">
            Registro de ações realizadas por administradores no painel. Acesso exclusivo de
            superadministradores.
          </p>
        </div>
        <div className="admin-page-actions">
          <Button variant="outline" onClick={load} loading={loading}>
            <RefreshCw size={18} aria-hidden="true" />
            Atualizar
          </Button>
        </div>
      </div>

      {logs.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <Input
              label="Buscar no histórico"
              id="search-audit"
              type="search"
              placeholder="Buscar por ação ou registro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="admin-toolbar-filters">
            <Select
              label="Entidade"
              value={entityFilter}
              options={entityOptions}
              onChange={(e) => setEntityFilter(e.target.value)}
            />
          </div>
        </div>
      )}

      {error ? (
        <ErrorState message="Não foi possível carregar o histórico de auditoria." onRetry={load} />
      ) : loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<ScrollText size={40} aria-hidden="true" />}
          title={logs.length === 0 ? 'Nenhum registro de auditoria' : 'Nenhum registro encontrado'}
          description={
            logs.length === 0
              ? 'As ações dos administradores aparecerão aqui conforme forem realizadas.'
              : 'Tente ajustar a busca ou os filtros.'
          }
        />
      ) : (
        <Table<AuditLog>
          columns={[
            {
              key: 'action',
              header: 'Ação',
              render: (log) => {
                const meta = actionBadge(log.action);
                return <Badge variant={meta.variant}>{meta.label}</Badge>;
              },
            },
            {
              key: 'entity_type',
              header: 'Entidade',
              render: (log) => entityLabel(log.entity_type),
            },
            {
              key: 'entity_id',
              header: 'Registro',
              render: (log) => (log.entity_id ? log.entity_id.slice(0, 8) + '…' : '—'),
            },
            {
              key: 'metadata',
              header: 'Detalhes',
              render: (log) => {
                if (!log.metadata) return '—';
                const entries = Object.entries(log.metadata).slice(0, 3);
                return entries
                  .map(([key, value]) => `${key}: ${String(value)}`)
                  .join(' · ');
              },
            },
            {
              key: 'created_at',
              header: 'Data e hora',
              render: (log) => formatDateTime(log.created_at),
            },
          ]}
          data={filtered}
          keyExtractor={(log) => log.id}
          emptyMessage="Nenhum registro encontrado para a busca."
        />
      )}
    </div>
  );
}
