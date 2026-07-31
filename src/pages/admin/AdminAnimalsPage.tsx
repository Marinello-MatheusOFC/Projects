import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Archive, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Alert } from '@/components/feedback/Alert';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { fetchAdminAnimals, archiveAnimal, type AnimalWithImages } from '@/services/animals';
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
  const [archivingId, setArchivingId] = useState<string | null>(null);
  const [archiveError, setArchiveError] = useState(false);

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

  useEffect(() => loadAnimals(), [loadAnimals]);

  const handleArchive = async (animal: AnimalWithImages) => {
    if (!window.confirm(`Tem certeza que deseja arquivar "${animal.name}"?`)) return;
    setArchivingId(animal.id);
    setArchiveError(false);
    try {
      await archiveAnimal(animal.id);
      loadAnimals();
    } catch {
      setArchiveError(true);
    } finally {
      setArchivingId(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return animals;
    return animals.filter((animal) => animal.name.toLowerCase().includes(term));
  }, [animals, search]);

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
    { key: 'name', header: 'Nome', render: (animal) => animal.name },
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
      key: 'featured',
      header: 'Destacado',
      render: (animal) =>
        animal.featured ? (
          <Star size={18} aria-label="Destacado" fill="currentColor" />
        ) : (
          <span aria-hidden="true">—</span>
        ),
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (animal) => (
        <div style={{ display: 'flex', gap: 'var(--space-1)', alignItems: 'center' }}>
          <Link to={`/admin/animais/${animal.id}/editar`} aria-label={`Editar ${animal.name}`}>
            <Button variant="ghost" size="sm" title={`Editar ${animal.name}`}>
              <Pencil size={16} aria-hidden="true" />
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Arquivar ${animal.name}`}
            title={`Arquivar ${animal.name}`}
            onClick={() => handleArchive(animal)}
            disabled={archivingId === animal.id}
          >
            <Archive size={16} aria-hidden="true" />
          </Button>
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
      <Link to="/admin/animais/novo">
        <Button>
          <Plus size={18} aria-hidden="true" />
          Novo Animal
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Animais</h2>
      <p className="admin-page-subtitle">Gerencie os animais cadastrados para adoção.</p>
      {header}

      {archiveError && (
        <Alert
          type="error"
          message="Não foi possível arquivar o animal."
          onClose={() => setArchiveError(false)}
        />
      )}

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
          emptyMessage="Nenhum animal encontrado com esse nome."
        />
      )}
    </div>
  );
}
