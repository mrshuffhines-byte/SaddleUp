import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';

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
  lessons: Lesson[];
}

interface Phase {
  phaseNumber: number;
  title?: string;
  modules: Module[];
}

interface Module {
  moduleNumber: number;
  title?: string;
  lessons: Lesson[];
}

export default function PlanScreen() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedPhases, setExpandedPhases] = useState<Set<number>>(new Set([1])); // Expand first phase by default
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
    } catch (error) {
      console.error('Load plan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const togglePhase = (phaseNumber: number) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseNumber)) {
      newExpanded.delete(phaseNumber);
    } else {
      newExpanded.add(phaseNumber);
    }
    setExpandedPhases(newExpanded);
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
    // Extract duration from lesson content if available, default to 30
    return lesson.content?.duration || 30;
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
        modules: [],
      });
    }
    
    const phase = phasesMap.get(lesson.phaseNumber)!;
    let module = phase.modules.find(m => m.moduleNumber === lesson.moduleNumber);
    
    if (!module) {
      module = {
        moduleNumber: lesson.moduleNumber,
        lessons: [],
      };
      phase.modules.push(module);
    }
    
    module.lessons.push(lesson);
  });

  // Sort and organize
  const phases = Array.from(phasesMap.values())
    .sort((a, b) => a.phaseNumber - b.phaseNumber)
    .map(phase => ({
      ...phase,
      modules: phase.modules.sort((a, b) => a.moduleNumber - b.moduleNumber),
    }));

  // Calculate progress
  const completedLessons = plan.lessons.filter(l => l.isCompleted).length;
  const totalLessons = plan.lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  // Calculate phase progress
  const getPhaseProgress = (phase: Phase) => {
    const phaseLessons = phase.modules.flatMap(m => m.lessons);
    const completed = phaseLessons.filter(l => l.isCompleted).length;
    return phaseLessons.length > 0 ? (completed / phaseLessons.length) * 100 : 0;
  };

  return (
    <ScrollView style={styles.container}>
      {/* Plan Header */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={styles.planId}>Plan {plan.visibleIdDisplay}</Text>
            <Text style={styles.planTitle}>{plan.name || 'Your Training Journey'}</Text>
            <Text style={styles.planGoal}>Goal: {formatGoal(plan.goal)}</Text>
          </View>
        </View>

        {/* Overall Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Overall Progress</Text>
            <Text style={styles.progressPercentage}>{Math.round(progressPercentage)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedLessons} of {totalLessons} lessons completed
          </Text>
        </View>
      </Card>

      {/* Phases */}
      <View style={styles.phasesContainer}>
        {phases.map((phase) => {
          const phaseExpanded = expandedPhases.has(phase.phaseNumber);
          const phaseProgress = getPhaseProgress(phase);
          const phaseLessons = phase.modules.flatMap(m => m.lessons);
          const phaseCompleted = phaseLessons.filter(l => l.isCompleted).length;

          return (
            <Card key={phase.phaseNumber} style={styles.phaseCard}>
              <TouchableOpacity
                style={styles.phaseHeader}
                onPress={() => togglePhase(phase.phaseNumber)}
                activeOpacity={0.7}
              >
                <View style={styles.phaseIconBadge}>
                  <Text style={styles.phaseIconNumber}>{phase.phaseNumber}</Text>
                </View>
                <View style={styles.phaseInfo}>
                  <Text style={styles.phaseTitle}>Phase {phase.phaseNumber}</Text>
                  <Text style={styles.phaseMeta}>
                    {phaseCompleted}/{phaseLessons.length} lessons · ~{Math.round(phaseLessons.reduce((sum, l) => sum + getLessonDuration(l), 0) / 60)}h
                  </Text>
                </View>
                <View style={styles.phaseProgressCircle}>
                  <View style={[styles.circularProgress, { borderColor: colors.primary[500] }]}>
                    <Text style={styles.circularProgressText}>{Math.round(phaseProgress)}%</Text>
                  </View>
                </View>
                <Text style={styles.expandIcon}>{phaseExpanded ? '▼' : '▶'}</Text>
              </TouchableOpacity>

              {phaseExpanded && (
                <View style={styles.phaseContent}>
                  {phase.modules.map((module) => {
                    const moduleKey = `${phase.phaseNumber}-${module.moduleNumber}`;
                    const moduleExpanded = expandedModules.has(moduleKey);
                    const moduleCompleted = module.lessons.filter(l => l.isCompleted).length;

                    return (
                      <View key={module.moduleNumber} style={styles.moduleContainer}>
                        <TouchableOpacity
                          style={styles.moduleHeader}
                          onPress={() => toggleModule(phase.phaseNumber, module.moduleNumber)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.moduleIconBadge}>
                            <Text style={styles.moduleIconNumber}>{module.moduleNumber}</Text>
                          </View>
                          <View style={styles.moduleInfo}>
                            <Text style={styles.moduleTitle}>Module {module.moduleNumber}</Text>
                            <Text style={styles.moduleMeta}>
                              {moduleCompleted}/{module.lessons.length} lessons
                            </Text>
                          </View>
                          <Text style={styles.expandIcon}>{moduleExpanded ? '▼' : '▶'}</Text>
                        </TouchableOpacity>

                        {moduleExpanded && (
                          <View style={styles.lessonsContainer}>
                            {module.lessons.map((lesson) => (
                              <LessonItem
                                key={lesson.id}
                                lesson={lesson}
                                onPress={() => router.push(`/lesson/${lesson.lessonId}`)}
                              />
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}
            </Card>
          );
        })}
      </View>
    </ScrollView>
  );
}

function LessonItem({ lesson, onPress }: { lesson: Lesson; onPress: () => void }) {
  const isComplete = lesson.isCompleted;
  const duration = lesson.content?.duration || 30;

  return (
    <TouchableOpacity
      style={[
        styles.lessonItem,
        isComplete && styles.lessonComplete,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.lessonIcon}>
        {isComplete ? (
          <View style={styles.checkIcon}>
            <Text style={styles.checkIconText}>✓</Text>
          </View>
        ) : (
          <View style={styles.lessonNumberBadge}>
            <Text style={styles.lessonNumberText}>{lesson.lessonNumber}</Text>
          </View>
        )}
      </View>
      <View style={styles.lessonContent}>
        <Text style={[styles.lessonTitle, isComplete && styles.lessonTitleComplete]}>
          {lesson.title}
        </Text>
        <View style={styles.lessonMeta}>
          <Text style={styles.lessonMetaText}>⏱ {duration} min</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function formatGoal(goal: string): string {
  const goalMap: Record<string, string> = {
    learn_to_ride: 'Learn to Ride',
    learn_to_drive: 'Learn to Drive',
    groundwork_only: 'Groundwork Only',
    general_horsemanship: 'General Horsemanship',
  };
  return goalMap[goal] || goal;
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
  headerCard: {
    margin: spacing.md,
    marginBottom: spacing.sm,
  },
  headerRow: {
    marginBottom: spacing.md,
  },
  headerInfo: {
    flex: 1,
  },
  planId: {
    ...typography.caption,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  planTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  planGoal: {
    ...typography.body,
    color: colors.neutral[600],
  },
  progressContainer: {
    marginTop: spacing.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    ...typography.bodySmall,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  progressPercentage: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.primary[500],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.neutral[500],
  },
  phasesContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  phaseCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  phaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  phaseIconBadge: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  phaseIconNumber: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.primary[700],
  },
  phaseInfo: {
    flex: 1,
  },
  phaseTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  phaseMeta: {
    ...typography.bodySmall,
    color: colors.neutral[500],
  },
  phaseProgressCircle: {
    marginRight: spacing.sm,
  },
  circularProgress: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  circularProgressText: {
    ...typography.caption,
    fontWeight: '700',
    color: colors.primary[500],
  },
  expandIcon: {
    ...typography.body,
    color: colors.neutral[500],
    marginLeft: spacing.xs,
  },
  phaseContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  moduleContainer: {
    marginTop: spacing.sm,
    backgroundColor: colors.neutral[100],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  moduleIconBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  moduleIconNumber: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary[500],
  },
  moduleInfo: {
    flex: 1,
  },
  moduleTitle: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  moduleMeta: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  lessonsContainer: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  lessonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginTop: spacing.sm,
    ...shadows.sm,
  },
  lessonComplete: {
    backgroundColor: colors.success + '15', // 15% opacity
    borderWidth: 1,
    borderColor: colors.success,
  },
  lessonIcon: {
    marginRight: spacing.md,
  },
  checkIcon: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIconText: {
    ...typography.body,
    color: colors.neutral[50],
    fontWeight: '700',
  },
  lessonNumberBadge: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonNumberText: {
    ...typography.bodySmall,
    fontWeight: '700',
    color: colors.primary[500],
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    ...typography.body,
    fontWeight: '500',
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  lessonTitleComplete: {
    textDecorationLine: 'line-through',
    color: colors.neutral[500],
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  lessonMetaText: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  chevron: {
    ...typography.h3,
    color: colors.neutral[500],
    marginLeft: spacing.sm,
  },
});
