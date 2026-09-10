import { router, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryStyle } from '@/components/category-style';
import { PlusIcon, RepeatIcon, SearchIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { IconCircle } from '@/components/ui/IconCircle';
import { NoGroupCard } from '@/components/ui/NoGroupCard';
import { StatusCheck } from '@/components/ui/StatusCheck';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import type { TaskRow } from '@/lib/database-types';
import { taskDueLabel } from '@/lib/task-due-label';

const FREQUENCY_LABEL: Record<TaskRow['recurrence'], string> = {
  none: 'Una vez',
  daily: 'Diaria',
  weekly: 'Semanal',
  monthly: 'Mensual',
};

export default function TareasScreen() {
  const theme = useTheme();
  const { activeGroup, categories, members, tasks, toggleTask, claimTask } = useAppData();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();
  const [activeCategory, setActiveCategory] = useState<string | null>(categoryParam ?? null);

  const findMember = (id: string | null) => members.find((m) => m.id === id);

  const visible = useMemo(
    () => (activeCategory ? tasks.filter((t) => t.category_id === activeCategory) : tasks),
    [activeCategory, tasks],
  );
  const openTasks = visible.filter((t) => t.assignee_id === null);
  const todayTasks = visible.filter((t) => t.assignee_id !== null && taskDueLabel(t) === 'Hoy');
  const weekTasks = visible.filter((t) => t.assignee_id !== null && taskDueLabel(t) !== 'Hoy');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <View style={styles.center}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.display }]}>Tareas</Text>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <SearchIcon size={17} color={theme.textSecondary} />
            </Pressable>
            {activeGroup && (
              <Pressable
                onPress={() => router.push('/nueva-tarea')}
                style={[styles.iconBtn, { backgroundColor: theme.primary }]}>
                <PlusIcon size={17} color={theme.primaryOn} strokeWidth={2.2} />
              </Pressable>
            )}
          </View>
        </View>
      </View>

      {!activeGroup ? (
        <View style={styles.center}>
          <NoGroupCard message="Crea un grupo o únete a uno para ver y crear tareas." />
        </View>
      ) : (
        <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        <Chip label="Todas" selected={activeCategory === null} onPress={() => setActiveCategory(null)} />
        {categories.map((c) => (
          <Chip
            key={c.id}
            label={c.name}
            selected={activeCategory === c.id}
            activeColor={c.color}
            onPress={() => setActiveCategory(c.id)}
          />
        ))}
        <Chip label="+ Categoría" dashed activeColor={theme.primary} onPress={() => router.push('/categorias')} />
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          {tasks.length === 0 && (
            <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 13, textAlign: 'center', marginTop: Spacing.six }}>
              Aún no hay tareas. Crea la primera con el botón +.
            </Text>
          )}

          {openTasks.length > 0 && (
            <TaskSection title="Abiertas para el grupo">
              {openTasks.map((task) => {
                const category = categories.find((c) => c.id === task.category_id);
                const style = categoryStyle(category ?? { icon: 'pin', color: theme.textFaint });
                return (
                  <Card key={task.id} style={styles.taskRow} padding={12} outlined outlineColor={style.color}>
                    <IconCircle size={40} background={style.soft}>
                      <style.Icon size={19} color={style.color} />
                    </IconCircle>
                    <View style={styles.flexGrow}>
                      <Text style={[styles.taskTitle, { color: theme.text, fontFamily: Fonts.bodyMedium }]}>
                        {task.title}
                      </Text>
                      <Text style={{ color: style.color, fontFamily: Fonts.bodyMedium, fontSize: 11.5 }}>
                        Disponible · nadie la ha tomado
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => claimTask(task)}
                      style={[styles.takeBtn, { backgroundColor: style.color }]}>
                      <Text style={{ color: '#fff', fontFamily: Fonts.bodyBold, fontSize: 11.5 }}>Tomar</Text>
                    </Pressable>
                  </Card>
                );
              })}
            </TaskSection>
          )}

          {todayTasks.length > 0 && (
            <TaskSection title="Hoy">
              {todayTasks.map((task) => (
                <TaskListRow key={task.id} task={task} assigneeName={displayName(findMember(task.assignee_id)?.name)} onToggle={() => toggleTask(task)} />
              ))}
            </TaskSection>
          )}

          {weekTasks.length > 0 && (
            <TaskSection title="Esta semana">
              {weekTasks.map((task) => (
                <TaskListRow key={task.id} task={task} assigneeName={displayName(findMember(task.assignee_id)?.name)} onToggle={() => toggleTask(task)} />
              ))}
            </TaskSection>
          )}
        </View>
      </ScrollView>
        </>
      )}
    </SafeAreaView>
  );
}

function displayName(name?: string) {
  return name ?? '';
}

function TaskSection({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textSecondary, fontFamily: Fonts.display }]}>
        {title.toUpperCase()}
      </Text>
      <View style={{ gap: Spacing.two }}>{children}</View>
    </View>
  );
}

function TaskListRow({ task, assigneeName, onToggle }: { task: TaskRow; assigneeName: string; onToggle: () => void }) {
  const theme = useTheme();
  const { categories } = useAppData();
  const category = categories.find((c) => c.id === task.category_id);
  const style = categoryStyle(category ?? { icon: 'pin', color: theme.textFaint });
  const done = task.status === 'done';

  return (
    <Card style={styles.taskRow} padding={12}>
      <IconCircle size={40} background={style.soft}>
        <style.Icon size={19} color={style.color} />
      </IconCircle>
      <View style={styles.flexGrow}>
        <Text
          style={[
            styles.taskTitle,
            {
              color: done ? theme.textFaint : theme.text,
              fontFamily: Fonts.bodyMedium,
              textDecorationLine: done ? 'line-through' : 'none',
            },
          ]}>
          {task.title}
        </Text>
        <View style={styles.subtitleRow}>
          <Text style={{ color: done ? theme.textFaint : theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
            {category?.name ?? 'Sin categoría'} ·
          </Text>
          {task.recurrence !== 'none' && <RepeatIcon size={11} color={theme.textFaint} strokeWidth={2} />}
          <Text style={{ color: done ? theme.textFaint : theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
            {FREQUENCY_LABEL[task.recurrence]} · {assigneeName}
          </Text>
        </View>
      </View>
      <Pressable onPress={onToggle}>
        <StatusCheck done={done} />
      </Pressable>
    </Card>
  );
}

const styles = StyleSheet.create({
  center: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.five,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
  },
  title: { fontSize: 23 },
  headerActions: { flexDirection: 'row', gap: Spacing.two },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radii.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipsScroll: { flexGrow: 0 },
  chipsRow: {
    gap: Spacing.two,
    paddingHorizontal: Spacing.five,
    paddingBottom: Spacing.four,
  },
  scroll: {
    alignItems: 'center',
    paddingBottom: Spacing.eight,
  },
  section: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  sectionTitle: { fontSize: 13, letterSpacing: 0.4 },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  flexGrow: { flex: 1, minWidth: 0 },
  taskTitle: { fontSize: 14.5 },
  subtitleRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2, flexWrap: 'wrap' },
  takeBtn: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: Radii.pill,
  },
});
