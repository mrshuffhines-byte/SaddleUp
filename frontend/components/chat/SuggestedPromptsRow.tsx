import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { spacing } from '../../app/theme';
import { SuggestedPromptChip } from './SuggestedPromptChip';

interface SuggestedPromptsRowProps {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
}

export function SuggestedPromptsRow({ prompts, onSelectPrompt }: SuggestedPromptsRowProps) {
  if (prompts.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {prompts.map((prompt, index) => (
          <SuggestedPromptChip
            key={index}
            text={prompt}
            onPress={() => onSelectPrompt(prompt)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
  },
  scrollContent: {
    paddingRight: spacing.base,
  },
});
