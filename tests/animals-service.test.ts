import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/supabase', () => {
  const error = { message: 'backend offline (mock)' };
  const chain = {
    select: () => chain,
    eq: () => chain,
    is: () => chain,
    order: () => chain,
    maybeSingle: () => Promise.resolve({ data: null, error }),
    then: (onFulfilled: (value: unknown) => unknown) => {
      onFulfilled({ data: null, error });
    },
  };
  return {
    supabase: {
      from: () => chain,
      auth: {
        signInWithPassword: vi.fn(),
        signOut: vi.fn(),
      },
    },
  };
});

import {
  fetchAnimals,
  fetchAdoptableAnimals,
  fetchFeaturedAnimals,
  fetchAnimalBySlug,
} from '@/services/animals';

describe('services/animals com backend indisponível', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAnimals retorna a lista de demonstração quando o backend falha', async () => {
    const animals = await fetchAnimals();
    expect(animals.length).toBeGreaterThan(0);
    const first = animals[0];
    expect(first).toHaveProperty('name');
    expect(first).toHaveProperty('cover');
    expect(first?.cover).toBeTruthy();
  });

  it('fetchAdoptableAnimals retorna apenas animais disponíveis', async () => {
    const animals = await fetchAdoptableAnimals();
    expect(animals.length).toBeGreaterThan(0);
    expect(animals.every((a) => a.status === 'available')).toBe(true);
  });

  it('fetchFeaturedAnimals respeita o limite', async () => {
    const animals = await fetchFeaturedAnimals(2);
    expect(animals.length).toBe(2);
  });

  it('fetchAnimalBySlug encontra animal de demonstração pelo slug', async () => {
    const luna = await fetchAnimalBySlug('luna');
    expect(luna?.name).toBe('Luna');
    expect(luna?.images.length).toBeGreaterThan(0);
  });

  it('fetchAnimalBySlug retorna null para slug desconhecido', async () => {
    const result = await fetchAnimalBySlug('nao-existe');
    expect(result).toBeNull();
  });
});
