import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import type { User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

import type {
  Profile,
  Role,
} from '@/types';

import {
  AuthContext,
  type AuthContextType,
  type AuthMode,
  type DemoSignInResult,
} from './useAuth';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [user, setUser] =
    useState<User | null>(null);

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [initialized, setInitialized] =
    useState(false);

  const [authMode, setAuthMode] =
    useState<AuthMode>('none');

  const loadProfile = useCallback(
    async (
      userId: string,
    ): Promise<Profile | null> => {
      const {
        data,
        error,
      } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error(
          'Erro ao carregar perfil:',
          error.message,
        );

        return null;
      }

      if (!data) {
        console.warn(
          'Nenhum perfil encontrado para o usuário:',
          userId,
        );

        return null;
      }

      return data as Profile;
    },
    [],
  );

  const updateAuthenticatedUser =
    useCallback(
      async (
        authenticatedUser: User,
        mode: AuthMode,
      ): Promise<Profile | null> => {
        setUser(authenticatedUser);
        setAuthMode(mode);

        const loadedProfile =
          await loadProfile(
            authenticatedUser.id,
          );

        setProfile(loadedProfile);

        return loadedProfile;
      },
      [loadProfile],
    );

  const signInDemo = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<DemoSignInResult> => {
      setLoading(true);

      try {
        const {
          data,
          error,
        } =
          await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          });

        if (error) {
          setUser(null);
          setProfile(null);
          setAuthMode('none');

          return {
            success: false,
            session: null,
            error: error.message,
          };
        }

        if (!data.user || !data.session) {
          setUser(null);
          setProfile(null);
          setAuthMode('none');

          return {
            success: false,
            session: null,
            error:
              'O Supabase não retornou uma sessão válida.',
          };
        }

        const loadedProfile =
          await updateAuthenticatedUser(
            data.user,
            'demo',
          );

        if (!loadedProfile) {
          await supabase.auth.signOut();

          setUser(null);
          setProfile(null);
          setAuthMode('none');

          return {
            success: false,
            session: null,
            error:
              'Usuário autenticado, mas nenhum perfil foi encontrado.',
          };
        }

        if (!loadedProfile.active) {
          await supabase.auth.signOut();

          setUser(null);
          setProfile(null);
          setAuthMode('none');

          return {
            success: false,
            session: null,
            error:
              'Este perfil está desativado.',
          };
        }

        return {
          success: true,
          session: data.session,
        };
      } catch (error) {
        console.error(
          'Erro inesperado durante o login:',
          error,
        );

        setUser(null);
        setProfile(null);
        setAuthMode('none');

        return {
          success: false,
          session: null,
          error:
            error instanceof Error
              ? error.message
              : 'Erro inesperado durante o login.',
        };
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [updateAuthenticatedUser],
  );

  const signOut = useCallback(
    async (): Promise<void> => {
      setLoading(true);

      try {
        const { error } =
          await supabase.auth.signOut();

        if (error) {
          console.error(
            'Erro ao sair:',
            error.message,
          );
        }
      } catch (error) {
        console.error(
          'Erro inesperado ao sair:',
          error,
        );
      } finally {
        setUser(null);
        setProfile(null);
        setAuthMode('none');
        setLoading(false);
      }
    },
    [],
  );

  const hasRole = useCallback(
    (roles: Role[]): boolean => {
      if (
        !profile ||
        profile.active !== true
      ) {
        return false;
      }

      return roles.includes(profile.role);
    },
    [profile],
  );

  useEffect(() => {
    let active = true;

    const initializeAuth =
      async (): Promise<void> => {
        try {
          const {
            data: { session },
            error,
          } =
            await supabase.auth.getSession();

          if (!active) {
            return;
          }

          if (error) {
            console.error(
              'Erro ao recuperar sessão:',
              error.message,
            );

            setUser(null);
            setProfile(null);
            setAuthMode('none');

            return;
          }

          const sessionUser =
            session?.user ?? null;

          if (!sessionUser) {
            setUser(null);
            setProfile(null);
            setAuthMode('none');

            return;
          }

          const loadedProfile =
            await loadProfile(
              sessionUser.id,
            );

          if (!active) {
            return;
          }

          setUser(sessionUser);
          setProfile(loadedProfile);
          setAuthMode('supabase');
        } catch (error) {
          console.error(
            'Erro inesperado ao inicializar autenticação:',
            error,
          );

          if (active) {
            setUser(null);
            setProfile(null);
            setAuthMode('none');
          }
        } finally {
          if (active) {
            setInitialized(true);
            setLoading(false);
          }
        }
      };

    void initializeAuth();

    const {
      data: { subscription },
    } =
      supabase.auth.onAuthStateChange(
        (_event, session) => {
          const sessionUser =
            session?.user ?? null;

          if (!sessionUser) {
            setUser(null);
            setProfile(null);
            setAuthMode('none');
            setLoading(false);
            setInitialized(true);

            return;
          }

          setLoading(true);

          window.setTimeout(() => {
            void loadProfile(
              sessionUser.id,
            ).then((loadedProfile) => {
              if (!active) {
                return;
              }

              setUser(sessionUser);
              setProfile(loadedProfile);

              setAuthMode(
                (currentMode) =>
                  currentMode === 'demo'
                    ? 'demo'
                    : 'supabase',
              );

              setLoading(false);
              setInitialized(true);
            });
          }, 0);
        },
      );

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const isProfileActive =
    profile?.active === true;

  const contextValue =
    useMemo<AuthContextType>(
      () => ({
        user,
        profile,
        loading,
        initialized,
        authMode,

        isAuthenticated:
          user !== null &&
          isProfileActive,

        isAdmin:
          isProfileActive &&
          (
            profile?.role === 'admin' ||
            profile?.role ===
              'superadmin'
          ),

        isSuperAdmin:
          isProfileActive &&
          profile?.role ===
            'superadmin',

        signOut,
        signInDemo,
        hasRole,
      }),
      [
        user,
        profile,
        loading,
        initialized,
        authMode,
        isProfileActive,
        signOut,
        signInDemo,
        hasRole,
      ],
    );

  return (
    <AuthContext.Provider
      value={contextValue}
    >
      {children}
    </AuthContext.Provider>
  );
}