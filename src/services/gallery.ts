import { supabase, withFallback, resolveImageUrl } from '@/lib/images';
import { isDemoConfigured } from '@/lib/auth-demo';
import type { GalleryAlbum, GalleryImage } from '@/types';
import { demoGalleryAlbums, demoGalleryImages } from '@/data/content';

export interface GalleryAlbumWithImages extends GalleryAlbum {
  images: GalleryImage[];
  imageUrls: string[];
}

export type GalleryAlbumInput = {
  title: string;
  slug: string;
  description?: string | null;
  cover_image_path?: string | null;
  published: boolean;
};

export function decorateAlbum(album: GalleryAlbum, images: GalleryImage[]): GalleryAlbumWithImages {
  const sorted = [...images].sort((a, b) => a.position - b.position);
  return {
    ...album,
    images: sorted,
    imageUrls: sorted.map((img) => resolveImageUrl(img.storage_path)),
  };
}

function demoAlbums(): GalleryAlbumWithImages[] {
  return demoGalleryAlbums.map((album) =>
    decorateAlbum(album, demoGalleryImages.filter((img) => img.album_id === album.id)),
  );
}

export async function fetchGallery(): Promise<GalleryAlbumWithImages[]> {
  return withFallback(
    async () =>
      supabase
        .from('gallery_albums')
        .select('*, gallery_images(*)')
        .eq('published', true)
        .order('created_at', { ascending: false }),
    [] as GalleryAlbumWithImages[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'gallery_images' in rows[0]) {
      return (rows as (GalleryAlbum & { gallery_images: GalleryImage[] })[]).map((row) =>
        decorateAlbum(row, row.gallery_images),
      );
    }
    return isDemoConfigured() ? demoAlbums() : ([] as GalleryAlbumWithImages[]);
  });
}

export async function fetchGalleryAlbum(id: string): Promise<GalleryAlbumWithImages | null> {
  const { data, error } = await supabase
    .from('gallery_albums')
    .select('*, gallery_images(*)')
    .eq('id', id)
    .maybeSingle();
  if (error) throw new Error('Não foi possível carregar o álbum.');
  if (!data) return null;
  return decorateAlbum(
    data as GalleryAlbum,
    (data as { gallery_images?: GalleryImage[] }).gallery_images ?? [],
  );
}

export async function fetchAdminGallery(): Promise<GalleryAlbumWithImages[]> {
  return withFallback(
    async () =>
      supabase
        .from('gallery_albums')
        .select('*, gallery_images(*)')
        .order('created_at', { ascending: false }),
    [] as GalleryAlbumWithImages[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'gallery_images' in rows[0]) {
      return (rows as (GalleryAlbum & { gallery_images: GalleryImage[] })[]).map((row) =>
        decorateAlbum(row, row.gallery_images),
      );
    }
    return isDemoConfigured() ? demoAlbums() : ([] as GalleryAlbumWithImages[]);
  });
}

export async function createGalleryAlbum(input: GalleryAlbumInput): Promise<GalleryAlbum | null> {
  const { data, error } = await supabase.from('gallery_albums').insert(input).select().single();
  if (error) throw new Error('Não foi possível criar o álbum.');
  return data as GalleryAlbum;
}

export async function updateGalleryAlbum(id: string, input: Partial<GalleryAlbumInput>): Promise<GalleryAlbum | null> {
  const { data, error } = await supabase
    .from('gallery_albums')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error('Não foi possível atualizar o álbum.');
  return data as GalleryAlbum;
}

export async function deleteGalleryAlbum(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_albums').delete().eq('id', id);
  if (error) throw new Error('Não foi possível excluir o álbum.');
}

export async function uploadGalleryImage(albumId: string, file: File, caption: string, altText: string): Promise<GalleryImage | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${albumId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from('gallery').upload(path, file);
  if (uploadError) throw new Error('Não foi possível enviar a imagem.');

  const { data, error } = await supabase
    .from('gallery_images')
    .insert({ album_id: albumId, storage_path: `gallery/${path}`, caption: caption || null, alt_text: altText || null, position: 0 })
    .select()
    .single();
  if (error) throw new Error('Não foi possível registrar a imagem.');
  return data as GalleryImage;
}

export async function deleteGalleryImage(id: string): Promise<void> {
  const { error } = await supabase.from('gallery_images').delete().eq('id', id);
  if (error) throw new Error('Não foi possível remover a imagem.');
}
