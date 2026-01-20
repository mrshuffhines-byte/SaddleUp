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
          placeholderTextColor={colors.midGray} // Design system: mid-gray for placeholder text
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
    ...typography.label,
    color: colors.deepInk, // Design system: deep ink for labels
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.offWhite, // Design system: off-white background
    borderWidth: 1,
    borderColor: colors.borderWarm, // Design system: border-warm for borders
    borderRadius: borderRadius.md, // Design system: 12px for inputs
    paddingHorizontal: spacing.base, // Design system: 16px padding
    minHeight: 44, // Design system: minimum 44px tap target
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 1,
  },
  icon: {
    marginRight: spacing.sm,
    fontSize: typography.body.fontSize,
    opacity: 0.7, // Subtle, doesn't dominate
  },
  input: {
    flex: 1,
    ...typography.body,
    fontSize: 16, // Design system: 16px body text
    color: colors.deepInk,
    paddingVertical: spacing.base, // Design system: 16px padding
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

