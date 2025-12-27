import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../app/theme';
import Button from './Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  illustration?: React.ReactNode;
}

export default function EmptyState({
  icon = '📋',
  title,
  description,
  actionLabel,
  onAction,
  illustration,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {illustration || <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          style={styles.button}
          fullWidth={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    minHeight: 300,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    ...typography.h3,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.body.lineHeight,
    maxWidth: 300,
  },
  button: {
    marginTop: spacing.sm,
  },
});

