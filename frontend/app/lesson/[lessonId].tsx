import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Pressable,
  Modal,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import { Button } from '../../components/ui';

interface Lesson {
  id: string;
  lessonId: string;
  title: string;
  phaseNumber: number;
  moduleNumber: number;
  lessonNumber: number;
  isCompleted: boolean;
  content?: any;
  plan?: {
    id: string;
    lessons?: Array<{
      id: string;
      lessonId: string;
      title: string;
      phaseNumber: number;
      moduleNumber: number;
      lessonNumber: number;
      isCompleted: boolean;
    }>;
  };
}

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [nextLesson, setNextLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const router = useRouter();

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      loadInstructionProgress();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(
        `${API_URL}/api/training/lesson/${lessonId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load lesson');
      }

      const data = await response.json();
      setLesson(data);
      setIsCompleted(data.isCompleted || false);

      // Load plan to get next lesson
      const planResponse = await fetch(`${API_URL}/api/training/plan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (planResponse.ok) {
        const plan = await planResponse.json();
        if (plan.lessons) {
          // Find current lesson index
          const sortedLessons = [...plan.lessons].sort((a, b) => {
            if (a.phaseNumber !== b.phaseNumber) return a.phaseNumber - b.phaseNumber;
            if (a.moduleNumber !== b.moduleNumber) return a.moduleNumber - b.moduleNumber;
            return a.lessonNumber - b.lessonNumber;
          });

          const currentIndex = sortedLessons.findIndex(
            (l) => l.lessonId === lessonId
          );

          if (currentIndex >= 0 && currentIndex < sortedLessons.length - 1) {
            setNextLesson(sortedLessons[currentIndex + 1]);
          }
        }
      }
    } catch (error) {
      console.error('Load lesson error:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const loadInstructionProgress = async () => {
    try {
      const key = `lesson_progress_${lessonId}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const progress = JSON.parse(saved);
        setCheckedSteps(new Set(progress.checkedSteps || []));
      }
    } catch (error) {
      console.error('Load progress error:', error);
    }
  };

  const saveInstructionProgress = async (steps: Set<number>) => {
    try {
      const key = `lesson_progress_${lessonId}`;
      await AsyncStorage.setItem(
        key,
        JSON.stringify({ checkedSteps: Array.from(steps) })
      );
    } catch (error) {
      console.error('Save progress error:', error);
    }
  };

  const toggleStep = (index: number) => {
    const newChecked = new Set(checkedSteps);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedSteps(newChecked);
    saveInstructionProgress(newChecked);
  };

  const toggleTip = (index: number) => {
    const newExpanded = new Set(expandedTips);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedTips(newExpanded);
  };

  const handleMarkComplete = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch(
        `${API_URL}/api/training/lesson/${lessonId}/complete`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to mark lesson complete');
      }

      setIsCompleted(true);
      setShowSuccess(true);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const goToNextLesson = () => {
    setShowSuccess(false);
    if (nextLesson) {
      router.replace(`/lesson/${nextLesson.lessonId}`);
    } else {
      router.push('/(tabs)/plan');
    }
  };

  const goToPlan = () => {
    setShowSuccess(false);
    router.push('/(tabs)/plan');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!lesson) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>Lesson not found</Text>
      </View>
    );
  }

  const content = lesson.content as any;
  const duration = content?.duration || 30;
  const objectives = content?.objective
    ? [content.objective]
    : content?.objectives || [];

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.content}>
          {/* Header with Breadcrumb */}
          <View style={styles.header}>
            <Text style={styles.breadcrumb}>
              Phase {lesson.phaseNumber} {'>'} Module {lesson.moduleNumber} {'>'} Lesson{' '}
              {lesson.lessonNumber}
            </Text>
            <Text style={styles.title}>{lesson.title}</Text>
            <View style={styles.timeRow}>
              <Text style={styles.timeIcon}>⏱</Text>
              <Text style={styles.timeText}>~{duration} minutes</Text>
            </View>
          </View>

          {content?.requiresProfessionalHelp && (
            <Card style={styles.warningCard}>
              <Text style={styles.warningText}>
                ⚠️ This lesson requires professional instruction. Please work with a
                qualified instructor.
              </Text>
            </Card>
          )}

          {/* Learning Objectives */}
          {objectives.length > 0 && (
            <Card style={styles.objectivesCard}>
              <Text style={styles.sectionTitle}>🎯 Learning Objectives</Text>
              <Text style={styles.objectiveText}>
                By the end of this lesson, you'll be able to:
              </Text>
              {objectives.map((obj: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {obj}
                </Text>
              ))}
            </Card>
          )}

          {/* Equipment */}
          {content?.equipment && content.equipment.length > 0 && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>🛠 Equipment Needed</Text>
              {content.equipment.map((item: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {item}
                </Text>
              ))}
            </Card>
          )}

          {/* Interactive Instructions */}
          {content?.instructions && content.instructions.length > 0 && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>📋 Step-by-Step Instructions</Text>
              {content.instructions.map((instruction: string, index: number) => {
                const isChecked = checkedSteps.has(index);
                return (
                  <Pressable
                    key={index}
                    style={[
                      styles.instructionStep,
                      isChecked && styles.instructionStepChecked,
                    ]}
                    onPress={() => toggleStep(index)}
                  >
                    <View style={styles.checkbox}>
                      {isChecked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <View style={styles.instructionContent}>
                      <Text
                        style={[
                          styles.instructionText,
                          isChecked && styles.instructionTextChecked,
                        ]}
                      >
                        {instruction}
                      </Text>
                      {/* Tip expansion could go here if we add tips to instructions */}
                    </View>
                  </Pressable>
                );
              })}
            </Card>
          )}

          {/* Safety Notes */}
          {content?.safetyNotes && content.safetyNotes.length > 0 && (
            <Card style={styles.safetyCard}>
              <Text style={styles.sectionTitle}>⚠️ Safety Notes</Text>
              {content.safetyNotes.map((note: string, index: number) => (
                <Text key={index} style={styles.safetyPoint}>
                  • {note}
                </Text>
              ))}
            </Card>
          )}

          {/* Common Mistakes */}
          {content?.commonMistakes && content.commonMistakes.length > 0 && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>💡 Common Mistakes to Avoid</Text>
              {content.commonMistakes.map((mistake: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>
                  • {mistake}
                </Text>
              ))}
            </Card>
          )}

          {/* Move On When */}
          {content?.moveOnWhen && content.moveOnWhen.length > 0 && (
            <Card style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>✅ Move On When</Text>
              {content.moveOnWhen.map((criterion: string, index: number) => (
                <Text key={index} style={styles.bulletPoint}>
                  ✓ {criterion}
                </Text>
              ))}
            </Card>
          )}

          {/* Complete Button */}
          {!isCompleted && (
            <Button
              title="Mark as Complete"
              onPress={handleMarkComplete}
              style={styles.completeButton}
              fullWidth
            />
          )}

          {isCompleted && (
            <Card style={styles.completedCard}>
              <Text style={styles.completedText}>✓ Lesson Completed</Text>
            </Card>
          )}

          {/* What's Next */}
          {nextLesson && (
            <Card style={styles.nextUpCard}>
              <Text style={styles.nextUpLabel}>Up Next</Text>
              <Text style={styles.nextUpTitle}>{nextLesson.title}</Text>
              <Button
                title="Start Next Lesson →"
                onPress={() => router.push(`/lesson/${nextLesson.lessonId}`)}
                variant="outline"
                style={styles.nextButton}
                fullWidth
              />
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Success Modal */}
      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.successModal}>
            <Text style={styles.successEmoji}>🎉</Text>
            <Text style={styles.successTitle}>Lesson Complete!</Text>
            <Text style={styles.successText}>
              Great job! You're making progress.
            </Text>
            <View style={styles.successButtons}>
              {nextLesson ? (
                <Button
                  title="Continue to Next Lesson →"
                  onPress={goToNextLesson}
                  style={styles.successButton}
                  fullWidth
                />
              ) : (
                <Button
                  title="View Training Plan"
                  onPress={goToPlan}
                  style={styles.successButton}
                  fullWidth
                />
              )}
              <Button
                title="Back to Plan"
                onPress={goToPlan}
                variant="outline"
                style={styles.successButton}
                fullWidth
              />
            </View>
          </Card>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing.lg,
  },
  header: {
    marginBottom: spacing.lg,
  },
  breadcrumb: {
    ...typography.caption,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeIcon: {
    fontSize: typography.body.fontSize,
    marginRight: spacing.xs,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
  warningCard: {
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    borderWidth: 2,
    marginBottom: spacing.lg,
  },
  warningText: {
    ...typography.body,
    color: colors.neutral[800],
  },
  objectivesCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.primary[50],
  },
  sectionCard: {
    marginBottom: spacing.lg,
  },
  safetyCard: {
    marginBottom: spacing.lg,
    backgroundColor: colors.warning + '20',
    borderColor: colors.warning,
    borderWidth: 2,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  objectiveText: {
    ...typography.body,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  bulletPoint: {
    ...typography.body,
    color: colors.neutral[700],
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.sm,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
  },
  instructionStepChecked: {
    backgroundColor: colors.success + '20',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.primary[500],
    marginRight: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  checkmark: {
    fontSize: typography.bodySmall.fontSize,
    color: colors.primary[500],
    fontWeight: '700',
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    ...typography.body,
    color: colors.neutral[900],
    lineHeight: typography.body.lineHeight,
  },
  instructionTextChecked: {
    textDecorationLine: 'line-through',
    color: colors.neutral[500],
  },
  safetyPoint: {
    ...typography.body,
    color: colors.neutral[800],
    lineHeight: typography.body.lineHeight,
    marginBottom: spacing.sm,
    fontWeight: '500',
  },
  completeButton: {
    marginTop: spacing.lg,
    marginBottom: spacing.lg,
  },
  completedCard: {
    backgroundColor: colors.success + '20',
    borderColor: colors.success,
    borderWidth: 2,
    marginBottom: spacing.lg,
  },
  completedText: {
    ...typography.body,
    color: colors.success,
    fontWeight: '600',
    textAlign: 'center',
  },
  nextUpCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.secondary[50],
  },
  nextUpLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  nextUpTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  nextButton: {
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  successModal: {
    width: '100%',
    maxWidth: 400,
    padding: spacing.xl,
    alignItems: 'center',
  },
  successEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  successTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successText: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  successButtons: {
    width: '100%',
    gap: spacing.md,
  },
  successButton: {
    marginTop: 0,
  },
  emptyText: {
    ...typography.body,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
