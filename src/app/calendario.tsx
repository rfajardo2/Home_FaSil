import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryStyle } from '@/components/category-style';
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { IconCircle } from '@/components/ui/IconCircle';
import { NoGroupCard } from '@/components/ui/NoGroupCard';
import { StatusCheck } from '@/components/ui/StatusCheck';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import type { TaskRow } from '@/lib/database-types';

const WEEKDAY_LABELS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MONTH_LABEL_OPTIONS: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };

function dateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function todayKey(): string {
  const d = new Date();
  return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function CalendarioScreen() {
  const theme = useTheme();
  const { activeGroup, tasks, categories, members, toggleTask } = useAppData();

  const [viewYear, setViewYear] = useState(() => new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(todayKey());

  const tasksByDate = useMemo(() => {
    const map = new Map<string, TaskRow[]>();
    for (const task of tasks) {
      if (!task.due_date) continue;
      const list = map.get(task.due_date) ?? [];
      list.push(task);
      map.set(task.due_date, list);
    }
    return map;
  }, [tasks]);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
  const cells: (number | null)[] = [...Array(firstWeekday).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  const monthLabel = new Date(viewYear, viewMonth, 1).toLocaleDateString('es', MONTH_LABEL_OPTIONS);
  const selectedTasks = tasksByDate.get(selectedDate) ?? [];
  const selectedLabel = new Date(`${selectedDate}T00:00:00`).toLocaleDateString('es', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  function goToMonth(offset: number) {
    const d = new Date(viewYear, viewMonth + offset, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header
        title="Calendario"
        showBack
        fallbackHref="/tareas"
        size="md"
        right={
          activeGroup ? (
            <Pressable onPress={() => router.push('/nueva-tarea')} style={[styles.addBtn, { backgroundColor: theme.primary }]}>
              <PlusIcon size={16} color={theme.primaryOn} strokeWidth={2.4} />
            </Pressable>
          ) : undefined
        }
      />

      {!activeGroup ? (
        <View style={styles.center}>
          <NoGroupCard message="Crea un grupo o únete a uno para ver tareas y eventos en el calendario." />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.center}>
            <Card padding={16} style={{ gap: Spacing.four }}>
              <View style={styles.monthRow}>
                <Pressable onPress={() => goToMonth(-1)} style={[styles.navBtn, { backgroundColor: theme.surfaceAlt }]}>
                  <ChevronLeftIcon size={15} color={theme.text} />
                </Pressable>
                <Text style={[styles.monthLabel, { color: theme.text, fontFamily: Fonts.display }]}>
                  {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
                </Text>
                <Pressable onPress={() => goToMonth(1)} style={[styles.navBtn, { backgroundColor: theme.surfaceAlt }]}>
                  <ChevronRightIcon size={15} color={theme.text} />
                </Pressable>
              </View>

              <View style={styles.weekRow}>
                {WEEKDAY_LABELS.map((w) => (
                  <Text key={w} style={[styles.weekdayLabel, { color: theme.textFaint, fontFamily: Fonts.bodyBold }]}>
                    {w}
                  </Text>
                ))}
              </View>

              <View style={styles.grid}>
                {cells.map((day, i) => {
                  if (day === null) return <View key={`blank-${i}`} style={styles.cell} />;
                  const key = dateKey(viewYear, viewMonth, day);
                  const dayTasks = tasksByDate.get(key) ?? [];
                  const selected = key === selectedDate;
                  const isToday = key === todayKey();
                  return (
                    <Pressable key={key} onPress={() => setSelectedDate(key)} style={styles.cell}>
                      <View
                        style={[
                          styles.dayCircle,
                          selected && { backgroundColor: theme.primary },
                          !selected && isToday && { borderWidth: 1.5, borderColor: theme.primary },
                        ]}>
                        <Text
                          style={{
                            color: selected ? theme.primaryOn : theme.text,
                            fontFamily: isToday || selected ? Fonts.bodyBold : Fonts.body,
                            fontSize: 13,
                          }}>
                          {day}
                        </Text>
                      </View>
                      {dayTasks.length > 0 && (
                        <View style={[styles.dot, { backgroundColor: selected ? theme.primary : theme.textFaint }]} />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </Card>

            <View style={styles.listSection}>
              <Text style={[styles.listTitle, { color: theme.text, fontFamily: Fonts.display }]}>
                {selectedLabel}
              </Text>
              {selectedTasks.length === 0 ? (
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5, marginTop: Spacing.two }}>
                  No hay tareas ni eventos este día.
                </Text>
              ) : (
                <View style={{ gap: Spacing.two, marginTop: Spacing.three }}>
                  {selectedTasks.map((task) => {
                    const category = categories.find((c) => c.id === task.category_id);
                    const style = categoryStyle(category ?? { icon: 'pin', color: theme.textFaint });
                    const assignee = members.find((m) => m.id === task.assignee_id);
                    const done = task.status === 'done';
                    return (
                      <Card key={task.id} style={styles.taskRow} padding={12}>
                        <IconCircle size={38} background={style.soft}>
                          <style.Icon size={18} color={style.color} />
                        </IconCircle>
                        <View style={styles.flexGrow}>
                          <Text
                            style={{
                              color: done ? theme.textFaint : theme.text,
                              fontFamily: Fonts.bodyMedium,
                              fontSize: 14,
                              textDecorationLine: done ? 'line-through' : 'none',
                            }}>
                            {task.title}
                          </Text>
                          <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                            {category?.name ?? 'Sin categoría'} · {assignee?.name ?? 'Abierta'}
                          </Text>
                        </View>
                        <Pressable onPress={() => toggleTask(task)}>
                          <StatusCheck done={done} />
                        </Pressable>
                      </Card>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five },
  addBtn: { width: 34, height: 34, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  monthLabel: { fontSize: 16 },
  navBtn: { width: 30, height: 30, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  weekdayLabel: { flex: 1, textAlign: 'center', fontSize: 11 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', gap: 3, paddingVertical: 4 },
  dayCircle: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  listSection: { marginTop: Spacing.five },
  listTitle: { fontSize: 16 },
  taskRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flexGrow: { flex: 1, minWidth: 0 },
});
