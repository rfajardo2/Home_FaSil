import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryStyle } from '@/components/category-style';
import { CalendarIcon, PlusIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { BottomTabInset, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import type { TaskRow } from '@/lib/database-types';

const FREQUENCY_OPTIONS: { value: TaskRow['recurrence']; label: string }[] = [
  { value: 'none', label: 'Una vez' },
  { value: 'daily', label: 'Diaria' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensual' },
];

export default function NuevaTareaScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { categories, members, createTask } = useAppData();
  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [assignMode, setAssignMode] = useState<'alguien' | 'abierta'>('alguien');
  const [assigneeId, setAssigneeId] = useState<string | null>(session?.user?.id ?? members[0]?.id ?? null);
  const [frequency, setFrequency] = useState<TaskRow['recurrence']>('none');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Categories load asynchronously; default to the first one once they arrive
  // (but don't clobber a choice the user already made).
  useEffect(() => {
    setCategoryId((current) => current ?? categories[0]?.id ?? null);
  }, [categories]);

  async function handleSave() {
    if (saving) return;
    setError(null);
    if (!title.trim()) {
      setError('Ponle un título a la tarea.');
      return;
    }
    setSaving(true);
    const { error: saveError } = await createTask({
      title: title.trim(),
      categoryId,
      assigneeId: assignMode === 'abierta' ? null : assigneeId,
      recurrence: frequency,
      dueDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || null,
    });
    setSaving(false);
    if (saveError) {
      setError(saveError);
      return;
    }
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header
        title="Nueva tarea"
        showBack
        size="md"
        right={
          <Pressable onPress={handleSave} style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
            <PlusIcon size={16} color={theme.primaryOn} strokeWidth={2.4} />
          </Pressable>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          <Field label="Título">
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Ej. Lavar los platos"
              placeholderTextColor={theme.textFaint}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          <Field label="Categoría">
            <View style={styles.wrapRow}>
              {categories.map((c) => {
                const selected = categoryId === c.id;
                const style = categoryStyle(c);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[
                      styles.pill,
                      { backgroundColor: selected ? style.color : theme.surface, borderColor: selected ? style.color : theme.border },
                    ]}>
                    <Text style={{ color: selected ? '#fff' : style.color, fontFamily: Fonts.bodyBold, fontSize: 13 }}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => router.push('/categorias')}
                style={[styles.pill, styles.dashedPill, { borderColor: theme.primary }]}>
                <PlusIcon size={11} color={theme.primary} strokeWidth={2.4} />
                <Text style={{ color: theme.primary, fontFamily: Fonts.bodyBold, fontSize: 13 }}> Nueva</Text>
              </Pressable>
            </View>
          </Field>

          <Field label="¿A quién se la asignas?">
            <SegmentedControl
              value={assignMode}
              onChange={(v) => setAssignMode(v as typeof assignMode)}
              options={[
                { value: 'alguien', label: 'Asignar a alguien' },
                { value: 'abierta', label: 'Dejar abierta' },
              ]}
            />
            {assignMode === 'alguien' ? (
              <View style={styles.avatarRow}>
                {members.map((m) => (
                  <Pressable key={m.id} onPress={() => setAssigneeId(m.id)} style={styles.avatarCol}>
                    <Avatar
                      initials={m.initials}
                      color={m.avatar_color}
                      size={50}
                      selected={assigneeId === m.id}
                      faded={assigneeId !== m.id}
                    />
                    <Text
                      style={{
                        color: assigneeId === m.id ? theme.text : theme.textFaint,
                        fontFamily: Fonts.bodyMedium,
                        fontSize: 11,
                      }}>
                      {m.id === session?.user?.id ? 'Tú' : m.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
            ) : (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11 }}>
                Cualquier persona del grupo podrá tomarla desde la pestaña Tareas.
              </Text>
            )}
          </Field>

          <Field label="Frecuencia">
            <SegmentedControl value={frequency} onChange={(v) => setFrequency(v as TaskRow['recurrence'])} options={FREQUENCY_OPTIONS} />
          </Field>

          <Field label="Fecha límite">
            <View style={[styles.input, styles.dateRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Text style={{ color: theme.text, fontFamily: Fonts.body, fontSize: 14.5 }}>
                {new Date().toLocaleDateString('es', { day: 'numeric', month: 'short' })}
              </Text>
              <CalendarIcon size={17} color={theme.textSecondary} />
            </View>
          </Field>

          <Field label="Notas">
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Agrega notas o instrucciones..."
              placeholderTextColor={theme.textFaint}
              multiline
              style={[
                styles.input,
                styles.textarea,
                { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface },
              ]}
            />
          </Field>

          {error && <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{error}</Text>}
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <PrimaryButton label={saving ? 'Guardando...' : 'Guardar tarea'} onPress={handleSave} />
      </View>
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

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: 110 },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.five },
  field: { gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 13,
    paddingHorizontal: Spacing.four,
    fontSize: 14.5,
    fontFamily: Fonts.body,
  },
  textarea: { height: 76, textAlignVertical: 'top' },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radii.pill, borderWidth: 1 },
  dashedPill: { flexDirection: 'row', alignItems: 'center', borderStyle: 'dashed' },
  avatarRow: { flexDirection: 'row', gap: Spacing.four, marginTop: 2 },
  avatarCol: { alignItems: 'center', gap: 5 },
  saveBtn: { width: 38, height: 38, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center' },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.five, paddingTop: Spacing.three },
});
