import { Link } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function CrearCuentaScreen() {
  const theme = useTheme();
  const { signUp } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  async function handleSubmit() {
    if (submitting) return;
    setError(null);
    if (!name.trim() || !email.trim() || !password) {
      setError('Completa tu nombre, correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setSubmitting(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp(email.trim(), password, name);
    setSubmitting(false);
    if (signUpError) {
      setError(traducirError(signUpError));
      return;
    }
    if (needsEmailConfirmation) {
      setConfirmEmailSent(true);
    }
    // Si no hace falta confirmar correo, la sesión ya quedó activa y
    // Stack.Protected redirige automáticamente a (tabs).
  }

  if (confirmEmailSent) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
        <View style={styles.confirmWrap}>
          <Text style={[styles.confirmTitle, { color: theme.text, fontFamily: Fonts.display }]}>
            Revisa tu correo
          </Text>
          <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13.5, textAlign: 'center' }}>
            Te enviamos un link de confirmación a {email.trim()}. Ábrelo y luego vuelve para iniciar sesión.
          </Text>
          <View style={{ marginTop: Spacing.five, width: '100%', maxWidth: 280 }}>
            <Link href="/iniciar-sesion" replace asChild>
              <PrimaryButton label="Ir a iniciar sesión" />
            </Link>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          <Header title="Crear cuenta" showBack size="lg" />
          <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13.5, marginBottom: Spacing.five }}>
            Regístrate para empezar a organizar tu hogar en familia.
          </Text>

          <Field label="Nombre">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Valentina"
              placeholderTextColor={theme.textFaint}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

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
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={theme.textFaint}
              secureTextEntry
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          {error && (
            <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{error}</Text>
          )}

          <View style={{ marginTop: Spacing.two }}>
            <PrimaryButton label={submitting ? 'Creando cuenta...' : 'Crear cuenta'} onPress={handleSubmit} />
          </View>

          <View style={styles.footerRow}>
            <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13 }}>
              ¿Ya tienes cuenta?{' '}
            </Text>
            <Link href="/iniciar-sesion" replace>
              <Text style={{ color: theme.primary, fontFamily: Fonts.bodyBold, fontSize: 13 }}>Iniciar sesión</Text>
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
  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese correo.';
  if (message.includes('Password should be')) return 'La contraseña es demasiado corta o débil.';
  if (message.includes('Unable to validate email address')) return 'Ese correo no es válido.';
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
  confirmWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.seven, gap: Spacing.three },
  confirmTitle: { fontSize: 20 },
});
