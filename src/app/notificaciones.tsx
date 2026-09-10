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
import { useAppData } from '@/hooks/use-app-data';
import { useTheme } from '@/hooks/use-theme';
import type { NotificationRow, NotificationType } from '@/lib/database-types';
import { relativeTimeLabel } from '@/lib/relative-time';

export default function NotificacionesScreen() {
  const theme = useTheme();
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppData();

  const startOfDay = (d: Date) => {
    const copy = new Date(d);
    copy.setHours(0, 0, 0, 0);
    return copy.getTime();
  };
  const today = startOfDay(new Date());
  const yesterday = today - 86_400_000;

  const todayItems = notifications.filter((n) => startOfDay(new Date(n.created_at)) === today);
  const yesterdayItems = notifications.filter((n) => startOfDay(new Date(n.created_at)) === yesterday);
  const earlierItems = notifications.filter((n) => {
    const day = startOfDay(new Date(n.created_at));
    return day !== today && day !== yesterday;
  });

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
          <Pressable onPress={() => markAllNotificationsRead()}>
            <Text style={{ color: theme.primary, fontFamily: Fonts.bodyMedium, fontSize: 12 }}>Marcar todo</Text>
          </Pressable>
        }
      />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.center}>
          {notifications.length === 0 && (
            <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 13, textAlign: 'center', marginTop: Spacing.six }}>
              No tienes notificaciones todavía.
            </Text>
          )}
          <Group title="Hoy" items={todayItems} iconFor={iconFor} onPress={markNotificationRead} />
          <Group title="Ayer" items={yesterdayItems} iconFor={iconFor} onPress={markNotificationRead} />
          <Group title="Anteriores" items={earlierItems} iconFor={iconFor} onPress={markNotificationRead} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Group({
  title,
  items,
  iconFor,
  onPress,
}: {
  title: string;
  items: NotificationRow[];
  iconFor: (t: NotificationType) => { Icon: React.ComponentType<any>; bg: string; color: string };
  onPress: (id: string) => void;
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
          <Pressable key={n.id} onPress={() => n.unread && onPress(n.id)}>
            <Card style={styles.row} padding={13}>
              <View style={[styles.iconWrap, { backgroundColor: bg }]}>
                <Icon size={17} color={color} />
              </View>
              <View style={styles.flexGrow}>
                <Text style={{ color: theme.text, fontFamily: Fonts.bodyMedium, fontSize: 13.5, lineHeight: 18 }}>
                  {n.title}
                </Text>
                <Text style={{ color: theme.textFaint, fontFamily: Fonts.body, fontSize: 11 }}>
                  {relativeTimeLabel(n.created_at)}
                </Text>
              </View>
              {n.unread && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
            </Card>
          </Pressable>
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
