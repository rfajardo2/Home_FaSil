import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

import { GhostAddButton } from '@/components/ui/Button';
import { PlusIcon, SlidersIcon, TrendingUpIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Chip } from '@/components/ui/Chip';
import { Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import { formatMoney } from '@/lib/format-money';

const DONUT_SIZE = 116;
const STROKE = 15;
const RADIUS = (DONUT_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.5;

type Period = 'semana' | 'mes' | 'año';

function periodBounds(period: Period, now: Date) {
  if (period === 'semana') {
    const start = new Date(now);
    start.setDate(start.getDate() - 7);
    start.setHours(0, 0, 0, 0);
    const prevStart = new Date(start);
    prevStart.setDate(prevStart.getDate() - 7);
    return { start, prevStart, prevEnd: start };
  }
  if (period === 'año') {
    const start = new Date(now.getFullYear(), 0, 1);
    const prevStart = new Date(now.getFullYear() - 1, 0, 1);
    return { start, prevStart, prevEnd: start };
  }
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { start, prevStart, prevEnd: start };
}

export default function EstadisticasScreen() {
  const theme = useTheme();
  const { expenses, categories } = useAppData();
  const [period, setPeriod] = useState<Period>('mes');

  const now = new Date();
  const { start, prevStart, prevEnd } = periodBounds(period, now);

  const periodExpenses = expenses.filter((e) => new Date(`${e.expense_date}T00:00:00`) >= start);
  const prevExpenses = expenses.filter((e) => {
    const d = new Date(`${e.expense_date}T00:00:00`);
    return d >= prevStart && d < prevEnd;
  });

  const total = periodExpenses.reduce((sum, e) => sum + e.total, 0);
  const prevTotal = prevExpenses.reduce((sum, e) => sum + e.total, 0);
  const change = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : null;

  const daysElapsed = Math.max(1, Math.round((now.getTime() - start.getTime()) / 86_400_000) + 1);
  const dailyAverage = total / daysElapsed;

  const breakdown = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const e of periodExpenses) {
      const key = e.category_id ?? 'none';
      byCategory.set(key, (byCategory.get(key) ?? 0) + e.total);
    }
    return [...byCategory.entries()]
      .map(([categoryId, amount]) => {
        const category = categories.find((c) => c.id === categoryId);
        return {
          categoryId,
          label: category?.name ?? 'Sin categoría',
          color: category?.color ?? theme.textFaint,
          amount,
          percent: total > 0 ? Math.round((amount / total) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [periodExpenses, categories, total, theme.textFaint]);

  const topCategory = breakdown[0];

  const segmentLengths = breakdown.map((slice) => (slice.percent / 100) * CIRCUMFERENCE);
  const segments = breakdown.map((slice, i) => ({
    ...slice,
    offset: -segmentLengths.slice(0, i).reduce((sum, len) => sum + len, 0),
    dash: [Math.max(segmentLengths[i] - GAP, 0), CIRCUMFERENCE],
  }));

  const trend = useMemo(() => {
    const months: { key: string; label: string; amount: number; isCurrent: boolean }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        label: d.toLocaleDateString('es', { month: 'short' }),
        amount: 0,
        isCurrent: i === 0,
      });
    }
    for (const e of expenses) {
      const key = e.expense_date.slice(0, 7);
      const bucket = months.find((m) => m.key === key);
      if (bucket) bucket.amount += e.total;
    }
    return months;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses]);

  const maxAmount = Math.max(1, ...trend.map((p) => p.amount));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top', 'bottom']}>
      <Header
        title="Estadísticas"
        showBack
        size="md"
        right={
          <View style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <SlidersIcon size={16} color={theme.textSecondary} />
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <View style={styles.chipsRow}>
            <Chip label="Semana" selected={period === 'semana'} onPress={() => setPeriod('semana')} />
            <Chip label="Mes" selected={period === 'mes'} onPress={() => setPeriod('mes')} />
            <Chip label="Año" selected={period === 'año'} onPress={() => setPeriod('año')} />
          </View>

          {/* Summary */}
          <View style={styles.statsRow}>
            <Card style={styles.statTile} padding={12}>
              <Text style={styles.tileLabel}>Total gastado</Text>
              <Text style={[styles.tileValue, { color: theme.text, fontFamily: Fonts.display }]}>
                {formatMoney(total)}
              </Text>
              {change !== null && (
                <View style={styles.trendRow}>
                  <TrendingUpIcon size={10} color={theme.textFaint} strokeWidth={2.4} />
                  <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>
                    {change >= 0 ? '+' : ''}
                    {change}% vs periodo ant.
                  </Text>
                </View>
              )}
            </Card>
            <Card style={styles.statTile} padding={12}>
              <Text style={styles.tileLabel}>Promedio diario</Text>
              <Text style={[styles.tileValue, { color: theme.text, fontFamily: Fonts.display }]}>
                {formatMoney(dailyAverage)}
              </Text>
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>
                {daysElapsed} {daysElapsed === 1 ? 'día' : 'días'}
              </Text>
            </Card>
            <Card style={styles.statTile} padding={12}>
              <Text style={styles.tileLabel}>Categoría top</Text>
              <Text
                style={[styles.tileValue, { color: topCategory?.color ?? theme.textFaint, fontFamily: Fonts.display }]}
                numberOfLines={1}>
                {topCategory?.label ?? '—'}
              </Text>
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>
                {topCategory ? `${topCategory.percent}% del total` : 'Sin gastos'}
              </Text>
            </Card>
          </View>

          {/* Donut */}
          <Section title="Gastos por categoría">
            <Card padding={16} style={{ alignItems: 'center', gap: Spacing.three }}>
              {breakdown.length === 0 ? (
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 12.5, paddingVertical: Spacing.five }}>
                  Sin gastos en este periodo.
                </Text>
              ) : (
                <>
                  <View style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
                    <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} style={{ transform: [{ rotate: '-90deg' }] }}>
                      <Circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={RADIUS} stroke={theme.surfaceAlt} strokeWidth={STROKE} fill="none" />
                      {segments.map((seg) => (
                        <Circle
                          key={seg.categoryId}
                          cx={DONUT_SIZE / 2}
                          cy={DONUT_SIZE / 2}
                          r={RADIUS}
                          stroke={seg.color}
                          strokeWidth={STROKE}
                          strokeDasharray={seg.dash.join(' ')}
                          strokeDashoffset={seg.offset}
                          fill="none"
                        />
                      ))}
                    </Svg>
                    <View style={styles.donutCenter} pointerEvents="none">
                      <Text style={{ color: theme.textFaint, fontFamily: Fonts.bodyBold, fontSize: 9.5 }}>TOTAL</Text>
                      <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 14.5 }}>{formatMoney(total)}</Text>
                    </View>
                  </View>

                  <View style={{ width: '100%', gap: 7 }}>
                    {breakdown.map((slice) => (
                      <View key={slice.categoryId} style={styles.legendRow}>
                        <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                        <Text style={[styles.legendLabel, { color: theme.text, fontFamily: Fonts.bodyMedium }]}>
                          {slice.label}
                        </Text>
                        <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                          {formatMoney(slice.amount)}
                        </Text>
                        <Text style={[styles.legendPercent, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
                          {slice.percent}%
                        </Text>
                      </View>
                    ))}
                  </View>
                </>
              )}
            </Card>
          </Section>

          {/* Trend */}
          <Section title="Tendencia mensual">
            <Card padding={16} style={{ gap: Spacing.two }}>
              <View style={styles.barsRow}>
                {trend.map((point) => {
                  const height = (point.amount / maxAmount) * 100;
                  return (
                    <View key={point.key} style={styles.barCol}>
                      {point.isCurrent && point.amount > 0 && (
                        <Text style={{ color: theme.primary, fontFamily: Fonts.display, fontSize: 10 }} numberOfLines={1}>
                          {formatMoney(point.amount)}
                        </Text>
                      )}
                      <View
                        style={[
                          styles.bar,
                          { height: Math.max(height, 2), backgroundColor: point.isCurrent ? theme.primary : theme.surfaceAlt },
                        ]}
                      />
                      <Text
                        style={{
                          color: point.isCurrent ? theme.primary : theme.textFaint,
                          fontFamily: Fonts.bodyBold,
                          fontSize: 10,
                        }}>
                        {point.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </Card>
          </Section>

          <GhostAddButton
            label="Agregar widget"
            icon={<PlusIcon size={15} color={theme.textSecondary} strokeWidth={2.2} />}
          />
        </View>
      </ScrollView>
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
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.four },
  iconBtn: { width: 36, height: 36, borderRadius: Radii.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipsRow: { flexDirection: 'row', gap: Spacing.two },
  statsRow: { flexDirection: 'row', gap: Spacing.two },
  statTile: { flex: 1, gap: 2 },
  tileLabel: { fontSize: 10.5, color: '#9C8F86', fontFamily: Fonts.bodyMedium },
  tileValue: { fontSize: 16 },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  donutCenter: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 9, height: 9, borderRadius: 5 },
  legendLabel: { flex: 1, fontSize: 12 },
  legendPercent: { width: 32, textAlign: 'right', fontSize: 11.5 },
  barsRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, height: 128, paddingTop: 16 },
  barCol: { flex: 1, alignItems: 'center', gap: 5 },
  bar: { width: '100%', maxWidth: 26, borderRadius: 5 },
});
