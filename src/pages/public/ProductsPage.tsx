import { EmptyState } from '@/components/feedback/EmptyState';
import { Input } from '@/components/ui/Input';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';

export default function ProductsPage() {
  return (
    <div>
      <section className="page-hero">
        <div className="page-hero-photo">
          <ResponsivePicture
            src="/images/demo/animal-paw.jpg"
            alt="Brechó beneficente"
            objectFit="cover"
            objectPosition="center 50%"
            priority
            width={1920}
            height={600}
            fallback="gallery"
          />
        </div>
        <div className="page-hero-overlay" />
        <div className="container">
          <h1 className="page-hero-title">Brechó Beneficente</h1>
          <p className="page-hero-subtitle">
            Suas compras ajudam a manter nossos projetos.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div style={{ marginBottom: 'var(--space-6)' }}>
            <Input
              label="Buscar produtos"
              type="search"
              placeholder="O que você procura?"
              id="search-products"
            />
          </div>

          <EmptyState
            title="Nenhum produto disponível"
            description="Em breve teremos novidades no brechó."
          />

          <div style={{ textAlign: 'center', marginTop: 'var(--space-6)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
            <p>A compra é combinada diretamente com a ONG. Entre em contato para mais informações.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
