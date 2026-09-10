import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  ClockIcon,
  LightbulbIcon,
  ReceiptIcon,
  StarIcon,
  TrophyIcon,
  WalletIcon,
} from '@/components/icons';
import { Card } from '@/components/ui/Card';
import { Header } from '@/components/ui/Header';
import { AccentColors, Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { NOTIFICATIONS } from '@/data/mock';
import { useTheme } from '@/hooks/use-theme';
import type { NotificationType } from '@/types';

export default function NotificacionesScreen() {
  const theme = useTheme();
  const today = NOTIFICATIONS.slice(0, 4);
  const yesterday = NOTIFICATIONS.slice(4);

  const iconFor = (type: NotificationType) => {
    switch (type) {
      case 'tarea':
        return { Icon: ClockIcon, bg: theme.primarySoft, color: theme.primary };
      case 'factura':
        return { Icon: ReceiptIcon, bg: theme.dangerSoft, color: theme.danger };
      case 'ranking':
        return { Icon: TrophyIcon, bg: AccentColors.catCocinaSoft, color: AccentColors.catCocina };
      case 'recomendacion':
        return { Icon: LightbulbIcon, bg: theme.successSoft, color: theme.success };
      case 'logro':
        return { Icon: StarIcon, bg: theme.primarySoft, color: theme.primary };
      case 'gasto':
        return { Icon: WalletIcon, bg: AccentColors.catServiciosSoft, color: AccentColors.catServicios };
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <Header
        title="Notificaciones"
        showBack
        size="md"
        right={
          <Pressable>
            <Text style={{ color: theme.primary, fontFamily: Fonts.bodyMedium, fontSize: 12 }}>Marcar todo</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          <Group title="Hoy" items={today} iconFor={iconFor} />
          <Group title="Ayer" items={yesterday} iconFor={iconFor} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({
  title,
  items,
  iconFor,
}: {
  title: string;
  items: typeof NOTIFICATIONS;
  iconFor: (t: NotificationType) => { Icon: React.ComponentType<any>; bg: string; color: string };
}) {
  const theme = useTheme();
  if (items.length === 0) return null;
  return (
    <View style={styles.group}>
      <Text style={[styles.groupTitle, { color: theme.textSecondary, fontFamily: Fonts.display }]}>
        {title.toUpperCase()}
      </Text>
      {items.map((n) => {
        const { Icon, bg, color } = iconFor(n.type);
        return (
          <Card key={n.id} style={styles.row} padding={13}>
            <View style={[styles.iconWrap, { backgroundColor: bg }]}>
              <Icon size={17} color={color} />
            </View>
            <View style={styles.flexGrow}>
              <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5, lineHeight: 18 }}>
                {n.title}
              </Text>
              <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11 }}>{n.timeLabel}</Text>
            </View>
            {n.unread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
          </Card>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: Spacing.eight },
  center: { width: '100%', maxWidth: MaxContentWidth, paddingHorizontal: Spacing.five, gap: Spacing.five },
  group: { gap: Spacing.two },
  groupTitle: { fontSize: 13, letterSpacing: 0.4 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.three },
  iconWrap: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  flexGrow: { flex: 1, minWidth: 0 },
  unreadDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
});
