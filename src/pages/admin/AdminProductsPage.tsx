import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Table } from '@/components/ui/Table';
import { TableSkeleton } from '@/components/feedback/Skeleton';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { fetchAdminProducts, deleteProduct, type ProductWithImage } from '@/services/products';
import { logAudit } from '@/services/audit';
import { formatPrice } from '@/lib/format';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithImage[] | null>(null);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    document.title = 'Produtos — SOS Focinho Carente';
    let active = true;
    fetchAdminProducts()
      .then((data) => {
        if (active) setProducts(data);
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
    setProducts(null);
    fetchAdminProducts()
      .then(setProducts)
      .catch(() => setError(true));
  };

  const filtered = useMemo(() => {
    if (!products) return [];
    const query = search.trim().toLowerCase();
    if (!query) return products;
    return products.filter((p) => p.name.toLowerCase().includes(query));
  }, [products, search]);

  const handleDelete = async (product: ProductWithImage) => {
    if (!window.confirm(`Excluir o produto "${product.name}"?`)) return;
    try {
      await deleteProduct(product.id);
      await logAudit('excluir', 'product', product.id, { name: product.name });
      await load();
    } catch {
      setError(true);
    }
  };

  const toolbar = (
    <div className="admin-toolbar">
      <div className="admin-toolbar-search">
        <Input
          label="Buscar produto"
          id="search-product"
          type="search"
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <Link to="/admin/produtos/novo">
        <Button>
          <Plus size={18} aria-hidden="true" />
          Novo Produto
        </Button>
      </Link>
    </div>
  );

  if (error) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Produtos</h2>
        <p className="admin-page-subtitle">Gerenciamento do brechó beneficente.</p>
        {toolbar}
        <ErrorState message="Não foi possível carregar os produtos." onRetry={load} />
      </div>
    );
  }

  if (products === null) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Produtos</h2>
        <p className="admin-page-subtitle">Gerenciamento do brechó beneficente.</p>
        {toolbar}
        <TableSkeleton />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="admin-page">
        <h2 className="admin-page-title">Produtos</h2>
        <p className="admin-page-subtitle">Gerenciamento do brechó beneficente.</p>
        {toolbar}
        <EmptyState
          icon={<Package size={40} aria-hidden="true" />}
          title="Nenhum produto cadastrado"
          description="Cadastre o primeiro produto do brechó para começar."
          action={
            <Link to="/admin/produtos/novo">
              <Button>
                <Plus size={18} aria-hidden="true" />
                Novo Produto
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="admin-page">
      <h2 className="admin-page-title">Produtos</h2>
      <p className="admin-page-subtitle">Gerenciamento do brechó beneficente.</p>
      {toolbar}

      <Table<ProductWithImage>
        columns={[
          { key: 'name', header: 'Nome', render: (p) => <strong>{p.name}</strong> },
          { key: 'price', header: 'Preço', render: (p) => formatPrice(p.price) },
          {
            key: 'available',
            header: 'Disponível',
            render: (p) => (
              <Badge variant={p.available ? 'success' : 'default'}>
                {p.available ? 'Sim' : 'Não'}
              </Badge>
            ),
          },
          {
            key: 'published',
            header: 'Publicado',
            render: (p) => (
              <Badge variant={p.published ? 'success' : 'default'}>
                {p.published ? 'Sim' : 'Não'}
              </Badge>
            ),
          },
          {
            key: 'actions',
            header: 'Ações',
            render: (p) => (
              <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                <Link to={`/admin/produtos/${p.id}/editar`}>
                  <Button variant="ghost" size="sm">
                    <Pencil size={14} aria-hidden="true" />
                    Editar
                  </Button>
                </Link>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(p)}
                  aria-label={`Excluir ${p.name}`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                  Excluir
                </Button>
              </div>
            ),
          },
        ]}
        data={filtered}
        keyExtractor={(p) => p.id}
        emptyMessage="Nenhum produto encontrado para a busca."
      />
    </div>
  );
}
