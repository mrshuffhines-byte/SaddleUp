import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../app/theme';
import Button from '../ui/Button';

interface SaveTemplateSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
  defaultName?: string;
}

export function SaveTemplateSheet({
  visible,
  onClose,
  onConfirm,
  defaultName = '',
}: SaveTemplateSheetProps) {
  const [templateName, setTemplateName] = useState(defaultName);

  React.useEffect(() => {
    if (visible && defaultName) {
      setTemplateName(defaultName);
    }
  }, [visible, defaultName]);

  const handleConfirm = () => {
    if (templateName.trim()) {
      onConfirm(templateName.trim());
      setTemplateName('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.sheet,
                {
                  paddingBottom: spacing.base,
                  borderTopLeftRadius: borderRadius.xl,
                  borderTopRightRadius: borderRadius.xl,
                },
              ]}
            >
              <View style={styles.handle} />
              <Text style={styles.title}>Save to Library</Text>
              <Text style={styles.subtitle}>Give this template a name</Text>

              <TextInput
                style={styles.input}
                value={templateName}
                onChangeText={setTemplateName}
                placeholder="Template name"
                placeholderTextColor={colors.midGray}
                autoFocus
                accessible={true}
                accessibilityLabel="Template name input"
              />

              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClose}
                  style={styles.cancelButton}
                />
                <Button
                  title="Save to Library"
                  onPress={handleConfirm}
                  style={styles.confirmButton}
                  disabled={!templateName.trim()}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    ...shadows.lg,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: colors.borderWarm,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: spacing.base,
  },
  title: {
    ...typography.h3,
    color: colors.deepInk,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.body,
    color: colors.slate,
    marginBottom: spacing.xl,
  },
  input: {
    ...typography.body,
    backgroundColor: colors.offWhite,
    borderWidth: 1,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    color: colors.deepInk,
    marginBottom: spacing.xl,
    minHeight: 44,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
