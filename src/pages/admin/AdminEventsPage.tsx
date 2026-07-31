import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Alert } from '@/components/feedback/Alert';
import { fetchAdminEvents, deleteEvent, type EventWithImage } from '@/services/events';
import { formatDate } from '@/lib/format';

const statusConfig: Record<EventWithImage['status'], { label: string; variant: 'success' | 'error' | 'default' }> = {
  scheduled: { label: 'Agendado', variant: 'success' },
  cancelled: { label: 'Cancelado', variant: 'error' },
  completed: { label: 'Concluído', variant: 'default' },
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchAdminEvents()
      .then((rows) => {
        if (active) {
          setEvents(rows);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return events;
    return events.filter((event) => event.title.toLowerCase().includes(term));
  }, [events, search]);

  const handleDelete = async (event: EventWithImage) => {
    if (!window.confirm(`Excluir o evento "${event.title}"?`)) return;
    try {
      await deleteEvent(event.id);
      setReloadKey((key) => key + 1);
    } catch {
      setDeleteError(true);
    }
  };

  const columns = [
    { key: 'title', header: 'Título', render: (event: EventWithImage) => event.title },
    {
      key: 'start_at',
      header: 'Data',
      render: (event: EventWithImage) => formatDate(event.start_at) || '—',
    },
    {
      key: 'location_name',
      header: 'Local',
      render: (event: EventWithImage) => event.location_name ?? event.address ?? '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (event: EventWithImage) => {
        const config = statusConfig[event.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'published',
      header: 'Publicado',
      render: (event: EventWithImage) => (event.published ? 'Sim' : 'Não'),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (event: EventWithImage) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to={`/admin/eventos/${event.id}/editar`}>
            <Button variant="ghost" size="sm" aria-label={`Editar evento ${event.title}`}>
              <Pencil size={16} aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Excluir evento ${event.title}`}
            onClick={() => handleDelete(event)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </Button>
        </div>
      ),
    },
  ];

  const header = (
    <div className="admin-toolbar">
      <div className="admin-toolbar-search">
        <Input
          label="Buscar evento"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por título..."
          id="search-event"
        />
      </div>
      <Link to="/admin/eventos/novo">
        <Button>
          <Plus size={18} aria-hidden="true" />
          Novo Evento
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Eventos</h2>
      <p className="admin-page-subtitle">Gerencie os eventos divulgados no site.</p>
      {header}

      {deleteError && (
        <Alert type="error" message="Não foi possível excluir o evento." onClose={() => setDeleteError(false)} />
      )}

      {error ? (
        <ErrorState
          message="Não foi possível carregar os eventos."
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : loading ? (
        <TableSkeleton />
      ) : events.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} aria-hidden="true" />}
          title="Nenhum evento cadastrado"
          description="Cadastre o primeiro evento para começar."
          action={
            <Link to="/admin/eventos/novo">
              <Button>Cadastrar Evento</Button>
            </Link>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(event) => event.id}
          emptyMessage="Nenhum evento encontrado para a busca."
        />
      )}
    </div>
  );
}
