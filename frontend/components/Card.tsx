import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, BORDER_RADIUS, SHADOWS, SPACING } from '../app/constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  elevation?: 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export default function Card({ children, style, elevation = 'md', noPadding = false }: CardProps) {
  return (
    <View
      style={[
        styles.card,
        !noPadding && styles.padding,
        SHADOWS[elevation],
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  padding: {
    padding: SPACING.md,
  },
});

