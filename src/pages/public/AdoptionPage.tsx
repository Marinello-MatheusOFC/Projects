import { useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { speciesLabels, sexLabels, sizeLabels } from '@/utils';

const speciesOptions = Object.entries(speciesLabels).map(([value, label]) => ({ value, label }));
const sexOptions = Object.entries(sexLabels).map(([value, label]) => ({ value, label }));
const sizeOptions = Object.entries(sizeLabels).map(([value, label]) => ({ value, label }));

const dummyAnimals = [
  { id: '1', name: 'Luna', species: 'Cachorro', sex: 'Fêmea', size: 'Médio', status: 'available', slug: 'luna' },
  { id: '2', name: 'Toddy', species: 'Cachorro', sex: 'Macho', size: 'Pequeno', status: 'available', slug: 'toddy' },
  { id: '3', name: 'Mel', species: 'Gato', sex: 'Fêmea', size: 'Pequeno', status: 'available', slug: 'mel' },
  { id: '4', name: 'Thor', species: 'Cachorro', sex: 'Macho', size: 'Grande', status: 'in_process', slug: 'thor' },
  { id: '5', name: 'Pipoca', species: 'Gato', sex: 'Fêmea', size: 'Pequeno', status: 'available', slug: 'pipoca' },
  { id: '6', name: 'Bolinha', species: 'Cachorro', sex: 'Macho', size: 'Médio', status: 'available', slug: 'bolinha' },
];

export default function AdoptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const loading = false;
  const [error, setError] = useState(false);

  const name = searchParams.get('nome') || '';
  const species = searchParams.get('especie') || '';
  const sex = searchParams.get('sexo') || '';
  const size = searchParams.get('porte') || '';

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      params.set('pagina', '1');
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const hasFilters = name || species || sex || size;

  const animals = dummyAnimals;

  if (error) {
    return (
      <div>
        <section className="section">
          <div className="container">
            <ErrorState
              message="Não conseguimos carregar os animais agora."
              onRetry={() => setError(false)}
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>

      {/* Abertura */}
      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="container">
          <div className="adoption-header">
            <h1>Talvez um desses olhares esteja esperando encontrar você.</h1>
            <p>
              Cada animal tem sua própria história. Conheça quem está disponível
              e descubra se um deles tem a ver com você.
            </p>
          </div>

          <div className="filters-bar" role="search" aria-label="Filtrar animais">
            <div className="form-field" style={{ marginBottom: 0, minWidth: 200, flex: 2 }}>
              <label htmlFor="search-name" className="form-label">Buscar por nome</label>
              <input
                id="search-name"
                className="form-input"
                type="search"
                value={name}
                onChange={(e) => updateFilter('nome', e.target.value)}
                placeholder="Digite um nome..."
                style={{ padding: '0.625rem 0.875rem' }}
              />
            </div>
            <Select
              label="Espécie"
              value={species}
              onChange={(e) => updateFilter('especie', e.target.value)}
              options={speciesOptions}
              placeholder="Todas"
            />
            <Select
              label="Sexo"
              value={sex}
              onChange={(e) => updateFilter('sexo', e.target.value)}
              options={sexOptions}
              placeholder="Todos"
            />
            <Select
              label="Porte"
              value={size}
              onChange={(e) => updateFilter('porte', e.target.value)}
              options={sizeOptions}
              placeholder="Todos"
            />
            {hasFilters && (
              <Button variant="ghost" onClick={clearFilters} style={{ marginTop: 'auto' }}>
                <X size={16} aria-hidden="true" />
                Limpar
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Listagem */}
      <section className="section">
        <div className="container">
          {loading ? (
            <div className="adoption-grid" aria-label="Carregando animais">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : animals.length > 0 ? (
            <>
              <p style={{ marginBottom: 'var(--space-4)', color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>
                {animals.length} animal(is) encontrado(s)
              </p>
              <div className="adoption-grid">
                {animals.map((animal) => (
                  <Link
                    key={animal.id}
                    to={`/adocao/${animal.slug}`}
                    className="adoption-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="adoption-card-image">
                      <ResponsivePicture
                        src="/placeholder-animal.jpg"
                        alt={`${animal.name}, ${animal.species}`}
                        objectFit="cover"
                        objectPosition={animal.slug === 'luna' ? 'center 40%' : animal.slug === 'toddy' ? 'center 30%' : 'center 50%'}
                        width={600}
                        height={450}
                      />
                    </div>
                    <div className="adoption-card-body">
                      <div className="adoption-card-name">{animal.name}</div>
                      <div className="adoption-card-details">
                        <span className="adoption-card-detail">{animal.species}</span>
                        <span className="adoption-card-detail">{animal.sex}</span>
                        <span className="adoption-card-detail">Porte {animal.size}</span>
                      </div>
                      <div className="adoption-card-action">
                        <Button variant="outline" size="sm" style={{ pointerEvents: 'none' }}>
                          Conhecer {animal.name} <span aria-hidden="true">→</span>
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            <div className="animals-empty">
              <EmptyState
                title="Nenhum animal encontrado"
                description="Tente ajustar os filtros ou buscar por outro nome."
                action={
                  hasFilters ? (
                    <Button variant="outline" onClick={clearFilters}>
                      Limpar filtros
                    </Button>
                  ) : undefined
                }
              />
            </div>
          )}
        </div>
      </section>

      {/* Processo de adoção */}
      <section className="section section--alt">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-3)' }}>Processo de Adoção</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)' }}>
              A adoção é uma decisão importante. Queremos garantir que seja o melhor caminho para você e para o animal.
            </p>
            <Link to="/processo-de-adocao">
              <Button variant="outline">Entender o processo</Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
