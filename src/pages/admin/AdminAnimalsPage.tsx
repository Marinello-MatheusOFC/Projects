import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';

export default function AdminAnimalsPage() {
  const [loading] = useState(false);
  const [error] = useState(false);
  const [search] = useState('');

  const header = (
    <div className="admin-toolbar">
      <div className="admin-toolbar-search">
        <Input
          label="Buscar animal"
          type="search"
          value={search}
          onChange={() => {}}
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

  if (error) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Animais</h2>
        {header}
        <ErrorState message="Não foi possível carregar os animais." />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Animais</h2>
      {header}

      {loading ? (
        <TableSkeleton />
      ) : (
        <EmptyState
          title="Nenhum animal cadastrado"
          description="Cadastre o primeiro animal para começar."
          action={
            <Link to="/admin/animais/novo">
              <Button>Cadastrar Animal</Button>
            </Link>
          }
        />
      )}
    </div>
  );
}
