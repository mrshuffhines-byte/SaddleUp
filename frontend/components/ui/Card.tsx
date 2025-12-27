import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../app/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
  variant?: 'default' | 'outlined';
}

export default function Card({ 
  children, 
  style, 
  elevation = 'md', 
  noPadding = false,
  variant = 'default',
}: CardProps) {
  return (
    <View
      style={[
        styles.card,
        variant === 'outlined' ? styles.outlined : undefined,
        !noPadding && styles.padding,
        shadows[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    ...shadows.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  padding: {
    padding: spacing.md,
  },
});

