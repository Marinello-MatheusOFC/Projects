import { supabase, withFallback, resolveImageUrl } from '@/lib/images';
import { isDemoConfigured } from '@/lib/auth-demo';
import type { Animal, AnimalImage, AnimalSpecies, AnimalSex, AnimalSize, AnimalStatus } from '@/types';
import { demoAnimals, demoAnimalImages } from '@/data/animals';

export interface AnimalWithImages extends Animal {
  images: AnimalImage[];
  cover: string;
}

const BUCKET = 'animals';

export type AnimalInput = {
  name: string;
  slug: string;
  species: AnimalSpecies;
  sex: AnimalSex;
  size: AnimalSize;
  birth_date_estimate?: string | null;
  age_text?: string | null;
  description?: string | null;
  history?: string | null;
  health_notes?: string | null;
  personality?: string | null;
  compatibility_notes?: string | null;
  vaccinated: boolean;
  neutered: boolean;
  special_needs: boolean;
  status: AnimalStatus;
  featured: boolean;
  published: boolean;
};

function toWithImages(animal: Animal, images: AnimalImage[]): AnimalWithImages {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const coverImg = sorted.find((img) => img.is_cover) ?? sorted[0];
  return {
    ...animal,
    images: sorted,
    cover: resolveImageUrl(coverImg?.storage_path ?? null),
  };
}

function demoTowithImages(): AnimalWithImages[] {
  return demoAnimals.map((animal) => {
    const images = demoAnimalImages.filter((img) => img.animal_id === animal.id);
    return toWithImages(animal, images);
  });
}

function demoBySlug(slug: string): AnimalWithImages | null {
  const animal = demoAnimals.find((a) => a.slug === slug);
  if (!animal) return null;
  return toWithImages(animal, demoAnimalImages.filter((img) => img.animal_id === animal.id));
}

export async function fetchAnimals(): Promise<AnimalWithImages[]> {
  return withFallback(
    async () =>
      supabase
        .from('animals')
        .select('*, animal_images(*)')
        .eq('published', true)
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    [] as AnimalWithImages[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'animal_images' in rows[0]) {
      return (rows as (Animal & { animal_images: AnimalImage[] })[]).map((row) =>
        toWithImages(row, row.animal_images),
      );
    }
    return isDemoConfigured() ? demoTowithImages() : ([] as AnimalWithImages[]);
  });
}

export async function fetchAdoptableAnimals(): Promise<AnimalWithImages[]> {
  const all = await fetchAnimals();
  const adoptable = all.filter((a) => a.status === 'available');
  return adoptable.length > 0 ? adoptable : all;
}

export async function fetchFeaturedAnimals(limit = 4): Promise<AnimalWithImages[]> {
  const all = await fetchAnimals();
  const featured = all.filter((a) => a.featured && a.status === 'available');
  const pool = featured.length >= limit ? featured : all.filter((a) => a.status === 'available');
  return pool.slice(0, limit);
}

export async function fetchAnimalBySlug(slug: string): Promise<AnimalWithImages | null> {
  return withFallback(
    async () =>
      supabase
        .from('animals')
        .select('*, animal_images(*)')
        .eq('slug', slug)
        .eq('published', true)
        .is('deleted_at', null)
        .maybeSingle(),
    null as AnimalWithImages | null,
  ).then((row) => {
    if (row && 'animal_images' in row && row.id !== '') {
      return toWithImages(row as Animal, (row as { animal_images: AnimalImage[] }).animal_images);
    }
    return isDemoConfigured() ? demoBySlug(slug) : null;
  });
}

export async function fetchAdminAnimals(): Promise<AnimalWithImages[]> {
  return withFallback(
    async () =>
      supabase
        .from('animals')
        .select('*, animal_images(*)')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    [] as AnimalWithImages[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'animal_images' in rows[0]) {
      return (rows as (Animal & { animal_images: AnimalImage[] })[]).map((row) =>
        toWithImages(row, row.animal_images),
      );
    }
    return isDemoConfigured() ? demoTowithImages() : ([] as AnimalWithImages[]);
  });
}

export async function fetchAdminAnimal(id: string): Promise<AnimalWithImages | null> {
  const { data, error } = await supabase
    .from('animals')
    .select('*, animal_images(*)')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();
  if (error) throw new Error('Não foi possível carregar o animal.');
  if (!data) return null;
  return toWithImages(data as Animal, (data as { animal_images?: AnimalImage[] }).animal_images ?? []);
}

export async function createAnimal(input: AnimalInput): Promise<Animal | null> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('animals')
    .insert({ ...input, created_by: userData.user?.id })
    .select()
    .single();
  if (error) throw new Error('Não foi possível cadastrar o animal.');
  return data as Animal;
}

export async function updateAnimal(id: string, input: Partial<AnimalInput>): Promise<Animal | null> {
  const { data, error } = await supabase.from('animals').update(input).eq('id', id).select().single();
  if (error) throw new Error('Não foi possível atualizar o animal.');
  return data as Animal;
}

export async function archiveAnimal(id: string): Promise<void> {
  const { error } = await supabase
    .from('animals')
    .update({ deleted_at: new Date().toISOString(), status: 'archived' })
    .eq('id', id);
  if (error) throw new Error('Não foi possível arquivar o animal.');
}

export async function uploadAnimalImage(
  animalId: string,
  file: File,
  isCover: boolean,
): Promise<AnimalImage | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${animalId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw new Error('Não foi possível enviar a imagem.');

  const { data, error } = await supabase
    .from('animal_images')
    .insert({ animal_id: animalId, storage_path: `${BUCKET}/${path}`, is_cover: isCover, position: 0 })
    .select()
    .single();
  if (error) throw new Error('Não foi possível registrar a imagem.');
  return data as AnimalImage;
}

export async function setAnimalCover(animalId: string, imageId: string): Promise<void> {
  await supabase.from('animal_images').update({ is_cover: false }).eq('animal_id', animalId);
  const { error } = await supabase.from('animal_images').update({ is_cover: true }).eq('id', imageId);
  if (error) throw new Error('Não foi possível definir a imagem de capa.');
}

export async function deleteAnimalImage(imageId: string): Promise<void> {
  const { data, error } = await supabase
    .from('animal_images')
    .delete()
    .eq('id', imageId)
    .select('storage_path')
    .single();
  if (error) throw new Error('Não foi possível remover a imagem.');
  const storagePath = (data as { storage_path?: string } | null)?.storage_path ?? '';
  const bucketPath = storagePath.replace(/^animals\//, '');
  if (bucketPath) await supabase.storage.from(BUCKET).remove([bucketPath]);
}
