import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme';

interface ScreenBackgroundProps {
  children: React.ReactNode;
  variant?: 'default' | 'warm' | 'plain';
}

export function ScreenBackground({ children, variant = 'default' }: ScreenBackgroundProps) {
  if (variant === 'plain') {
    return <View style={styles.plain}>{children}</View>;
  }
  
  return (
    <LinearGradient
      colors={variant === 'warm' ? ['#fdf3d0', '#f0e6d9'] : ['#faf6f1', '#f0e6d9']}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  plain: {
    flex: 1,
    backgroundColor: colors.primary[50],
  },
});

