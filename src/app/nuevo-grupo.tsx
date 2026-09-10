import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { HeartIcon, HomeIcon, StarIcon, UsersIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { AccentColors, BottomTabInset, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';

const GROUP_COLORS = [AccentColors.avatar1, AccentColors.avatar2, AccentColors.avatar3, AccentColors.avatar4, AccentColors.avatar5];
const GROUP_ICONS = [HomeIcon, UsersIcon, HeartIcon, StarIcon];
const GROUP_EMOJIS = ['🏠', '👨‍👩‍👧‍👦', '❤️', '⭐'];

export default function NuevoGrupoScreen() {
  const theme = useTheme();
  const { createGroup, joinGroupByCode } = useAppData();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [colorIndex, setColorIndex] = useState(0);
  const [iconIndex, setIconIndex] = useState(0);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [creating, setCreating] = useState(false);

  async function handleJoin() {
    if (joining) return;
    setJoinError(null);
    setJoining(true);
    const { error } = await joinGroupByCode(code);
    setJoining(false);
    if (error) {
      setJoinError(error);
      return;
    }
    router.replace('/');
  }

  async function handleCreate() {
    if (creating) return;
    setCreateError(null);
    if (!name.trim()) {
      setCreateError('Ponle un nombre a tu grupo.');
      return;
    }
    setCreating(true);
    const { error } = await createGroup(name.trim(), GROUP_EMOJIS[iconIndex]);
    setCreating(false);
    if (error) {
      setCreateError(error);
      return;
    }
    router.replace('/');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header title="Nuevo grupo" showBack fallbackHref="/" size="md" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          <Field label="Unirme con un código de invitación">
            <View style={styles.codeRow}>
              <TextInput
                value={code}
                onChangeText={setCode}
                placeholder="FAM-8321"
                placeholderTextColor={theme.textFaint}
                autoCapitalize="characters"
                style={[styles.input, styles.flexGrow, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              />
              <Pressable onPress={handleJoin} style={[styles.joinBtn, { backgroundColor: theme.surfaceAlt }]}>
                <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 13.5 }}>
                  {joining ? '...' : 'Unirme'}
                </Text>
              </Pressable>
            </View>
            {joinError && <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12 }}>{joinError}</Text>}
          </Field>

          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
            <Text style={{ color: theme.textFaint, fontFamily: Fonts.bodyMedium, fontSize: 11.5 }}>
              O CREA UNA NUEVA
            </Text>
            <View style={[styles.dividerLine, { backgroundColor: theme.border }]} />
          </View>

          <Field label="Nombre del grupo">
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Casa de los abuelos"
              placeholderTextColor={theme.textFaint}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          <Field label="Color">
            <View style={styles.swatchRow}>
              {GROUP_COLORS.map((c, i) => (
                <Pressable
                  key={c}
                  onPress={() => setColorIndex(i)}
                  style={[
                    styles.swatch,
                    { backgroundColor: c },
                    colorIndex === i && { borderWidth: 2.5, borderColor: theme.background, shadowColor: c },
                    colorIndex === i && styles.swatchSelected,
                  ]}
                />
              ))}
            </View>
          </Field>

          <Field label="Ícono">
            <View style={styles.swatchRow}>
              {GROUP_ICONS.map((Icon, i) => (
                <Pressable
                  key={i}
                  onPress={() => setIconIndex(i)}
                  style={[
                    styles.iconSwatch,
                    {
                      backgroundColor: iconIndex === i ? GROUP_COLORS[colorIndex] : theme.surface,
                      borderColor: iconIndex === i ? GROUP_COLORS[colorIndex] : theme.border,
                    },
                  ]}>
                  <Icon size={19} color={iconIndex === i ? '#fff' : theme.textSecondary} />
                </Pressable>
              ))}
            </View>
          </Field>

          {createError && <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{createError}</Text>}
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <PrimaryButton label={creating ? 'Creando...' : 'Crear grupo'} onPress={handleCreate} />
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
  flexGrow: { flex: 1 },
  codeRow: { flexDirection: 'row', gap: Spacing.two },
  joinBtn: { borderRadius: Radii.md, paddingVertical: 13, paddingHorizontal: Spacing.five, justifyContent: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  dividerLine: { flex: 1, height: 1 },
  swatchRow: { flexDirection: 'row', gap: Spacing.three },
  swatch: { width: 32, height: 32, borderRadius: 16 },
  swatchSelected: { shadowOpacity: 0.5, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
  iconSwatch: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.three,
  },
});
