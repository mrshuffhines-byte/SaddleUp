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

export default function PlanScreen() {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
      </View>
    );
  }

  if (!plan) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No training plan found</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push('/onboarding')}
        >
          <Text style={styles.buttonText}>Create Plan</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Group lessons by phase and module
  const phases: any = {};
  plan.lessons.forEach((lesson: any) => {
    const phaseKey = `Phase ${lesson.phaseNumber}`;
    const moduleKey = `Module ${lesson.moduleNumber}`;

    if (!phases[phaseKey]) {
      phases[phaseKey] = {};
    }
    if (!phases[phaseKey][moduleKey]) {
      phases[phaseKey][moduleKey] = [];
    }
    phases[phaseKey][moduleKey].push(lesson);
  });

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Training Plan</Text>
        <Text style={styles.planId}>{plan.visibleIdDisplay}</Text>

        {Object.entries(phases).map(([phaseName, modules]: [string, any]) => (
          <View key={phaseName} style={styles.phaseSection}>
            <Text style={styles.phaseTitle}>{phaseName}</Text>
            {Object.entries(modules).map(([moduleName, lessons]: [string, any]) => (
              <View key={moduleName} style={styles.moduleSection}>
                <Text style={styles.moduleTitle}>{moduleName}</Text>
                {lessons.map((lesson: any) => (
                  <TouchableOpacity
                    key={lesson.id}
                    style={[
                      styles.lessonItem,
                      lesson.isCompleted && styles.lessonCompleted,
                    ]}
                    onPress={() => router.push(`/lesson/${lesson.lessonId}`)}
                  >
                    <Text style={styles.lessonTitle}>{lesson.title}</Text>
                    {lesson.isCompleted && (
                      <Text style={styles.completedBadge}>✓ Completed</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
        ))}
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
    marginBottom: 8,
  },
  planId: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  phaseSection: {
    marginBottom: 32,
  },
  phaseTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  moduleSection: {
    marginBottom: 20,
    marginLeft: 16,
  },
  moduleTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#5A4A3A',
    marginBottom: 8,
  },
  lessonItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  lessonCompleted: {
    backgroundColor: '#E8F5E9',
    borderColor: '#8B7355',
  },
  lessonTitle: {
    fontSize: 16,
    color: '#5A4A3A',
  },
  completedBadge: {
    fontSize: 14,
    color: '#8B7355',
    fontWeight: '600',
    marginTop: 4,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
