import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Archive, RotateCcw, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ConfirmDialog } from '@/components/feedback/ConfirmDialog';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import {
  fetchAdminAnimals,
  updateAnimal,
  archiveAnimal,
  restoreAnimal,
  type AnimalWithImages,
} from '@/services/animals';
import { logAudit } from '@/services/audit';
import { speciesLabel, sizeLabel } from '@/lib/format';
import type { AnimalStatus } from '@/types';

const statusMeta: Record<AnimalStatus, { label: string; variant: 'success' | 'warning' | 'default' }> = {
  available: { label: 'Disponível', variant: 'success' },
  in_process: { label: 'Em processo', variant: 'warning' },
  adopted: { label: 'Adotado', variant: 'default' },
  archived: { label: 'Arquivado', variant: 'default' },
};

export default function AdminAnimalsPage() {
  const [animals, setAnimals] = useState<AnimalWithImages[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | AnimalStatus>('all');
  const [confirmArchive, setConfirmArchive] = useState<AnimalWithImages | null>(null);
  const [confirmRestore, setConfirmRestore] = useState<AnimalWithImages | null>(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadAnimals = useCallback(() => {
    let active = true;
    setLoading(true);
    setError(false);
    fetchAdminAnimals()
      .then((data) => {
        if (active) setAnimals(data);
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
    document.title = 'Animais — SOS Focinho Carente';
  }, []);

  useEffect(() => loadAnimals(), [loadAnimals]);

  const flash = (message: string) => {
    setActionNotice(message);
    window.setTimeout(() => setActionNotice(null), 4000);
  };

  const handleArchive = async () => {
    if (!confirmArchive) return;
    setBusy(true);
    setActionError(false);
    try {
      await archiveAnimal(confirmArchive.id);
      await logAudit('arquivar', 'animal', confirmArchive.id, { name: confirmArchive.name });
      setConfirmArchive(null);
      loadAnimals();
      flash(`"${confirmArchive.name}" arquivado e removido do portal.`);
    } catch {
      setActionError(true);
      setConfirmArchive(null);
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (!confirmRestore) return;
    setBusy(true);
    setActionError(false);
    try {
      await restoreAnimal(confirmRestore.id);
      await logAudit('restaurar', 'animal', confirmRestore.id, { name: confirmRestore.name });
      setConfirmRestore(null);
      loadAnimals();
      flash(`"${confirmRestore.name}" restaurado e disponível para adoção.`);
    } catch {
      setActionError(true);
      setConfirmRestore(null);
    } finally {
      setBusy(false);
    }
  };

  const handleToggleFeatured = async (animal: AnimalWithImages) => {
    setBusy(true);
    setActionError(false);
    try {
      const next = !animal.featured;
      await updateAnimal(animal.id, { featured: next });
      await logAudit(next ? 'destacar' : 'remover_destaque', 'animal', animal.id, { name: animal.name });
      setAnimals((prev) => prev.map((a) => (a.id === animal.id ? { ...a, featured: next } : a)));
      flash(next ? `"${animal.name}" destacado no portal.` : `Destaque de "${animal.name}" removido.`);
    } catch {
      setActionError(true);
    } finally {
      setBusy(false);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return animals.filter((animal) => {
      if (statusFilter !== 'all' && animal.status !== statusFilter) return false;
      if (!term) return true;
      return animal.name.toLowerCase().includes(term);
    });
  }, [animals, search, statusFilter]);

  const columns: {
    key: keyof AnimalWithImages | string;
    header: string;
    render: (animal: AnimalWithImages) => ReactNode;
  }[] = [
    {
      key: 'cover',
      header: 'Foto',
      render: (animal) => (
        <ResponsivePicture
          src={animal.cover}
          width={80}
          height={60}
          fallback="animal"
          alt={`Foto de ${animal.name}`}
        />
      ),
    },
    {
      key: 'name',
      header: 'Nome',
      render: (animal) => (
        <Link to={`/admin/animais/${animal.id}`}>{animal.name}</Link>
      ),
    },
    { key: 'species', header: 'Espécie', render: (animal) => speciesLabel(animal.species) },
    { key: 'size', header: 'Porte', render: (animal) => sizeLabel(animal.size) },
    {
      key: 'status',
      header: 'Status',
      render: (animal) => {
        const meta = statusMeta[animal.status];
        return <Badge variant={meta.variant}>{meta.label}</Badge>;
      },
    },
    {
      key: 'published',
      header: 'Publicação',
      render: (animal) => (
        <Badge variant={animal.published ? 'success' : 'default'}>
          {animal.published ? 'Publicado' : 'Rascunho'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (animal) => (
        <div className="admin-table-actions">
          <button
            type="button"
            className={`admin-icon-btn ${animal.featured ? 'admin-icon-btn--active' : ''}`}
            aria-label={animal.featured ? `Remover destaque de ${animal.name}` : `Destacar ${animal.name}`}
            title={animal.featured ? 'Remover destaque' : 'Destacar'}
            disabled={busy}
            onClick={() => handleToggleFeatured(animal)}
          >
            <Star size={18} aria-hidden="true" />
          </button>
          <Link
            to={`/admin/animais/${animal.id}/editar`}
            className="admin-icon-btn"
            aria-label={`Editar ${animal.name}`}
            title={`Editar ${animal.name}`}
          >
            <Pencil size={18} aria-hidden="true" />
          </Link>
          {animal.status === 'archived' ? (
            <button
              type="button"
              className="admin-icon-btn"
              aria-label={`Restaurar ${animal.name}`}
              title="Restaurar"
              disabled={busy}
              onClick={() => setConfirmRestore(animal)}
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              className="admin-icon-btn admin-icon-btn--danger"
              aria-label={`Arquivar ${animal.name}`}
              title={`Arquivar ${animal.name}`}
              disabled={busy}
              onClick={() => setConfirmArchive(animal)}
            >
              <Archive size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const header = (
    <div className="admin-toolbar">
      <div className="admin-toolbar-search">
        <Input
          label="Buscar animal"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nome..."
          id="search-animal"
        />
      </div>
      <div className="admin-toolbar-filters">
        <select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | AnimalStatus)}
          className="form-select"
        >
          <option value="all">Todos os status</option>
          <option value="available">Disponível</option>
          <option value="in_process">Em processo</option>
          <option value="adopted">Adotado</option>
          <option value="archived">Arquivado</option>
        </select>
        <Link to="/admin/animais/novo">
          <Button>
            <Plus size={18} aria-hidden="true" />
            Novo Animal
          </Button>
        </Link>
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Animais</h1>
          <p className="admin-page-subtitle">Gerencie os animais cadastrados para adoção.</p>
        </div>
      </div>

      {actionError && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="error" message="Não foi possível concluir a ação." onClose={() => setActionError(false)} />
        </div>
      )}
      {actionNotice && (
        <div style={{ marginBottom: '1rem' }}>
          <Alert type="success" message={actionNotice} onClose={() => setActionNotice(null)} />
        </div>
      )}

      {header}

      {error ? (
        <ErrorState message="Não foi possível carregar os animais." onRetry={loadAnimals} />
      ) : loading ? (
        <TableSkeleton />
      ) : animals.length === 0 ? (
        <EmptyState
          title="Nenhum animal cadastrado"
          description="Cadastre o primeiro animal para começar."
          action={
            <Link to="/admin/animais/novo">
              <Button>Cadastrar Animal</Button>
            </Link>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          keyExtractor={(animal) => animal.id}
          emptyMessage="Nenhum animal encontrado com os filtros atuais."
        />
      )}

      <ConfirmDialog
        isOpen={!!confirmArchive}
        onClose={() => setConfirmArchive(null)}
        title="Arquivar animal"
        message={
          <>
            Tem certeza que deseja arquivar <strong>{confirmArchive?.name}</strong>? Ele será
            removido do portal público.
          </>
        }
        confirmLabel="Arquivar"
        loading={busy}
        onConfirm={handleArchive}
      />

      <ConfirmDialog
        isOpen={!!confirmRestore}
        onClose={() => setConfirmRestore(null)}
        title="Restaurar animal"
        message={
          <>
            Tem certeza que deseja restaurar <strong>{confirmRestore?.name}</strong>? Ele voltará
            a aparecer como disponível para adoção no portal.
          </>
        }
        confirmLabel="Restaurar"
        loading={busy}
        onConfirm={handleRestore}
      />
    </div>
  );
}
