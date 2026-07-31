import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Newspaper, Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { Alert } from '@/components/feedback/Alert';
import { fetchAdminNews, deleteNews, type NewsWithImage } from '@/services/news';
import { formatDate } from '@/lib/format';

const statusConfig: Record<NewsWithImage['status'], { label: string; variant: 'success' | 'warning' }> = {
  draft: { label: 'Rascunho', variant: 'warning' },
  published: { label: 'Publicada', variant: 'success' },
};

export default function AdminNewsPage() {
  const [news, setNews] = useState<NewsWithImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deleteError, setDeleteError] = useState(false);
  const [search, setSearch] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchAdminNews()
      .then((rows) => {
        if (active) {
          setNews(rows);
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
    if (!term) return news;
    return news.filter((item) => item.title.toLowerCase().includes(term));
  }, [news, search]);

  const handleDelete = async (item: NewsWithImage) => {
    if (!window.confirm(`Excluir a notícia "${item.title}"?`)) return;
    try {
      await deleteNews(item.id);
      setReloadKey((key) => key + 1);
    } catch {
      setDeleteError(true);
    }
  };

  const columns = [
    { key: 'title', header: 'Título', render: (item: NewsWithImage) => item.title },
    {
      key: 'published_at',
      header: 'Data de publicação',
      render: (item: NewsWithImage) => formatDate(item.published_at) || '—',
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: NewsWithImage) => {
        const config = statusConfig[item.status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
      },
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: NewsWithImage) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to={`/admin/noticias/${item.id}/editar`}>
            <Button variant="ghost" size="sm" aria-label={`Editar notícia ${item.title}`}>
              <Pencil size={16} aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Excluir notícia ${item.title}`}
            onClick={() => handleDelete(item)}
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
          label="Buscar notícia"
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por título..."
          id="search-news"
        />
      </div>
      <Link to="/admin/noticias/novo">
        <Button>
          <Plus size={18} aria-hidden="true" />
          Nova Notícia
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Notícias</h2>
      <p className="admin-page-subtitle">Gerencie as notícias publicadas no site.</p>
      {header}

      {deleteError && (
        <Alert type="error" message="Não foi possível excluir a notícia." onClose={() => setDeleteError(false)} />
      )}

      {error ? (
        <ErrorState
          message="Não foi possível carregar as notícias."
          onRetry={() => setReloadKey((key) => key + 1)}
        />
      ) : loading ? (
        <TableSkeleton />
      ) : news.length === 0 ? (
        <EmptyState
          icon={<Newspaper size={48} aria-hidden="true" />}
          title="Nenhuma notícia cadastrada"
          description="Cadastre a primeira notícia para começar."
          action={
            <Link to="/admin/noticias/novo">
              <Button>Cadastrar Notícia</Button>
            </Link>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(item) => item.id}
          emptyMessage="Nenhuma notícia encontrada para a busca."
        />
      )}
    </div>
  );
}
