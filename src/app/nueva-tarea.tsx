import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalendarIcon, PlusIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { BottomTabInset, CATEGORIES, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { MEMBERS } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';
import type { CategoryId } from '@/constants/theme';
import type { TaskFrequency } from '@/types';
import { router } from 'expo-router';

const FREQUENCY_OPTIONS: { value: TaskFrequency; label: string }[] = [
  { value: 'una_vez', label: 'Una vez' },
  { value: 'diaria', label: 'Diaria' },
  { value: 'semanal', label: 'Semanal' },
  { value: 'mensual', label: 'Mensual' },
];

export default function NuevaTareaScreen() {
  const theme = useTheme();
  const [title, setTitle] = useState('Lavar los platos');
  const [categoryId, setCategoryId] = useState<CategoryId>('cocina');
  const [assignMode, setAssignMode] = useState<'alguien' | 'abierta'>('alguien');
  const [assigneeId, setAssigneeId] = useState(MEMBERS[1].id);
  const [frequency, setFrequency] = useState<TaskFrequency>('diaria');
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header
        title="Nueva tarea"
        showBack
        size="md"
        right={
          <Pressable
            onPress={() => router.back()}
            style={[styles.saveBtn, { backgroundColor: theme.primary }]}>
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
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          <Field label="Categoría">
            <View style={styles.wrapRow}>
              {CATEGORIES.map((c) => {
                const selected = categoryId === c.id;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(c.id)}
                    style={[
                      styles.pill,
                      { backgroundColor: selected ? c.color : theme.surface, borderColor: selected ? c.color : theme.border },
                    ]}>
                    <Text style={{ color: selected ? '#fff' : c.color, fontFamily: Fonts.bodyBold, fontSize: 13 }}>
                      {c.label}
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
                {MEMBERS.map((m) => (
                  <Pressable key={m.id} onPress={() => setAssigneeId(m.id)} style={styles.avatarCol}>
                    <Avatar
                      initials={m.initials}
                      color={m.avatarColor}
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
                      {m.isYou ? 'Tú' : m.name}
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
            <SegmentedControl value={frequency} onChange={(v) => setFrequency(v as TaskFrequency)} options={FREQUENCY_OPTIONS} />
          </Field>

          <Field label="Fecha límite">
            <View style={[styles.input, styles.dateRow, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <Text style={{ color: theme.text, fontFamily: Fonts.body, fontSize: 14.5 }}>Hoy, 10 sept</Text>
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
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <PrimaryButton label="Guardar tarea" onPress={() => router.back()} />
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
