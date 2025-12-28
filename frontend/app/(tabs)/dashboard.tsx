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
  ImageBackground,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import { Button, ProgressBar, EmptyState } from '../../components/ui';
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
  const [planStatus, setPlanStatus] = useState<{ exists: boolean; hasLessons: boolean } | null>(null);
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

      const [userResponse, sessionsResponse, skillsResponse, planResponse] = await Promise.all([
        fetch(`${API_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/sessions`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/training/skills`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/training/plan`, {
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

      // Check plan status
      if (planResponse.ok) {
        const planData = await planResponse.json();
        setPlanStatus({
          exists: true,
          hasLessons: planData.lessons && planData.lessons.length > 0,
        });
      } else {
        setPlanStatus({ exists: false, hasLessons: false });
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

  const getPersonalizedMessage = (completedLessons: number): string => {
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
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <Text style={styles.logo}>Rein</Text>
          <View style={styles.navLinks}>
            <TouchableOpacity onPress={() => router.push('/(tabs)/dashboard')}>
              <Text style={[styles.navLink, styles.navLinkActive]}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/plan')}>
              <Text style={styles.navLink}>My Plan</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/sessions')}>
              <Text style={styles.navLink}>Sessions</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/plan')}>
              <Text style={styles.navLink}>Library</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/(tabs)/chat')}>
              <Text style={styles.navLink}>Ask a Trainer</Text>
            </TouchableOpacity>
          </View>
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
          {showProfileMenu && (
            <View style={styles.profileMenu}>
              <TouchableOpacity
                style={styles.profileMenuItem}
                onPress={() => {
                  setShowProfileMenu(false);
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
        </View>

        {/* Hero Section with Background Image */}
        <ImageBackground
          source={{ uri: 'https://images.unsplash.com/photo-1516728788616-9a2c07a5d5d8?w=1920&q=80' }}
          style={styles.heroSection}
          imageStyle={styles.heroImage}
        >
          <View style={styles.heroOverlay}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Welcome back, {userName}! 👋</Text>
              <Text style={styles.heroSubtitle}>Let's start your training journey today.</Text>
            </View>
          </View>
        </ImageBackground>

        {/* Floating Stats Ribbon */}
        <View style={styles.statsRibbon}>
          <StatBadge icon="🏆" value={skillsUnlocked} label="Skills Mastered" />
          <StatBadge icon="📅" value={sessionsLogged} label="Sessions Completed" />
          <StatBadge icon="🔥" value={streak} label="Day Streak" />
        </View>

      {/* AI Training Plan Generator - Always show when no active plan */}
      {!activePlan && (
        <Card style={styles.planGeneratorCard}>
          <View style={styles.planGeneratorHeader}>
            <Text style={styles.planGeneratorIcon}>🤖</Text>
            <View style={styles.planGeneratorText}>
              <Text style={styles.planGeneratorTitle}>AI Training Plan Generator</Text>
              <Text style={styles.planGeneratorSubtitle}>
                Get a personalized training plan tailored to you and your horse
              </Text>
            </View>
          </View>
          <View style={styles.planGeneratorFeatures}>
            <View style={styles.planGeneratorFeature}>
              <Text style={styles.planGeneratorFeatureIcon}>✨</Text>
              <Text style={styles.planGeneratorFeatureText}>AI-powered personalized curriculum</Text>
            </View>
            <View style={styles.planGeneratorFeature}>
              <Text style={styles.planGeneratorFeatureIcon}>🐴</Text>
              <Text style={styles.planGeneratorFeatureText}>Tailored to your horse's needs</Text>
            </View>
            <View style={styles.planGeneratorFeature}>
              <Text style={styles.planGeneratorFeatureIcon}>📈</Text>
              <Text style={styles.planGeneratorFeatureText}>Progressive skill building</Text>
            </View>
          </View>
          <Button
            title="Generate My Training Plan"
            onPress={() => router.push('/onboarding')}
            style={styles.planGeneratorButton}
            fullWidth
          />
        </Card>
      )}

      {/* Next Lesson Card */}
      {nextLesson && (
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
      )}

      {/* Plan Status Warning */}
      {planStatus && (!planStatus.exists || !planStatus.hasLessons) && (
        <Card style={styles.planStatusCard}>
          <Text style={styles.planStatusIcon}>⚠️</Text>
          <View style={styles.planStatusContent}>
            <Text style={styles.planStatusTitle}>
              {!planStatus.exists ? 'No Training Plan' : 'Plan Generation Issue'}
            </Text>
            <Text style={styles.planStatusText}>
              {!planStatus.exists
                ? 'Create your personalized training plan to get started.'
                : 'Your plan was created but has no lessons. Tap to regenerate.'}
            </Text>
            <TouchableOpacity
              style={styles.planStatusButton}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.planStatusButtonText}>
                {!planStatus.exists ? 'Create Plan' : 'Regenerate Plan'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

        {/* Main Dashboard Grid */}
        <View style={styles.mainGrid}>
          {/* Left Column - Quick Actions */}
          <View style={styles.quickActionsColumn}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActions}>
              <QuickActionButton
                icon="🤖"
                label="New Plan"
                onPress={() => router.push('/onboarding')}
              />
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
            </View>
          </View>

          {/* Right Column - Sidebar Widgets */}
          <View style={styles.sidebarColumn}>
            {/* Trainer's Tip */}
            <Card style={styles.trainerTipCard}>
              <Text style={styles.trainerTipLabel}>💡 Trainer's Tip</Text>
              <Text style={styles.trainerTipText}>
                "{dailyTip}"
              </Text>
            </Card>

            {/* Up Next Widget */}
            <Card style={styles.upNextCard}>
              <Text style={styles.upNextLabel}>Up Next</Text>
              <View style={styles.upNextContent}>
                <Text style={styles.upNextIcon}>📅</Text>
                <Text style={styles.upNextText}>No upcoming sessions</Text>
                <TouchableOpacity
                  style={styles.upNextButton}
                  onPress={() => router.push('/(tabs)/sessions')}
                >
                  <Text style={styles.upNextButtonText}>Schedule a session →</Text>
                </TouchableOpacity>
              </View>
            </Card>
          </View>
        </View>
      </ScrollView>
    </View>
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

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
  },
  // Navigation Bar
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
    ...shadows.sm,
    position: 'relative',
  },
  logo: {
    ...typography.h2,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.neutral[900],
  },
  navLinks: {
    flexDirection: 'row',
    gap: spacing.lg,
    flex: 1,
    justifyContent: 'center',
    display: 'none', // Hide on mobile, show on larger screens if needed
  },
  navLink: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '500',
  },
  navLinkActive: {
    color: colors.neutral[900],
    borderBottomWidth: 2,
    borderBottomColor: colors.neutral[900],
    paddingBottom: 2,
  },
  profileButton: {
    marginLeft: spacing.md,
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileIconText: {
    ...typography.h4,
    color: colors.surface,
    fontWeight: '700',
  },
  profileMenu: {
    position: 'absolute',
    top: 60,
    right: spacing.lg,
    backgroundColor: colors.surface,
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
  // Hero Section
  heroSection: {
    height: 300,
    width: '100%',
    justifyContent: 'flex-end',
  },
  heroImage: {
    resizeMode: 'cover',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(42, 30, 21, 0.6)',
  },
  heroContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  heroTitle: {
    ...typography.h1,
    fontSize: 32,
    color: colors.surface,
    marginBottom: spacing.sm,
  },
  heroSubtitle: {
    ...typography.bodyLarge,
    fontSize: 18,
    color: colors.neutral[100],
  },
  // Floating Stats Ribbon
  statsRibbon: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginTop: -60,
    gap: spacing.md,
    zIndex: 10,
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
    padding: spacing.md,
    paddingVertical: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.md,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  statBadgeIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  statBadgeValue: {
    ...typography.h2,
    fontSize: 28,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  statBadgeLabel: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.neutral[600],
    textAlign: 'center',
    fontWeight: '500',
  },
  planGeneratorCard: {
    margin: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    backgroundColor: colors.primary[50],
    borderWidth: 2,
    borderColor: colors.primary[200],
  },
  planGeneratorHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  planGeneratorIcon: {
    fontSize: 48,
    marginRight: spacing.md,
  },
  planGeneratorText: {
    flex: 1,
  },
  planGeneratorTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  planGeneratorSubtitle: {
    ...typography.body,
    color: colors.neutral[600],
  },
  planGeneratorFeatures: {
    marginBottom: spacing.lg,
  },
  planGeneratorFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  planGeneratorFeatureIcon: {
    fontSize: 20,
    marginRight: spacing.sm,
  },
  planGeneratorFeatureText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
  },
  planGeneratorButton: {
    marginTop: spacing.sm,
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
  // Main Grid
  mainGrid: {
    flexDirection: 'column',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    gap: spacing.lg,
  },
  quickActionsColumn: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.h2,
    fontSize: 24,
    fontFamily: 'serif',
    fontWeight: 'bold',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    minWidth: width < 400 ? '100%' : '45%',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  sidebarColumn: {
    gap: spacing.md,
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
  // Trainer's Tip Card (Sage Green)
  trainerTipCard: {
    padding: spacing.lg,
    backgroundColor: colors.secondary[50],
    borderWidth: 1,
    borderColor: colors.secondary[200],
  },
  trainerTipLabel: {
    ...typography.body,
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trainerTipText: {
    ...typography.body,
    fontSize: 16,
    color: colors.neutral[700],
    lineHeight: 24,
    fontStyle: 'italic',
  },
  // Up Next Widget
  upNextCard: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  upNextLabel: {
    ...typography.body,
    fontSize: 18,
    fontFamily: 'serif',
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  upNextContent: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  upNextIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  upNextText: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.md,
    fontSize: 14,
  },
  upNextButton: {
    marginTop: spacing.sm,
  },
  upNextButtonText: {
    ...typography.body,
    color: colors.neutral[900],
    fontWeight: '600',
    fontSize: 14,
  },
  planStatusCard: {
    margin: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.warningBg,
    borderWidth: 1,
    borderColor: colors.warning,
    flexDirection: 'row',
    padding: spacing.lg,
  },
  planStatusIcon: {
    fontSize: 32,
    marginRight: spacing.md,
  },
  planStatusContent: {
    flex: 1,
  },
  planStatusTitle: {
    ...typography.h4,
    color: colors.warning,
    marginBottom: spacing.xs,
  },
  planStatusText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    marginBottom: spacing.md,
  },
  planStatusButton: {
    backgroundColor: colors.warning,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignSelf: 'flex-start',
  },
  planStatusButtonText: {
    ...typography.bodySmall,
    color: colors.surface,
    fontWeight: '600',
  },
});
