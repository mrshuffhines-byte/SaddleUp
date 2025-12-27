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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Session History</Text>

        {sessions.length === 0 ? (
          <Text style={styles.emptyText}>No sessions logged yet</Text>
        ) : (
          sessions.map((session) => (
            <View key={session.id} style={styles.sessionCard}>
              <Text style={styles.sessionTitle}>{session.lesson.title}</Text>
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
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F1EA',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A4A3A',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
  },
  sessionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  sessionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 8,
  },
  sessionDate: {
    fontSize: 14,
    color: '#999',
    marginBottom: 4,
  },
  sessionDuration: {
    fontSize: 14,
    color: '#5A4A3A',
    marginBottom: 4,
  },
  sessionRating: {
    fontSize: 14,
    color: '#5A4A3A',
    marginBottom: 8,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#5A4A3A',
    fontStyle: 'italic',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#D4C4B0',
  },
});
