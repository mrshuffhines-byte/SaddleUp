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
          placeholderTextColor={colors.neutral[500]}
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
    color: colors.neutral[800],
    marginBottom: spacing.sm,
    letterSpacing: 0.1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    minHeight: 52, // WCAG AA minimum tap target
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1.5,
  },
  icon: {
    marginRight: spacing.sm,
    fontSize: typography.body.fontSize,
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px for readability and prevents zoom on iOS
    color: colors.neutral[900],
    paddingVertical: spacing.md,
    minHeight: 48, // Better tap target
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

