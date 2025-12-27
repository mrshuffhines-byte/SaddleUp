import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../app/theme';

interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
}

export default function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  icon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  value: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.neutral[600],
    textAlign: 'center',
  },
});

