import { Link } from 'react-router-dom';
import { ResponsivePicture } from '@/components/media/ResponsivePicture';
import { speciesLabel } from '@/lib/format';

export interface AnimalStripAnimal {
  name: string;
  slug: string;
  cover: string;
  species: 'dog' | 'cat';
}

interface AnimalStripProps {
  animals: AnimalStripAnimal[];
}

export function AnimalStrip({ animals }: AnimalStripProps) {
  if (animals.length === 0) return null;
  return (
    <div className="animal-strip" role="list" aria-label="Animais disponíveis para adoção">
      {animals.map((animal) => (
        <Link
          key={animal.slug}
          to={`/adocao/${animal.slug}`}
          className="animal-strip__item"
          role="listitem"
          aria-label={`Conhecer ${animal.name}, ${speciesLabel(animal.species)}`}
        >
          <span className="animal-strip__photo">
            <ResponsivePicture
              src={animal.cover}
              alt={`${animal.name}, ${speciesLabel(animal.species)}`}
              objectFit="cover"
              objectPosition="center 45%"
              width={320}
              height={320}
              fallback={animal.species === 'cat' ? 'cat' : 'animal'}
            />
          </span>
          <span className="animal-strip__name">{animal.name}</span>
        </Link>
      ))}
    </div>
  );
}
