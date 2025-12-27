import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../app/constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  disabled = false,
  loading = false,
  style,
  fullWidth = false,
}: ButtonProps) {
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    style,
  ];

  const textStyle = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    styles[`textSize${size.charAt(0).toUpperCase() + size.slice(1)}`],
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? COLORS.surface : COLORS.primary} />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.md,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  ghost: {
    backgroundColor: 'transparent',
    ...SHADOWS.sm,
    shadowOpacity: 0,
    elevation: 0,
  },
  sizeSm: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  sizeMd: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  sizeLg: {
    paddingVertical: SPACING.md + 4,
    paddingHorizontal: SPACING.xl,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  textPrimary: {
    color: COLORS.surface,
  },
  textSecondary: {
    color: COLORS.surface,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textGhost: {
    color: COLORS.primary,
  },
  textSizeSm: {
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  textSizeMd: {
    fontSize: TYPOGRAPHY.sizes.base,
  },
  textSizeLg: {
    fontSize: TYPOGRAPHY.sizes.md,
  },
  icon: {
    marginRight: SPACING.xs,
    fontSize: TYPOGRAPHY.sizes.base,
  },
});

