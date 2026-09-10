import { StyleSheet, View } from 'react-native';

type IconCircleProps = {
  children: React.ReactNode;
  size?: number;
  background: string;
};

export function IconCircle({ children, size = 40, background }: IconCircleProps) {
  return (
    <View
      style={[
        styles.base,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: background },
      ]}>
      {children}
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
