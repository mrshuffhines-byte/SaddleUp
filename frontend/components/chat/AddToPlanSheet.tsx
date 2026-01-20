import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Platform,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../../app/theme';
import Button from '../ui/Button';

interface AddToPlanSheetProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (date: Date, time: string) => void;
  defaultDate?: Date;
}

export function AddToPlanSheet({
  visible,
  onClose,
  onConfirm,
  defaultDate = new Date(),
}: AddToPlanSheetProps) {
  const [selectedDate, setSelectedDate] = useState(defaultDate);
  const [selectedTime, setSelectedTime] = useState('09:00');

  const handleConfirm = () => {
    onConfirm(selectedDate, selectedTime);
    onClose();
  };

  // For now, we'll use a simple date/time picker
  // In production, you'd want to use @react-native-community/datetimepicker
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
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
              <Text style={styles.title}>Add to Plan</Text>
              <Text style={styles.subtitle}>Schedule this training session</Text>

              <View style={styles.pickerSection}>
                <Text style={styles.label}>Date</Text>
                <Text style={styles.previewText}>{formatDate(selectedDate)}</Text>
                <Text style={styles.hint}>Date picker would appear here</Text>
              </View>

              <View style={styles.pickerSection}>
                <Text style={styles.label}>Time</Text>
                <Text style={styles.previewText}>{selectedTime}</Text>
                <Text style={styles.hint}>Time picker would appear here</Text>
              </View>

              <View style={styles.actions}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={onClose}
                  style={styles.cancelButton}
                />
                <Button
                  title="Add to Plan"
                  onPress={handleConfirm}
                  style={styles.confirmButton}
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
  pickerSection: {
    marginBottom: spacing.xl,
  },
  label: {
    ...typography.label,
    color: colors.deepInk,
    marginBottom: spacing.sm,
  },
  previewText: {
    ...typography.body,
    color: colors.deepInk,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.offWhite,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderWarm,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.midGray,
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.base,
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
