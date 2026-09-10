import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getCategory } from '@/components/CategoryIcon';
import { SlidersIcon, TrophyIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { IconCircle } from '@/components/ui/IconCircle';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { ACHIEVEMENTS, GROUPS, MEMBERS } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';

const activeGroup = GROUPS.find((g) => g.active)!;
const ranked = [...MEMBERS].sort((a, b) => b.points - a.points);
const you = MEMBERS.find((m) => m.isYou)!;
const pointsToNextLevel = 400;

export default function GrupoScreen() {
  const theme = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.display }]}>
                {activeGroup.name}
              </Text>
              <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 12.5 }}>
                {activeGroup.memberCount} integrantes
              </Text>
            </View>
            <View style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <SlidersIcon size={17} color={theme.textSecondary} />
            </View>
          </View>

          {/* Leaderboard */}
          <Section title="Ranking del mes">
            <Card style={[styles.leaderRow, { backgroundColor: theme.primarySoft }]} padding={13}>
              <Text style={[styles.rankIndex, { color: theme.primary, fontFamily: Fonts.display }]}>1</Text>
              <Avatar initials={ranked[0].initials} color={ranked[0].avatarColor} size={44} />
              <View style={styles.flexGrow}>
                <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 14.5 }}>
                  {ranked[0].isYou ? 'Tú' : ranked[0].name}
                </Text>
                <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11 }}>
                  Nivel {ranked[0].level} · líder del mes
                </Text>
              </View>
              <TrophyIcon size={16} color={getCategory('cocina').color} />
              <Text style={[styles.rankPoints, { color: theme.text, fontFamily: Fonts.display, fontSize: 14.5 }]}>
                {ranked[0].points} pts
              </Text>
            </Card>

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
                  <Avatar initials={member.initials} color={member.avatarColor} size={36} />
                  <Text style={[styles.flexGrow, { color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                    {member.isYou ? 'Tú' : member.name}
                  </Text>
                  <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 13 }}>
                    {member.points} pts
                  </Text>
                </View>
              ))}
            </Card>
          </Section>

          {/* Achievements */}
          <Section title="Logros">
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((a) => (
                <Card
                  key={a.id}
                  style={[styles.achievementCard, !a.unlocked && { opacity: 0.45 }]}
                  padding={12}>
                  <IconCircle size={42} background={a.unlocked ? theme.primarySoft : theme.surfaceAlt}>
                    <TrophyIcon size={19} color={a.unlocked ? theme.primary : theme.textFaint} />
                  </IconCircle>
                  <Text
                    style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 10.5, textAlign: 'center' }}
                    numberOfLines={2}>
                    {a.label}
                  </Text>
                </Card>
              ))}
            </View>
          </Section>

          {/* Your progress */}
          <Section title="Tu progreso">
            <Card padding={15} style={{ gap: Spacing.two }}>
              <View style={styles.progressHeaderRow}>
                <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 13.5 }}>
                  Nivel {you.level}
                </Text>
                <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 12 }}>
                  {you.points} / {pointsToNextLevel} pts
                </Text>
              </View>
              <View style={[styles.barTrack, { backgroundColor: theme.surfaceAlt }]}>
                <View
                  style={[
                    styles.barFill,
                    { backgroundColor: theme.primary, width: `${Math.min(100, (you.points / pointsToNextLevel) * 100)}%` },
                  ]}
                />
              </View>
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11.5 }}>
                {pointsToNextLevel - you.points} pts para el nivel {you.level + 1}
              </Text>
            </Card>
          </Section>
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
  achievementsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  achievementCard: { width: '31.5%', alignItems: 'center', gap: 6 },
  progressHeaderRow: { flexDirection: 'row', justifyContent: 'space-between' },
  barTrack: { height: 9, borderRadius: Radii.pill, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: Radii.pill },
});
