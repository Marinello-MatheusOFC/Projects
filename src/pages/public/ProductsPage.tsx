import { EmptyState } from '@/components/feedback/EmptyState';
import { Input } from '@/components/ui/Input';
export default function ProductsPage() {
  return (
    <div className="products-page">
      <section className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Brechó Beneficente</h1>
          <p className="page-hero-subtitle">
            Compre no nosso brechó e contribua com a causa animal.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="products-search">
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

          <div className="products-notice">
            <p>
              A compra é combinada diretamente com a ONG. Entre em contato para
              mais informações sobre os produtos.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
