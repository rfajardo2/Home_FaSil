import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryStyle } from '@/components/category-style';
import { PlusIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { Header } from '@/components/ui/Header';
import { BottomTabInset, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';

export default function NuevoGastoScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { sharedAccounts, categories, members, createExpense } = useAppData();

  const [accountId, setAccountId] = useState<string | null>(null);
  const [creatingAccount, setCreatingAccount] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [merchant, setMerchant] = useState('');
  const [total, setTotal] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [paidBy, setPaidBy] = useState<string | null>(session?.user?.id ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Shared accounts load asynchronously; default to the first one (or "new
  // account" mode if there really are none) once they arrive, without
  // clobbering a choice the user already made.
  useEffect(() => {
    setAccountId((current) => {
      if (current || creatingAccount) return current;
      return sharedAccounts[0]?.id ?? null;
    });
  }, [sharedAccounts, creatingAccount]);
  useEffect(() => {
    if (accountId === null && sharedAccounts.length === 0) setCreatingAccount(true);
  }, [sharedAccounts, accountId]);

  async function handleSave() {
    if (saving) return;
    setError(null);
    const totalNumber = Number(total.replace(/[^\d.]/g, ''));
    if (!merchant.trim()) {
      setError('Dile dónde fue el gasto.');
      return;
    }
    if (!totalNumber || totalNumber <= 0) {
      setError('Ingresa un total válido.');
      return;
    }
    if (!paidBy) {
      setError('Elige quién pagó.');
      return;
    }
    if (!accountId && !newAccountName.trim()) {
      setError('Elige o crea una cuenta compartida.');
      return;
    }
    setSaving(true);
    const { error: saveError } = await createExpense({
      accountId,
      newAccountName: accountId ? null : newAccountName,
      merchant: merchant.trim(),
      total: totalNumber,
      categoryId,
      paidBy,
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
      <Header title="Nuevo gasto" showBack size="md" />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.center}>
          <Field label="Cuenta compartida">
            <View style={styles.wrapRow}>
              {sharedAccounts.map((a) => {
                const selected = !creatingAccount && accountId === a.id;
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => {
                      setCreatingAccount(false);
                      setAccountId(a.id);
                    }}
                    style={[
                      styles.pill,
                      { backgroundColor: selected ? theme.primary : theme.surface, borderColor: selected ? theme.primary : theme.border },
                    ]}>
                    <Text style={{ color: selected ? '#fff' : theme.text, fontFamily: Fonts.bodyBold, fontSize: 13 }}>
                      {a.name}
                    </Text>
                  </Pressable>
                );
              })}
              <Pressable
                onPress={() => {
                  setCreatingAccount(true);
                  setAccountId(null);
                }}
                style={[
                  styles.pill,
                  styles.dashedPill,
                  { borderColor: theme.primary, backgroundColor: creatingAccount ? theme.primarySoft : 'transparent' },
                ]}>
                <PlusIcon size={11} color={theme.primary} strokeWidth={2.4} />
                <Text style={{ color: theme.primary, fontFamily: Fonts.bodyBold, fontSize: 13 }}> Nueva</Text>
              </Pressable>
            </View>
            {creatingAccount && (
              <TextInput
                value={newAccountName}
                onChangeText={setNewAccountName}
                placeholder="Ej. Cuenta del hogar"
                placeholderTextColor={theme.textFaint}
                style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
              />
            )}
          </Field>

          <Field label="Comercio">
            <TextInput
              value={merchant}
              onChangeText={setMerchant}
              placeholder="Ej. Supermercado La Colonia"
              placeholderTextColor={theme.textFaint}
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          <Field label="Total">
            <TextInput
              value={total}
              onChangeText={setTotal}
              placeholder="0"
              placeholderTextColor={theme.textFaint}
              keyboardType="numeric"
              style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
            />
          </Field>

          <Field label="Categoría (opcional)">
            <View style={styles.wrapRow}>
              {categories.map((c) => {
                const selected = categoryId === c.id;
                const style = categoryStyle(c);
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setCategoryId(selected ? null : c.id)}
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
            </View>
          </Field>

          <Field label="¿Quién pagó?">
            <View style={styles.avatarRow}>
              {members.map((m) => (
                <Pressable key={m.id} onPress={() => setPaidBy(m.id)} style={styles.avatarCol}>
                  <Avatar
                    initials={m.initials}
                    color={m.avatar_color}
                    size={50}
                    selected={paidBy === m.id}
                    faded={paidBy !== m.id}
                  />
                  <Text
                    style={{
                      color: paidBy === m.id ? theme.text : theme.textFaint,
                      fontFamily: Fonts.bodyMedium,
                      fontSize: 11,
                    }}>
                    {m.id === session?.user?.id ? 'Tú' : m.name}
                  </Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11 }}>
              Se divide en partes iguales entre los {members.length || 0} integrantes del grupo.
            </Text>
          </Field>

          {error && <Text style={{ color: theme.danger, fontFamily: Fonts.body, fontSize: 12.5 }}>{error}</Text>}
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <PrimaryButton label={saving ? 'Guardando...' : 'Guardar gasto'} onPress={handleSave} />
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
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: Radii.pill, borderWidth: 1 },
  dashedPill: { flexDirection: 'row', alignItems: 'center', borderStyle: 'dashed' },
  avatarRow: { flexDirection: 'row', gap: Spacing.four, marginTop: 2, flexWrap: 'wrap' },
  avatarCol: { alignItems: 'center', gap: 5 },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.five, paddingTop: Spacing.three },
});
