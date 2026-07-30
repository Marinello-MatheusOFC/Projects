import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { AuthContext } from './useAuth';
import type { Profile, Role } from '@/types';
import type { User } from '@supabase/supabase-js';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }, []);

  const hasRole = useCallback(
    (roles: Role[]) => {
      if (!profile) return false;
      return roles.includes(profile.role);
    },
    [profile],
  );

  useEffect(() => {
    if (initialized) return;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profileData) {
          setProfile(profileData as Profile);
        }
      }
      setInitialized(true);
      setLoading(false);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          setUser(session.user);
          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (profileData) {
            setProfile(profileData as Profile);
          }
        } else {
          setUser(null);
          setProfile(null);
        }
        setLoading(false);
      },
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [initialized]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        initialized,
        isAuthenticated: !!user && !!profile?.active,
        isAdmin: profile?.role === 'admin' || profile?.role === 'superadmin',
        isSuperAdmin: profile?.role === 'superadmin',
        signOut,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
