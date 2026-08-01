import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/feedback/EmptyState';
import { ErrorState } from '@/components/feedback/ErrorState';
import { CardSkeleton } from '@/components/feedback/Skeleton';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { PageHeader } from '@/components/layout/PageHeader';
import { speciesLabels, sexLabels, sizeLabels } from '@/utils';
import { fetchAdoptableAnimals, type AnimalWithImages } from '@/services/animals';
import { animalCardMeta, speciesLabel, sizeLabel } from '@/lib/format';

const speciesOptions = Object.entries(speciesLabels).map(([value, label]) => ({ value, label }));
const sexOptions = Object.entries(sexLabels).map(([value, label]) => ({ value, label }));
const sizeOptions = Object.entries(sizeLabels).map(([value, label]) => ({ value, label }));

export default function AdoptionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [animals, setAnimals] = useState<AnimalWithImages[] | null>(null);
  const [error, setError] = useState(false);

  const name = searchParams.get('nome') || '';
  const species = searchParams.get('especie') || '';
  const sex = searchParams.get('sexo') || '';
  const size = searchParams.get('porte') || '';

  useEffect(() => {
    let active = true;
    fetchAdoptableAnimals()
      .then((result) => {
        if (active) {
          setAnimals(result);
          setError(false);
        }
      })
      .catch(() => {
        if (active) setError(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const updateFilter = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value) params.set(key, value);
      else params.delete(key);
      setSearchParams(params);
    },
    [searchParams, setSearchParams],
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  const hasFilters = Boolean(name || species || sex || size);

  const filtered = (animals ?? []).filter((animal) => {
    if (name && !animal.name.toLowerCase().includes(name.toLowerCase())) return false;
    if (species && animal.species !== species) return false;
    if (sex && animal.sex !== sex) return false;
    if (size && animal.size !== size) return false;
    return true;
  });

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
      <PageHeader
        tone="yellow"
        eyebrow="SOS Focinho Carente"
        title="Talvez um desses olhares esteja esperando encontrar você."
        subtitle="Cada animal tem sua própria história. Conheça quem está disponível e descubra se um deles tem a ver com você."
        media={{
          src: '/images/demo/hero-cat.jpg',
          alt: 'Animal olhando com expressão de espera',
          objectPosition: 'center 40%',
          fallback: 'hero',
        }}
      />

      <section className="section section--cream" style={{ paddingTop: 'var(--space-10)', paddingBottom: 0 }}>
        <div className="container">
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

      <section className="section">
        <div className="container">
          {animals === null ? (
            <div className="adoption-grid" aria-label="Carregando animais">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="adoption-count">
                {filtered.length} {filtered.length === 1 ? 'animal encontrado' : 'animais encontrados'}
              </p>
              <div className="adoption-grid">
                {filtered.map((animal) => (
                  <Link
                    key={animal.id}
                    to={`/adocao/${animal.slug}`}
                    className="adoption-card"
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <div className="adoption-card-image">
                      <ResponsivePicture
                        src={animal.cover}
                        alt={`${animal.name}, ${speciesLabel(animal.species)} de porte ${sizeLabel(animal.size)}`}
                        objectFit="cover"
                        width={600}
                        height={450}
                        fallback={animal.species === 'cat' ? 'cat' : 'animal'}
                      />
                    </div>
                    <div className="adoption-card-body">
                      <div className="adoption-card-name">{animal.name}</div>
                      <div className="adoption-card-details">
                        {animalCardMeta(animal)
                          .split(' · ')
                          .map((part) => (
                            <span key={part} className="adoption-card-detail">{part}</span>
                          ))}
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
          )}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: 500, margin: '0 auto' }}>
            <h2 className="section-title">Processo de Adoção</h2>
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
