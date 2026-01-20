import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../../app/theme';

interface ChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  disabled?: boolean;
}

export function ChatInput({
  value,
  onChangeText,
  onSend,
  placeholder = "Tell me what's happening in one sentence.",
  disabled = false,
}: ChatInputProps) {
  const [focused, setFocused] = useState(false);
  const hasText = value.trim().length > 0;

  return (
    <View
      style={styles.container}
    >
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.midGray}
          multiline
          editable={!disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          accessible={true}
          accessibilityLabel="Chat input"
          accessibilityHint="Type your training question here"
        />
        <TouchableOpacity
          style={[styles.sendButton, !hasText && styles.sendButtonDisabled]}
          onPress={onSend}
          disabled={!hasText || disabled}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Send message"
          activeOpacity={0.7}
        >
          <Text style={styles.sendIcon}>↑</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.borderWarm,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    flex: 1,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 24,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    paddingRight: 48,
    ...typography.body,
    color: colors.deepInk,
    maxHeight: 120,
    fontSize: 16,
  },
  sendButton: {
    position: 'absolute',
    right: spacing.xs,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.deepInk,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  sendButtonDisabled: {
    backgroundColor: colors.borderWarm,
  },
  sendIcon: {
    color: colors.offWhite,
    fontSize: 18,
    fontWeight: '600',
  },
});
