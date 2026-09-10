import { Pressable, StyleSheet, Text } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ChipProps = {
  label: string;
  selected?: boolean;
  /** Overrides the "selected" fill (used for category chips). */
  activeColor?: string;
  dashed?: boolean;
  onPress?: () => void;
};

export function Chip({ label, selected, activeColor, dashed, onPress }: ChipProps) {
  const theme = useTheme();
  const fill = selected ? activeColor ?? theme.primary : theme.surface;
  const textColor = selected ? '#fff' : activeColor ?? theme.textSecondary;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: fill,
          borderColor: selected ? fill : theme.border,
          borderStyle: dashed ? 'dashed' : 'solid',
        },
      ]}>
      <Text style={[styles.label, { color: textColor, fontFamily: Fonts.bodyMedium }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: Radii.pill,
    borderWidth: 1,
  },
  label: {
    fontSize: 13,
  },
});
