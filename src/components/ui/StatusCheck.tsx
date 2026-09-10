import { StyleSheet, View } from 'react-native';

import { CheckIcon } from '@/components/icons';
import { useTheme } from '@/hooks/use-theme';

type StatusCheckProps = {
  done: boolean;
  size?: number;
};

/** The circular pending/done indicator at the end of a task row. */
export function StatusCheck({ done, size = 23 }: StatusCheckProps) {
  const theme = useTheme();
  if (!done) {
    return (
      <View
        style={[
          styles.base,
          { width: size, height: size, borderRadius: size / 2, borderWidth: 2, borderColor: theme.border },
        ]}
      />
    );
  }
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.success },
      ]}>
      <CheckIcon size={size * 0.55} color="#fff" strokeWidth={2.6} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
