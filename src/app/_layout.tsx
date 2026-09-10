import { Outfit_600SemiBold, Outfit_700Bold, Outfit_800ExtraBold } from '@expo-google-fonts/outfit';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';
import { AppDataProvider } from '@/hooks/use-app-data';
import { AuthProvider, useAuth } from '@/hooks/use-auth';
import { isSupabaseConfigured } from '@/lib/supabase';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <AuthProvider>
      <AppDataProvider>
        <Navigation />
      </AppDataProvider>
    </AuthProvider>
  );
}

/**
 * Gates the whole app behind Supabase Auth using `Stack.Protected`. When
 * Supabase isn't configured (no `.env`), the app stays open with mock data,
 * matching the "works out of the box" promise from the README.
 */
function Navigation() {
  const scheme = useColorScheme();
  const theme = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { session, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [loading]);

  if (loading) {
    return null;
  }

  const authed = !isSupabaseConfigured || !!session;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.background },
        animation: 'slide_from_right',
      }}>
      <Stack.Protected guard={authed}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="grupos" />
        <Stack.Screen name="nuevo-grupo" />
        <Stack.Screen name="nueva-tarea" />
        <Stack.Screen name="nuevo-gasto" />
        <Stack.Screen name="categorias" />
        <Stack.Screen name="estadisticas" />
        <Stack.Screen name="notificaciones" />
        <Stack.Screen name="factura/[id]" />
      </Stack.Protected>
      <Stack.Protected guard={!authed}>
        <Stack.Screen name="iniciar-sesion" />
        <Stack.Screen name="crear-cuenta" />
      </Stack.Protected>
    </Stack>
  );
}
