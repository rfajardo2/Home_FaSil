import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type PrimaryButtonProps = {
  label: string;
  onPress?: (e: GestureResponderEvent) => void;
};

export function PrimaryButton({ label, onPress }: PrimaryButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        { backgroundColor: theme.primary, opacity: pressed ? 0.9 : 1 },
      ]}>
      <Text style={[styles.primaryLabel, { color: theme.primaryOn, fontFamily: Fonts.bodyBold }]}>
        {label}
      </Text>
    </Pressable>
  );
}

type GhostAddButtonProps = {
  label: string;
  icon: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
};

/** Dashed "+ Agregar..." affordance (join group, add category, add widget). */
export function GhostAddButton({ label, icon, onPress }: GhostAddButtonProps) {
  const theme = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.ghost, { borderColor: theme.border }]}>
      <View style={{ marginRight: Spacing.two }}>{icon}</View>
      <Text style={[styles.ghostLabel, { color: theme.primary, fontFamily: Fonts.bodyBold }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    borderRadius: Radii.md + 1,
    paddingVertical: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 15,
  },
  ghost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.four,
    borderRadius: Radii.lg,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  ghostLabel: {
    fontSize: 13.5,
  },
});
