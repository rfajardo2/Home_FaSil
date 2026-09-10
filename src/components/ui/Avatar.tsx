import { StyleSheet, Text, View } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AvatarProps = {
  initials: string;
  color: string;
  size?: number;
  /** Draws a ring around the avatar (e.g. "selected assignee"). */
  selected?: boolean;
  /** Dims the avatar (e.g. "not the selected assignee"). */
  faded?: boolean;
};

export function Avatar({ initials, color, size = 36, selected, faded }: AvatarProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
          opacity: faded ? 0.5 : 1,
          borderWidth: selected ? 3 : 2,
          borderColor: selected ? theme.primary : theme.surface,
        },
      ]}>
      <Text style={{ color: '#fff', fontFamily: Fonts.display, fontSize: size * 0.36 }}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
