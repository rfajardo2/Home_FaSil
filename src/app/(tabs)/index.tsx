import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryStyle } from '@/components/category-style';
import { BellIcon, ChevronDownIcon, HomeIcon, PlusIcon, StarIcon, TrophyIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { IconCircle } from '@/components/ui/IconCircle';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { StatusCheck } from '@/components/ui/StatusCheck';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { taskDueLabel } from '@/lib/task-due-label';

export default function InicioScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { activeGroup, members, categories, tasks, toggleTask } = useAppData();

  const you = members.find((m) => m.id === session?.user?.id) ?? members[0];
  const todayTasks = tasks.filter((t) => taskDueLabel(t) === 'Hoy');
  const todayAssigned = todayTasks.filter((t) => t.assignee_id);
  const doneToday = todayAssigned.filter((t) => t.status === 'done').length;
  const progress = todayAssigned.length > 0 ? doneToday / todayAssigned.length : 0;
  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const topMembers = [...members].sort((a, b) => b.points - a.points).slice(0, 2);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View>
              <Text style={[styles.hello, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Hola de nuevo
              </Text>
              <Text style={[styles.name, { color: theme.text, fontFamily: Fonts.display }]}>
                {you?.name ?? '...'}
              </Text>
            </View>
            <Pressable
              onPress={() => router.push('/notificaciones')}
              style={[styles.bellBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <BellIcon size={19} color={theme.textSecondary} />
              <View style={[styles.bellDot, { backgroundColor: theme.primary, borderColor: theme.surface }]} />
            </Pressable>
          </View>

          {/* Group switcher */}
          <Pressable
            onPress={() => router.push('/grupos')}
            style={[styles.groupPill, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <IconCircle size={22} background={theme.primarySoft}>
              <HomeIcon size={12} color={theme.primary} strokeWidth={2.2} />
            </IconCircle>
            <Text style={[styles.groupLabel, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
              {activeGroup?.name ?? 'Sin grupo'}
            </Text>
            <ChevronDownIcon size={12} color={theme.textFaint} strokeWidth={2.2} />
          </Pressable>

          {/* Progress card */}
          <Card style={styles.progressCard} padding={16}>
            <View>
              <Text style={[styles.smallLabel, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                Progreso de hoy
              </Text>
              <Text style={[styles.bigStat, { color: theme.text, fontFamily: Fonts.display }]}>
                {doneToday} de {todayAssigned.length}
              </Text>
              <Text style={[styles.faintLabel, { color: theme.textFaint, fontFamily: Fonts.body }]}>
                tareas completadas
              </Text>
            </View>
            <ProgressRing size={60} progress={progress} trackColor={theme.border} progressColor={theme.primary} />
          </Card>

          {/* Tareas de hoy */}
          <Section title="Tareas de hoy" actionLabel="Ver todas" onAction={() => router.push('/tareas')}>
            {todayAssigned.length === 0 && (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5 }}>
                No hay tareas asignadas para hoy.
              </Text>
            )}
            {todayAssigned.slice(0, 2).map((task) => {
              const category = categories.find((c) => c.id === task.category_id);
              const style = categoryStyle(category ?? { icon: 'pin', color: theme.textFaint });
              const assignee = members.find((m) => m.id === task.assignee_id);
              return (
                <Card key={task.id} style={styles.taskRow} padding={12}>
                  <IconCircle size={38} background={style.soft}>
                    <style.Icon size={18} color={style.color} />
                  </IconCircle>
                  <View style={styles.flexGrow}>
                    <Text
                      style={[
                        styles.taskTitle,
                        {
                          color: theme.text,
                          fontFamily: Fonts.bodyMedium,
                          textDecorationLine: task.status === 'done' ? 'line-through' : 'none',
                          opacity: task.status === 'done' ? 0.55 : 1,
                        },
                      ]}>
                      {task.title}
                    </Text>
                    <Text style={[styles.taskSubtitle, { color: theme.textSecondary, fontFamily: Fonts.body }]}>
                      {category?.name ?? 'Sin categoría'} · {assignee?.name}
                    </Text>
                  </View>
                  <Pressable onPress={() => toggleTask(task)}>
                    <StatusCheck done={task.status === 'done'} />
                  </Pressable>
                </Card>
              );
            })}
          </Section>

          {/* Tu semana */}
          <Section title="Tu semana">
            <View style={styles.rowGap}>
              <Card style={styles.statCard} padding={13}>
                <IconCircle size={34} background={theme.primarySoft}>
                  <StarIcon size={17} color={theme.primary} />
                </IconCircle>
                <View>
                  <Text style={[styles.statValue, { color: theme.text, fontFamily: Fonts.display }]}>{doneCount}</Text>
                  <Text style={[styles.statCaption, { color: theme.textFaint, fontFamily: Fonts.body }]}>
                    tareas hechas
                  </Text>
                </View>
              </Card>
              <Card style={styles.statCard} padding={13}>
                <IconCircle size={34} background={theme.primarySoft}>
                  <StarIcon size={17} color={theme.primary} />
                </IconCircle>
                <View>
                  <Text style={[styles.statValue, { color: theme.text, fontFamily: Fonts.display }]}>
                    {you?.points ?? 0} pts
                  </Text>
                  <Text style={[styles.statCaption, { color: theme.textFaint, fontFamily: Fonts.body }]}>
                    en el grupo
                  </Text>
                </View>
              </Card>
            </View>
          </Section>

          {/* Ranking familiar */}
          <Section title="Ranking familiar" actionLabel="Ver todo" onAction={() => router.push('/grupo')}>
            {topMembers.length === 0 ? (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5 }}>
                Todavía no hay nadie más en el grupo.
              </Text>
            ) : (
              <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
                {topMembers.map((member, i) => (
                  <View
                    key={member.id}
                    style={[
                      styles.rankRow,
                      i < topMembers.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                    ]}>
                    <Text style={[styles.rankIndex, { color: theme.textFaint, fontFamily: Fonts.display }]}>
                      {i + 1}
                    </Text>
                    <Avatar initials={member.initials} color={member.avatar_color} size={28} />
                    <Text style={[styles.rankName, { color: theme.text, fontFamily: Fonts.bodyMedium }]}>
                      {member.id === session?.user?.id ? 'Tú' : member.name}
                    </Text>
                    {i === 0 && <TrophyIcon size={15} color={theme.primary} />}
                    <Text style={[styles.rankPoints, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
                      {member.points} pts
                    </Text>
                  </View>
                ))}
              </Card>
            )}
          </Section>

          {/* Quick actions */}
          <View style={styles.quickRow}>
            <QuickAction label="Tarea" primary onPress={() => router.push('/nueva-tarea')} />
            <QuickAction label="Gasto" onPress={() => router.push('/gastos')} />
            <QuickAction label="Evento" onPress={() => router.push('/nueva-tarea')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  actionLabel,
  onAction,
  children,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.display }]}>{title}</Text>
        {actionLabel && (
          <Pressable onPress={onAction}>
            <Text style={[styles.sectionAction, { color: theme.primary, fontFamily: Fonts.bodyBold }]}>
              {actionLabel}
            </Text>
          </Pressable>
        )}
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function QuickAction({ label, primary, onPress }: { label: string; primary?: boolean; onPress?: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.quickBtn,
        {
          backgroundColor: primary ? theme.primary : theme.surface,
          borderColor: primary ? theme.primary : theme.border,
        },
      ]}>
      <PlusIcon size={15} color={primary ? theme.primaryOn : theme.text} strokeWidth={2.2} />
      <Text
        style={{
          color: primary ? theme.primaryOn : theme.text,
          fontFamily: Fonts.bodyBold,
          fontSize: 12.5,
        }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: {
    alignItems: 'center',
    paddingBottom: Spacing.eight,
  },
  center: {
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.five,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
  },
  hello: { fontSize: 13 },
  name: { fontSize: 23 },
  bellBtn: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bellDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  groupPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: Spacing.two,
    marginTop: Spacing.four,
    paddingVertical: 6,
    paddingHorizontal: Spacing.three,
    paddingRight: Spacing.four,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  groupLabel: { fontSize: 12.5 },
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
  },
  smallLabel: { fontSize: 12.5 },
  bigStat: { fontSize: 22 },
  faintLabel: { fontSize: 11.5 },
  section: {
    marginTop: Spacing.five,
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 15.5 },
  sectionAction: { fontSize: 12.5 },
  sectionBody: { gap: Spacing.two },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flexGrow: { flex: 1, minWidth: 0 },
  taskTitle: { fontSize: 14 },
  taskSubtitle: { fontSize: 11.5, marginTop: 1 },
  rowGap: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  statCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  statValue: { fontSize: 16 },
  statCaption: { fontSize: 11 },
  rankRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: 10,
  },
  rankIndex: { width: 16, fontSize: 12.5 },
  rankName: { flex: 1, fontSize: 13.5 },
  rankPoints: { fontSize: 13, width: 60, textAlign: 'right' },
  quickRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.five,
  },
  quickBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: Radii.md,
    borderWidth: 1,
  },
});
