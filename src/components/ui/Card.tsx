import { StyleSheet, View, type ViewProps } from 'react-native';

import { Radii } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type CardProps = ViewProps & {
  padding?: number;
  outlined?: boolean;
  outlineColor?: string;
};

/** The rounded white surface used for every list row, stat tile and panel. */
export function Card({ style, padding = 14, outlined, outlineColor, ...rest }: CardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.base,
        {
          backgroundColor: theme.surface,
          padding,
          borderColor: outlined ? outlineColor ?? theme.primary : 'transparent',
          borderWidth: outlined ? 1.5 : 0,
        },
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radii.lg,
    shadowColor: '#4A342A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 1,
  },
});
