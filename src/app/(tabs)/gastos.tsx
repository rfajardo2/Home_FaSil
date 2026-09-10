import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PlusIcon, ReceiptIcon, TrendingUpIcon, WalletIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { IconCircle } from '@/components/ui/IconCircle';
import { NoGroupCard } from '@/components/ui/NoGroupCard';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/format-money';

export default function GastosScreen() {
  const theme = useTheme();
  const { session } = useAuth();
  const { activeGroup, members, sharedAccounts, expenses } = useAppData();
  const userId = session?.user?.id;

  let owedToYou = 0;
  let youOwe = 0;
  for (const expense of expenses) {
    for (const split of expense.expense_splits) {
      if (split.settled || split.profile_id === expense.paid_by) continue;
      if (expense.paid_by === userId) owedToYou += split.amount;
      if (split.profile_id === userId) youOwe += split.amount;
    }
  }

  const now = new Date();
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: theme.text, fontFamily: Fonts.display }]}>Gastos del hogar</Text>
            <View style={styles.headerActions}>
              <Pressable
                onPress={() => router.push('/estadisticas')}
                style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <TrendingUpIcon size={16} color={theme.textSecondary} strokeWidth={1.9} />
              </Pressable>
              {activeGroup && (
                <Pressable
                  onPress={() => router.push('/nuevo-gasto')}
                  style={[styles.iconBtn, { backgroundColor: theme.primary }]}>
                  <PlusIcon size={17} color={theme.primaryOn} strokeWidth={2.2} />
                </Pressable>
              )}
            </View>
          </View>

          {!activeGroup && <NoGroupCard message="Crea un grupo o únete a uno para llevar los gastos compartidos del hogar." />}

          {activeGroup && (
            <>
          {/* Balance */}
          <Card padding={16} style={{ gap: Spacing.three }}>
            <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyMedium, fontSize: 12.5 }}>
              Tu balance
            </Text>
            <View style={styles.balanceRow}>
              <View style={[styles.balanceTile, { backgroundColor: theme.successSoft }]}>
                <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyMedium, fontSize: 11 }}>
                  Te deben
                </Text>
                <Text style={{ color: theme.success, fontFamily: Fonts.display, fontSize: 17 }}>
                  {formatMoney(owedToYou)}
                </Text>
              </View>
              <View style={[styles.balanceTile, { backgroundColor: theme.dangerSoft }]}>
                <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyMedium, fontSize: 11 }}>
                  Debes
                </Text>
                <Text style={{ color: theme.danger, fontFamily: Fonts.display, fontSize: 17 }}>
                  {formatMoney(youOwe)}
                </Text>
              </View>
            </View>
          </Card>

          {/* Cuentas compartidas */}
          <Section title="Cuentas compartidas">
            {sharedAccounts.length === 0 && (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5 }}>
                Todavía no hay cuentas compartidas. Crea un gasto para empezar una.
              </Text>
            )}
            {sharedAccounts.map((account) => {
              const accountExpenses = expenses.filter((e) => e.account_id === account.id);
              const monthTotal = accountExpenses
                .filter((e) => e.expense_date.startsWith(monthKey))
                .reduce((sum, e) => sum + e.total, 0);
              const participantIds = [...new Set(accountExpenses.flatMap((e) => e.expense_splits.map((s) => s.profile_id)))];
              return (
                <Card key={account.id} style={styles.accountRow} padding={12}>
                  <IconCircle size={40} background={theme.primarySoft}>
                    <WalletIcon size={18} color={theme.primary} />
                  </IconCircle>
                  <View style={styles.flexGrow}>
                    <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 14 }}>
                      {account.name}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                      {formatMoney(monthTotal)} este mes
                    </Text>
                  </View>
                  <View style={styles.avatarStack}>
                    {participantIds.slice(0, 4).map((id, i) => {
                      const m = members.find((mm) => mm.id === id);
                      if (!m) return null;
                      return (
                        <View key={id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                          <Avatar initials={m.initials} color={m.avatar_color} size={26} />
                        </View>
                      );
                    })}
                  </View>
                </Card>
              );
            })}
          </Section>

          {/* Gastos recientes */}
          <Section title="Gastos recientes">
            {expenses.length === 0 && (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5 }}>
                Todavía no hay gastos registrados.
              </Text>
            )}
            {expenses.map((expense) => (
              <Pressable key={expense.id} onPress={() => router.push(`/factura/${expense.id}`)}>
                <Card style={styles.accountRow} padding={12}>
                  <View style={[styles.receiptIconWrap, { backgroundColor: theme.surfaceAlt }]}>
                    <ReceiptIcon size={17} color={theme.textSecondary} />
                  </View>
                  <View style={styles.flexGrow}>
                    <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 14 }}>
                      {expense.merchant}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                      {new Date(`${expense.expense_date}T00:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                      {' · dividido entre '}
                      {expense.expense_splits.length}
                    </Text>
                  </View>
                  <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 14 }}>
                    {formatMoney(expense.total)}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </Section>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.text, fontFamily: Fonts.display }]}>{title}</Text>
      <View style={{ gap: Spacing.two }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    paddingBottom: Spacing.four,
  },
  title: { fontSize: 21, flexShrink: 1 },
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
  balanceRow: { flexDirection: 'row', gap: Spacing.three },
  balanceTile: { flex: 1, borderRadius: Radii.md, padding: Spacing.three, gap: 2 },
  section: { marginTop: Spacing.five, gap: Spacing.three },
  sectionTitle: { fontSize: 15.5 },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.three },
  flexGrow: { flex: 1, minWidth: 0 },
  avatarStack: { flexDirection: 'row' },
  receiptIconWrap: { width: 38, height: 38, borderRadius: Radii.pill, alignItems: 'center', justifyContent: 'center' },
});
