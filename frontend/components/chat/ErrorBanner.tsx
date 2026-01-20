import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../app/theme';

interface ErrorBannerProps {
  message?: string;
}

export function ErrorBanner({ message = "You're offline. Check your connection." }: ErrorBannerProps) {
  return (
    <View style={styles.container} accessible={true} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.bone,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderWarm,
  },
  text: {
    ...typography.bodySmall,
    color: colors.deepInk,
  },
});
