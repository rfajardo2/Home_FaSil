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

  const meta = user.user_metadata ?? {};
  const firstName = (meta.first_name as string | undefined)?.trim() || null;
  const lastName = (meta.last_name as string | undefined)?.trim() || null;
  const name = [firstName, lastName].filter(Boolean).join(' ') || user.email?.split('@')[0] || 'Usuario';
  const initials = (firstName?.[0] ?? name[0] ?? 'U').toUpperCase();
  const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  const requestedUsername = (meta.username as string | undefined)?.trim().toLowerCase() || null;

  const baseInsert = { id: user.id, name, initials, avatar_color: avatarColor, first_name: firstName, last_name: lastName };

  if (!requestedUsername) {
    await supabase.from('profiles').insert(baseInsert);
    return;
  }

  // The username was checked for availability in the sign-up form, but that
  // was a best-effort UX check (anon role, no lock) — someone else could
  // have taken it in the meantime. The unique index on profiles is the real
  // guard, so on conflict fall back to a suffixed variant instead of failing
  // account creation outright (there's no interactive UI to ask again here).
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = attempt === 0 ? requestedUsername : `${requestedUsername}${Math.floor(Math.random() * 9000) + attempt * 137}`;
    const { error } = await supabase.from('profiles').insert({ ...baseInsert, username: candidate });
    if (!error) return;
    if (error.code !== '23505') {
      console.warn('[auth] no se pudo crear el perfil:', error.message);
      return;
    }
  }
  // Last resort: create the profile without a username rather than lose the account.
  await supabase.from('profiles').insert(baseInsert);
}

type SignUpInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  username: string;
};

type AuthContextValue = {
  session: Session | null;
  /** True while the initial session is being restored. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Returns `needsEmailConfirmation: true` when Supabase requires confirming the email before a session exists. */
  signUp: (input: SignUpInput) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>;
  /** Best-effort pre-signup availability check (runs unauthenticated) — the real guard is the DB's unique index. */
  checkUsernameAvailable: (username: string) => Promise<boolean>;
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
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
      return { error: error?.message ?? null };
    },
    async signUp({ email, password, firstName, lastName, username }) {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            name: `${firstName.trim()} ${lastName.trim()}`.trim(),
            username: username.trim().toLowerCase(),
          },
        },
      });
      if (error) return { error: error.message, needsEmailConfirmation: false };
      // Supabase's anti-enumeration behavior: signing up with an email that's
      // already registered returns success with no error, but `identities`
      // comes back empty instead of containing the (non-existent) new one.
      if (data.user && data.user.identities?.length === 0) {
        return { error: 'User already registered', needsEmailConfirmation: false };
      }
      return { error: null, needsEmailConfirmation: !data.session };
    },
    async checkUsernameAvailable(username) {
      if (!isSupabaseConfigured) return true;
      const { data, error } = await supabase.rpc('is_username_available', { check_username: username });
      if (error) {
        console.warn('[auth] no se pudo verificar el nombre de usuario:', error.message);
        return true;
      }
      return Boolean(data);
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
