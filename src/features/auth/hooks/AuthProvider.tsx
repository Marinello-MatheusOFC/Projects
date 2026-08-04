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
  type SignInResult,
  type SignUpResult,
} from './useAuth';

import {
  demoSessionToProfile,
  demoSessionToUser,
  demoSignInWithPassword,
  demoSignOut,
  getDemoSession,
} from '@/lib/auth-demo';

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

  const signInDemo = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<DemoSignInResult> => {
      setLoading(true);

      try {
        const result =
          await demoSignInWithPassword(
            email,
            password,
          );

        if (
          !result.success ||
          !result.session
        ) {
          setUser(null);
          setProfile(null);
          setAuthMode('none');

          return {
            success: false,
            session: null,
            error:
              result.error ??
              'E-mail ou senha inválidos.',
          };
        }

        setUser(
          demoSessionToUser(
            result.session,
          ) as unknown as User,
        );
        setProfile(
          demoSessionToProfile(
            result.session,
          ),
        );
        setAuthMode('demo');

        return {
          success: true,
          session: result.session,
        };
      } catch (error) {
        console.error(
          'Erro inesperado durante o login de demonstração:',
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
    [],
  );

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
    ): Promise<SignUpResult> => {
      setLoading(true);

      try {
        const { data, error } =
          await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: fullName,
              },
            },
          });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        if (data.user) {
          setUser(data.user);

          const loadedProfile =
            await loadProfile(data.user.id);
          setProfile(loadedProfile);
          setAuthMode('supabase');

          return { success: true };
        }

        return {
          success: false,
          error: 'Não foi possível criar a conta.',
        };
      } catch (error) {
        console.error(
          'Erro inesperado durante o cadastro:',
          error,
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Erro inesperado durante o cadastro.',
        };
      } finally {
        setLoading(false);
        setInitialized(true);
      }
    },
    [loadProfile],
  );

  const signIn = useCallback(
    async (
      email: string,
      password: string,
    ): Promise<SignInResult> => {
      setLoading(true);

      try {
        const { data, error } =
          await supabase.auth.signInWithPassword({
            email,
            password,
          });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        if (data.user) {
          setUser(data.user);

          const loadedProfile =
            await loadProfile(data.user.id);
          setProfile(loadedProfile);
          setAuthMode('supabase');

          return { success: true };
        }

        return {
          success: false,
          error: 'Não foi possível entrar.',
        };
      } catch (error) {
        console.error(
          'Erro inesperado durante o login:',
          error,
        );

        return {
          success: false,
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
    [loadProfile],
  );

  const signInWithGoogle = useCallback(
    async (): Promise<SignInResult> => {
      try {
        const { error } =
          await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: `${window.location.origin}/`,
            },
          });

        if (error) {
          return {
            success: false,
            error: error.message,
          };
        }

        return { success: true };
      } catch (error) {
        console.error(
          'Erro inesperado durante o login com Google:',
          error,
        );

        return {
          success: false,
          error:
            error instanceof Error
              ? error.message
              : 'Erro inesperado durante o login com Google.',
        };
      }
    },
    [],
  );

  const signOut = useCallback(
    async (): Promise<void> => {
      setLoading(true);

      try {
        await demoSignOut();

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
            const demoSession =
              getDemoSession();

            if (demoSession) {
              setUser(
                demoSessionToUser(
                  demoSession,
                ) as unknown as User,
              );
              setProfile(
                demoSessionToProfile(
                  demoSession,
                ),
              );
              setAuthMode('demo');

              return;
            }

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

        isUser:
          isProfileActive &&
          profile?.role === 'user',

        signOut,
        signInDemo,
        signUp,
        signIn,
        signInWithGoogle,
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
        signUp,
        signIn,
        signInWithGoogle,
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
