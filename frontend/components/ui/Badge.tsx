import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../app/theme';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'primary' | 'secondary';
  size?: 'sm' | 'md';
  style?: any;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  style,
}: BadgeProps) {
  return (
    <View style={[styles.badge, styles[variant], styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`], style]}>
      <Text style={[styles.text, styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`]]}>
        {children}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sizeSm: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  sizeMd: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs / 2,
  },
  default: {
    backgroundColor: colors.neutral[200],
  },
  primary: {
    backgroundColor: colors.primary[100],
  },
  secondary: {
    backgroundColor: colors.secondary[100],
  },
  success: {
    backgroundColor: colors.success + '20', // 20% opacity
  },
  warning: {
    backgroundColor: colors.warning + '20',
  },
  error: {
    backgroundColor: colors.error + '20',
  },
  info: {
    backgroundColor: colors.info + '20',
  },
  text: {
    fontWeight: '600',
  },
  textDefault: {
    color: colors.neutral[700],
    fontSize: typography.caption.fontSize,
  },
  textPrimary: {
    color: colors.primary[700],
    fontSize: typography.caption.fontSize,
  },
  textSecondary: {
    color: colors.secondary[700],
    fontSize: typography.caption.fontSize,
  },
  textSuccess: {
    color: colors.success,
    fontSize: typography.caption.fontSize,
  },
  textWarning: {
    color: colors.warning,
    fontSize: typography.caption.fontSize,
  },
  textError: {
    color: colors.error,
    fontSize: typography.caption.fontSize,
  },
  textInfo: {
    color: colors.info,
    fontSize: typography.caption.fontSize,
  },
});

// Convenience components for common badge types
export function CompletedBadge() {
  return <Badge variant="success" size="sm">✓ Completed</Badge>;
}

export function InProgressBadge() {
  return <Badge variant="info" size="sm">In Progress</Badge>;
}

export function LockedBadge() {
  return <Badge variant="default" size="sm">🔒 Locked</Badge>;
}

