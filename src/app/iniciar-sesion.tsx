import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function IniciarSesionScreen() {
  const theme = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    setError(null);
    if (!email.trim() || !password) {
      setError('Ingresa tu correo y tu contraseña.');
      return;
    }
    setSubmitting(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setSubmitting(false);
    if (signInError) setError(traducirError(signInError));
    // Al tener sesión, Stack.Protected redirige automáticamente a (tabs).
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          <Header title="Hola de nuevo" size="lg" />
          <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13.5, marginBottom: Spacing.five }}>
            Inicia sesión para ver las tareas y gastos de tu hogar.
          </Text>

          <Field label="Correo">
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="tu@correo.com"
              placeholderTextColor={theme.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          <Field label="Contraseña">
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textFaint}
              secureTextEntry
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          {error && (
            <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{error}</Text>
          )}

          <View style={{ marginTop: Spacing.two }}>
            <PrimaryButton label={submitting ? 'Entrando...' : 'Iniciar sesión'} onPress={handleSubmit} />
          </View>

          <View style={styles.footerRow}>
            <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13 }}>
              ¿No tienes cuenta?{' '}
            </Text>
            <Link href="/crear-cuenta" replace>
              <Text style={{ color: theme.primary, fontFamily: Fonts.bodyBold, fontSize: 13 }}>Crear cuenta</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.field}>
      <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyBold, fontSize: 12.5 }}>{label}</Text>
      {children}
    </View>
  );
}

/** Traduce los mensajes de error más comunes de Supabase Auth. */
function traducirError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.';
  if (message.includes('Email not confirmed')) return 'Confirma tu correo antes de iniciar sesión.';
  return message;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.four },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 13,
    paddingHorizontal: Spacing.four,
    fontSize: 14.5,
    fontFamily: Fonts.body,
  },
  footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: Spacing.two },
});
