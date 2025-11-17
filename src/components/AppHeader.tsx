import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { HamburgerButton } from './HamburgerButton';
import { useTheme } from '../theme/ThemeProvider';

type Props = {
  title?: string;
  showHamburger?: boolean;
  right?: React.ReactNode;
};

export const AppHeader: React.FC<Props> = ({ title = '', showHamburger = true, right }) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.card }]}>
      <View style={styles.left}>
        {showHamburger && <HamburgerButton color={theme.colors.primary} />}
      </View>

      <View style={styles.center}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.colors.text }]}>
          {title}
        </Text>
      </View>

      <View style={styles.right}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    height: Platform.select({ ios: 56, android: 40, default: 40 }),
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  left: { width: 56, alignItems: 'flex-start', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  right: { width: 56, alignItems: 'flex-end', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
});