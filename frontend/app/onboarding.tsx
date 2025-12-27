import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants';

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [methods, setMethods] = useState<any[]>([]);
  const [methodsByCategory, setMethodsByCategory] = useState<Record<string, any[]>>({});
  const [formData, setFormData] = useState({
    experienceLevel: '',
    primaryGoal: '',
    daysPerWeek: '',
    sessionLength: '',
    ownsHorse: false,
    horseDetails: '',
    primaryMethodId: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      const response = await fetch(`${API_URL}/api/methods`);
      if (response.ok) {
        const data = await response.json();
        setMethods(data);
        
        // Group by category
        const grouped: Record<string, any[]> = {};
        data.forEach((method: any) => {
          if (!grouped[method.category]) {
            grouped[method.category] = [];
          }
          grouped[method.category].push(method);
        });
        setMethodsByCategory(grouped);
      }
    } catch (error) {
      console.error('Failed to load methods:', error);
    }
  };

  const experienceLevels = [
    { value: 'complete_beginner', label: 'Complete Beginner' },
    { value: 'some_experience', label: 'Some Experience' },
    { value: 'returning_rider', label: 'Returning Rider' },
    { value: 'experienced', label: 'Experienced' },
  ];

  const goals = [
    { value: 'learn_to_ride', label: 'Learn to Ride' },
    { value: 'learn_to_drive', label: 'Learn to Drive' },
    { value: 'groundwork_only', label: 'Groundwork Only' },
    { value: 'general_horsemanship', label: 'General Horsemanship' },
  ];

  const handleNext = () => {
    if (step === 1 && !formData.experienceLevel) {
      Alert.alert('Error', 'Please select your experience level');
      return;
    }
    if (step === 2 && !formData.primaryGoal) {
      Alert.alert('Error', 'Please select your primary goal');
      return;
    }
    if (step === 3 && (!formData.daysPerWeek || !formData.sessionLength)) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      // Save profile
      const profileResponse = await fetch(`${API_URL}/api/user/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          experienceLevel: formData.experienceLevel,
          primaryGoal: formData.primaryGoal,
          daysPerWeek: parseInt(formData.daysPerWeek),
          sessionLength: parseInt(formData.sessionLength),
          ownsHorse: formData.ownsHorse,
          horseDetails: formData.horseDetails || undefined,
        }),
      });

      // Generate training plan
      const planResponse = await fetch(`${API_URL}/api/training/generate-plan`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!planResponse.ok) {
        throw new Error('Failed to generate training plan');
      }

      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Let's Get Started</Text>
        <Text style={styles.stepIndicator}>Step {step} of 4</Text>

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.question}>
              What's your experience level?
            </Text>
            {experienceLevels.map((level) => (
              <TouchableOpacity
                key={level.value}
                style={[
                  styles.option,
                  formData.experienceLevel === level.value &&
                    styles.optionSelected,
                ]}
                onPress={() =>
                  setFormData({ ...formData, experienceLevel: level.value })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.experienceLevel === level.value &&
                      styles.optionTextSelected,
                  ]}
                >
                  {level.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.question}>What's your primary goal?</Text>
            {goals.map((goal) => (
              <TouchableOpacity
                key={goal.value}
                style={[
                  styles.option,
                  formData.primaryGoal === goal.value && styles.optionSelected,
                ]}
                onPress={() =>
                  setFormData({ ...formData, primaryGoal: goal.value })
                }
              >
                <Text
                  style={[
                    styles.optionText,
                    formData.primaryGoal === goal.value &&
                      styles.optionTextSelected,
                  ]}
                >
                  {goal.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {step === 3 && (
          <View style={styles.step}>
            <Text style={styles.question}>
              How many days per week can you train?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Days per week (1-7)"
              keyboardType="number-pad"
              value={formData.daysPerWeek}
              onChangeText={(text) =>
                setFormData({ ...formData, daysPerWeek: text })
              }
            />

            <Text style={styles.question}>
              How long are your training sessions? (minutes)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Session length in minutes"
              keyboardType="number-pad"
              value={formData.sessionLength}
              onChangeText={(text) =>
                setFormData({ ...formData, sessionLength: text })
              }
            />
          </View>
        )}

        {step === 4 && (
          <View style={styles.step}>
            <Text style={styles.question}>Do you own a horse?</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>I own a horse</Text>
              <Switch
                value={formData.ownsHorse}
                onValueChange={(value) =>
                  setFormData({ ...formData, ownsHorse: value })
                }
                trackColor={{ false: '#D4C4B0', true: '#8B7355' }}
                thumbColor="#fff"
              />
            </View>

            {formData.ownsHorse && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tell us about your horse (optional)"
                multiline
                numberOfLines={4}
                value={formData.horseDetails}
                onChangeText={(text) =>
                  setFormData({ ...formData, horseDetails: text })
                }
              />
            )}
          </View>
        )}

        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={() => setStep(step - 1)}
            >
              <Text style={styles.buttonTextSecondary}>Back</Text>
            </TouchableOpacity>
          )}

          {step < 5 ? (
            <TouchableOpacity style={styles.button} onPress={handleNext}>
              <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Generate Training Plan</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B7355',
    marginBottom: 8,
  },
  stepIndicator: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  step: {
    marginBottom: 32,
  },
  question: {
    fontSize: 20,
    fontWeight: '600',
    color: '#5A4A3A',
    marginBottom: 24,
  },
  option: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#D4C4B0',
  },
  optionSelected: {
    borderColor: '#8B7355',
    backgroundColor: '#F5F1EA',
  },
  optionText: {
    fontSize: 18,
    color: '#5A4A3A',
  },
  optionTextSelected: {
    color: '#8B7355',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4C4B0',
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4C4B0',
  },
  switchLabel: {
    fontSize: 18,
    color: '#5A4A3A',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    backgroundColor: '#8B7355',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#8B7355',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  buttonTextSecondary: {
    color: '#8B7355',
    fontSize: 18,
    fontWeight: '600',
  },
});
