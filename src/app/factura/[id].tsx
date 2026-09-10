import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReceiptIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { BottomTabInset, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useAuth } from '@/hooks/use-auth';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/format-money';

export default function FacturaDetalleScreen() {
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  const { expenses, members, sharedAccounts, settleExpense } = useAppData();
  const [settling, setSettling] = useState(false);

  const expense = expenses.find((e) => e.id === id);

  if (!expense) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
        <Header title="Detalle de gasto" showBack fallbackHref="/gastos" size="md" />
        <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 13, textAlign: 'center', marginTop: Spacing.six }}>
          No encontramos este gasto.
        </Text>
      </SafeAreaView>
    );
  }

  const account = sharedAccounts.find((a) => a.id === expense.account_id);
  const paidByMember = members.find((m) => m.id === expense.paid_by);
  const allSettled = expense.expense_splits.every((s) => s.settled);

  async function handleSettle() {
    if (settling) return;
    setSettling(true);
    await settleExpense(expense!.id);
    setSettling(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header title="Detalle de gasto" showBack size="md" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <Card padding={18} style={styles.receiptCard}>
            <View style={[styles.receiptIcon, { backgroundColor: theme.primarySoft }]}>
              <ReceiptIcon size={26} color={theme.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.flexGrow}>
              <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 15 }}>{expense.merchant}</Text>
              <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                {new Date(`${expense.expense_date}T00:00:00`).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                {account ? ` · ${account.name}` : ''}
                {paidByMember ? ` · pagó ${paidByMember.id === session?.user?.id ? 'Tú' : paidByMember.name}` : ''}
              </Text>
              <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 19, marginTop: 2 }}>
                {formatMoney(expense.total)}
              </Text>
            </View>
          </Card>

          <Section title={`División entre ${expense.expense_splits.length}`}>
            {expense.expense_splits.length === 0 ? (
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5 }}>
                Este gasto no tiene una división registrada.
              </Text>
            ) : (
              <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
                {expense.expense_splits.map((split, i) => {
                  const member = members.find((m) => m.id === split.profile_id);
                  if (!member) return null;
                  return (
                    <View
                      key={split.id}
                      style={[
                        styles.row,
                        i < expense.expense_splits.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                      ]}>
                      <Avatar initials={member.initials} color={member.avatar_color} size={28} />
                      <Text style={[styles.flexGrow, { color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                        {member.id === session?.user?.id ? `${member.name} (tú)` : member.name}
                      </Text>
                      <Text
                        style={{
                          color: split.settled ? theme.success : theme.text,
                          fontFamily: Fonts.bodyBold,
                          fontSize: 13.5,
                        }}>
                        {formatMoney(split.amount)}
                        {split.settled ? ' ✓' : ''}
                      </Text>
                    </View>
                  );
                })}
              </Card>
            )}
          </Section>
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <PrimaryButton
          label={allSettled ? 'División confirmada' : settling ? 'Confirmando...' : 'Confirmar división'}
          onPress={allSettled ? undefined : handleSettle}
        />
      </View>
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{ gap: Spacing.two }}>
      <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 15 }}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: 110 },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.four },
  receiptCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.four },
  receiptIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  flexGrow: { flex: 1, minWidth: 0 },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: 10 },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.five, paddingTop: Spacing.three },
});
