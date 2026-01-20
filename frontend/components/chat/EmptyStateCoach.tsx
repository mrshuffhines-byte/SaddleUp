import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../app/theme';
import { SuggestedPromptsRow } from './SuggestedPromptsRow';

interface EmptyStateCoachProps {
  onSelectPrompt: (prompt: string) => void;
}

const EMPTY_STATE_PROMPTS = [
  "My horse won't stand still for mounting",
  '5-minute groundwork warm-up',
  'Help me build confidence at the canter',
  "What should I do if my horse spooks?",
];

export function EmptyStateCoach({ onSelectPrompt }: EmptyStateCoachProps) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarIcon}>💬</Text>
          </View>
        </View>
        <Text style={styles.headline}>Ask me anything</Text>
        <Text style={styles.subtext}>
          I'll break it into simple steps you can follow.
        </Text>
      </View>
      <SuggestedPromptsRow prompts={EMPTY_STATE_PROMPTS} onSelectPrompt={onSelectPrompt} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  content: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarContainer: {
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.turquoise,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarIcon: {
    fontSize: 40,
  },
  headline: {
    ...typography.h3,
    color: colors.deepInk,
    fontWeight: '600',
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtext: {
    ...typography.body,
    color: colors.slate,
    textAlign: 'center',
    paddingHorizontal: spacing.base,
  },
});
