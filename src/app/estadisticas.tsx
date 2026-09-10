import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Circle, Svg } from 'react-native-svg';

import { GhostAddButton } from '@/components/ui/Button';
import { PlusIcon, SlidersIcon, TrendingUpIcon } from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { Chip } from '@/components/ui/Chip';
import { ChartColors, Fonts, MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { EXPENSE_BREAKDOWN, MONTHLY_TREND } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';

const DONUT_SIZE = 116;
const STROKE = 15;
const RADIUS = (DONUT_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2.5;

const CHART_ORDER: Record<string, string> = {
  servicios: ChartColors.servicios,
  cocina: ChartColors.cocina,
  limpieza: ChartColors.limpieza,
  mantenimiento: ChartColors.mantenimiento,
  eventos: ChartColors.eventos,
};

export default function EstadisticasScreen() {
  const theme = useTheme();

  let cumulative = 0;
  const segments = EXPENSE_BREAKDOWN.map((slice) => {
    const length = (slice.percent / 100) * CIRCUMFERENCE;
    const seg = { ...slice, offset: -cumulative, dash: [Math.max(length - GAP, 0), CIRCUMFERENCE] };
    cumulative += length;
    return seg;
  });

  const maxAmount = Math.max(...MONTHLY_TREND.map((p) => p.amount));

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
            <Chip label="Semana" />
            <Chip label="Mes" selected />
            <Chip label="Año" />
          </View>

          {/* Summary */}
          <View style={styles.statsRow}>
            <Card style={styles.statTile} padding={12}>
              <Text style={styles.tileLabel}>Total gastado</Text>
              <Text style={[styles.tileValue, { color: theme.text, fontFamily: Fonts.display }]}>$494.000</Text>
              <View style={styles.trendRow}>
                <TrendingUpIcon size={10} color={theme.textFaint} strokeWidth={2.4} />
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>8% vs mes ant.</Text>
              </View>
            </Card>
            <Card style={styles.statTile} padding={12}>
              <Text style={styles.tileLabel}>Promedio diario</Text>
              <Text style={[styles.tileValue, { color: theme.text, fontFamily: Fonts.display }]}>$16.500</Text>
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>30 días</Text>
            </Card>
            <Card style={styles.statTile} padding={12}>
              <Text style={styles.tileLabel}>Categoría top</Text>
              <Text style={[styles.tileValue, { color: ChartColors.servicios, fontFamily: Fonts.display }]}>
                Servicios
              </Text>
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>35% del total</Text>
            </Card>
          </View>

          {/* Donut */}
          <Section title="Gastos por categoría">
            <Card padding={16} style={{ alignItems: 'center', gap: Spacing.three }}>
              <View style={{ width: DONUT_SIZE, height: DONUT_SIZE }}>
                <Svg width={DONUT_SIZE} height={DONUT_SIZE} viewBox={`0 0 ${DONUT_SIZE} ${DONUT_SIZE}`} style={{ transform: [{ rotate: '-90deg' }] }}>
                  <Circle cx={DONUT_SIZE / 2} cy={DONUT_SIZE / 2} r={RADIUS} stroke={theme.surfaceAlt} strokeWidth={STROKE} fill="none" />
                  {segments.map((seg) => (
                    <Circle
                      key={seg.categoryId}
                      cx={DONUT_SIZE / 2}
                      cy={DONUT_SIZE / 2}
                      r={RADIUS}
                      stroke={CHART_ORDER[seg.categoryId]}
                      strokeWidth={STROKE}
                      strokeDasharray={seg.dash.join(' ')}
                      strokeDashoffset={seg.offset}
                      fill="none"
                    />
                  ))}
                </Svg>
                <View style={styles.donutCenter} pointerEvents="none">
                  <Text style={{ color: theme.textFaint, fontFamily: Fonts.bodyBold, fontSize: 9.5 }}>TOTAL</Text>
                  <Text style={{ color: theme.text, fontFamily: Fonts.display, fontSize: 14.5 }}>$494.000</Text>
                </View>
              </View>

              <View style={{ width: '100%', gap: 7 }}>
                {EXPENSE_BREAKDOWN.map((slice) => (
                  <View key={slice.categoryId} style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: CHART_ORDER[slice.categoryId] }]} />
                    <Text style={[styles.legendLabel, { color: theme.text, fontFamily: Fonts.bodyMedium }]}>
                      {slice.label}
                    </Text>
                    <Text style={{ color: theme.textSecondary, fontFamily: Fonts.body, fontSize: 11.5 }}>
                      {slice.amountLabel}
                    </Text>
                    <Text style={[styles.legendPercent, { color: theme.text, fontFamily: Fonts.bodyBold }]}>
                      {slice.percent}%
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </Section>

          {/* Trend */}
          <Section title="Tendencia mensual">
            <Card padding={16} style={{ gap: Spacing.two }}>
              <View style={styles.barsRow}>
                <View style={[styles.budgetLine, { borderColor: theme.border, bottom: (450 / maxAmount) * 112 }]} />
                {MONTHLY_TREND.map((point) => {
                  const height = (point.amount / maxAmount) * 100;
                  return (
                    <View key={point.label} style={styles.barCol}>
                      {point.isCurrent && (
                        <Text style={{ color: theme.primary, fontFamily: Fonts.display, fontSize: 10 }}>
                          ${point.amount}k
                        </Text>
                      )}
                      <View
                        style={[
                          styles.bar,
                          { height, backgroundColor: point.isCurrent ? theme.primary : theme.surfaceAlt },
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
              <View style={styles.budgetCaptionRow}>
                <View style={[styles.budgetSwatch, { borderColor: theme.textFaint }]} />
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 10.5 }}>
                  Presupuesto mensual: $450.000
                </Text>
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
  budgetLine: { position: 'absolute', left: 0, right: 0, borderTopWidth: 1.5, borderStyle: 'dashed' },
  barCol: { flex: 1, alignItems: 'center', gap: 5 },
  bar: { width: '100%', maxWidth: 26, borderRadius: 5 },
  budgetCaptionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  budgetSwatch: { width: 14, borderTopWidth: 1.5, borderStyle: 'dashed' },
});
