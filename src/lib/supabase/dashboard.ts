import { supabase } from './client';

type PostgrestError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

const RLS_CODES = new Set(['42501', 'P0001', '23505']);

function isRlsError(err: unknown): boolean {
  if (!err) return false;
  const e = err as PostgrestError;
  if (e.code && RLS_CODES.has(e.code)) return true;
  const msg = e.message ?? '';
  return (
    msg.includes('policy') ||
    msg.includes('row-level') ||
    msg.includes('permission') ||
    msg.includes('denied') ||
    msg.includes('RLS') ||
    msg.toLowerCase().includes('não permitido') ||
    msg.toLowerCase().includes('sem permissão')
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQb = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResult = any;

export async function safeCount(
  build: (qb: AnyQb) => AnyResult,
  table: string,
): Promise<number> {
  try {
    const base = supabase.from(table);
    const { count, error } = (await build(base)) as {
      count: number | null;
      error: PostgrestError | null;
    };
    if (error) {
      if (isRlsError(error)) {
        console.warn(`[dashboard] RLS bloqueou count em ${table}: ${error.message}`);
      }
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    if (isRlsError(err)) {
      console.warn(`[dashboard] RLS/erro em count ${table}`);
    }
    return 0;
  }
}

export async function safeList<T = unknown>(
  build: (qb: AnyQb) => AnyResult,
  table: string,
): Promise<T[]> {
  try {
    const base = supabase.from(table);
    const { data, error } = (await build(base)) as {
      data: T[] | null;
      error: PostgrestError | null;
    };
    if (error) {
      if (isRlsError(error)) {
        console.warn(`[dashboard] RLS bloqueou list em ${table}: ${error.message}`);
      }
      return [];
    }
    return (data ?? []) as T[];
  } catch (err) {
    if (isRlsError(err)) {
      console.warn(`[dashboard] RLS/erro em list ${table}`);
    }
    return [];
  }
}

export function isTableMissingError(err: unknown): boolean {
  const e = err as PostgrestError | null | undefined;
  if (!e) return false;
  const msg = e.message ?? '';
  return (
    e.code === '42P01' ||
    msg.includes('does not exist') ||
    msg.includes('não existe') ||
    msg.includes('relation')
  );
}
