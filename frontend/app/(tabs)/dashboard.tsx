import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import { Button, ProgressBar } from '../../components/ui';
import { Badge } from '../../components/ui';

interface User {
  id: string;
  email: string;
  name?: string | null;
  profile?: {
    primaryGoal: string;
    experienceLevel: string;
  };
  trainingPlans?: Array<{
    id: string;
    visibleIdDisplay: string;
    name?: string;
    goal: string;
    lessons?: Array<{
      id: string;
      lessonId: string;
      title: string;
      phaseNumber: number;
      moduleNumber: number;
      isCompleted: boolean;
      content?: any;
    }>;
  }>;
  horses?: Array<{
    id: string;
    name: string;
  }>;
}

interface Session {
  id: string;
  sessionDate: string;
  duration: number;
  rating: number;
  lesson?: {
    title: string;
    phaseNumber: number;
    moduleNumber: number;
  };
}

const DAILY_TIPS = [
  "Remember: consistency beats intensity. Short, regular sessions build trust faster than long, sporadic ones.",
  "Always end on a positive note, even if it's just one small success. Your horse remembers the last interaction.",
  "Take time to observe your horse before starting. Their body language tells you what they need.",
  "Progress isn't linear - both you and your horse will have good days and challenging days. That's normal!",
  "When things get frustrating, go back to something your horse knows well. Rebuilding confidence helps move forward.",
  "Groundwork is never wasted time. A solid foundation on the ground makes everything under saddle easier.",
  "Listen to your horse more than you speak to them. They're telling you if the approach is working.",
];

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [skillsUnlocked, setSkillsUnlocked] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const [userResponse, sessionsResponse, skillsResponse] = await Promise.all([
        fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/training/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!userResponse.ok) {
        if (userResponse.status === 401) {
          await AsyncStorage.removeItem('authToken');
          router.replace('/(auth)/login');
          return;
        }
        throw new Error('Failed to load user');
      }

      const userData = await userResponse.json();
      setUser(userData);

      if (!userData.profile) {
        router.replace('/onboarding');
        return;
      }

      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(Array.isArray(sessionsData) ? sessionsData : []);
      }

      if (skillsResponse.ok) {
        const skillsData = await skillsResponse.json();
        setSkillsUnlocked(skillsData.unlocked?.length || skillsData.total || 0);
      }
    } catch (error) {
      console.error('Load data error:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('user');
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getPersonalizedMessage = (): string => {
    if (sessions.length === 0) {
      return "Let's start your training journey today!";
    }

    const lastSession = sessions[0]; // Assuming sessions are sorted by date desc
    const lastSessionDate = new Date(lastSession.sessionDate);
    const daysSinceLastSession = Math.floor(
      (Date.now() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    const streak = calculateStreak();

    if (daysSinceLastSession > 7) {
      return "It's been a while - ready to get back in the saddle?";
    } else if (streak >= 3) {
      return `${streak}-day streak! Keep up the great momentum! 🔥`;
    } else if (completedLessons === 0) {
      return "Let's start your training journey today!";
    } else {
      return "Ready for your next lesson?";
    }
  };

  const calculateStreak = (): number => {
    if (sessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Sort sessions by date descending
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );

    let checkDate = new Date(today);
    
    for (const session of sortedSessions) {
      const sessionDate = new Date(session.sessionDate);
      sessionDate.setHours(0, 0, 0, 0);

      // Check if this session is on the date we're checking
      if (sessionDate.getTime() === checkDate.getTime()) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (sessionDate.getTime() < checkDate.getTime()) {
        // Gap found, break streak
        break;
      }
      // If session date is in the future relative to checkDate, skip it
    }

    return streak;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  const activePlan = user?.trainingPlans?.[0];
  const completedLessons = activePlan?.lessons?.filter(l => l.isCompleted).length || 0;
  const totalLessons = activePlan?.lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const userName = user?.name || user?.email?.split('@')[0] || 'there';
  const nextLesson = activePlan?.lessons?.find(l => !l.isCompleted);
  const streak = calculateStreak();
  const sessionsLogged = sessions.length;
  const dailyTip = DAILY_TIPS[new Date().getDate() % DAILY_TIPS.length];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Header with Profile Menu */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Welcome back, {userName}! 👋</Text>
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => setShowProfileMenu(!showProfileMenu)}
          >
            <View style={styles.profileIcon}>
              <Text style={styles.profileIconText}>
                {userName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        {showProfileMenu && (
          <View style={styles.profileMenu}>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                // TODO: Navigate to profile/settings
              }}
            >
              <Text style={styles.profileMenuText}>Profile & Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.profileMenuItem}
              onPress={() => {
                setShowProfileMenu(false);
                handleLogout();
              }}
            >
              <Text style={[styles.profileMenuText, styles.profileMenuDanger]}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
        <Text style={styles.subGreeting}>{getPersonalizedMessage()}</Text>
      </View>

      {/* Progress Card */}
      <Card style={styles.progressCard}>
        <Text style={styles.cardTitle}>Your Progress</Text>
        <ProgressBar
          progress={progressPercentage}
          showLabel={false}
          style={styles.progressBar}
        />
        <Text style={styles.progressText}>
          {completedLessons} of {totalLessons} lessons completed
        </Text>
        <View style={styles.statsRow}>
          <StatBadge icon="🏆" value={skillsUnlocked} label="Skills" />
          <StatBadge icon="📅" value={sessionsLogged} label="Sessions" />
          <StatBadge icon="🔥" value={streak} label="Day Streak" />
        </View>
      </Card>

      {/* Next Lesson Card */}
      {nextLesson ? (
        <Pressable
          style={styles.nextLessonCard}
          onPress={() => router.push(`/lesson/${nextLesson.lessonId}`)}
          android_ripple={{ color: colors.primary[100] }}
        >
          <Card style={styles.cardPressable}>
            <Text style={styles.cardLabel}>Continue Your Journey</Text>
            <Text style={styles.nextLessonTitle}>{nextLesson.title}</Text>
            <Text style={styles.nextLessonMeta}>
              Phase {nextLesson.phaseNumber} • Module {nextLesson.moduleNumber}
              {nextLesson.content?.duration && ` • ~${nextLesson.content.duration} min`}
            </Text>
            <View style={styles.continueButton}>
              <Text style={styles.continueButtonText}>Continue Lesson →</Text>
            </View>
          </Card>
        </Pressable>
      ) : !activePlan ? (
        <Card style={styles.actionCard}>
          <View style={styles.actionCardContent}>
            <Text style={styles.actionCardIcon}>🎓</Text>
            <Text style={styles.actionCardTitle}>Create Your Training Plan</Text>
            <Text style={styles.actionCardDescription}>
              Get started with a personalized AI-powered training plan tailored to
              you, your horse, and your goals.
            </Text>
            <Button
              title="Generate Plan"
              onPress={() => router.push('/onboarding')}
              style={styles.actionButton}
              fullWidth
            />
          </View>
        </Card>
      ) : null}

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickActionButton
          icon="💬"
          label="Ask Trainer"
          onPress={() => router.push('/(tabs)/chat')}
        />
        <QuickActionButton
          icon="📝"
          label="Log Session"
          onPress={() => router.push('/(tabs)/sessions')}
        />
        <QuickActionButton
          icon="📚"
          label="All Lessons"
          onPress={() => router.push('/(tabs)/plan')}
        />
        <QuickActionButton
          icon="⭐"
          label="Skills"
          onPress={() => router.push('/(tabs)/skills')}
        />
      </View>

      {/* Tip of the Day */}
      <Card style={styles.tipCard}>
        <Text style={styles.tipLabel}>💡 Trainer's Tip</Text>
        <Text style={styles.tipText}>{dailyTip}</Text>
      </Card>
    </ScrollView>
  );
}

function StatBadge({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={styles.statBadge}>
      <Text style={styles.statBadgeIcon}>{icon}</Text>
      <Text style={styles.statBadgeValue}>{value}</Text>
      <Text style={styles.statBadgeLabel}>{label}</Text>
    </View>
  );
}

function QuickActionButton({
  icon,
  label,
  onPress,
}: {
  icon: string;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={styles.quickActionButton}
      onPress={onPress}
      android_ripple={{ color: colors.primary[100] }}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={styles.quickActionLabel}>{label}</Text>
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
  header: {
    paddingTop: 60,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    backgroundColor: colors.primary[500],
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  greeting: {
    ...typography.h1,
    color: colors.neutral[50],
    flex: 1,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    ...typography.h4,
    color: colors.primary[500],
    fontWeight: '700',
  },
  profileMenu: {
    position: 'absolute',
    top: 100,
    right: spacing.lg,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    paddingVertical: spacing.xs,
    minWidth: 180,
    ...shadows.lg,
    zIndex: 1000,
  },
  profileMenuItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  profileMenuText: {
    ...typography.body,
    color: colors.neutral[900],
  },
  profileMenuDanger: {
    color: colors.error,
  },
  subGreeting: {
    ...typography.body,
    color: colors.neutral[50],
    opacity: 0.9,
  },
  progressCard: {
    margin: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  cardTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  cardLabel: {
    ...typography.caption,
    color: colors.neutral[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  statBadge: {
    flex: 1,
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.md,
  },
  statBadgeIcon: {
    fontSize: 24,
    marginBottom: spacing.xs / 2,
  },
  statBadgeValue: {
    ...typography.h4,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  statBadgeLabel: {
    ...typography.caption,
    color: colors.neutral[600],
  },
  nextLessonCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardPressable: {
    padding: spacing.lg,
  },
  nextLessonTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  nextLessonMeta: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  continueButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
    marginTop: spacing.xs,
  },
  continueButtonText: {
    ...typography.body,
    color: colors.neutral[50],
    fontWeight: '600',
  },
  actionCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
  },
  actionCardContent: {
    alignItems: 'center',
  },
  actionCardIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  actionCardTitle: {
    ...typography.h2,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  actionCardDescription: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.body.lineHeight,
  },
  actionButton: {
    marginTop: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  quickActionButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  quickActionLabel: {
    ...typography.bodySmall,
    color: colors.neutral[900],
    fontWeight: '500',
  },
  tipCard: {
    margin: spacing.lg,
    marginTop: 0,
    padding: spacing.lg,
    backgroundColor: colors.secondary[50],
  },
  tipLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.secondary[700],
    marginBottom: spacing.sm,
  },
  tipText: {
    ...typography.body,
    color: colors.neutral[800],
    lineHeight: typography.body.lineHeight,
  },
});
