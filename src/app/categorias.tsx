import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryStyle } from '@/components/category-style';
import { ChevronRightIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { IconCircle } from '@/components/ui/IconCircle';
import { NoGroupCard } from '@/components/ui/NoGroupCard';
import { AccentColors, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const NEW_CATEGORY_COLORS = [
  AccentColors.petGreen,
  AccentColors.catCocina,
  AccentColors.catLimpieza,
  AccentColors.catServicios,
  AccentColors.catMantenimiento,
  AccentColors.catEventos,
];
/** Icon keys must match CATEGORY_ICONS in @/components/icons. */
const NEW_CATEGORY_ICONS = ['paw', 'heart', 'pin', 'gift'];

export default function CategoriasScreen() {
  const theme = useTheme();
  const { activeGroup, categories, tasks, createCategory } = useAppData();
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const taskCountByCategory = tasks.reduce<Record<string, number>>((acc, t) => {
    if (t.category_id) acc[t.category_id] = (acc[t.category_id] ?? 0) + 1;
    return acc;
  }, {});

  async function handleCreate() {
    if (creating) return;
    setError(null);
    if (!name.trim()) {
      setError('Ponle un nombre a la categoría.');
      return;
    }
    setCreating(true);
    const { error: createError } = await createCategory(name.trim(), NEW_CATEGORY_ICONS[iconIndex], NEW_CATEGORY_COLORS[colorIndex]);
    setCreating(false);
    if (createError) {
      setError(createError);
      return;
    }
    setName('');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header title="Categorías" showBack fallbackHref="/" size="md" />
      {!activeGroup ? (
        <View style={styles.center}>
          <NoGroupCard message="Crea un grupo o únete a uno para ver y crear categorías." />
        </View>
      ) : (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          {categories.length > 0 && (
            <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
              {categories.map((c, i) => {
                const style = categoryStyle(c);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => router.push({ pathname: '/tareas', params: { category: c.id } })}
                    style={[
                      styles.row,
                      i < categories.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                    ]}>
                    <IconCircle size={32} background={style.soft}>
                      <style.Icon size={15} color={style.color} />
                    </IconCircle>
                    <View style={styles.flexGrow}>
                      <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }}>{c.name}</Text>
                      <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11 }}>
                        {taskCountByCategory[c.id] ?? 0} tareas
                      </Text>
                    </View>
                    <ChevronRightIcon size={15} color={theme.textFaint} />
                  </Pressable>
                );
              })}
            </Card>
          )}

          <View style={styles.newCategory}>
            <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.display }]}>
              Nueva categoría
            </Text>

            <Field label="Nombre">
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ej. Mascotas"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              />
            </Field>

            <Field label="Color">
              <View style={styles.swatchRow}>
                {NEW_CATEGORY_COLORS.map((c, i) => (
                  <Pressable
                    key={c}
                    onPress={() => setColorIndex(i)}
                    style={[
                      styles.swatch,
                      { backgroundColor: c },
                      colorIndex === i && { borderWidth: 2.5, borderColor: theme.background },
                    ]}
                  />
                ))}
              </View>
            </Field>

            <Field label="Ícono">
              <View style={styles.swatchRow}>
                {NEW_CATEGORY_ICONS.map((iconKey, i) => {
                  const style = categoryStyle({ icon: iconKey, color: NEW_CATEGORY_COLORS[colorIndex] });
                  const selected = iconIndex === i;
                  return (
                    <Pressable
                      key={iconKey}
                      onPress={() => setIconIndex(i)}
                      style={[
                        styles.iconSwatch,
                        {
                          backgroundColor: selected ? NEW_CATEGORY_COLORS[colorIndex] : theme.surface,
                          borderColor: selected ? NEW_CATEGORY_COLORS[colorIndex] : theme.border,
                        },
                      ]}>
                      <style.Icon size={17} color={selected ? '#fff' : theme.textSecondary} />
                    </Pressable>
                  );
                })}
              </View>
            </Field>

            {error && <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{error}</Text>}

            <Pressable onPress={handleCreate} style={[styles.createBtn, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.primaryOn, fontFamily: Fonts.bodyBold, fontSize: 14 }}>
                {creating ? 'Creando...' : 'Crear categoría'}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.two }}>
      <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyBold, fontSize: 12.5 }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.five },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three, paddingVertical: 11 },
  flexGrow: { flex: 1, minWidth: 0 },
  newCategory: { gap: Spacing.four },
  sectionTitle: { fontSize: 15.5 },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.four,
    fontSize: 14,
    fontFamily: Fonts.body,
  },
  swatchRow: { flexDirection: 'row', gap: Spacing.three },
  swatch: { width: 28, height: 28, borderRadius: 14 },
  iconSwatch: { width: 38, height: 38, borderRadius: 19, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  createBtn: { borderRadius: Radii.md, paddingVertical: 13, alignItems: 'center', marginTop: 2 },
});
