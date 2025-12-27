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
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';

export default function LessonScreen() {
  const { lessonId } = useLocalSearchParams<{ lessonId: string }>();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState({
    duration: '',
    rating: 5,
    notes: '',
    horseNotes: '',
  });
  const [loggingSession, setLoggingSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (lessonId) {
      loadLesson();
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
    } catch (error) {
      console.error('Load lesson error:', error);
      Alert.alert('Error', 'Failed to load lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkComplete = async () => {
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

      const data = await response.json();
      
      // Show celebration if skills were unlocked
      if (data.newlyUnlockedSkills && data.newlyUnlockedSkills.length > 0) {
        Alert.alert(
          '🎉 Lesson Complete!',
          `New skills unlocked:\n${data.newlyUnlockedSkills.join('\n')}`,
          [{ text: 'Awesome!', style: 'default' }]
        );
      } else {
        Alert.alert('Success', 'Lesson marked as complete!');
      }
      
      loadLesson(); // Reload to show updated state
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleLogSession = async () => {
    if (!sessionData.duration) {
      Alert.alert('Error', 'Please enter session duration');
      return;
    }

    setLoggingSession(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/api/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          lessonId: lessonId,
          duration: parseInt(sessionData.duration),
          rating: sessionData.rating,
          notes: sessionData.notes || undefined,
          horseNotes: sessionData.horseNotes || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to log session');
      }

      Alert.alert('Success', 'Session logged successfully!');
      setSessionData({
        duration: '',
        rating: 5,
        notes: '',
        horseNotes: '',
      });
      loadLesson(); // Reload to show updated sessions
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoggingSession(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#8B7355" />
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.subtitle}>
          Phase {lesson.phaseNumber} • Module {lesson.moduleNumber} • Lesson{' '}
          {lesson.lessonNumber}
        </Text>

        {content.requiresProfessionalHelp && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ This lesson requires professional instruction. Please work with
              a qualified instructor.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objective</Text>
          <Text style={styles.sectionText}>{content.objective}</Text>
        </View>

        {content.equipment && content.equipment.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Equipment Needed</Text>
            {content.equipment.map((item: string, index: number) => (
              <Text key={index} style={styles.bulletPoint}>
                • {item}
              </Text>
            ))}
          </View>
        )}

        {content.instructions && content.instructions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Instructions</Text>
            {content.instructions.map((instruction: string, index: number) => (
              <View key={index} style={styles.instructionStep}>
                <Text style={styles.stepNumber}>{index + 1}</Text>
                <Text style={styles.instructionText}>{instruction}</Text>
              </View>
            ))}
          </View>
        )}

        {content.safetyNotes && content.safetyNotes.length > 0 && (
          <View style={[styles.section, styles.safetySection]}>
            <Text style={styles.sectionTitle}>⚠️ Safety Notes</Text>
            {content.safetyNotes.map((note: string, index: number) => (
              <Text key={index} style={styles.safetyPoint}>
                • {note}
              </Text>
            ))}
            <View style={styles.safetyReminder}>
              <Text style={styles.safetyReminderText}>
                Always prioritize safety. If unsure, seek guidance from a qualified instructor.
              </Text>
            </View>
          </View>
        )}

        {content.commonMistakes && content.commonMistakes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Common Mistakes</Text>
            {content.commonMistakes.map((mistake: string, index: number) => (
              <Text key={index} style={styles.bulletPoint}>
                • {mistake}
              </Text>
            ))}
          </View>
        )}

        {content.moveOnWhen && content.moveOnWhen.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Move On When</Text>
            {content.moveOnWhen.map((criterion: string, index: number) => (
              <Text key={index} style={styles.bulletPoint}>
                ✓ {criterion}
              </Text>
            ))}
          </View>
        )}

        {!lesson.isCompleted && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={handleMarkComplete}
          >
            <Text style={styles.completeButtonText}>
              Mark as Complete
            </Text>
          </TouchableOpacity>
        )}

        {lesson.isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓ Lesson Completed</Text>
          </View>
        )}

        <View style={styles.sessionSection}>
          <Text style={styles.sectionTitle}>Log Session</Text>

          <Text style={styles.label}>Duration (minutes)</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter duration"
            keyboardType="number-pad"
            value={sessionData.duration}
            onChangeText={(text) =>
              setSessionData({ ...sessionData, duration: text })
            }
          />

          <Text style={styles.label}>Rating (1-5)</Text>
          <View style={styles.ratingRow}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity
                key={rating}
                style={[
                  styles.ratingButton,
                  sessionData.rating === rating && styles.ratingButtonSelected,
                ]}
                onPress={() => setSessionData({ ...sessionData, rating })}
              >
                <Text
                  style={[
                    styles.ratingText,
                    sessionData.rating === rating &&
                      styles.ratingTextSelected,
                  ]}
                >
                  {rating}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="How did the session go?"
            multiline
            numberOfLines={3}
            value={sessionData.notes}
            onChangeText={(text) =>
              setSessionData({ ...sessionData, notes: text })
            }
          />

          <Text style={styles.label}>Horse Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="How was the horse's behavior/mood?"
            multiline
            numberOfLines={3}
            value={sessionData.horseNotes}
            onChangeText={(text) =>
              setSessionData({ ...sessionData, horseNotes: text })
            }
          />

          <TouchableOpacity
            style={[styles.logButton, loggingSession && styles.buttonDisabled]}
            onPress={handleLogSession}
            disabled={loggingSession}
          >
            <Text style={styles.logButtonText}>
              {loggingSession ? 'Logging...' : 'Log Session'}
            </Text>
          </TouchableOpacity>
        </View>

        {lesson.sessions && lesson.sessions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Previous Sessions</Text>
            {lesson.sessions.map((session: any) => (
              <View key={session.id} style={styles.sessionCard}>
                <Text style={styles.sessionDate}>
                  {new Date(session.sessionDate).toLocaleDateString()}
                </Text>
                <Text>Duration: {session.duration} minutes</Text>
                <Text>Rating: {'⭐'.repeat(session.rating)}</Text>
                {session.notes && (
                  <Text style={styles.sessionNotes}>{session.notes}</Text>
                )}
              </View>
            ))}
          </View>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 24,
  },
  warningBox: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#FFC107',
  },
  warningText: {
    fontSize: 16,
    color: '#856404',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 24,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 24,
    marginBottom: 8,
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B7355',
    marginRight: 12,
    width: 24,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#5A4A3A',
    lineHeight: 24,
  },
  completeButton: {
    backgroundColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#8B7355',
  },
  completedText: {
    color: '#8B7355',
    fontSize: 18,
    fontWeight: '600',
  },
  sessionSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5A4A3A',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#F5F1EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    color: '#333',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ratingRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  ratingButton: {
    flex: 1,
    backgroundColor: '#F5F1EA',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4C4B0',
  },
  ratingButtonSelected: {
    borderColor: '#8B7355',
    backgroundColor: '#8B7355',
  },
  ratingText: {
    fontSize: 18,
    color: '#5A4A3A',
    fontWeight: '600',
  },
  ratingTextSelected: {
    color: '#fff',
  },
  logButton: {
    backgroundColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  logButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  sessionCard: {
    backgroundColor: '#F5F1EA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  sessionDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B7355',
    marginBottom: 4,
  },
  sessionNotes: {
    fontSize: 14,
    color: '#5A4A3A',
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    textAlign: 'center',
    marginTop: 48,
  },
  safetySection: {
    backgroundColor: '#FFF3CD',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#FFC107',
  },
  safetyPoint: {
    fontSize: 16,
    color: '#856404',
    lineHeight: 24,
    marginBottom: 8,
    fontWeight: '500',
  },
  safetyReminder: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#FFC107',
  },
  safetyReminderText: {
    fontSize: 14,
    color: '#856404',
    fontStyle: 'italic',
    lineHeight: 20,
  },
});
