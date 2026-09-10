import type { Session, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState } from 'react';

import { AccentColors } from '@/constants/theme';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const AVATAR_COLORS = [
  AccentColors.avatar1,
  AccentColors.avatar2,
  AccentColors.avatar3,
  AccentColors.avatar4,
  AccentColors.avatar5,
];

/** Creates the `profiles` row for a user on their first authenticated session, if it doesn't exist yet. */
async function ensureProfile(user: User) {
  const { data: existing } = await supabase.from('profiles').select('id').eq('id', user.id).maybeSingle();
  if (existing) return;

  const name = (user.user_metadata?.name as string | undefined)?.trim() || user.email?.split('@')[0] || 'Usuario';
  const initials = name.slice(0, 1).toUpperCase();
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

  await supabase.from('profiles').insert({ id: user.id, name, initials, avatar_color: avatarColor });
}

type AuthContextValue = {
  session: Session | null;
  /** True while the initial session is being restored. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Returns `needsEmailConfirmation: true` when Supabase requires confirming the email before a session exists. */
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user) {
      ensureProfile(session.user).catch((err) => console.warn('[auth] no se pudo crear el perfil:', err));
    }
    // Only re-run when the signed-in user actually changes, not on every session refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.user?.id]);

  const value: AuthContextValue = {
    session,
    loading,
    async signIn(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    async signUp(email, password, name) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() } },
      });
      if (error) return { error: error.message, needsEmailConfirmation: false };
      return { error: null, needsEmailConfirmation: !data.session };
    },
    async signOut() {
      await supabase.auth.signOut();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>.');
  return ctx;
}
