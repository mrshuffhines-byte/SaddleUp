import React from 'react';
import { View, TextInput, Text, StyleSheet, TextInputProps } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../../app/theme';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  icon?: string;
  containerStyle?: any;
  rightIcon?: React.ReactNode;
}

export default function Input({
  label,
  error,
  icon,
  containerStyle,
  style,
  rightIcon,
  ...props
}: InputProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={[styles.inputContainer, error && styles.inputError]}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <TextInput
          style={[styles.input, icon && styles.inputWithIcon, rightIcon && styles.inputWithRightIcon, style]}
          placeholderTextColor={colors.neutral[500]} // Improved contrast for better visibility
          {...props}
        />
        {rightIcon && (
          <View style={styles.rightIconContainer}>
            {rightIcon}
          </View>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...typography.bodySmall,
    fontSize: 15,
    fontWeight: '600',
    color: colors.neutral[900], // Darker for better contrast (WCAG AA)
    marginBottom: spacing.sm,
    letterSpacing: 0.2, // Slightly increased for clarity
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 2, // Increased from 1.5 for better definition
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 56, // Increased from 52 for better tap target (WCAG AA)
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2, // Increased from 1.5 for consistency
  },
  icon: {
    marginRight: spacing.sm,
    fontSize: typography.body.fontSize,
    opacity: 0.7, // Subtle, doesn't dominate
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 16, // Minimum 16px for readability and prevents zoom on iOS
    color: colors.neutral[900],
    paddingVertical: spacing.md + 2, // Slightly increased for better comfort
    minHeight: 52, // Better tap target
  },
  inputWithIcon: {
    paddingLeft: 0,
  },
  inputWithRightIcon: {
    paddingRight: spacing.md + 24,
  },
  rightIconContainer: {
    position: 'absolute',
    right: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

