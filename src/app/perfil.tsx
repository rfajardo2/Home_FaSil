import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
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
  const { myProfile, groups } = useAppData();
  const user = session?.user;

  const fullName = myProfile?.name || (user?.user_metadata?.name as string | undefined) || 'Usuario';
  const initials = myProfile?.initials ?? fullName[0]?.toUpperCase() ?? 'U';
  const avatarColor = myProfile?.avatar_color ?? theme.primary;

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

          <Section title="Cuenta">
            <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
              <InfoRow label="Nombre" value={myProfile?.first_name ?? '—'} />
              <InfoRow label="Apellido" value={myProfile?.last_name ?? '—'} />
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    paddingVertical: 11,
  },
  flexGrow: { flex: 1, minWidth: 0 },
  signOut: { alignItems: 'center', marginTop: Spacing.two, paddingVertical: Spacing.three },
});
