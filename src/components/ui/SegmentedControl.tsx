import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type SegmentedControlProps = {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
};

export function SegmentedControl({ options, value, onChange }: SegmentedControlProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            style={[
              styles.segment,
              {
                backgroundColor: selected ? theme.primary : theme.surface,
                borderColor: selected ? theme.primary : theme.border,
              },
            ]}>
            <Text
              style={{
                color: selected ? theme.primaryOn : theme.textSecondary,
                fontFamily: selected ? Fonts.bodyBold : Fonts.bodyMedium,
                fontSize: 12.5,
              }}
              numberOfLines={1}>
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  segment: {
    flexGrow: 1,
    flexBasis: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three - 2,
    paddingHorizontal: Spacing.one,
    borderRadius: Radii.sm + 1,
    borderWidth: 1,
  },
});
