import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants';
import { colors, spacing, typography, borderRadius, shadows } from './theme';
import { Button, ProgressBar } from '../components/ui';
import Card from '../components/ui/Card';

const TOTAL_STEPS = 4;

const EXPERIENCE_LEVELS = [
  {
    value: 'complete_beginner',
    label: 'Complete Beginner',
    icon: '🌱',
    description: 'Brand new to horses',
  },
  {
    value: 'some_experience',
    label: 'Some Experience',
    icon: '🐴',
    description: 'Ridden a few times',
  },
  {
    value: 'returning_rider',
    label: 'Returning Rider',
    icon: '🔄',
    description: 'Getting back into it',
  },
  {
    value: 'experienced',
    label: 'Experienced',
    icon: '⭐',
    description: 'Confident with basics',
  },
];

const PRIMARY_GOALS = [
  {
    value: 'learn_to_ride',
    label: 'Learn to Ride',
    icon: '🏇',
    description: 'Master mounted work and riding skills',
  },
  {
    value: 'learn_to_drive',
    label: 'Learn to Drive',
    icon: '🛞',
    description: 'Learn to drive horses in harness',
  },
  {
    value: 'groundwork_only',
    label: 'Groundwork Only',
    icon: '🤝',
    description: 'Focus on ground-based training',
  },
  {
    value: 'general_horsemanship',
    label: 'General Horsemanship',
    icon: '📚',
    description: 'Build overall horse skills',
  },
];

const DAYS_OPTIONS = [
  { value: 1, label: '1-2 days' },
  { value: 3, label: '3-4 days' },
  { value: 5, label: '5+ days' },
];

const SESSION_LENGTH_OPTIONS = [
  { value: 30, label: '15-30 min' },
  { value: 45, label: '30-60 min' },
  { value: 60, label: '60+ min' },
];

