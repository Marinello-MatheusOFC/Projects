import { supabase, withFallback } from '@/lib/images';
import { isDemoConfigured } from '@/lib/auth-demo';
import { demoAdoptionApplications } from '@/data/applications';
import type { AdoptionApplication } from '@/types';

export interface UserAdoptionApplication
  extends AdoptionApplication {
  animal_name?: string;
}

export async function fetchUserAdoptionApplications(
  userId: string,
): Promise<UserAdoptionApplication[]> {
  return withFallback(
    async () =>
      supabase
        .from('adoption_applications')
        .select('*, animals(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    [] as UserAdoptionApplication[],
  ).then((rows) => {
    if (Array.isArray(rows) && rows.length > 0) {
      return rows.map((row) => ({
        ...row,
        animal_name: (row as Record<string, unknown>).animals
          ? ((row as Record<string, Record<string, string>>).animals?.name ?? undefined)
          : undefined,
      })) as UserAdoptionApplication[];
    }

    if (!isDemoConfigured()) return [];

    return demoAdoptionApplications.map((app) => ({
      ...app,
      user_id: userId,
      animal_name: 'Animal Demo',
    })) as UserAdoptionApplication[];
  });
}
