import {
  createContext,
  useContext,
} from 'react';

import type { User } from '@supabase/supabase-js';

import type {
  Profile,
  Role,
} from '@/types';

export type AuthMode =
  | 'supabase'
  | 'demo'
  | 'none';

export interface DemoSignInResult {
  success: boolean;
  session: unknown;
  error?: string;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;

  isAuthenticated: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;

  authMode: AuthMode;

  signOut: () => Promise<void>;

  signInDemo: (
    email: string,
    password: string,
  ) => Promise<DemoSignInResult>;

  hasRole: (roles: Role[]) => boolean;
}

export const AuthContext =
  createContext<AuthContextType | null>(null);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error(
      'useAuth deve ser usado dentro de AuthProvider',
    );
  }

  return context;
}