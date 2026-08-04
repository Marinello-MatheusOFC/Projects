import { supabase, withFallback, resolveImageUrl } from '@/lib/images';
import { isDemoConfigured } from '@/lib/auth-demo';
import type { NewsPost, NewsStatus } from '@/types';
import { demoNews } from '@/data/content';

const BUCKET = 'news';

export interface NewsWithImage extends NewsPost {
  image: string;
}

export type NewsInput = {
  title: string;
  slug: string;
  excerpt?: string | null;
  content?: string | null;
  cover_image_path?: string | null;
  status: NewsStatus;
  published_at?: string | null;
};

function decorate(post: NewsPost): NewsWithImage {
  return { ...post, image: resolveImageUrl(post.cover_image_path) };
}

function demoList(): NewsWithImage[] {
  return demoNews.map(decorate);
}

function demoBySlug(slug: string): NewsWithImage | null {
  const found = demoNews.find((n) => n.slug === slug);
  return found ? decorate(found) : null;
}

export async function fetchNews(): Promise<NewsWithImage[]> {
  return withFallback(
    async () =>
      supabase
        .from('news_posts')
        .select('*')
        .eq('status', 'published')
        .is('deleted_at', null)
        .order('published_at', { ascending: false }),
    [] as NewsWithImage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'title' in rows[0]) {
      return (rows as NewsPost[]).map(decorate);
    }
    return isDemoConfigured() ? demoList() : ([] as NewsWithImage[]);
  });
}

export async function fetchNewsBySlug(slug: string): Promise<NewsWithImage | null> {
  return withFallback(
    async () =>
      supabase
        .from('news_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .is('deleted_at', null)
        .maybeSingle(),
    null as NewsWithImage | null,
  ).then((row) => {
    if (row && 'title' in row && (row as NewsPost).id) {
      return decorate(row as NewsPost);
    }
    return isDemoConfigured() ? demoBySlug(slug) : null;
  });
}

export async function fetchAdminNews(): Promise<NewsWithImage[]> {
  return withFallback(
    async () =>
      supabase
        .from('news_posts')
        .select('*')
        .is('deleted_at', null)
        .order('created_at', { ascending: false }),
    [] as NewsWithImage[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0 && 'title' in rows[0]) {
      return (rows as NewsPost[]).map(decorate);
    }
    return isDemoConfigured() ? demoList() : ([] as NewsWithImage[]);
  });
}

export async function createNews(input: NewsInput): Promise<NewsPost | null> {
  const { data: userData } = await supabase.auth.getUser();
  const { data, error } = await supabase
    .from('news_posts')
    .insert({ ...input, author_id: userData.user?.id })
    .select()
    .single();
  if (error) throw new Error('Não foi possível criar a notícia.');
  return data as NewsPost;
}

export async function updateNews(id: string, input: Partial<NewsInput>): Promise<NewsPost | null> {
  const { data, error } = await supabase.from('news_posts').update(input).eq('id', id).select().single();
  if (error) throw new Error('Não foi possível atualizar a notícia.');
  return data as NewsPost;
}

export async function deleteNews(id: string): Promise<void> {
  const { error } = await supabase.from('news_posts').delete().eq('id', id);
  if (error) throw new Error('Não foi possível excluir a notícia.');
}

export async function uploadNewsImage(newsId: string, file: File): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${newsId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file);
  if (uploadError) throw new Error('Não foi possível enviar a imagem.');
  const storagePath = `${BUCKET}/${path}`;
  await updateNews(newsId, { cover_image_path: storagePath });
  return storagePath;
}
