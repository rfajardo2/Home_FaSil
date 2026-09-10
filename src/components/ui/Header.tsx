import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChevronLeftIcon } from '@/components/icons';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type HeaderProps = {
  title: string;
  /** Shows a back chevron that pops the current screen. Omit for tab roots. */
  showBack?: boolean;
  right?: React.ReactNode;
  size?: 'lg' | 'md';
};

/** Custom screen header — every screen builds its own instead of the native one, so it matches the mockup exactly. */
export function Header({ title, showBack, right, size = 'lg' }: HeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {showBack && (
          <Pressable
            onPress={() => router.back()}
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ChevronLeftIcon size={17} color={theme.text} />
          </Pressable>
        )}
        <Text
          style={[
            size === 'lg' ? styles.titleLg : styles.titleMd,
            { color: theme.text, fontFamily: Fonts.display },
          ]}>
          {title}
        </Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.five,
    paddingTop: Spacing.six,
    paddingBottom: Spacing.four,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: Radii.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLg: {
    fontSize: 22,
  },
  titleMd: {
    fontSize: 19,
  },
});
