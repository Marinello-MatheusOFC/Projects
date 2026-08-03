import { supabase } from '@/lib/supabase';
import { isDemoConfigured } from '@/lib/auth-demo';

/**
 * Resolve o caminho de uma imagem para uma URL utilizável.
 * - Retorna vazio para valores nulos/vazios.
 * - Preserva URLs externas (http/https) e caminhos locais (/images/...).
 * - Converte caminhos de storage do Supabase para a URL pública.
 */
export function resolveImageUrl(path?: string | null): string {
  if (!path) return '';
  if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;
  const base = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  if (!base) return '';
  return `${base.replace(/\/$/, '')}/storage/v1/object/public/${path}`;
}

export function getStoragePublicUrl(bucket: string, path: string): string {
  return resolveImageUrl(`${bucket}/${path}`);
}

/**
 * Executa uma consulta ao Supabase.
 * - Em modo demonstração, retorna o fallback local quando o backend
 *   não está disponível ou não há dados.
 * - Em produção, erros são propagados e o fallback NUNCA é exibido,
 *   evitando que conteúdo fictício apareça como se fosse real.
 */
export async function withFallback<T>(
  query: () => Promise<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  const demo = isDemoConfigured();

  try {
    const { data, error } = await query();
    if (error) throw error;
    if (demo && (data === null || data === undefined)) return fallback;
    return data as T;
  } catch (error) {
    if (demo) return fallback;
    throw error;
  }
}

export { supabase };
