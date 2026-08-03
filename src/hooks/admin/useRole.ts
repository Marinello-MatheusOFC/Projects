import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { Role } from '@/types';

interface UseRoleResult {
  role: Role | null;
  isAdmin: boolean;
  isSuperadmin: boolean;
  loading: boolean;
}

export function useRole(): UseRoleResult {
  const { profile, loading } = useAuth();

  return useMemo(
    () => ({
      role: profile?.role ?? null,
      isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
      isSuperadmin: profile?.role === 'superadmin',
      loading,
    }),
    [profile, loading],
  );
}
