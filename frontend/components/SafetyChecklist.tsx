import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../app/theme';
import { Button } from './ui/Button';

interface SafetyChecklistProps {
  visible: boolean;
  onComplete: () => void;
  onCancel: () => void;
  isBeginnerLesson?: boolean;
}

export function SafetyChecklist({ visible, onComplete, onCancel, isBeginnerLesson = true }: SafetyChecklistProps) {
  const [checks, setChecks] = useState({
    safetyWarnings: false,
    supervision: false,
    phone: false,
    enclosure: false,
    footwear: false,
  });
  
  const allChecked = Object.values(checks).every(v => v);
  
  const toggleCheck = (key: keyof typeof checks) => {
    setChecks(prev => ({ ...prev, [key]: !prev[key] }));
  };
  
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>⚠️ Before You Start</Text>
          <Text style={styles.subtitle}>
            Your safety is the most important thing. Please confirm:
          </Text>
          
          <View style={styles.checklistItems}>
            <Pressable 
              style={styles.checkItem} 
              onPress={() => toggleCheck('safetyWarnings')}
            >
              <Text style={styles.checkbox}>
                {checks.safetyWarnings ? '☑' : '☐'}
              </Text>
              <Text style={styles.checkText}>
                I have read all safety warnings for this lesson
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.checkItem}
              onPress={() => toggleCheck('supervision')}
            >
              <Text style={styles.checkbox}>
                {checks.supervision ? '☑' : '☐'}
              </Text>
              <View style={styles.checkContent}>
                <Text style={styles.checkText}>
                  I have an experienced person nearby
                </Text>
                <Text style={styles.checkSubtext}>
                  OR I have notified someone of my location
                </Text>
              </View>
            </Pressable>
            
            <Pressable 
              style={styles.checkItem}
              onPress={() => toggleCheck('phone')}
            >
              <Text style={styles.checkbox}>
                {checks.phone ? '☑' : '☐'}
              </Text>
              <Text style={styles.checkText}>
                I have a phone with me for emergencies
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.checkItem}
              onPress={() => toggleCheck('enclosure')}
            >
              <Text style={styles.checkbox}>
                {checks.enclosure ? '☑' : '☐'}
              </Text>
              <Text style={styles.checkText}>
                My horse is in a safe, enclosed area
              </Text>
            </Pressable>
            
            <Pressable 
              style={styles.checkItem}
              onPress={() => toggleCheck('footwear')}
            >
              <Text style={styles.checkbox}>
                {checks.footwear ? '☑' : '☐'}
              </Text>
              <Text style={styles.checkText}>
                I am wearing closed-toe shoes or boots
              </Text>
            </Pressable>
          </View>
          
          <View style={styles.safetyTip}>
            <Text style={styles.safetyTipTitle}>💡 Safety Tip</Text>
            <Text style={styles.safetyTipText}>
              Never wrap a lead rope around your hand. If your horse pulls away, 
              you could be dragged or injured. Always hold the rope in loops.
            </Text>
          </View>
          
          <View style={styles.buttons}>
            <Button
              title="Go Back"
              onPress={onCancel}
              variant="outline"
              style={styles.cancelButton}
            />
            <Button
              title="I'm Ready - Begin Lesson"
              onPress={onComplete}
              disabled={!allChecked}
              style={styles.startButton}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    maxHeight: '90%',
    ...shadows.lg,
  },
  title: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.xl,
  },
  checklistItems: {
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: {
    fontSize: typography.h3.fontSize,
    color: colors.primary[600],
    marginTop: spacing.xs / 2,
  },
  checkContent: {
    flex: 1,
  },
  checkText: {
    ...typography.body,
    color: colors.neutral[800],
    flex: 1,
  },
  checkSubtext: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginTop: spacing.xs / 2,
  },
  safetyTip: {
    backgroundColor: colors.secondary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary[500],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  safetyTipTitle: {
    ...typography.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.secondary[700],
    marginBottom: spacing.xs,
  },
  safetyTipText: {
    ...typography.bodySmall,
    color: colors.secondary[800],
    lineHeight: typography.bodySmall.lineHeight,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  startButton: {
    flex: 2,
  },
});

