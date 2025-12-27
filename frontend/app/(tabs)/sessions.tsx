import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import Card from '../../components/ui/Card';
import { EmptyState } from '../../components/ui';

export default function SessionsScreen() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      const response = await fetch(`${API_URL}/api/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to load sessions');
      }

      const data = await response.json();
      setSessions(data);
    } catch (error) {
      console.error('Load sessions error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Session History</Text>

        {sessions.length === 0 ? (
          <EmptyState
            icon="📝"
            title="No Sessions Yet"
            description="After you complete a lesson, log your training session to track your progress."
            actionLabel="View Training Plan"
            onAction={() => router.push('/(tabs)/plan')}
          />
        ) : (
          sessions.map((session) => (
            <Card key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>{session.lesson?.title || 'Session'}</Text>
              <Text style={styles.sessionDate}>
                {new Date(session.sessionDate).toLocaleDateString()}
              </Text>
              <Text style={styles.sessionDuration}>
                Duration: {session.duration} minutes
              </Text>
              <Text style={styles.sessionRating}>
                Rating: {'⭐'.repeat(session.rating)}
              </Text>
              {session.notes && (
                <Text style={styles.sessionNotes}>{session.notes}</Text>
              )}
            </Card>
          ))
        )}
      </View>
    </ScrollView>
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
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.lg,
  },
  sessionCard: {
    marginBottom: spacing.md,
  },
  sessionTitle: {
    ...typography.h4,
    color: colors.primary[500],
    marginBottom: spacing.sm,
  },
  sessionDate: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    marginBottom: spacing.xs,
  },
  sessionDuration: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    marginBottom: spacing.xs,
  },
  sessionRating: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
  },
  sessionNotes: {
    ...typography.body,
    color: colors.neutral[700],
    fontStyle: 'italic',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});
