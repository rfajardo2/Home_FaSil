/**
 * Supabase client — reads its URL/key from env vars so nothing secret lives
 * in source. The app runs fine without them (screens use mock data from
 * `src/data/mock.ts`); once you create a Supabase project and fill in
 * `.env` (see `.env.example` and the README), swap a screen's mock import
 * for a query against `supabase` and it's live.
 */
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isSupabaseConfigured) {
  console.warn(
    '[supabase] EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY no están definidas — ' +
      'la app sigue funcionando con datos de ejemplo (src/data/mock.ts). Revisa el README para conectarla.',
  );
}

// AsyncStorage doesn't exist on web; supabase-js falls back to localStorage there.
const storage = Platform.OS === 'web' ? undefined : AsyncStorage;

export const supabase = createClient(supabaseUrl ?? 'https://placeholder.supabase.co', supabaseAnonKey ?? 'placeholder', {
  auth: {
    storage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});
