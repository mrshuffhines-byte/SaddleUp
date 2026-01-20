import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '../../app/theme';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'selected' | 'interactive' | 'outlined';
  onPress?: () => void;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export default function Card({ 
  children, 
  variant = 'default',
  onPress,
  style, 
  elevation = 'md', 
  noPadding = false,
}: CardProps) {
  const cardStyle = [
    styles.base,
    variant === 'elevated' && styles.elevated,
    variant === 'selected' && styles.selected,
    variant === 'interactive' && styles.interactive,
    variant === 'outlined' && styles.outlined,
    !noPadding && styles.padding,
    !variant || variant === 'default' ? shadows[elevation] : undefined,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: colors.white, // Design system: white for card surfaces
    borderRadius: borderRadius.lg, // Design system: 16px for cards
    overflow: 'hidden',
  },
  padding: {
    padding: spacing.md,
  },
  elevated: {
    ...shadows.lg,
  },
  selected: {
    backgroundColor: colors.deepInk,
    borderWidth: 1,
    borderColor: colors.deepInk,
    ...shadows.lg,
  },
  interactive: {
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.borderWarm, // Design system: border-warm for card borders
    ...shadows.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
});

