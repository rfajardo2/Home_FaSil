import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ReceiptIcon } from '@/components/icons';
import { Avatar } from '@/components/ui/Avatar';
import { PrimaryButton } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { BottomTabInset, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { findMember, INVOICE_DETAIL } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';

export default function FacturaDetalleScreen() {
  const theme = useTheme();
  const invoice = INVOICE_DETAIL;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header title="Detalle de factura" showBack size="md" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <Card padding={18} style={styles.receiptCard}>
            <View style={[styles.receiptIcon, { backgroundColor: theme.primarySoft }]}>
              <ReceiptIcon size={26} color={theme.primary} strokeWidth={1.5} />
            </View>
            <View style={styles.flexGrow}>
              <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 15 }}>{invoice.merchant}</Text>
              <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                {invoice.dateLabel} · {invoice.itemCount} ítems
              </Text>
              <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 19, marginTop: 2 }}>
                {invoice.totalLabel}
              </Text>
            </View>
          </Card>

          <Section title="Detalle de ítems">
            <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
              {invoice.items.map((item, i) => {
                const assignee = findMember(item.assigneeId);
                return (
                  <View
                    key={item.id}
                    style={[styles.row, { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
                    <Text style={[styles.flexGrow, { color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                      {item.label}
                    </Text>
                    {assignee && <Avatar initials={assignee.initials} color={assignee.avatarColor} size={22} />}
                    <Text style={[styles.amountCol, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
                      {item.amountLabel}
                    </Text>
                  </View>
                );
              })}
              <View style={styles.row}>
                <Text style={[styles.flexGrow, { color: theme.textSecondary, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                  {invoice.otherItemsLabel}
                </Text>
                <Text style={[styles.amountCol, { color: theme.textSecondary, fontFamily: Fonts.bodyBold }]}>
                  {invoice.otherItemsAmountLabel}
                </Text>
              </View>
            </Card>
          </Section>

          <Section title={`División entre ${invoice.splits.length}`}>
            <Card padding={0} style={{ paddingHorizontal: Spacing.four }}>
              {invoice.splits.map((split, i) => {
                const member = findMember(split.memberId);
                if (!member) return null;
                return (
                  <View
                    key={split.memberId}
                    style={[
                      styles.row,
                      i < invoice.splits.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border },
                    ]}>
                    <Avatar initials={member.initials} color={member.avatarColor} size={28} />
                    <Text style={[styles.flexGrow, { color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5 }]}>
                      {member.isYou ? `${member.name} (tú)` : member.name}
                    </Text>
                    <Text style={{ color: theme.text, fontFamily: Fonts.bodyBold, fontSize: 13.5 }}>
                      {split.amountLabel}
                    </Text>
                  </View>
                );
              })}
            </Card>
          </Section>
        </View>
      </ScrollView>

      <View style={[styles.ctaWrap, { paddingBottom: BottomTabInset + Spacing.three }]}>
        <PrimaryButton label="Confirmar división" />
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
  amountCol: { fontSize: 13, minWidth: 56, textAlign: 'right' },
  ctaWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: Spacing.five, paddingTop: Spacing.three },
});
