import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../app/theme';

interface SuggestedPromptChipProps {
  text: string;
  onPress: () => void;
}

export function SuggestedPromptChip({ text, onPress }: SuggestedPromptChipProps) {
  return (
    <TouchableOpacity
      style={styles.chip}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Suggested prompt: ${text}`}
      activeOpacity={0.7}
    >
      <Text style={styles.chipText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginRight: spacing.sm,
    minHeight: 44,
    justifyContent: 'center',
  },
  chipText: {
    ...typography.small,
    color: colors.slate,
    lineHeight: 20,
  },
});
