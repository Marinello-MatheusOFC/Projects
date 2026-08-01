import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { fetchAdoptionApplications } from '@/services/applications';
import { fetchAdminAnimals, type AnimalWithImages } from '@/services/animals';
import type { AdoptionApplication, AdoptionStatus } from '@/types';
import { adoptionStatusLabels } from '@/utils';
import { formatDate } from '@/lib/format';

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

export default function AdminAdoptionsPage() {
  const [applications, setApplications] = useState<AdoptionApplication[] | null>(null);
  const [animals, setAnimals] = useState<AnimalWithImages[]>([]);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Adoções — SOS Focinho Carente';
    let active = true;
    Promise.all([fetchAdoptionApplications(), fetchAdminAnimals()])
      .then(([apps, animalList]) => {
        if (active) {
          setApplications(apps);
          setAnimals(animalList);
        }
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
    setApplications(null);
    Promise.all([fetchAdoptionApplications(), fetchAdminAnimals()])
      .then(([apps, animalList]) => {
        setApplications(apps);
        setAnimals(animalList);
      })
      .catch(() => setError(true));
  };

  const filtered = useMemo(() => {
    if (!applications) return [];
    const query = search.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter(
      (a) =>
        a.applicant_name.toLowerCase().includes(query) ||
        a.city.toLowerCase().includes(query),
    );
  }, [applications, search]);

  const animalName = (animalId: string): string => {
    const found = animals.find((a) => a.id === animalId);
    return found ? found.name : `${animalId.slice(0, 8)}...`;
  };

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Solicitações de Adoção</h1>
        </div>
        <ErrorState message="Não foi possível carregar as solicitações." onRetry={load} />
      </div>
    );
  }

  if (applications === null) {
    return (
      <div className="admin-page">
        <div className="admin-page-header">
          <h1 className="admin-page-title">Solicitações de Adoção</h1>
        </div>
        <TableSkeleton />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Solicitações de Adoção</h1>
          <p className="admin-page-subtitle">
            Acompanhe e atualize o andamento das solicitações de adoção.
          </p>
        </div>
      </div>

      {applications.length > 0 && (
        <div className="admin-toolbar">
          <div className="admin-toolbar-search">
            <Input
              label="Buscar solicitação"
              id="search-adoption"
              type="search"
              placeholder="Buscar por nome ou cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      )}

      {applications.length === 0 ? (
        <EmptyState
          icon={<HeartHandshake size={40} aria-hidden="true" />}
          title="Nenhuma solicitação de adoção"
          description="As solicitações enviadas pelo formulário de adoção aparecerão aqui."
        />
      ) : (
        <Table<AdoptionApplication>
          columns={[
            {
              key: 'applicant_name',
              header: 'Nome',
              render: (a) => (
                <Link to={`/admin/adocoes/${a.id}`}>
                  <strong>{a.applicant_name}</strong>
                </Link>
              ),
            },
            { key: 'animal_id', header: 'Animal', render: (a) => animalName(a.animal_id) },
            { key: 'city', header: 'Cidade', render: (a) => a.city || '—' },
            { key: 'created_at', header: 'Data', render: (a) => formatDate(a.created_at) },
            {
              key: 'status',
              header: 'Status',
              render: (a) => (
                <Badge variant={adoptionBadgeVariant(a.status)}>
                  {adoptionStatusLabels[a.status] ?? a.status}
                </Badge>
              ),
            },
            {
              key: 'actions',
              header: 'Ações',
              render: (a) => (
                <Link to={`/admin/adocoes/${a.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye size={14} aria-hidden="true" />
                    Detalhes
                  </Button>
                </Link>
              ),
            },
          ]}
          data={filtered}
          keyExtractor={(a) => a.id}
          emptyMessage="Nenhuma solicitação encontrada para a busca."
        />
      )}
    </div>
  );
}
