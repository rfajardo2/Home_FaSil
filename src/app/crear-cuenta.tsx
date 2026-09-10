import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TextInput, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

/** Lowercase, no accents, no spaces or symbols — e.g. "Rubén Fajardo" → "rubenfajardo". */
function slugifyUsername(input: string): string {
  return input
    .normalize('NFD')
    .replace(new RegExp('[\\u0300-\\u036f]', 'g'), '') // strip accents (á → a + combining mark, drop the mark)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';

export default function CrearCuentaScreen() {
  const theme = useTheme();
  const { signUp, checkUsernameAvailable } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [usernameTouched, setUsernameTouched] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [usernameSuggestions, setUsernameSuggestions] = useState<string[]>([]);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmEmailSent, setConfirmEmailSent] = useState(false);

  // Auto-suggest the username from the name, but stop touching it the
  // moment the user edits it directly — never clobber their own choice.
  useEffect(() => {
    if (usernameTouched) return;
    setUsername(slugifyUsername(`${firstName}${lastName}`));
  }, [firstName, lastName, usernameTouched]);

  // Debounced availability check; offers a couple of "name1", "name2" style
  // alternatives when the handle is already taken.
  useEffect(() => {
    const candidate = username.trim().toLowerCase();
    if (!candidate) {
      setUsernameStatus('idle');
      setUsernameSuggestions([]);
      return;
    }
    setUsernameStatus('checking');
    setUsernameSuggestions([]);
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailable(candidate);
      if (available) {
        setUsernameStatus('available');
        return;
      }
      setUsernameStatus('taken');
      const found: string[] = [];
      // Sequential on purpose: stop as soon as we have enough suggestions.
      for (let i = 1; i <= 6 && found.length < 3; i++) {
        if (await checkUsernameAvailable(`${candidate}${i}`)) found.push(`${candidate}${i}`);
      }
      setUsernameSuggestions(found);
    }, 500);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- checkUsernameAvailable is a fresh fn each render; only re-run on username changes
  }, [username]);

  async function handleSubmit() {
    if (submitting) return;
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !username.trim() || !email.trim() || !password) {
      setError('Completa nombre, apellido, usuario, correo y contraseña.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('Ese nombre de usuario ya está en uso. Elige otro.');
      return;
    }
    setSubmitting(true);
    const { error: signUpError, needsEmailConfirmation } = await signUp({
      email: email.trim(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      username: username.trim().toLowerCase(),
    });
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
          <Header title="Crear cuenta" showBack fallbackHref="/iniciar-sesion" size="lg" />
          <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13.5, marginBottom: Spacing.five }}>
            Regístrate para empezar a organizar tu hogar en familia.
          </Text>

          <View style={styles.row}>
            <Field label="Nombre" style={styles.flexGrow}>
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Valentina"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              />
            </Field>
            <Field label="Apellido" style={styles.flexGrow}>
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="García"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              />
            </Field>
          </View>

          <Field label="Nombre de usuario">
            <TextInput
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                setUsernameTouched(true);
              }}
              placeholder="valentinagarcia"
              placeholderTextColor={theme.textFaint}
              autoCapitalize="none"
              autoCorrect={false}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
            {usernameStatus === 'checking' && (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11.5 }}>Verificando...</Text>
            )}
            {usernameStatus === 'available' && (
              <Text style={{ color: theme.success, fontFamily: Fonts.body, fontSize: 11.5 }}>Disponible</Text>
            )}
            {usernameStatus === 'taken' && (
              <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 11.5 }}>
                Ya está en uso{usernameSuggestions.length > 0 ? ' · prueba: ' + usernameSuggestions.join(', ') : ''}
              </Text>
            )}
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

function Field({ label, children, style }: { label: string; children: React.ReactNode; style?: object }) {
  const theme = useTheme();
  return (
    <View style={[styles.field, style]}>
      <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyBold, fontSize: 12.5 }}>{label}</Text>
      {children}
    </View>
  );
}

/** Traduce los mensajes de error más comunes de Supabase Auth. */
function traducirError(message: string): string {
  if (message.includes('User already registered')) return 'Ya existe una cuenta registrada con ese correo.';
  if (message.includes('Password should be')) return 'La contraseña es demasiado corta o débil.';
  if (message.includes('Unable to validate email address')) return 'Ese correo no es válido.';
  if (message.includes('duplicate key') && message.includes('username')) return 'Ese nombre de usuario ya está en uso.';
  if (message.includes('rate limit')) return 'Demasiados intentos seguidos. Espera un momento y vuelve a intentarlo.';
  return message;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.four },
  row: { flexDirection: 'row', gap: Spacing.three },
  flexGrow: { flex: 1 },
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