const TEMPERAMENT_OPTIONS = ['calm', 'nervous', 'energetic', 'stubborn'];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    experienceLevel: '',
    primaryGoal: '',
    daysPerWeek: 0,
    sessionLength: 0,
    ownsHorse: false,
    horseDetails: '',
    horseName: '',
    horseBreed: '',
    horseAge: '',
    horseTemperament: [] as string[],
  });
  const router = useRouter();
  const scaleAnim = useState(new Animated.Value(1))[0];

  const handleNext = () => {
    if (step === 1 && !formData.experienceLevel) {
      Alert.alert('Please select', 'Please select your experience level');
      return;
    }
    if (step === 2 && !formData.primaryGoal) {
      Alert.alert('Please select', 'Please select your primary goal');
      return;
    }
    if (step === 3 && (!formData.daysPerWeek || !formData.sessionLength)) {
      Alert.alert('Please select', 'Please select your time commitment');
      return;
    }
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const toggleTemperament = (temp: string) => {
    setFormData({
      ...formData,
      horseTemperament: formData.horseTemperament.includes(temp)
        ? formData.horseTemperament.filter(t => t !== temp)
        : [...formData.horseTemperament, temp],
    });
  };

  const animateSelection = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      // Build horse details string if horse info provided
      let horseDetails = formData.horseDetails;
      if (formData.ownsHorse && formData.horseName) {
        const details: string[] = [];
        if (formData.horseName) details.push(`Name: ${formData.horseName}`);
        if (formData.horseBreed) details.push(`Breed: ${formData.horseBreed}`);
        if (formData.horseAge) details.push(`Age: ${formData.horseAge}`);
        if (formData.horseTemperament.length > 0) {
          details.push(`Temperament: ${formData.horseTemperament.join(', ')}`);
        }
        horseDetails = details.join('. ') + (formData.horseDetails ? `. ${formData.horseDetails}` : '');
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
          daysPerWeek: formData.daysPerWeek,
          sessionLength: formData.sessionLength,
          ownsHorse: formData.ownsHorse,
          horseDetails: horseDetails || undefined,
        }),
      });

      if (!profileResponse.ok) {
        throw new Error('Failed to save profile');
      }

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

  const progress = (step / TOTAL_STEPS) * 100;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <ProgressBar
            progress={progress}
            showLabel={false}
            style={styles.progressBar}
          />
          <Text style={styles.stepText}>Step {step} of {TOTAL_STEPS}</Text>
        </View>

        {/* Step 1: Experience Level */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your experience level?</Text>
            <Text style={styles.stepSubtitle}>
              This helps us create the perfect starting point for you
            </Text>

            <View style={styles.optionsGrid}>
              {EXPERIENCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.optionCard,
                    formData.experienceLevel === level.value && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    animateSelection();
                    setFormData({ ...formData, experienceLevel: level.value });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{level.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      formData.experienceLevel === level.value && styles.optionLabelSelected,
                    ]}
                  >
                    {level.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      formData.experienceLevel === level.value && styles.optionDescriptionSelected,
                    ]}
                  >
                    {level.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 2: Primary Goal */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>What's your primary goal?</Text>
            <Text style={styles.contextText}>
              We'll tailor your plan to help you achieve this
            </Text>

            <View style={styles.optionsGrid}>
              {PRIMARY_GOALS.map((goal) => (
                <TouchableOpacity
                  key={goal.value}
                  style={[
                    styles.optionCard,
                    formData.primaryGoal === goal.value && styles.optionCardSelected,
                  ]}
                  onPress={() => {
                    animateSelection();
                    setFormData({ ...formData, primaryGoal: goal.value });
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.optionIcon}>{goal.icon}</Text>
                  <Text
                    style={[
                      styles.optionLabel,
                      formData.primaryGoal === goal.value && styles.optionLabelSelected,
                    ]}
                  >
                    {goal.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDescription,
                      formData.primaryGoal === goal.value && styles.optionDescriptionSelected,
                    ]}
                  >
                    {goal.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Step 3: Time Commitment */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>How much time can you commit?</Text>
            <Text style={styles.helperText}>
              Be realistic - we'll design lessons that fit your life
            </Text>

            <Card style={styles.timeCard}>
              <Text style={styles.sectionLabel}>Days per week</Text>
              <View style={styles.optionsRow}>
                {DAYS_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timeOption,
                      formData.daysPerWeek === option.value && styles.timeOptionSelected,
                    ]}
                    onPress={() => {
                      animateSelection();
                      setFormData({ ...formData, daysPerWeek: option.value });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        formData.daysPerWeek === option.value && styles.timeOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionLabel, styles.sectionLabelSpacing]}>
                Session length
              </Text>
              <View style={styles.optionsRow}>
                {SESSION_LENGTH_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.timeOption,
                      formData.sessionLength === option.value && styles.timeOptionSelected,
                    ]}
                    onPress={() => {
                      animateSelection();
                      setFormData({ ...formData, sessionLength: option.value });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timeOptionText,
                        formData.sessionLength === option.value && styles.timeOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          </View>
        )}

        {/* Step 4: Horse Details */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Do you have a horse?</Text>
            <Text style={styles.stepSubtitle}>
              If not, we'll create lessons you can apply when you're ready
            </Text>

            <Card style={styles.horseCard}>
              <TouchableOpacity
                style={styles.toggleRow}
                onPress={() => setFormData({ ...formData, ownsHorse: !formData.ownsHorse })}
                activeOpacity={0.7}
              >
                <Text style={styles.toggleLabel}>I own a horse</Text>
                <View style={[styles.toggleSwitch, formData.ownsHorse && styles.toggleSwitchOn]}>
                  <View
                    style={[
                      styles.toggleCircle,
                      formData.ownsHorse && styles.toggleCircleOn,
                    ]}
                  />
                </View>
              </TouchableOpacity>

              {formData.ownsHorse ? (
                <View style={styles.horseForm}>
                  <Text style={styles.formLabel}>Horse's Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="What's your horse's name?"
                    value={formData.horseName}
                    onChangeText={(text) => setFormData({ ...formData, horseName: text })}
                    placeholderTextColor={colors.neutral[400]}
                  />

                  <Text style={styles.formLabel}>Breed (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Quarter Horse, Thoroughbred"
                    value={formData.horseBreed}
                    onChangeText={(text) => setFormData({ ...formData, horseBreed: text })}
                    placeholderTextColor={colors.neutral[400]}
                  />

                  <Text style={styles.formLabel}>Age (optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Years"
                    value={formData.horseAge}
                    onChangeText={(text) => setFormData({ ...formData, horseAge: text.replace(/[^0-9]/g, '') })}
                    keyboardType="number-pad"
                    placeholderTextColor={colors.neutral[400]}
                  />

                  <Text style={styles.formLabel}>Temperament (optional)</Text>
                  <View style={styles.temperamentGrid}>
                    {TEMPERAMENT_OPTIONS.map((temp) => (
                      <TouchableOpacity
                        key={temp}
                        style={[
                          styles.temperamentChip,
                          formData.horseTemperament.includes(temp) && styles.temperamentChipSelected,
                        ]}
                        onPress={() => toggleTemperament(temp)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.temperamentChipText,
                            formData.horseTemperament.includes(temp) && styles.temperamentChipTextSelected,
                          ]}
                        >
                          {temp}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Additional Notes (optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Anything else we should know about your horse?"
                    value={formData.horseDetails}
                    onChangeText={(text) => setFormData({ ...formData, horseDetails: text })}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    placeholderTextColor={colors.neutral[400]}
                  />
                </View>
              ) : (
                <View style={styles.noHorseMessage}>
                  <Text style={styles.noHorseIcon}>🐴</Text>
                  <Text style={styles.noHorseText}>
                    No problem! We'll create lessons you can apply when you're ready.
                  </Text>
                </View>
              )}
            </Card>
          </View>
        )}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          {step < TOTAL_STEPS ? (
            <Button
              title="Next"
              onPress={handleNext}
              style={styles.nextButton}
              fullWidth={step === 1}
            />
          ) : (
            <Button
              title={loading ? 'Generating Plan...' : 'Generate My Training Plan →'}
              onPress={handleSubmit}
              loading={loading}
              style={styles.submitButton}
              fullWidth
            />
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  progressContainer: {
    marginBottom: spacing.xl,
  },
  progressBar: {
    marginBottom: spacing.sm,
  },
  stepText: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  stepContainer: {
    marginBottom: spacing.xl,
  },
  stepTitle: {
    ...typography.h1,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  stepSubtitle: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
    lineHeight: typography.body.lineHeight,
  },
  contextText: {
    ...typography.body,
    color: colors.primary[700],
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  helperText: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    marginBottom: spacing.lg,
    fontStyle: 'italic',
  },
  optionsGrid: {
    gap: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    ...shadows.sm,
  },
  optionCardSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
    ...shadows.md,
  },
  optionIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  optionLabel: {
    ...typography.h4,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  optionLabelSelected: {
    color: colors.neutral[50],
  },
  optionDescription: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    textAlign: 'center',
  },
  optionDescriptionSelected: {
    color: colors.neutral[100],
  },
  timeCard: {
    padding: spacing.lg,
  },
  sectionLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  sectionLabelSpacing: {
    marginTop: spacing.lg,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  timeOption: {
    flex: 1,
    minWidth: 100,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  timeOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  timeOptionText: {
    ...typography.body,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  timeOptionTextSelected: {
    color: colors.neutral[50],
  },
  horseCard: {
    padding: spacing.lg,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.neutral[900],
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.neutral[300],
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleSwitchOn: {
    backgroundColor: colors.primary[500],
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral[50],
    alignSelf: 'flex-start',
  },
  toggleCircleOn: {
    alignSelf: 'flex-end',
  },
  horseForm: {
    marginTop: spacing.md,
  },
  formLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    ...typography.body,
    color: colors.neutral[900],
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.md,
  },
  temperamentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  temperamentChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  temperamentChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  temperamentChipText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    textTransform: 'capitalize',
  },
  temperamentChipTextSelected: {
    color: colors.neutral[50],
  },
  noHorseMessage: {
    alignItems: 'center',
    padding: spacing.xl,
    marginTop: spacing.md,
  },
  noHorseIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  noHorseText: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.body.lineHeight,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.xl,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 2,
  },
  submitButton: {
    flex: 1,
  },
});
