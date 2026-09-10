import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon, getCategory } from '@/components/CategoryIcon';
import { PlusIcon, RepeatIcon, SearchIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { StatusCheck } from '@/components/ui/StatusCheck';
import { CATEGORIES, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { findMember, TASKS } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';
import type { Task } from '@/types';

const FREQUENCY_LABEL: Record<Task['frequency'], string> = {
  una_vez: 'Una vez',
  diaria: 'Diaria',
  semanal: 'Semanal',
  mensual: 'Mensual',
};

export default function TareasScreen() {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const visible = useMemo(
    () => (activeCategory ? TASKS.filter((t) => t.categoryId === activeCategory) : TASKS),
    [activeCategory],
  );
  const openTasks = visible.filter((t) => t.assigneeId === null);
  const todayTasks = visible.filter((t) => t.assigneeId !== null && t.dueLabel === 'Hoy');
  const weekTasks = visible.filter((t) => t.assigneeId !== null && t.dueLabel !== 'Hoy');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <View style={styles.center}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.display }]}>Tareas</Text>
          <View style={styles.headerActions}>
            <Pressable style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <SearchIcon size={17} color={theme.textSecondary} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/nueva-tarea')}
              style={[styles.iconBtn, { backgroundColor: theme.primary }]}>
              <PlusIcon size={17} color={theme.primaryOn} strokeWidth={2.2} />
            </Pressable>
          </View>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.chipsRow}
        style={styles.chipsScroll}>
        <Chip label="Todas" selected={activeCategory === null} onPress={() => setActiveCategory(null)} />
        {CATEGORIES.map((c) => (
          <Chip
            key={c.id}
            label={c.label}
            selected={activeCategory === c.id}
            activeColor={c.color}
            onPress={() => setActiveCategory(c.id)}
          />
        ))}
        <Chip label="+ Categoría" dashed activeColor={theme.primary} onPress={() => router.push('/categorias')} />
      </ScrollView>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          {openTasks.length > 0 && (
            <TaskSection title="Abiertas para el grupo">
              {openTasks.map((task) => {
                const category = getCategory(task.categoryId);
                return (
                  <Card key={task.id} style={styles.taskRow} padding={12} outlined outlineColor={category.color}>
                    <CategoryIcon categoryId={task.categoryId} />
                    <View style={styles.flexGrow}>
                      <Text style={[styles.taskTitle, { color: theme.text, fontFamily: Fonts.bodyMedium }]}>
                        {task.title}
                      </Text>
                      <Text style={{ color: category.color, fontFamily: Fonts.bodyMedium, fontSize: 11.5 }}>
                        Disponible · nadie la ha tomado
                      </Text>
                    </View>
                    <Pressable style={[styles.takeBtn, { backgroundColor: category.color }]}>
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
                <TaskRow key={task.id} task={task} />
              ))}
            </TaskSection>
          )}

          {weekTasks.length > 0 && (
            <TaskSection title="Esta semana">
              {weekTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </TaskSection>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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

function TaskRow({ task }: { task: Task }) {
  const theme = useTheme();
  const category = getCategory(task.categoryId);
  const assignee = findMember(task.assigneeId);
  const done = task.status === 'hecha';

  return (
    <Card style={styles.taskRow} padding={12}>
      <CategoryIcon categoryId={task.categoryId} />
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
            {category.label} ·
          </Text>
          {task.frequency !== 'una_vez' && <RepeatIcon size={11} color={theme.textFaint} strokeWidth={2} />}
          <Text style={{ color: done ? theme.textFaint : theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
            {task.frequency === 'una_vez' ? 'una vez' : FREQUENCY_LABEL[task.frequency]} · {assignee?.name}
          </Text>
        </View>
      </View>
      <StatusCheck done={done} />
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
