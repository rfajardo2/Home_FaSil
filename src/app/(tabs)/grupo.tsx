import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SlidersIcon, TrophyIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { NoGroupCard } from '@/components/ui/NoGroupCard';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { isSupabaseConfigured } from '@/lib/supabase';

/** 100 points per level — not modeled server-side, just a simple, consistent display rule. */
const POINTS_PER_LEVEL = 100;
function levelFor(points: number) {
  return Math.floor(points / POINTS_PER_LEVEL) + 1;
}

export default function GrupoScreen() {
  const theme = useTheme();
  const { session, signOut } = useAuth();
  const { activeGroup, members } = useAppData();

  const ranked = [...members].sort((a, b) => b.points - a.points);
  const you = members.find((m) => m.id === session?.user?.id) ?? members[0];
  const youLevel = levelFor(you?.points ?? 0);
  const nextLevelPoints = youLevel * POINTS_PER_LEVEL;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.display }]}>
                {activeGroup?.name ?? 'Sin grupo'}
              </Text>
              <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 12.5 }}>
                {members.length} {members.length === 1 ? 'integrante' : 'integrantes'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/grupos')}
              style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <SlidersIcon size={17} color={theme.textSecondary} />
            </Pressable>
          </View>

          {!activeGroup && <NoGroupCard message="Crea un grupo o únete a uno para ver el ranking y los logros del hogar." />}

          {/* Leaderboard */}
          {activeGroup && ranked.length > 0 && (
            <Section title="Ranking">
              <Card style={[styles.leaderRow, { backgroundColor: theme.primarySoft }]} padding={13}>
                <Text style={[styles.rankIndex, { color: theme.primary, fontFamily: Fonts.display }]}>1</Text>
                <Avatar initials={ranked[0].initials} color={ranked[0].avatar_color} size={44} />
                <View style={styles.flexGrow}>
                  <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 14.5 }}>
                    {ranked[0].id === session?.user?.id ? 'Tú' : ranked[0].name}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11 }}>
                    Nivel {levelFor(ranked[0].points)} · líder
                  </Text>
                </View>
                <TrophyIcon size={16} color={theme.primary} />
                <Text style={[styles.rankPoints, { color: theme.text, fontFamily: Fonts.display, fontSize: 14.5 }]}>
                  {ranked[0].points} pts
                </Text>
              </Card>

              {ranked.length > 1 && (
                <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
                  {ranked.slice(1).map((member, i) => (
                    <View
                      key={member.id}
                      style={[
                        styles.simpleRow,
                        i < ranked.length - 2 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                      ]}>
                      <Text style={[styles.rankIndexSmall, { color: theme.textFaint, fontFamily: Fonts.display }]}>
                        {i + 2}
                      </Text>
                      <Avatar initials={member.initials} color={member.avatar_color} size={36} />
                      <Text style={[styles.flexGrow, { color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                        {member.id === session?.user?.id ? 'Tú' : member.name}
                      </Text>
                      <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 13 }}>
                        {member.points} pts
                      </Text>
                    </View>
                  ))}
                </Card>
              )}
            </Section>
          )}

          {/* Achievements — catalog isn't seeded yet (supabase/schema.sql's `achievements` table), so nothing to unlock yet. */}
          {activeGroup && (
            <Section title="Logros">
              <Card padding={16}>
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5, textAlign: 'center' }}>
                  Todavía no hay logros configurados para este grupo.
                </Text>
              </Card>
            </Section>
          )}

          {/* Your progress */}
          {activeGroup && you && (
            <Section title="Tu progreso">
              <Card padding={15} style={{ gap: Spacing.two }}>
                <View style={styles.progressHeaderRow}>
                  <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 13.5 }}>
                    Nivel {youLevel}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 12 }}>
                    {you.points} / {nextLevelPoints} pts
                  </Text>
                </View>
                <View style={[styles.barTrack, { backgroundColor: theme.surfaceAlt }]}>
                  <View
                    style={[
                      styles.barFill,
                      { backgroundColor: theme.primary, width: `${Math.min(100, (you.points / nextLevelPoints) * 100)}%` },
                    ]}
                  />
                </View>
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11.5 }}>
                  {Math.max(0, nextLevelPoints - you.points)} pts para el nivel {youLevel + 1}
                </Text>
              </Card>
            </Section>
          )}

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
      <View style={{ gap: Spacing.two }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
  },
  title: { fontSize: 22 },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginTop: Spacing.five, gap: Spacing.three },
  sectionTitle: { fontSize: 15.5 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flexGrow: { flex: 1, minWidth: 0 },
  rankIndex: { width: 18, fontSize: 14 },
  rankIndexSmall: { width: 18, fontSize: 13 },
  rankPoints: { width: 54, textAlign: 'right' },
  simpleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 10 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barTrack: { height: 9, borderRadius: Radii.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: Radii.pill },
  signOut: { alignItems: 'center', marginTop: Spacing.six, paddingVertical: Spacing.three },
});
