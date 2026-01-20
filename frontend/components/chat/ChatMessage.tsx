import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../app/theme';
import { SafetyCalloutBox } from './SafetyCalloutBox';

interface ChatMessageProps {
  message: {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    createdAt: string;
    steps?: Array<{ number: number; text: string; timeEstimate?: string }>;
    whenToStop?: string;
    hasSafetyConcern?: boolean;
  };
  onAddToPlan?: () => void;
  onSaveTemplate?: () => void;
}

export function ChatMessage({ message, onAddToPlan, onSaveTemplate }: ChatMessageProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userWrapper}>
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  // Coach message
  return (
    <View style={styles.coachWrapper}>
      <View style={styles.coachBubble}>
        {message.hasSafetyConcern && (
          <SafetyCalloutBox />
        )}
        
        {/* Main content */}
        <Text style={styles.coachText}>{message.content}</Text>

        {/* Steps if present */}
        {message.steps && message.steps.length > 0 && (
          <View style={styles.stepsContainer}>
            {message.steps.map((step) => (
              <View key={step.number} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{step.number}</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepText}>{step.text}</Text>
                  {step.timeEstimate && (
                    <Text style={styles.timeEstimate}>{step.timeEstimate}</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* When to stop callout */}
        {message.whenToStop && (
          <View style={styles.whenToStopBox}>
            <View style={styles.whenToStopBorder} />
            <View style={styles.whenToStopContent}>
              <Text style={styles.whenToStopLabel}>When to stop</Text>
              <Text style={styles.whenToStopText}>{message.whenToStop}</Text>
            </View>
          </View>
        )}

        {/* Action buttons */}
        {(message.steps || message.whenToStop) && (
          <View style={styles.actionsRow}>
            {onAddToPlan && (
              <TouchableOpacity
                style={styles.addToPlanButton}
                onPress={onAddToPlan}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Add to plan"
              >
                <Text style={styles.addToPlanText}>Add to Plan</Text>
              </TouchableOpacity>
            )}
            {onSaveTemplate && (
              <TouchableOpacity
                style={styles.saveTemplateButton}
                onPress={onSaveTemplate}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="Save as template"
              >
                <Text style={styles.saveTemplateText}>Save as Template</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userWrapper: {
    width: '100%',
    marginBottom: spacing.base,
    alignItems: 'flex-end',
    paddingRight: spacing.base,
  },
  userBubble: {
    maxWidth: '80%',
    backgroundColor: colors.deepInk,
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  userText: {
    ...typography.body,
    color: colors.offWhite,
    lineHeight: 24,
  },
  coachWrapper: {
    width: '100%',
    marginBottom: spacing.base,
    alignItems: 'flex-start',
    paddingLeft: spacing.base,
  },
  coachBubble: {
    maxWidth: '85%',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: 16,
    borderTopLeftRadius: 4,
    padding: spacing.base,
  },
  coachText: {
    ...typography.body,
    color: colors.deepInk,
    lineHeight: 24,
    marginBottom: spacing.base,
  },
  stepsContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.base,
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.deepInk,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    ...typography.bodySmall,
    color: colors.white,
    fontWeight: '600',
  },
  stepContent: {
    flex: 1,
  },
  stepText: {
    ...typography.body,
    color: colors.deepInk,
    lineHeight: 24,
    marginBottom: spacing.xs,
  },
  timeEstimate: {
    ...typography.bodySmall,
    color: colors.slate,
    fontStyle: 'italic',
  },
  whenToStopBox: {
    flexDirection: 'row',
    backgroundColor: colors.bone,
    borderRadius: borderRadius.sm,
    marginTop: spacing.base,
    marginBottom: spacing.base,
    overflow: 'hidden',
  },
  whenToStopBorder: {
    width: 3,
    backgroundColor: colors.turquoise,
  },
  whenToStopContent: {
    flex: 1,
    padding: spacing.base,
  },
  whenToStopLabel: {
    ...typography.label,
    color: colors.deepInk,
    marginBottom: spacing.xs,
  },
  whenToStopText: {
    ...typography.body,
    color: colors.deepInk,
    lineHeight: 24,
  },
  actionsRow: {
    flexDirection: 'row',
    marginTop: spacing.base,
    gap: spacing.md,
    paddingTop: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
  },
  addToPlanButton: {
    backgroundColor: colors.deepInk,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToPlanText: {
    ...typography.bodySmall,
    color: colors.offWhite,
    fontWeight: '600',
  },
  saveTemplateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveTemplateText: {
    ...typography.bodySmall,
    color: colors.deepInk,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
