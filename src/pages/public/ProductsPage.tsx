import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { fetchProducts, type ProductWithImage } from '@/services/products';
import { formatPrice } from '@/lib/format';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithImage[] | null>(null);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Brechó — SOS Focinho Carente';
  }, []);

  useEffect(() => {
    let active = true;
    setProducts(null);
    setError(false);
    fetchProducts()
      .then((result) => {
        if (active) setProducts(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [reload]);

  const normalized = query.trim().toLowerCase();
  const filtered = (products ?? []).filter((product) => {
    if (!normalized) return true;
    return (
      product.name.toLowerCase().includes(normalized) ||
      (product.description ?? '').toLowerCase().includes(normalized)
    );
  });

  return (
    <div>
      <PageHeader
        eyebrow="Brechó beneficente"
        title="Brechó Beneficente"
        subtitle="Suas compras ajudam a manter nossos projetos."
        media={{
          src: '/images/demo/animal-paw.jpg',
          alt: 'Brechó beneficente da ONG',
          objectPosition: 'center 50%',
          fallback: 'product',
        }}
      />

      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 'var(--space-6)', maxWidth: 480 }}>
            <Input
              label="Buscar produtos"
              type="search"
              placeholder="O que você procura?"
              id="search-products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {error ? (
            <ErrorState
              message="Não conseguimos carregar os produtos agora."
              onRetry={() => setReload((value) => value + 1)}
            />
          ) : products === null ? (
            <div className="products-grid" aria-label="Carregando produtos">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={48} aria-hidden="true" />}
              title="Nenhum produto disponível"
              description="Em breve teremos novidades no brechó."
            />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<ShoppingBag size={48} aria-hidden="true" />}
              title="Nenhum produto encontrado"
              description="Tente buscar por outro nome ou termo."
              action={
                <Button variant="outline" onClick={() => setQuery('')}>
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <>
              <div className="products-grid">
                {filtered.map((product) => (
                  <Link
                    key={product.slug}
                    to={`/brecho/${product.slug}`}
                    className="adoption-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="adoption-card-image">
                      <ResponsivePicture
                        src={product.image}
                        alt={product.name}
                        objectFit="cover"
                        width={600}
                        height={450}
                        fallback="product"
                      />
                    </div>
                    <div className="adoption-card-body">
                      <div className="adoption-card-name">{product.name}</div>
                      <div className="adoption-card-details">
                        <span className="adoption-card-detail">{formatPrice(product.price)}</span>
                        <span className={`badge badge--${product.available ? 'success' : 'error'}`}>
                          {product.available ? 'Disponível' : 'Esgotado'}
                        </span>
                      </div>
                      <div className="adoption-card-action">
                        <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>
                          Ver produto <ArrowRight size={14} aria-hidden="true" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="section-actions">
                <Link to="/contato">
                  <Button variant="outline">
                    <Heart size={16} aria-hidden="true" />
                    Contribuir com a ONG
                  </Button>
                </Link>
              </div>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <p>A compra é combinada diretamente com a ONG. Entre em contato para mais informações.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
