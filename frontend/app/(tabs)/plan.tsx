import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import { ProgressBar } from '../../components/ui';

interface Lesson {
  id: string;
  lessonId: string;
  title: string;
  phaseNumber: number;
  moduleNumber: number;
  lessonNumber: number;
  isCompleted: boolean;
  content?: any;
}

interface Plan {
  id: string;
  visibleIdDisplay: string;
  name?: string;
  goal: string;
  generatedContent?: any;
  lessons: Lesson[];
}

interface Phase {
  phaseNumber: number;
  title?: string;
  description?: string;
  icon?: string;
  modules: Module[];
}

interface Module {
  moduleNumber: number;
  title?: string;
  lessons: Lesson[];
}

type LessonStatus = 'completed' | 'current' | 'locked';

const PHASE_ICONS = ['🌱', '🌿', '🌳'];
const PHASE_TITLES = ['Foundation', 'Building Skills', 'Refinement'];
const PHASE_DESCRIPTIONS = [
  'Master the basics and build confidence',
  'Develop core skills and techniques',
  'Refine and perfect your horsemanship',
];

export default function PlanScreen() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const router = useRouter();

  useEffect(() => {
    loadPlan();
  }, []);

  const loadPlan = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/training/plan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load plan');
      }

      const data = await response.json();
      setPlan(data);
      
      // Expand first module of first phase by default
      if (data.lessons && data.lessons.length > 0) {
        const firstPhase = Math.min(...data.lessons.map((l: Lesson) => l.phaseNumber));
        const firstModule = Math.min(
          ...data.lessons
            .filter((l: Lesson) => l.phaseNumber === firstPhase)
            .map((l: Lesson) => l.moduleNumber)
        );
        setExpandedModules(new Set([`${firstPhase}-${firstModule}`]));
      }
    } catch (error) {
      console.error('Load plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (phaseNumber: number, moduleNumber: number) => {
    const key = `${phaseNumber}-${moduleNumber}`;
    const newExpanded = new Set(expandedModules);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedModules(newExpanded);
  };

  const getLessonDuration = (lesson: Lesson): number => {
    return lesson.content?.duration || 30;
  };

  const getLessonStatus = (lesson: Lesson, allLessons: Lesson[]): LessonStatus => {
    if (lesson.isCompleted) {
      return 'completed';
    }

    // Find all lessons before this one
    const previousLessons = allLessons.filter((l) => {
      if (l.phaseNumber < lesson.phaseNumber) return true;
      if (l.phaseNumber === lesson.phaseNumber && l.moduleNumber < lesson.moduleNumber) return true;
      if (
        l.phaseNumber === lesson.phaseNumber &&
        l.moduleNumber === lesson.moduleNumber &&
        l.lessonNumber < lesson.lessonNumber
      ) {
        return true;
      }
      return false;
    });

    // Check if all previous lessons are completed
    const allPreviousCompleted = previousLessons.every((l) => l.isCompleted);

    if (allPreviousCompleted) {
      return 'current';
    }

    return 'locked';
  };

  const calculateEstimatedWeeks = (totalLessons: number, daysPerWeek: number): number => {
    if (daysPerWeek === 0) return 0;
    const lessonsPerWeek = daysPerWeek;
    return Math.ceil(totalLessons / lessonsPerWeek);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="📚"
          title="No Training Plan"
          description="Create your personalized training plan to get started on your horsemanship journey."
          actionLabel="Create Plan"
          onAction={() => router.push('/onboarding')}
        />
      </View>
    );
  }

  // Group lessons by phase and module
  const phasesMap = new Map<number, Phase>();

  plan.lessons.forEach((lesson) => {
    if (!phasesMap.has(lesson.phaseNumber)) {
      phasesMap.set(lesson.phaseNumber, {
        phaseNumber: lesson.phaseNumber,
        title: PHASE_TITLES[lesson.phaseNumber - 1] || `Phase ${lesson.phaseNumber}`,
        description: PHASE_DESCRIPTIONS[lesson.phaseNumber - 1],
        icon: PHASE_ICONS[lesson.phaseNumber - 1] || '📚',
        modules: [],
      });
    }

    const phase = phasesMap.get(lesson.phaseNumber)!;
    let module = phase.modules.find((m) => m.moduleNumber === lesson.moduleNumber);

    if (!module) {
      module = {
        moduleNumber: lesson.moduleNumber,
        title: `Module ${lesson.moduleNumber}`,
        lessons: [],
      };
      phase.modules.push(module);
    }

    module.lessons.push(lesson);
  });

  // Sort and organize
  const phases = Array.from(phasesMap.values())
    .sort((a, b) => a.phaseNumber - b.phaseNumber)
    .map((phase) => ({
      ...phase,
      modules: phase.modules.sort((a, b) => a.moduleNumber - b.moduleNumber),
    }));

  const formatGoal = (goal: string): string => {
    const goalMap: Record<string, string> = {
      learn_to_ride: 'Learn to Ride',
      learn_to_drive: 'Learn to Drive',
      groundwork_only: 'Groundwork Only',
      general_horsemanship: 'General Horsemanship',
    };
    return goalMap[goal] || goal;
  };

  // Calculate progress
  const completedLessons = plan.lessons.filter((l) => l.isCompleted).length;
  const totalLessons = plan.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Check if plan has no lessons (error state)
  if (totalLessons === 0) {
    return (
      <ScrollView style={styles.container}>
        <Card style={styles.planHeaderCard}>
          <Text style={styles.planTitle}>{formatGoal(plan.goal)} Training Plan</Text>
          <View style={styles.errorStateContainer}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorTitle}>Plan Generation Issue</Text>
            <Text style={styles.errorDescription}>
              Your training plan was created but doesn't contain any lessons. This usually happens when there was an issue during plan generation.
            </Text>
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={async () => {
                try {
                  const token = await AsyncStorage.getItem('authToken');
                  if (!token) {
                    router.replace('/(auth)/login');
                    return;
                  }

                  // Regenerate plan
                  const response = await fetch(`${API_URL}/api/training/generate-plan`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({}),
                  });

                  if (!response.ok) {
                    throw new Error('Failed to regenerate plan');
                  }

                  // Reload plan
                  await loadPlan();
                } catch (error: any) {
                  Alert.alert('Error', error.message || 'Failed to regenerate plan');
                }
              }}
            >
              <Text style={styles.regenerateButtonText}>Regenerate Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.backToOnboardingButton}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.backToOnboardingButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>
    );
  }

  // Calculate estimated weeks (assuming user's daysPerWeek from profile)
  const daysPerWeek = plan.generatedContent?.daysPerWeek || 3;
  const estimatedWeeksLeft = calculateEstimatedWeeks(
    totalLessons - completedLessons,
    daysPerWeek
  );

  return (
    <ScrollView style={styles.container}>
      {/* Plan Header */}
      <Card style={styles.planHeaderCard}>
        <Text style={styles.planTitle}>{formatGoal(plan.goal)} Training Plan</Text>
        <ProgressBar
          progress={progressPercentage}
          showLabel={false}
          style={styles.progressBar}
        />
        <Text style={styles.progressSubtext}>
          {completedLessons} of {totalLessons} lessons • ~{estimatedWeeksLeft} weeks remaining
        </Text>
      </Card>

      {/* Phases */}
      <View style={styles.phasesContainer}>
        {phases.map((phase) => {
          const phaseCompleted = phase.modules
            .flatMap((m) => m.lessons)
            .filter((l) => l.isCompleted).length;
          const phaseTotal = phase.modules.flatMap((m) => m.lessons).length;

          return (
            <Card key={phase.phaseNumber} style={styles.phaseCard}>
              <View style={styles.phaseHeader}>
                <Text style={styles.phaseIcon}>{phase.icon}</Text>
                <View style={styles.phaseHeaderContent}>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  <Text style={styles.phaseDescription}>{phase.description}</Text>
                  <Text style={styles.phaseProgress}>
                    {phaseCompleted} of {phaseTotal} lessons completed
                  </Text>
                </View>
              </View>

              {phase.modules.map((module) => {
                const moduleKey = `${phase.phaseNumber}-${module.moduleNumber}`;
                const moduleExpanded = expandedModules.has(moduleKey);
                const moduleCompleted = module.lessons.filter((l) => l.isCompleted).length;

                return (
                  <View key={module.moduleNumber} style={styles.module}>
                    <Pressable
                      style={styles.moduleHeader}
                      onPress={() => toggleModule(phase.phaseNumber, module.moduleNumber)}
                      android_ripple={{ color: colors.primary[100] }}
                    >
                      <View style={styles.moduleHeaderContent}>
                        <Text style={styles.moduleTitle}>
                          Module {module.moduleNumber}
                        </Text>
                        <Text style={styles.moduleProgress}>
                          {moduleCompleted}/{module.lessons.length} lessons
                        </Text>
                      </View>
                      <Text style={styles.chevron}>{moduleExpanded ? '▼' : '▶'}</Text>
                    </Pressable>

                    {moduleExpanded && (
                      <View style={styles.lessonList}>
                        {module.lessons
                          .sort((a, b) => a.lessonNumber - b.lessonNumber)
                          .map((lesson) => (
                            <LessonRow
                              key={lesson.id}
                              lesson={lesson}
                              status={getLessonStatus(lesson, plan.lessons)}
                              onPress={() => router.push(`/lesson/${lesson.lessonId}`)}
                            />
                          ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function LessonRow({
  lesson,
  status,
  onPress,
}: {
  lesson: Lesson;
  status: LessonStatus;
  onPress: () => void;
}) {
  const statusStyles = {
    completed: { icon: '✓', color: colors.success, bg: colors.success + '20' },
    current: { icon: '→', color: colors.accent[500], bg: colors.accent[500] + '20' },
    locked: { icon: '○', color: colors.neutral[400], bg: 'transparent' },
  };

  const duration = lesson.content?.duration || 30;
  const statusStyle = statusStyles[status];

  return (
    <Pressable
      style={[
        styles.lessonRow,
        status === 'current' && styles.currentLesson,
        status === 'locked' && styles.lockedLesson,
      ]}
      onPress={status !== 'locked' ? onPress : undefined}
      disabled={status === 'locked'}
      android_ripple={
        status !== 'locked' ? { color: colors.primary[100] } : undefined
      }
    >
      <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
        <Text style={[styles.statusIcon, { color: statusStyle.color }]}>
          {statusStyle.icon}
        </Text>
      </View>
      <View style={styles.lessonInfo}>
        <Text
          style={[
            styles.lessonTitle,
            status === 'locked' && styles.lockedText,
            status === 'completed' && styles.completedText,
          ]}
        >
          {lesson.title}
        </Text>
        <Text style={styles.lessonMeta}>~{duration} min</Text>
      </View>
      {status === 'current' && (
        <View style={styles.startButton}>
          <Text style={styles.startButtonText}>Start</Text>
        </View>
      )}
      {status === 'completed' && (
        <View style={styles.completedBadge}>
          <Text style={styles.completedBadgeText}>Done</Text>
        </View>
      )}
    </Pressable>
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
  planHeaderCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  planTitle: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  progressSubtext: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
  phasesContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  phaseCard: {
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  phaseIcon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  phaseHeaderContent: {
    flex: 1,
  },
  phaseTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  phaseDescription: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  phaseProgress: {
    ...typography.bodySmall,
    color: colors.neutral[500],
  },
  module: {
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  moduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  moduleHeaderContent: {
    flex: 1,
  },
  moduleTitle: {
    ...typography.h4,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  moduleProgress: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  chevron: {
    ...typography.body,
    color: colors.neutral[500],
    marginLeft: spacing.sm,
  },
  lessonList: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[50],
  },
  currentLesson: {
    backgroundColor: colors.accent[500] + '10',
    borderWidth: 1,
    borderColor: colors.accent[500] + '30',
  },
  lockedLesson: {
    opacity: 0.6,
  },
  statusBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  statusIcon: {
    fontSize: 18,
    fontWeight: '700',
  },
  lessonInfo: {
    flex: 1,
  },
  lessonTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.neutral[500],
  },
  lockedText: {
    color: colors.neutral[400],
  },
  lessonMeta: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  startButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent[500],
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  startButtonText: {
    ...typography.bodySmall,
    color: colors.neutral[50],
    fontWeight: '600',
  },
  completedBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.success + '20',
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  completedBadgeText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '600',
  },
  errorStateContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  errorTitle: {
    ...typography.h3,
    color: colors.error,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorDescription: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  regenerateButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    minWidth: 200,
    alignItems: 'center',
  },
  regenerateButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  backToOnboardingButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    minWidth: 200,
    alignItems: 'center',
  },
  backToOnboardingButtonText: {
    ...typography.body,
    color: colors.neutral[700],
    fontWeight: '500',
  },
});
