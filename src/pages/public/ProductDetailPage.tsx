import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { fetchProductBySlug, type ProductWithImage } from '@/services/products';
import { formatPrice } from '@/lib/format';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<ProductWithImage | null | undefined>(undefined);
  const [error, setError] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    setProduct(undefined);
    setError(false);
    fetchProductBySlug(slug)
      .then((result) => {
        if (active) setProduct(result);
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, [slug, reload]);

  useEffect(() => {
    document.title = product ? `${product.name} — SOS Focinho Carente` : 'Brechó — SOS Focinho Carente';
  }, [product]);

  if (product === undefined) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <div className="skeleton" style={{ aspectRatio: '16 / 10', marginBottom: 'var(--space-6)' }} aria-hidden="true" />
            <div className="skeleton skeleton-title" aria-hidden="true" />
            <div className="skeleton skeleton-text" aria-hidden="true" />
            <div className="skeleton skeleton-text short" aria-hidden="true" />
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <Link to="/brecho" className="back-link">
              <ChevronLeft size={20} aria-hidden="true" />
              Voltar para o brechó
            </Link>
            <div className="error-state" role="alert">
              <h1 className="error-state-title">Não foi possível carregar o produto</h1>
              <p className="error-state-message">
                Não conseguimos carregar as informações deste item agora. Tente novamente.
              </p>
              <Button variant="outline" onClick={() => setReload((value) => value + 1)}>
                Tentar novamente
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <Link to="/brecho" className="back-link">
              <ChevronLeft size={20} aria-hidden="true" />
              Voltar para o brechó
            </Link>
            <div className="empty-state">
              <h1 className="empty-state-title">Produto não encontrado</h1>
              <p className="empty-state-description">O produto que você procura não está disponível.</p>
              <Link to="/brecho">
                <Button variant="outline">Ver todos os produtos</Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <Link to="/brecho" className="back-link">
            <ChevronLeft size={20} aria-hidden="true" />
            Voltar para o brechó
          </Link>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-6)' }}>
        <div className="container">
          <div className="animal-detail-gallery">
            <div className="animal-detail-main-image">
              <ResponsivePicture
                src={product.image}
                alt={`${product.name} — foto do produto`}
                objectFit="cover"
                objectPosition="center 50%"
                width={1200}
                height={750}
                fallback="product"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 'var(--space-8)' }}>
        <div className="container">
          <div className="animal-detail-layout">
            <div className="animal-detail-main">
              <div className="animal-detail-header">
                <h1 className="animal-detail-name">{product.name}</h1>
                <div className="animal-detail-status">
                  <Badge variant={product.available ? 'success' : 'default'}>
                    {product.available ? 'Disponível' : 'Esgotado'}
                  </Badge>
                </div>
              </div>

              <div className="animal-detail-section">
                <h2>Sobre este item</h2>
                <p>{product.description || 'Mais detalhes deste item serão compartilhados em breve.'}</p>
              </div>
            </div>

            <aside className="animal-detail-sidebar">
              <div className="detail-card">
                <h3>Informações</h3>
                <dl className="detail-list">
                  <div className="detail-row">
                    <dt><Tag size={14} aria-hidden="true" /> Preço</dt>
                    <dd>{formatPrice(product.price)}</dd>
                  </div>
                  <div className="detail-row">
                    <dt>Disponibilidade</dt>
                    <dd>{product.available ? 'Disponível' : 'Esgotado'}</dd>
                  </div>
                </dl>
              </div>

              <div className="detail-card detail-card--cta">
                <h3>Tenho interesse</h3>
                <p>
                  A compra é combinada diretamente com a ONG. Fale conosco para reservar este item.
                </p>
                {product.available ? (
                  <Link to="/contato">
                    <Button size="lg" fullWidth>
                      Tenho interesse <ArrowRight size={16} aria-hidden="true" />
                    </Button>
                  </Link>
                ) : (
                  <Button size="lg" fullWidth disabled>
                    Produto esgotado
                  </Button>
                )}
              </div>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
