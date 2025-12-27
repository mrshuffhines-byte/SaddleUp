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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import StatCard from '../../components/StatCard';
import Button from '../../components/ui/Button';

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
      isCompleted: boolean;
    }>;
  }>;
  horses?: Array<{
    id: string;
    name: string;
  }>;
}

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/user/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await AsyncStorage.removeItem('authToken');
          router.replace('/(auth)/login');
          return;
        }
        throw new Error('Failed to load user');
      }

      const data = await response.json();
      setUser(data);

      if (!data.profile) {
        router.replace('/onboarding');
        return;
      }
    } catch (error) {
      console.error('Load user error:', error);
      Alert.alert('Error', 'Failed to load user data');
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
    loadUser();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const activePlan = user?.trainingPlans?.[0];
  const completedLessons = activePlan?.lessons?.filter(l => l.isCompleted).length || 0;
  const totalLessons = activePlan?.lessons?.length || 0;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
  const userName = user?.name || user?.email?.split('@')[0] || 'there';
  const primaryHorse = user?.horses?.[0];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Section */}
      <View style={styles.heroSection}>
        <View style={styles.heroContent}>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{userName}! 🐴</Text>
          {primaryHorse && (
            <Text style={styles.horseInfo}>Training with {primaryHorse.name}</Text>
          )}
        </View>
        <TouchableOpacity style={styles.menuButton} onPress={handleLogout}>
          <Text style={styles.menuIcon}>⋮</Text>
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          icon="📚"
          value={completedLessons}
          label="Lessons Completed"
        />
        <StatCard
          icon="🎯"
          value="0"
          label="Skills Unlocked"
        />
        <StatCard
          icon="⏱️"
          value={`${Math.round(progressPercentage)}%`}
          label="Progress"
        />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {!activePlan ? (
          // No Plan - Show Create Plan Card
          <Card style={styles.actionCard}>
            <View style={styles.cardIconContainer}>
              <Text style={styles.cardIcon}>🎓</Text>
            </View>
            <Text style={styles.cardTitle}>Create Your Training Plan</Text>
            <Text style={styles.cardDescription}>
              Get started with a personalized AI-powered training plan tailored to
              you, your horse, and your goals.
            </Text>
            <Button
              title="Generate Plan"
              onPress={() => router.push('/onboarding')}
              style={styles.primaryButton}
              icon="→"
              fullWidth
            />
          </Card>
        ) : (
          // Has Plan - Show Progress and Next Lesson
          <Card style={styles.planCard}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planId}>Plan {activePlan.visibleIdDisplay}</Text>
                <Text style={styles.planTitle}>{activePlan.name || 'Your Training Journey'}</Text>
                <Text style={styles.planGoal}>Goal: {formatGoal(activePlan.goal)}</Text>
              </View>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
              <Text style={styles.progressText}>
                {completedLessons} of {totalLessons} lessons completed
              </Text>
            </View>

            <Button
              title="View Training Plan"
              onPress={() => router.push('/(tabs)/plan')}
              variant="outline"
              style={styles.viewPlanButton}
              fullWidth
            />
          </Card>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/chat')}
          >
            <Text style={styles.quickActionIcon}>💬</Text>
            <Text style={styles.quickActionLabel}>Ask Trainer</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/sessions')}
          >
            <Text style={styles.quickActionIcon}>📝</Text>
            <Text style={styles.quickActionLabel}>Log Session</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickActionButton}
            onPress={() => router.push('/(tabs)/skills')}
          >
            <Text style={styles.quickActionIcon}>⭐</Text>
            <Text style={styles.quickActionLabel}>Skills</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
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
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  heroSection: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  heroContent: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.sizes.md,
    color: colors.surface,
    opacity: 0.9,
    fontWeight: typography.weights.regular,
    marginBottom: spacing.xs,
  },
  userName: {
    fontSize: typography.sizes.xxl,
    color: colors.surface,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.xs,
  },
  horseInfo: {
    fontSize: typography.sizes.sm,
    color: colors.surface,
    opacity: 0.85,
    marginTop: spacing.xs,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: typography.sizes.lg,
    color: colors.surface,
    fontWeight: typography.weights.bold,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: -spacing.lg,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  actionCard: {
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIconContainer: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceAlt,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cardIcon: {
    fontSize: 40,
  },
  cardTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeights.relaxed * typography.sizes.base,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  primaryButton: {
    marginTop: spacing.sm,
  },
  planCard: {
    marginBottom: spacing.md,
  },
  planHeader: {
    marginBottom: spacing.md,
  },
  planId: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.xs,
  },
  planTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  planGoal: {
    fontSize: typography.sizes.base,
    color: colors.textSecondary,
  },
  progressContainer: {
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  progressText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
  viewPlanButton: {
    marginTop: spacing.sm,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: spacing.xs,
  },
  quickActionLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
});
