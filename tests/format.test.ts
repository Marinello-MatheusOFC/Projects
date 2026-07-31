import { describe, it, expect } from 'vitest';
import {
  speciesLabel,
  sexLabel,
  sizeLabel,
  animalStatusLabel,
  animalCardMeta,
  formatDate,
  formatShortDate,
  formatPrice,
  slugify,
} from '@/lib/format';

describe('format helpers', () => {
  it('speciesLabel traduz espécies', () => {
    expect(speciesLabel('dog')).toBe('Cachorro');
    expect(speciesLabel('cat')).toBe('Gato');
    expect(speciesLabel('other')).toBe('Outro');
  });

  it('sexLabel traduz sexo', () => {
    expect(sexLabel('male')).toBe('Macho');
    expect(sexLabel('female')).toBe('Fêmea');
  });

  it('sizeLabel traduz porte', () => {
    expect(sizeLabel('small')).toBe('Pequeno');
    expect(sizeLabel('medium')).toBe('Médio');
    expect(sizeLabel('large')).toBe('Grande');
  });

  it('animalStatusLabel traduz status', () => {
    expect(animalStatusLabel('available')).toBe('Disponível para adoção');
    expect(animalStatusLabel('in_process')).toBe('Em processo de adoção');
    expect(animalStatusLabel('adopted')).toBe('Adotado');
    expect(animalStatusLabel('archived')).toBe('Arquivado');
  });

  it('animalCardMeta combina espécie, sexo e porte', () => {
    expect(animalCardMeta({ species: 'dog', sex: 'female', size: 'medium' })).toBe(
      'Cachorro · Fêmea · Porte Médio',
    );
  });

  it('formatDate formata em pt-BR', () => {
    expect(formatDate('2026-07-31T10:00:00Z')).toContain('31 de julho de 2026');
    expect(formatDate(null)).toBe('');
    expect(formatDate('data-invalida')).toBe('');
  });

  it('formatShortDate formata dia e mês abreviado', () => {
    expect(formatShortDate('2026-07-31T10:00:00Z')).toMatch(/31/);
  });

  it('formatPrice formata moeda pt-BR', () => {
    expect(formatPrice(12.5)).toMatch(/12,50/);
    expect(formatPrice(0)).toMatch(/0,00/);
  });

  it('slugify gera slugs seguros', () => {
    expect(slugify('Luna, a Cachorra!')).toBe('luna-a-cachorra');
    expect(slugify('  Adoção Responsável  ')).toBe('adocao-responsavel');
    expect(slugify('')).toBe('');
  });
});
