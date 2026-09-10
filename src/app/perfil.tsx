import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { isSupabaseConfigured } from '@/lib/supabase';

const ROLE_LABEL = { admin: 'Administrador', member: 'Miembro' } as const;

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function PerfilScreen() {
  const theme = useTheme();
  const { session, signOut } = useAuth();
  const { myProfile, groups, updateProfile } = useAppData();
  const user = session?.user;

  const fullName = myProfile?.name || (user?.user_metadata?.name as string | undefined) || 'Usuario';
  const initials = myProfile?.initials ?? fullName[0]?.toUpperCase() ?? 'U';
  const avatarColor = myProfile?.avatar_color ?? theme.primary;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Resync the editable fields whenever the loaded profile changes (initial
  // load, or right after a successful save) — never while the user is mid-edit.
  useEffect(() => {
    if (!myProfile) return;
    setFirstName(myProfile.first_name ?? '');
    setLastName(myProfile.last_name ?? '');
  }, [myProfile]);

  function handleStartEditing() {
    setSaveError(null);
    setEditing(true);
  }

  function handleCancelEditing() {
    setFirstName(myProfile?.first_name ?? '');
    setLastName(myProfile?.last_name ?? '');
    setSaveError(null);
    setEditing(false);
  }

  async function handleConfirm() {
    if (saving) return;
    setSaveError(null);
    if (!firstName.trim()) {
      setSaveError('El nombre no puede estar vacío.');
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ firstName, lastName });
    setSaving(false);
    if (error) {
      setSaveError(error);
      return;
    }
    setEditing(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header title="Perfil" showBack fallbackHref="/" size="md" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.avatarWrap}>
            <Avatar initials={initials} color={avatarColor} size={72} />
            <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 19, marginTop: Spacing.three }}>
              {fullName}
            </Text>
            {myProfile?.username && (
              <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 13 }}>
                @{myProfile.username}
              </Text>
            )}
          </View>

          <Section title="Editar perfil">
            <Field label="Nombre">
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                editable={editing}
                placeholder="Tu nombre"
                placeholderTextColor={theme.textFaint}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border, backgroundColor: editing ? theme.surface : theme.surfaceAlt },
                ]}
              />
            </Field>
            <Field label="Apellido">
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                editable={editing}
                placeholder="Tu apellido"
                placeholderTextColor={theme.textFaint}
                style={[
                  styles.input,
                  { color: theme.text, borderColor: theme.border, backgroundColor: editing ? theme.surface : theme.surfaceAlt },
                ]}
              />
            </Field>
            {saveError && <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{saveError}</Text>}
            {!editing ? (
              <Pressable
                onPress={handleStartEditing}
                style={[styles.secondaryBtn, { backgroundColor: theme.surfaceAlt }]}>
                <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 14 }}>Editar</Text>
              </Pressable>
            ) : (
              <View style={styles.editActionsRow}>
                <Pressable
                  onPress={handleCancelEditing}
                  style={[styles.secondaryBtn, styles.flexGrow, { backgroundColor: theme.surfaceAlt }]}>
                  <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 14 }}>Cancelar</Text>
                </Pressable>
                <View style={styles.flexGrow}>
                  <PrimaryButton label={saving ? 'Guardando...' : 'Confirmar'} onPress={handleConfirm} />
                </View>
              </View>
            )}
          </Section>

          <Section title="Cuenta">
            <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
              <InfoRow label="Usuario" value={myProfile?.username ? `@${myProfile.username}` : '—'} />
              <InfoRow label="Correo" value={user?.email ?? '—'} />
              <InfoRow
                label="Correo confirmado"
                value={user?.email_confirmed_at ? 'Sí' : 'No'}
                valueColor={user?.email_confirmed_at ? theme.success : theme.danger}
              />
              <InfoRow label="Cuenta creada" value={formatDate(user?.created_at ?? myProfile?.created_at)} />
              <InfoRow label="Último acceso" value={formatDate(user?.last_sign_in_at)} last />
            </Card>
          </Section>

          <Section title="Grupos">
            {groups.length === 0 ? (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5 }}>
                No perteneces a ningún grupo todavía.
              </Text>
            ) : (
              <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
                {groups.map((g, i) => (
                  <View
                    key={g.id}
                    style={[styles.row, i < groups.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                    <Text style={[styles.flexGrow, { color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                      {g.name}
                    </Text>
                    <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12 }}>
                      {ROLE_LABEL[g.role]}
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </Section>

          {isSupabaseConfigured && (
            <Pressable style={styles.signOut} onPress={() => signOut()}>
              <Text style={{ color: theme.danger, fontFamily: Fonts.bodyBold, fontSize: 13 }}>Cerrar sesión</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.display }]}>{title}</Text>
      {children}
    </View>
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

function InfoRow({
  label,
  value,
  valueColor,
  last,
}: {
  label: string;
  value: string;
  valueColor?: string;
  last?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[styles.row, !last && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 12.5 }}>{label}</Text>
      <Text style={{ color: valueColor ?? theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13 }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.five },
  avatarWrap: { alignItems: 'center', paddingTop: Spacing.three },
  section: { gap: Spacing.three },
  sectionTitle: { fontSize: 15.5 },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 13,
    paddingHorizontal: Spacing.four,
    fontSize: 14.5,
    fontFamily: Fonts.body,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: 11,
  },
  flexGrow: { flex: 1, minWidth: 0 },
  signOut: { alignItems: 'center', marginTop: Spacing.two, paddingVertical: Spacing.three },
  secondaryBtn: { borderRadius: Radii.md, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  editActionsRow: { flexDirection: 'row', gap: Spacing.three },
});
