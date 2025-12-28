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
import { Button, TooltipText } from '../../components/ui';
import { SafetyChecklist } from '../../components/SafetyChecklist';

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
  const [showSafetyChecklist, setShowSafetyChecklist] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [troubleSteps, setTroubleSteps] = useState<Set<number>>(new Set());
  const [expandedTips, setExpandedTips] = useState<Set<number>>(new Set());
  const [completedLessonsCount, setCompletedLessonsCount] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (lessonId) {
      loadLesson();
      loadInstructionProgress();
      loadTroubleSteps();
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

          // Count completed lessons
          const completed = sortedLessons.filter(l => l.isCompleted).length;
          setCompletedLessonsCount(completed);
        }
      }

      // Load streak from sessions
      const sessionsResponse = await fetch(`${API_URL}/api/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (sessionsResponse.ok) {
        const sessions = await sessionsResponse.json();
        if (Array.isArray(sessions)) {
          const streak = calculateStreak(sessions);
          setCurrentStreak(streak);
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

  const markTrouble = (index: number) => {
    const newTrouble = new Set(troubleSteps);
    if (newTrouble.has(index)) {
      newTrouble.delete(index);
    } else {
      newTrouble.add(index);
    }
    setTroubleSteps(newTrouble);
    // Save to AsyncStorage
    const key = `lesson_trouble_${lessonId}`;
    AsyncStorage.setItem(key, JSON.stringify({ troubleSteps: Array.from(newTrouble) }));
  };

  const calculateStreak = (sessions: any[]): number => {
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sortedSessions = [...sessions].sort((a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );

    let checkDate = new Date(today);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.sessionDate);
      sessionDate.setHours(0, 0, 0, 0);

      if (sessionDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (sessionDate.getTime() < checkDate.getTime()) {
        break;
      }
    }

    return streak;
  };

  const loadTroubleSteps = async () => {
    try {
      const key = `lesson_trouble_${lessonId}`;
      const saved = await AsyncStorage.getItem(key);
      if (saved) {
        const data = JSON.parse(saved);
        setTroubleSteps(new Set(data.troubleSteps || []));
      }
    } catch (error) {
      console.error('Load trouble steps error:', error);
    }
  };

  const handleMarkComplete = () => {
    // Show safety checklist first (for beginner lessons)
    const isBeginner = true; // Could be determined from user profile
    setShowSafetyChecklist(true);
  };

  const handleSafetyChecklistComplete = async () => {
    setShowSafetyChecklist(false);
    
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
      setCompletedLessonsCount(prev => prev + 1);
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
                <View key={index} style={styles.objectiveItem}>
                  <Text style={styles.bullet}>•</Text>
                  <View style={styles.objectiveTextContainer}>
                    <TooltipText>{obj}</TooltipText>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Equipment */}
          {content?.equipment && content.equipment.length > 0 && (
            <Card style={styles.equipmentCard}>
              <Text style={styles.sectionTitle}>🧰 What You'll Need</Text>
              {content.equipment.map((item: string, index: number) => (
                <View key={index} style={styles.equipmentItem}>
                  <Text style={styles.equipmentCheck}>✓</Text>
                  <View style={styles.equipmentTextContainer}>
                    <TooltipText>{item}</TooltipText>
                  </View>
                </View>
              ))}
            </Card>
          )}

          {/* Interactive Instructions */}
          {content?.instructions && content.instructions.length > 0 && (
            <Card style={styles.instructionsCard}>
              <Text style={styles.sectionTitle}>📋 Instructions</Text>
              {content.instructions.map((instruction: any, index: number) => {
                const isChecked = checkedSteps.has(index);
                const hasTrouble = troubleSteps.has(index);
                const instructionText = typeof instruction === 'string' ? instruction : instruction.text;
                const instructionTip = typeof instruction === 'object' ? instruction.tip : undefined;
                const instructionWarning = typeof instruction === 'object' ? instruction.warning : undefined;
                const successLooksLike = typeof instruction === 'object' ? instruction.successLooksLike : undefined;
                const isTipExpanded = expandedTips.has(index);

                return (
                  <View 
                    key={index} 
                    style={[
                      styles.instructionStep,
                      isChecked && styles.stepCompleted,
                      hasTrouble && styles.stepTrouble,
                    ]}
                  >
                    <Pressable 
                      style={styles.stepCheckbox}
                      onPress={() => toggleStep(index)}
                    >
                      <Text style={styles.stepNumber}>
                        {isChecked ? '✓' : index + 1}
                      </Text>
                    </Pressable>
                    
                    <View style={styles.stepContent}>
                      <TooltipText>{instructionText}</TooltipText>
                      
                      {instructionTip && (
                        <TouchableOpacity
                          style={styles.stepTip}
                          onPress={() => toggleTip(index)}
                        >
                          <Text style={styles.tipIcon}>💡</Text>
                          <Text style={styles.tipButtonText}>
                            {isTipExpanded ? 'Hide Tip' : 'Show Tip'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      {instructionTip && isTipExpanded && (
                        <Text style={styles.tipText}>{instructionTip}</Text>
                      )}
                      
                      {instructionWarning && (
                        <View style={styles.stepWarning}>
                          <Text style={styles.warningIcon}>⚠️</Text>
                          <Text style={styles.warningText}>{instructionWarning}</Text>
                        </View>
                      )}
                      
                      {successLooksLike && (
                        <View style={styles.successHint}>
                          <Text style={styles.successIcon}>👀</Text>
                          <Text style={styles.successText}>
                            <Text style={styles.successLabel}>Success looks like: </Text>
                            {successLooksLike}
                          </Text>
                        </View>
                      )}
                      
                      <View style={styles.stepActions}>
                        <TouchableOpacity 
                          style={styles.doneButton}
                          onPress={() => toggleStep(index)}
                        >
                          <Text style={styles.doneButtonText}>
                            {isChecked ? 'Undo' : 'Done'}
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={[
                            styles.troubleButton, 
                            hasTrouble && styles.troubleButtonActive
                          ]}
                          onPress={() => markTrouble(index)}
                        >
                          <Text style={styles.troubleButtonText}>
                            {hasTrouble ? 'Had Trouble ❌' : 'Had Trouble?'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </Card>
          )}

          {/* Trouble Help Section */}
          {troubleSteps.size > 0 && (
            <Card style={styles.troubleHelp}>
              <Text style={styles.troubleHelpTitle}>Having trouble with some steps?</Text>
              <Text style={styles.troubleHelpText}>
                That's completely normal! Try asking the trainer for help with specific steps.
              </Text>
              <Button
                title="Ask the Trainer for Help"
                onPress={() => {
                  const troubleStepTexts = Array.from(troubleSteps)
                    .map(i => {
                      const inst = content?.instructions?.[i];
                      const text = typeof inst === 'string' ? inst : inst?.text || '';
                      return text.substring(0, 50); // Limit length
                    })
                    .filter(Boolean)
                    .slice(0, 3)
                    .join(', ');
                  // Navigate to chat - the chat screen will need to handle the prefill
                  router.push('/(tabs)/chat');
                  // Note: In a real implementation, you might want to use a global state
                  // or query params to prefill the chat input
                }}
                style={styles.askTrainerButton}
                fullWidth
              />
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
            <Card style={styles.mistakesCard}>
              <Text style={styles.sectionTitle}>❌ Common Mistakes to Avoid</Text>
              {content.commonMistakes.map((mistake: string, index: number) => (
                <View key={index} style={styles.mistakeItem}>
                  <Text style={styles.mistakeBullet}>•</Text>
                  <View style={styles.mistakeTextContainer}>
                    <TooltipText>{mistake}</TooltipText>
                  </View>
                </View>
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
              <Text style={styles.nextUpMeta}>
                Phase {nextLesson.phaseNumber} • ~{duration} min
              </Text>
              <Button
                title="Preview Next Lesson"
                onPress={() => router.push(`/lesson/${nextLesson.lessonId}`)}
                variant="outline"
                style={styles.previewButton}
                fullWidth
              />
            </Card>
          )}
        </View>
      </ScrollView>

      {/* Safety Checklist Modal */}
      <SafetyChecklist
        visible={showSafetyChecklist}
        onComplete={handleSafetyChecklistComplete}
        onCancel={() => setShowSafetyChecklist(false)}
        isBeginnerLesson={true}
      />

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
            <Text style={styles.successMessage}>
              Great job! You're making real progress on your horsemanship journey.
            </Text>
            
            {troubleSteps.size > 0 && (
              <View style={styles.reviewNote}>
                <Text style={styles.reviewNoteText}>
                  You marked {troubleSteps.size} step(s) as tricky. 
                  Consider practicing these again next session.
                </Text>
              </View>
            )}
            
            <View style={styles.successStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{completedLessonsCount}</Text>
                <Text style={styles.statLabel}>Lessons Done</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{currentStreak}</Text>
                <Text style={styles.statLabel}>Day Streak</Text>
              </View>
            </View>
            
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
                  title="Back to Training Plan"
                  onPress={goToPlan}
                  style={styles.successButton}
                  fullWidth
                />
              )}
              {nextLesson && (
                <Button
                  title="Back to Training Plan"
                  onPress={goToPlan}
                  variant="outline"
                  style={styles.successButton}
                  fullWidth
                />
              )}
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
  objectiveItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  bullet: {
    ...typography.body,
    color: colors.primary[700],
    marginRight: spacing.sm,
    marginTop: 2,
  },
  objectiveTextContainer: {
    flex: 1,
  },
  equipmentCard: {
    marginBottom: spacing.lg,
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  equipmentCheck: {
    ...typography.body,
    color: colors.success,
    marginRight: spacing.sm,
    marginTop: 2,
    fontWeight: typography.weights.bold,
  },
  equipmentTextContainer: {
    flex: 1,
  },
  instructionsCard: {
    marginBottom: spacing.lg,
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
  nextUpMeta: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  previewButton: {
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
  },
  successMessage: {
    ...typography.body,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  reviewNote: {
    backgroundColor: colors.warning + '20',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  reviewNoteText: {
    ...typography.bodySmall,
    color: colors.neutral[800],
    textAlign: 'center',
  },
  successStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.xl,
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.neutral[200],
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  statLabel: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successButtons: {
    width: '100%',
    gap: spacing.md,
  },
  successButton: {
    marginTop: 0,
  },
  emptyText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.body.fontWeight,
    lineHeight: typography.body.lineHeight,
    color: colors.neutral[500],
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
});
