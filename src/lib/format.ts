import type { AnimalSpecies, AnimalSex, AnimalSize, AnimalStatus } from '@/types';

export function speciesLabel(species: AnimalSpecies): string {
  switch (species) {
    case 'dog':
      return 'Cachorro';
    case 'cat':
      return 'Gato';
    default:
      return 'Outro';
  }
}

export function sexLabel(sex: AnimalSex): string {
  return sex === 'male' ? 'Macho' : 'Fêmea';
}

export function sizeLabel(size: AnimalSize): string {
  switch (size) {
    case 'small':
      return 'Pequeno';
    case 'medium':
      return 'Médio';
    default:
      return 'Grande';
  }
}

export function animalStatusLabel(status: AnimalStatus): string {
  switch (status) {
    case 'available':
      return 'Disponível para adoção';
    case 'in_process':
      return 'Em processo de adoção';
    case 'adopted':
      return 'Adotado';
    case 'archived':
      return 'Arquivado';
    default:
      return status;
  }
}

const plural: Record<string, string> = {
  dog: 'cães',
  cat: 'gatos',
};

export function animalCardMeta(animal: {
  species: AnimalSpecies;
  sex: AnimalSex;
  size: AnimalSize;
}): string {
  return `${speciesLabel(animal.species)} · ${sexLabel(animal.sex)} · Porte ${sizeLabel(animal.size)}`;
}

export function animalCollectionLabel(species: AnimalSpecies): string {
  return plural[species] ?? 'animais';
}

export function formatDate(value: string | null | undefined, options?: Intl.DateTimeFormatOptions): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', options ?? { day: '2-digit', month: 'long', year: 'numeric' }).format(date);
}

export function formatShortDate(value: string | null | undefined): string {
  return formatDate(value, { day: '2-digit', month: 'short' });
}

export function formatTime(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date);
}

export function formatDayNumber(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit' }).format(date);
}

export function formatMonthShort(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-BR', { month: 'short' })
    .format(date)
    .replace('.', '');
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
