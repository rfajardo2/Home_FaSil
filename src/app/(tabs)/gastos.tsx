import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon } from '@/components/CategoryIcon';
import { PlusIcon, ReceiptIcon, TrendingUpIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { findMember, RECENT_EXPENSES, SHARED_ACCOUNTS } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';

export default function GastosScreen() {
  const theme = useTheme();

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
              <Pressable style={[styles.iconBtn, { backgroundColor: theme.primary }]}>
                <PlusIcon size={17} color={theme.primaryOn} strokeWidth={2.2} />
              </Pressable>
            </View>
          </View>

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
                <Text style={{ color: theme.success, fontFamily: Fonts.display, fontSize: 17 }}>$65.000</Text>
              </View>
              <View style={[styles.balanceTile, { backgroundColor: theme.dangerSoft }]}>
                <Text style={{ color: theme.textSecondary, fontFamily: Fonts.bodyMedium, fontSize: 11 }}>
                  Debes
                </Text>
                <Text style={{ color: theme.danger, fontFamily: Fonts.display, fontSize: 17 }}>$20.000</Text>
              </View>
            </View>
          </Card>

          {/* Cuentas compartidas */}
          <Section title="Cuentas compartidas">
            {SHARED_ACCOUNTS.map((account) => (
              <Card key={account.id} style={styles.accountRow} padding={12}>
                <CategoryIcon categoryId={account.categoryId} />
                <View style={styles.flexGrow}>
                  <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 14 }}>
                    {account.name}
                  </Text>
                  <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                    {account.monthTotalLabel}
                  </Text>
                </View>
                <View style={styles.avatarStack}>
                  {account.memberIds.map((id, i) => {
                    const m = findMember(id);
                    if (!m) return null;
                    return (
                      <View key={id} style={{ marginLeft: i === 0 ? 0 : -6 }}>
                        <Avatar initials={m.initials} color={m.avatarColor} size={26} />
                      </View>
                    );
                  })}
                </View>
              </Card>
            ))}
          </Section>

          {/* Gastos recientes */}
          <Section title="Gastos recientes">
            {RECENT_EXPENSES.map((expense) => (
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
                      {expense.dateLabel} · dividido entre {expense.splitCount}
                    </Text>
                  </View>
                  <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 14 }}>
                    {expense.totalLabel}
                  </Text>
                </Card>
              </Pressable>
            ))}
          </Section>
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
