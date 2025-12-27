import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';

interface User {
  id: string;
  email: string;
  name?: string;
  profile?: any;
  trainingPlan?: any;
}

export default function DashboardScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
    router.replace('/(auth)/login');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  const hasPlan = user?.trainingPlan;
  const nextLesson = hasPlan
    ? user.trainingPlan.lessons?.find((l: any) => !l.isCompleted)
    : null;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.greeting}>
          Welcome{user?.name ? `, ${user.name}` : ''}!
        </Text>

        {!hasPlan ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create Your Training Plan</Text>
            <Text style={styles.cardText}>
              Get started by generating your personalized AI-powered training
              plan.
            </Text>
            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/onboarding')}
            >
              <Text style={styles.buttonText}>Generate Plan</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Your Training Plan</Text>
              <Text style={styles.cardText}>
                Plan ID: {user.trainingPlan.visibleIdDisplay}
              </Text>
              <Text style={styles.cardText}>
                Goal: {user.trainingPlan.goal.replace(/_/g, ' ')}
              </Text>
            </View>

            {nextLesson && (
              <TouchableOpacity
                style={styles.card}
                onPress={() =>
                  router.push(`/lesson/${nextLesson.lessonId}`)
                }
              >
                <Text style={styles.cardTitle}>Next Lesson</Text>
                <Text style={styles.cardText}>{nextLesson.title}</Text>
                <Text style={styles.cardSubtext}>
                  Phase {nextLesson.phaseNumber} • Module{' '}
                  {nextLesson.moduleNumber}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.button}
              onPress={() => router.push('/(tabs)/plan')}
            >
              <Text style={styles.buttonText}>View Full Plan</Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
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
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5A4A3A',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 8,
  },
  cardText: {
    fontSize: 16,
    color: '#5A4A3A',
    marginBottom: 4,
  },
  cardSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  logoutButton: {
    marginTop: 32,
    alignItems: 'center',
    padding: 16,
  },
  logoutText: {
    color: '#999',
    fontSize: 16,
  },
});
