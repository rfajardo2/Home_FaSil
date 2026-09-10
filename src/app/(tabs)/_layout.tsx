import { Tabs, TabList, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HomeIcon, TasksIcon, UsersIcon, WalletIcon, type IconProps } from '@/components/icons';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

/**
 * Custom bottom tab bar (headless `expo-router/ui` Tabs) so the exact same
 * design — icon + label, coral when active — renders identically on iOS,
 * Android and Web, instead of each platform's native tab bar chrome.
 *
 * Belonging to a group is optional — screens that need one (Tareas, Grupo,
 * Gastos, Categorías) show their own prompt to create/join one instead of
 * this layout gating access to the tabs themselves.
 */
export default function TabsLayout() {
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <BottomNavBar>
          <TabTrigger name="index" href="/" asChild>
            <NavButton icon={HomeIcon} label="Inicio" />
          </TabTrigger>
          <TabTrigger name="tareas" href="/tareas" asChild>
            <NavButton icon={TasksIcon} label="Tareas" />
          </TabTrigger>
          <TabTrigger name="grupo" href="/grupo" asChild>
            <NavButton icon={UsersIcon} label="Grupo" />
          </TabTrigger>
          <TabTrigger name="gastos" href="/gastos" asChild>
            <NavButton icon={WalletIcon} label="Gastos" />
          </TabTrigger>
        </BottomNavBar>
      </TabList>
    </Tabs>
  );
}

function BottomNavBar({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.bar,
        {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          paddingBottom: Math.max(insets.bottom, Spacing.three),
        },
      ]}>
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

function NavButton({
  icon: Icon,
  label,
  isFocused,
  ...props
}: TabTriggerSlotProps & { icon: React.ComponentType<IconProps>; label: string }) {
  const theme = useTheme();
  const color = isFocused ? theme.primary : theme.textFaint;
  return (
    <Pressable {...props} style={styles.navItem}>
      <Icon size={21} color={color} strokeWidth={isFocused ? 1.9 : 1.7} />
      <Text style={[styles.navLabel, { color, fontFamily: Fonts.bodyBold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    borderTopWidth: 1,
    alignItems: 'center',
  },
  inner: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '100%',
    maxWidth: MaxContentWidth,
    paddingTop: Spacing.three,
  },
  navItem: {
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  navLabel: {
    fontSize: 10.5,
  },
});
