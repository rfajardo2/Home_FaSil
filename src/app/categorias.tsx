import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CATEGORY_ICONS, ChevronRightIcon, GiftIcon, HeartIcon, PawIcon, PinIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { IconCircle } from '@/components/ui/IconCircle';
import { AccentColors, CATEGORIES, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const TASK_COUNTS: Record<string, number> = { cocina: 8, limpieza: 6, servicios: 4, mantenimiento: 3, eventos: 2 };
const NEW_CATEGORY_COLORS = [
  AccentColors.petGreen,
  AccentColors.catCocina,
  AccentColors.catLimpieza,
  AccentColors.catServicios,
  AccentColors.catMantenimiento,
  AccentColors.catEventos,
];
const NEW_CATEGORY_ICONS = [PawIcon, HeartIcon, PinIcon, GiftIcon];

export default function CategoriasScreen() {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header title="Categorías" showBack size="md" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
            {CATEGORIES.map((c, i) => {
              const Icon = CATEGORY_ICONS[c.icon];
              return (
                <View
                  key={c.id}
                  style={[
                    styles.row,
                    i < CATEGORIES.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                  ]}>
                  <IconCircle size={32} background={c.soft}>
                    <Icon size={15} color={c.color} />
                  </IconCircle>
                  <View style={styles.flexGrow}>
                    <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }}>{c.label}</Text>
                    <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11 }}>
                      {TASK_COUNTS[c.id] ?? 0} tareas
                    </Text>
                  </View>
                  <ChevronRightIcon size={15} color={theme.textFaint} />
                </View>
              );
            })}
          </Card>

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
                {NEW_CATEGORY_ICONS.map((Icon, i) => (
                  <Pressable
                    key={i}
                    onPress={() => setIconIndex(i)}
                    style={[
                      styles.iconSwatch,
                      {
                        backgroundColor: iconIndex === i ? NEW_CATEGORY_COLORS[colorIndex] : theme.surface,
                        borderColor: iconIndex === i ? NEW_CATEGORY_COLORS[colorIndex] : theme.border,
                      },
                    ]}>
                    <Icon size={17} color={iconIndex === i ? '#fff' : theme.textSecondary} />
                  </Pressable>
                ))}
              </View>
            </Field>

            <Pressable style={[styles.createBtn, { backgroundColor: theme.primary }]}>
              <Text style={{ color: theme.primaryOn, fontFamily: Fonts.bodyBold, fontSize: 14 }}>
                Crear categoría
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
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
