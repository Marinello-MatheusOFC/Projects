import { supabase } from '@/lib/supabase';

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
 * Executa uma consulta ao Supabase e, caso a fonte não esteja disponível
 * (erro de rede, backend local desligado, etc.), retorna o fallback local.
 * O fallback só é usado em caso de erro — resultados vazios são respeitados.
 */
export async function withFallback<T>(
  query: () => Promise<{ data: T | null; error: unknown }>,
  fallback: T,
): Promise<T> {
  try {
    const { data, error } = await query();
    if (error) return fallback;
    return (data ?? fallback) as T;
  } catch {
    return fallback;
  }
}

export { supabase };
