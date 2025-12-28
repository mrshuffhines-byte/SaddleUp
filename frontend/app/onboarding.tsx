import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming,
  interpolateColor,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './constants';
import { colors, spacing, typography, borderRadius, shadows } from './theme';
import { Button, ProgressBar, ScreenBackground } from '../components/ui';
import Card from '../components/ui/Card';
import { Input } from '../components/ui';

const TOTAL_STEPS = 6; // Step 4 split into 4A (basic info) and 4B (training/issues)

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
    description: 'Mounting, balance, walk/trot/canter, steering and stopping',
  },
  {
    value: 'learn_to_drive',
    label: 'Learn to Drive',
    icon: '🐴🛞', // Better carriage icon representation
    description: 'Carriage/cart driving (not riding) - harness work and ground driving',
  },
  {
    value: 'groundwork_only',
    label: 'Groundwork Only',
    icon: '🤝',
    description: 'Work with your horse while staying on the ground - leading, grooming, basic handling',
  },
  {
    value: 'general_horsemanship',
    label: 'General Horsemanship',
    icon: '📚',
    description: 'All-around horse care, handling, and relationship building',
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

const AGE_OPTIONS = ['Under 5', '5-10', '11-17', '18+'];

const TEMPERAMENT_OPTIONS = [
  { value: 'calm', label: '😌 Calm & Steady', desc: 'Relaxed, predictable' },
  { value: 'nervous', label: '😰 Nervous/Spooky', desc: 'Startles easily' },
  { value: 'energetic', label: '⚡ Energetic/Hot', desc: 'Lots of energy, forward' },
  { value: 'stubborn', label: '🫏 Stubborn', desc: 'Tests boundaries' },
  { value: 'unpredictable', label: '⚠️ Unpredictable', desc: 'Behavior varies' },
];

const HORSE_ISSUES = [
  'Biting',
  'Kicking',
  'Rearing',
  'Bolting',
  "Won't stand still",
  'Hard to catch',
  'Pulls on lead',
  'None that I know of',
];

const NO_HORSE_OPTIONS = [
  { value: 'lease', label: '🤝 I lease a horse', desc: 'Regular access to a specific horse' },
  { value: 'lessons', label: '📚 I take lessons', desc: 'Ride school horses at a barn' },
  { value: 'planning', label: '🔜 Planning to buy', desc: 'Learning before I get a horse' },
  { value: 'other', label: '🐴 Other situation', desc: "Friend's horse, volunteer, etc." },
];

const TIME_GAP_OPTIONS = [
  { value: '1-2', label: '1-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5-10', label: '5-10 years' },
  { value: '10-20', label: '10-20 years' },
  { value: '20+', label: '20+ years' },
];

export default function OnboardingScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    experienceLevel: '',
    returningTimeGap: '',
    primaryGoal: '',
    daysPerWeek: 0,
    sessionLength: 0,
    ownsHorse: false,
    horseAccess: '',
    // Horse profile fields
    horseName: '',
    horseBreed: '',
    horseAge: '',
    horseSex: '',
    horseTemperament: '',
    horseTrained: '',
    horseIssues: [] as string[],
    horseNotes: '',
    methodPreference: 'explore' as 'explore' | 'blend' | 'single',
    selectedMethods: [] as string[],
  });
  const router = useRouter();
  const [methods, setMethods] = useState<any[]>([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [methodsError, setMethodsError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');
  const [planGenerationError, setPlanGenerationError] = useState<string | null>(null);

  useEffect(() => {
    // Load methods when component mounts (for step 5)
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      setMethodsError(null);
      const response = await fetch(`${API_URL}/api/methods`);
      if (response.ok) {
        const data = await response.json();
        setMethods(data);
        if (data.length === 0) {
          setMethodsError('No methods found in database. Please ensure the database has been seeded.');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to load methods:', response.status, errorText);
        setMethodsError(`Failed to load methods: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to load methods:', error);
      setMethodsError(`Connection error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingMethods(false);
    }
  };

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
    // Step 4: Basic horse info - no validation needed (all optional)
    // Step 5: Training status - no validation needed (all optional), skip if doesn't own horse
    // Step 6: Method selection validation
    if ((step === 5 && !formData.ownsHorse) || step === 6) {
      // This is the method selection step
      if (formData.methodPreference !== 'explore' && formData.selectedMethods.length === 0) {
        Alert.alert('Please select', 'Please select at least one horsemanship method');
        return;
      }
    }
    
    if (step < TOTAL_STEPS) {
      // Skip step 5 if user doesn't own a horse
      if (step === 4 && !formData.ownsHorse) {
        setStep(6); // Skip to method selection
      } else {
        setStep(step + 1);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      // Skip step 5 when going back if user doesn't own a horse
      if (step === 6 && !formData.ownsHorse) {
        setStep(4);
      } else {
        setStep(step - 1);
      }
    }
  };

  const toggleIssue = (issue: string) => {
    setFormData({
      ...formData,
      horseIssues: formData.horseIssues.includes(issue)
        ? formData.horseIssues.filter(i => i !== issue)
        : [...formData.horseIssues, issue],
    });
  };

  const handleSubmit = async (retry = false) => {
    // Horse name is now optional - no validation needed

    setLoading(true);
    setPlanGenerationError(null);
    setLoadingMessage('Saving your profile...');

    try {
      const token = await AsyncStorage.getItem('authToken');
      if (!token) {
        router.replace('/(auth)/login');
        return;
      }

      // Save profile
      setLoadingMessage('Saving your profile...');
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
          ...(formData.returningTimeGap && { returningTimeGap: formData.returningTimeGap }),
          ...(!formData.ownsHorse && formData.horseAccess && { horseAccess: formData.horseAccess }),
          horseDetails: formData.ownsHorse && formData.horseName ? `${formData.horseName}` : undefined,
          methodPreference: formData.methodPreference,
          selectedMethods: formData.selectedMethods.length > 0 ? formData.selectedMethods : undefined,
        }),
      });

      if (!profileResponse.ok) {
        const errorData = await profileResponse.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save profile');
      }

      let horseId = null;

      // Create horse profile if user owns a horse and provided at least a name
      if (formData.ownsHorse && formData.horseName.trim()) {
        setLoadingMessage('Creating horse profile...');
        const horseData: any = {
          name: formData.horseName.trim(),
        };

        if (formData.horseBreed?.trim()) horseData.breed = formData.horseBreed.trim();
        if (formData.horseAge) horseData.age = formData.horseAge;
        if (formData.horseSex) horseData.sex = formData.horseSex;
        if (formData.horseTemperament) {
          horseData.temperament = [formData.horseTemperament];
        }
        if (formData.horseTrained) {
          horseData.isProfessionallyTrained = formData.horseTrained === 'Yes';
        }
        if (formData.horseIssues.length > 0) {
          const issues = formData.horseIssues.filter(i => i !== 'None that I know of');
          if (issues.length > 0) {
            horseData.knownIssues = issues;
          }
        }
        if (formData.horseNotes?.trim()) horseData.notes = formData.horseNotes.trim();

        const horseResponse = await fetch(`${API_URL}/api/horses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(horseData),
        });

        if (!horseResponse.ok) {
          const errorData = await horseResponse.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to create horse profile');
        }

        const horse = await horseResponse.json();
        horseId = horse.id;
      }

      // Generate training plan with timeout
      setLoadingMessage('Creating your training plan... This usually takes 10-15 seconds.');
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timed out. Please check your internet connection and try again.')), 30000); // 30 second timeout
      });

      const planPromise = fetch(`${API_URL}/api/training/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(horseId && { horseIds: [horseId] }),
        }),
      });

      const planResponse = await Promise.race([planPromise, timeoutPromise]) as Response;

      if (!planResponse.ok) {
        const errorData = await planResponse.json().catch(() => ({}));
        throw new Error(errorData.error || errorData.message || 'Failed to generate training plan');
      }

      const planData = await planResponse.json();

      // Validate that plan has lessons
      if (!planData.lessons || planData.lessons.length === 0) {
        throw new Error('Training plan was created but contains no lessons. Please try again.');
      }

      setLoadingMessage('Plan created successfully! Redirecting...');
      
      // Small delay to show success message
      await new Promise(resolve => setTimeout(resolve, 500));
      
      router.replace('/(tabs)/dashboard');
    } catch (error: any) {
      console.error('Onboarding error:', error);
      const errorMessage = error.message || 'Failed to complete onboarding. Please try again.';
      setPlanGenerationError(errorMessage);
      setLoading(false);
      
      // Don't show alert if it's a retry - let the user see the error message on screen
      if (!retry) {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  // Calculate progress accounting for skipped steps
  const getEffectiveStep = () => {
    if (step <= 4) return step;
    if (step === 5 && !formData.ownsHorse) return 5; // Step 5 is skipped, but we're at step 6
    if (step === 6 && !formData.ownsHorse) return 5; // Step 5 was skipped
    return step;
  };
  
  // Calculate effective total steps (5 if step 5 is skipped, 6 otherwise)
  const getEffectiveTotalSteps = () => {
    return formData.ownsHorse ? TOTAL_STEPS : TOTAL_STEPS - 1;
  };
  
  const effectiveStep = getEffectiveStep();
  const effectiveTotalSteps = getEffectiveTotalSteps();
  const progress = (effectiveStep / effectiveTotalSteps) * 100;

  const handleBackToDashboard = () => {
    Alert.alert(
      'Exit Plan Generator?',
      'Your progress will be saved. You can return to complete it anytime.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Go to Dashboard',
          onPress: () => router.replace('/(tabs)/dashboard'),
        },
      ]
    );
  };

  return (
    <ScreenBackground variant="default">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity
            style={styles.headerBackButton}
            onPress={handleBackToDashboard}
          >
            <Text style={styles.headerBackButtonText}>← Dashboard</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <ProgressBar
              progress={progress}
              showLabel={false}
              style={styles.progressBar}
            />
            <Text style={styles.stepText}>Step {effectiveStep} of {effectiveTotalSteps}</Text>
          </View>

          {/* Step 1: Experience Level */}
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>What's your experience level?</Text>
              <Text style={styles.stepSubtitle}>
                This helps us create the perfect starting point for you
              </Text>

              <View style={styles.optionsGrid}>
                {EXPERIENCE_LEVELS.map((level) => {
                  const isSelected = formData.experienceLevel === level.value;
                  return (
                    <OptionCard
                      key={level.value}
                      option={level}
                      isSelected={isSelected}
                      onSelect={() => setFormData({ ...formData, experienceLevel: level.value })}
                    />
                  );
                })}
              </View>

              {/* Returning Rider Time Gap Follow-up */}
              {formData.experienceLevel === 'returning_rider' && (
                <View style={styles.followUpSection}>
                  <Text style={styles.followUpTitle}>How long has it been since you rode regularly?</Text>
                  <View style={styles.timeGapOptions}>
                    {TIME_GAP_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt.value}
                        style={[
                          styles.timeGapButton,
                          formData.returningTimeGap === opt.value && styles.timeGapSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, returningTimeGap: opt.value })}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeGapText,
                            formData.returningTimeGap === opt.value && styles.timeGapTextSelected,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {(formData.returningTimeGap === '10-20' || formData.returningTimeGap === '20+') && (
                    <View style={styles.infoBox}>
                      <Text style={styles.infoTitle}>💡 Good to Know</Text>
                      <Text style={styles.infoText}>
                        A lot has changed in horse training! We'll help you refresh your skills 
                        and learn some updated techniques that are safer and more effective.
                      </Text>
                    </View>
                  )}
                </View>
              )}
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
                {PRIMARY_GOALS.map((goal) => {
                  const isSelected = formData.primaryGoal === goal.value;
                  return (
                    <OptionCard
                      key={goal.value}
                      option={goal}
                      isSelected={isSelected}
                      onSelect={() => setFormData({ ...formData, primaryGoal: goal.value })}
                    />
                  );
                })}
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
                      onPress={() => setFormData({ ...formData, daysPerWeek: option.value })}
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
                      onPress={() => setFormData({ ...formData, sessionLength: option.value })}
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

          {/* Step 4: Horse Ownership & Basic Info */}
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
                  <View style={styles.horseProfileSection}>
                    <View style={styles.sectionHeader}>
                      <Text style={styles.sectionTitle}>Basic Information</Text>
                      <TouchableOpacity
                        onPress={() => {
                          setFormData({ 
                            ...formData, 
                            ownsHorse: false,
                            horseName: '',
                            horseAge: '',
                            horseSex: '',
                            horseTemperament: '',
                            horseTrained: '',
                            horseIssues: [],
                            horseNotes: '',
                          });
                        }}
                        style={styles.skipButton}
                      >
                        <Text style={styles.skipButtonText}>Skip for now</Text>
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.optionalNote}>
                      All fields are optional. You can add details later.
                    </Text>
                    
                    <Input
                      label="Horse's Name"
                      placeholder="What's your horse's name? (optional)"
                      value={formData.horseName}
                      onChangeText={(text) => setFormData({ ...formData, horseName: text })}
                      containerStyle={styles.inputContainer}
                    />

                    <Text style={styles.formLabel}>Horse's age <Text style={styles.optionalTag}>(optional)</Text></Text>
                    <View style={styles.ageButtons}>
                      {AGE_OPTIONS.map((age) => (
                        <TouchableOpacity
                          key={age}
                          style={[
                            styles.ageButton,
                            formData.horseAge === age && styles.ageButtonSelected,
                          ]}
                          onPress={() => setFormData({ ...formData, horseAge: age })}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.ageButtonText,
                              formData.horseAge === age && styles.ageButtonTextSelected,
                            ]}
                          >
                            {age}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <Text style={styles.formLabel}>How would you describe your horse's temperament? <Text style={styles.optionalTag}>(optional)</Text></Text>
                    <View style={styles.temperamentOptions}>
                      {TEMPERAMENT_OPTIONS.map((temp) => (
                        <TouchableOpacity
                          key={temp.value}
                          style={[
                            styles.tempButton,
                            formData.horseTemperament === temp.value && styles.tempButtonSelected,
                          ]}
                          onPress={() => setFormData({ ...formData, horseTemperament: temp.value })}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.tempLabel,
                              formData.horseTemperament === temp.value && styles.tempLabelSelected,
                            ]}
                          >
                            {temp.label}
                          </Text>
                          <Text
                            style={[
                              styles.tempDesc,
                              formData.horseTemperament === temp.value && styles.tempDescSelected,
                            ]}
                          >
                            {temp.desc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    {(formData.horseTemperament === 'nervous' || 
                      formData.horseTemperament === 'stubborn' || 
                      formData.horseTemperament === 'unpredictable') && (
                      <View style={[
                        styles.warningBox,
                        formData.horseTemperament === 'unpredictable' && styles.warningBoxCritical
                      ]}>
                        <Text style={styles.warningIcon}>
                          {formData.horseTemperament === 'unpredictable' ? '⚠️' : '💡'}
                        </Text>
                        <View style={styles.warningContent}>
                          <Text style={styles.warningText}>
                            {formData.horseTemperament === 'unpredictable' 
                              ? 'Working with an unpredictable horse as a beginner can be dangerous. We strongly recommend having an experienced person present or consulting a professional trainer before starting.'
                              : formData.horseTemperament === 'nervous'
                              ? 'Nervous or spooky horses require extra patience and calm handling. Start with short, positive sessions and consider working with a trainer who can help you build your horse\'s confidence safely.'
                              : 'Stubborn horses often test boundaries and may require more consistent, patient training. Make sure you have clear, fair boundaries and consider professional guidance to ensure you\'re using effective techniques.'
                            }
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.noHorseSection}>
                    <Text style={styles.noHorseTitle}>That's okay! How will you be working with horses?</Text>
                    <View style={styles.noHorseOptions}>
                      {NO_HORSE_OPTIONS.map((opt) => (
                        <TouchableOpacity
                          key={opt.value}
                          style={[
                            styles.optButton,
                            formData.horseAccess === opt.value && styles.optButtonSelected,
                          ]}
                          onPress={() => setFormData({ ...formData, horseAccess: opt.value })}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.optLabel,
                              formData.horseAccess === opt.value && styles.optLabelSelected,
                            ]}
                          >
                            {opt.label}
                          </Text>
                          <Text
                            style={[
                              styles.optDesc,
                              formData.horseAccess === opt.value && styles.optDescSelected,
                            ]}
                          >
                            {opt.desc}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}
              </Card>
            </View>
          )}

          {/* Step 5: Training Status & Known Issues (only if owns horse) */}
          {step === 5 && formData.ownsHorse && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Training & Behavior</Text>
              <Text style={styles.stepSubtitle}>
                Help us understand your horse's training background and any challenges
              </Text>

              <Card style={styles.horseCard}>
                <View style={styles.horseProfileSection}>
                  <Text style={styles.sectionTitle}>Training Status</Text>
                  <Text style={styles.optionalNote}>
                    All fields are optional. You can add details later.
                  </Text>

                  <Text style={styles.formLabel}>Has this horse been professionally trained? <Text style={styles.optionalTag}>(optional)</Text></Text>
                  <View style={styles.radioGroup}>
                    {['Yes', 'No', "I don't know"].map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.radioButton,
                          formData.horseTrained === opt && styles.radioSelected,
                        ]}
                        onPress={() => setFormData({ ...formData, horseTrained: opt })}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.radioButtonText,
                            formData.horseTrained === opt && styles.radioButtonTextSelected,
                          ]}
                        >
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <Text style={styles.formLabel}>Does your horse have any known issues? <Text style={styles.optionalTag}>(optional)</Text></Text>
                  <Text style={styles.formHelperText}>
                    Select all that apply. This helps us tailor safety recommendations.
                  </Text>
                  <View style={styles.checkboxGroup}>
                    {HORSE_ISSUES.map((issue) => (
                      <TouchableOpacity
                        key={issue}
                        style={[
                          styles.checkboxItem,
                          formData.horseIssues.includes(issue) && styles.checkboxItemSelected,
                        ]}
                        onPress={() => toggleIssue(issue)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.checkboxIcon}>
                          {formData.horseIssues.includes(issue) ? '☑' : '☐'}
                        </Text>
                        <Text
                          style={[
                            styles.checkboxText,
                            formData.horseIssues.includes(issue) && styles.checkboxTextSelected,
                          ]}
                        >
                          {issue}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </Card>
            </View>
          )}

          {/* Step 5/6: Horsemanship Method Selection */}
          {step === 6 || (step === 5 && !formData.ownsHorse) ? (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>What horsemanship approach interests you?</Text>
              <Text style={styles.stepSubtitle}>
                Choose how you'd like to learn. This affects the style and techniques in your training plan.
              </Text>

              {/* Preference Selection */}
              <Card style={styles.methodPreferenceCard}>
                <Text style={styles.sectionLabel}>Your approach preference:</Text>
                <View style={styles.preferenceOptions}>
                  <TouchableOpacity
                    style={[
                      styles.preferenceOption,
                      formData.methodPreference === 'explore' && styles.preferenceOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, methodPreference: 'explore', selectedMethods: [] });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.preferenceIcon}>🔍</Text>
                    <Text style={[styles.preferenceLabel, formData.methodPreference === 'explore' && styles.preferenceLabelSelected]}>
                      Explore All Methods
                    </Text>
                    <Text style={[styles.preferenceDesc, formData.methodPreference === 'explore' && styles.preferenceDescSelected]}>
                      Show me techniques from various methods - I want to learn what works
                    </Text>
                    {formData.methodPreference === 'explore' && (
                      <View style={[styles.previewBox, { backgroundColor: colors.infoBg, borderColor: colors.info }]}>
                        <Text style={styles.previewTitle}>What to expect:</Text>
                        <Text style={styles.previewText}>• Mix of groundwork styles (natural horsemanship, classical, positive reinforcement)</Text>
                        <Text style={styles.previewText}>• Example lessons: "Leading respectfully", "Personal space boundaries", "Building trust through approach"</Text>
                        <Text style={styles.previewText}>• Great for beginners who want to discover their preferred style</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.preferenceOption,
                      formData.methodPreference === 'blend' && styles.preferenceOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, methodPreference: 'blend', selectedMethods: [] });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.preferenceIcon}>🎨</Text>
                    <Text style={[styles.preferenceLabel, formData.methodPreference === 'blend' && styles.preferenceLabelSelected]}>
                      Blend Methods
                    </Text>
                    <Text style={[styles.preferenceDesc, formData.methodPreference === 'blend' && styles.preferenceDescSelected]}>
                      Combine techniques from multiple methods I'm interested in
                    </Text>
                    {formData.methodPreference === 'blend' && (
                      <View style={[styles.previewBox, { backgroundColor: colors.accent[50], borderColor: colors.accent[200] }]}>
                        <Text style={styles.previewTitle}>What to expect:</Text>
                        <Text style={styles.previewText}>• Techniques from 2-4 methods you select below</Text>
                        <Text style={styles.previewText}>• Example: Parelli's "Seven Games" combined with clicker training principles</Text>
                        <Text style={styles.previewText}>• Best for riders familiar with specific methods who want a custom blend</Text>
                      </View>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.preferenceOption,
                      formData.methodPreference === 'single' && styles.preferenceOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, methodPreference: 'single', selectedMethods: [] });
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.preferenceIcon}>🎯</Text>
                    <Text style={[styles.preferenceLabel, formData.methodPreference === 'single' && styles.preferenceLabelSelected]}>
                      Focus on One Method
                    </Text>
                    <Text style={[styles.preferenceDesc, formData.methodPreference === 'single' && styles.preferenceDescSelected]}>
                      I want to focus on a specific training method
                    </Text>
                    {formData.methodPreference === 'single' && (
                      <View style={[styles.previewBox, { backgroundColor: colors.secondary[50], borderColor: colors.secondary[200] }]}>
                        <Text style={styles.previewTitle}>What to expect:</Text>
                        <Text style={styles.previewText}>• All lessons follow one method's philosophy and techniques</Text>
                        <Text style={styles.previewText}>• Example: If you choose Parelli, you'll learn the Seven Games progression</Text>
                        <Text style={styles.previewText}>• Best for riders committed to a specific method or preparing for certification</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </Card>

              {/* Method Selection (only show if not 'explore') */}
              {formData.methodPreference !== 'explore' && (
                <Card style={styles.methodSelectionCard}>
                  <Text style={styles.sectionLabel}>
                    {formData.methodPreference === 'blend' 
                      ? "Select methods you're interested in (pick 2-4):"
                      : 'Select your preferred method:'}
                  </Text>
                  
                  {loadingMethods ? (
                    <ActivityIndicator size="large" color={colors.primary[500]} style={styles.loadingSpinner} />
                  ) : methods.length === 0 ? (
                    <View style={styles.emptyMethodsContainer}>
                      <Text style={styles.errorText}>No training methods available.</Text>
                      {methodsError ? (
                        <Text style={styles.errorSubtext}>{methodsError}</Text>
                      ) : (
                        <Text style={styles.errorSubtext}>You can proceed without selecting methods, or try refreshing the page.</Text>
                      )}
                      <TouchableOpacity 
                        onPress={loadMethods}
                        style={styles.retryButton}
                      >
                        <Text style={styles.retryButtonText}>Retry Loading Methods</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.methodsByCategory}>
                      {Object.entries(
                        methods.reduce((acc: any, method: any) => {
                          const category = method.category || 'Other';
                          if (!acc[category]) acc[category] = [];
                          acc[category].push(method);
                          return acc;
                        }, {})
                      ).map(([category, categoryMethods]: [string, any]) => (
                        <View key={category} style={styles.methodCategory}>
                          <Text style={styles.categoryTitle}>{category}</Text>
                          <View style={styles.methodGrid}>
                            {categoryMethods.map((method: any) => {
                              const isSelected = formData.selectedMethods.includes(method.id);
                              // For 'blend', allow selection if less than 4 methods are selected
                              // For 'single', allow selection if no methods are selected (or if this one is already selected)
                              const canSelect = formData.methodPreference === 'blend' 
                                ? formData.selectedMethods.length < 4 
                                : formData.selectedMethods.length === 0 || isSelected;
                              
                              return (
                                <TouchableOpacity
                                  key={method.id}
                                  style={[
                                    styles.methodChip,
                                    isSelected && styles.methodChipSelected,
                                    !isSelected && !canSelect && styles.methodChipDisabled,
                                  ]}
                                  onPress={() => {
                                    if (formData.methodPreference === 'single') {
                                      // For single method, replace current selection with this one
                                      setFormData({ ...formData, selectedMethods: [method.id] });
                                    } else {
                                      // For blend, toggle selection
                                      if (isSelected) {
                                        // Deselect
                                        setFormData({ 
                                          ...formData, 
                                          selectedMethods: formData.selectedMethods.filter(id => id !== method.id) 
                                        });
                                      } else {
                                        // Select (we already checked canSelect, but add another check just in case)
                                        if (formData.selectedMethods.length < 4) {
                                          setFormData({ 
                                            ...formData, 
                                            selectedMethods: [...formData.selectedMethods, method.id] 
                                          });
                                        }
                                      }
                                    }
                                  }}
                                  disabled={!isSelected && !canSelect}
                                  activeOpacity={0.7}
                                >
                                  <Text style={[styles.methodChipText, isSelected && styles.methodChipTextSelected]}>
                                    {method.name}
                                  </Text>
                                </TouchableOpacity>
                              );
                            })}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </Card>
              )}
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
            {(() => {
              // Check if we're on the final step
              // If user owns horse: final step is 6 (TOTAL_STEPS)
              // If user doesn't own horse: final step is 6 (step 5 is skipped)
              const isFinalStep = step === 6 || (step === TOTAL_STEPS);
              
              return !isFinalStep ? (
                <Button
                  title="Next"
                  onPress={handleNext}
                  style={styles.nextButton}
                  fullWidth={step === 1}
                />
              ) : (
              <View>
                {planGenerationError && (
                  <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{planGenerationError}</Text>
                    <Button
                      title="Try Again"
                      onPress={() => handleSubmit(true)}
                      variant="outline"
                      style={styles.retryButton}
                    />
                  </View>
                )}
                {loading && loadingMessage && (
                  <View style={styles.loadingMessageContainer}>
                    <ActivityIndicator size="small" color={colors.primary[500]} style={{ marginRight: spacing.sm }} />
                    <Text style={styles.loadingMessageText}>{loadingMessage}</Text>
                  </View>
                )}
                <Button
                  title={loading ? 'Creating Your Plan...' : 'Generate My Training Plan →'}
                  onPress={() => handleSubmit(false)}
                  loading={loading}
                  disabled={loading}
                  style={styles.submitButton}
                  fullWidth
                />
              </View>
              );
            })()}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

// Option Card Component with Animations
function OptionCard({ 
  option, 
  isSelected, 
  onSelect 
}: { 
  option: { value: string; label: string; icon: string; description: string }; 
  isSelected: boolean; 
  onSelect: () => void;
}) {
  const scale = useSharedValue(1);
  const backgroundColor = useSharedValue(isSelected ? 1 : 0);

  useEffect(() => {
    backgroundColor.value = withTiming(isSelected ? 1 : 0, { duration: 200 });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => {
    const bgColor = interpolateColor(
      backgroundColor.value,
      [0, 1],
      ['#fafaf9', colors.primary[500]]
    );

    return {
      transform: [{ scale: scale.value }],
      backgroundColor: bgColor,
      borderColor: backgroundColor.value === 1 ? colors.primary[700] : colors.neutral[200], // Darker border for better contrast
      borderWidth: backgroundColor.value === 1 ? 3 : 2, // Thicker border when selected
    };
  });

  const textColorStyle = useAnimatedStyle(() => ({
    color: backgroundColor.value === 1 ? '#fafaf9' : colors.neutral[900],
  }));

  const descColorStyle = useAnimatedStyle(() => ({
    color: backgroundColor.value === 1 ? colors.primary[100] : colors.neutral[600],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Pressable
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View style={[styles.optionCard, animatedStyle]}>
        <View style={styles.iconContainer}>
          <Text style={styles.optionIcon}>{option.icon}</Text>
        </View>
        <Animated.Text style={[styles.optionLabel, textColorStyle]}>
          {option.label}
        </Animated.Text>
        <Animated.Text style={[styles.optionDescription, descColorStyle]}>
          {option.description}
        </Animated.Text>
        {isSelected && (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'transparent',
  },
  headerBackButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  headerBackButtonText: {
    ...typography.body,
    color: colors.primary[700],
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
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
    fontSize: 16, // Ensure minimum 16px
    color: colors.neutral[600],
    marginBottom: spacing.lg,
    lineHeight: 24,
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
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingVertical: spacing.lg + 4,
    minHeight: 100, // Better touch target for option cards
    borderWidth: 2,
    alignItems: 'center',
    ...shadows.sm,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  optionIcon: {
    fontSize: 32,
  },
  optionLabel: {
    ...typography.h4,
    fontSize: 18, // Ensure readable size
    marginBottom: spacing.xs,
    fontWeight: typography.weights.semibold,
  },
  optionDescription: {
    ...typography.bodySmall,
    fontSize: 15, // Slightly larger for better readability
    textAlign: 'center',
    lineHeight: 20,
  },
  checkmark: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.sm,
  },
  checkmarkText: {
    color: colors.primary[500],
    fontWeight: typography.weights.bold,
    fontSize: 18,
  },
  timeCard: {
    padding: spacing.lg,
  },
  sectionLabel: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
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
    minHeight: 44, // Minimum touch target
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[700], // Darker for better contrast
    borderWidth: 3,
    ...shadows.sm,
  },
  timeOptionText: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
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
    paddingVertical: spacing.sm, // Extra padding for better touch target
    minHeight: 44, // Minimum touch target
  },
  toggleLabel: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
    fontWeight: '600',
    color: colors.neutral[900],
    flex: 1,
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
    backgroundColor: colors.primary[600], // Darker for better contrast
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
  followUpSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  followUpTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
  },
  timeGapOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  timeGapButton: {
    flex: 1,
    minWidth: 100,
    minHeight: 44, // Minimum touch target
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeGapSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[700], // Darker for better contrast
    borderWidth: 3,
    ...shadows.sm,
  },
  timeGapText: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
    fontWeight: '500',
    color: colors.neutral[900],
  },
  timeGapTextSelected: {
    color: colors.neutral[50],
  },
  infoBox: {
    backgroundColor: colors.secondary[50],
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary[500],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
  },
  infoTitle: {
    ...typography.bodySmall,
    fontWeight: typography.weights.semibold,
    color: colors.secondary[700],
    marginBottom: spacing.xs,
  },
  infoText: {
    ...typography.bodySmall,
    color: colors.secondary[800],
    lineHeight: typography.bodySmall.lineHeight,
  },
  horseProfileSection: {
    marginTop: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    flex: 1,
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  skipButtonText: {
    ...typography.bodySmall,
    color: colors.primary[500],
    fontWeight: '600',
  },
  optionalNote: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginBottom: spacing.md,
  },
  optionalTag: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    fontStyle: 'italic',
    fontWeight: '400',
  },
  ageButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  ageButton: {
    flex: 1,
    minWidth: 80,
    minHeight: 44, // Minimum touch target size
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4, // Extra vertical padding for better touch target
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  ageButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  ageButtonText: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px for readability
    fontWeight: '500',
    color: colors.neutral[900],
  },
  ageButtonTextSelected: {
    color: colors.neutral[50],
  },
  temperamentOptions: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tempButton: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4, // Better touch target
    minHeight: 60, // Minimum touch target for cards
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  tempButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[700], // Darker border for better contrast
    borderWidth: 3, // Thicker border when selected
    ...shadows.md, // Add shadow for better visibility
  },
  tempLabel: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  tempLabelSelected: {
    fontSize: 16,
    color: colors.neutral[50],
  },
  tempDesc: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
  tempDescSelected: {
    color: colors.neutral[100],
  },
  warningBox: {
    backgroundColor: colors.info + '20',
    borderLeftWidth: 4,
    borderLeftColor: colors.info,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
  },
  warningBoxCritical: {
    backgroundColor: colors.warning + '20',
    borderLeftColor: colors.warning,
  },
  warningIcon: {
    fontSize: typography.h4.fontSize,
    marginRight: spacing.sm,
  },
  warningContent: {
    flex: 1,
  },
  warningText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    lineHeight: typography.bodySmall.lineHeight,
  },
  radioGroup: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    minHeight: 44, // Minimum touch target
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  radioSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[700], // Darker for better contrast
    borderWidth: 3,
    ...shadows.sm,
  },
  radioButtonText: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
    color: colors.neutral[900],
  },
  radioButtonTextSelected: {
    color: colors.neutral[50],
  },
  checkboxGroup: {
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    minHeight: 44, // Minimum touch target
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  checkboxItemSelected: {
    backgroundColor: colors.primary[100], // More visible than 50
    borderColor: colors.primary[500], // Stronger border
    borderWidth: 2.5,
  },
  checkboxIcon: {
    fontSize: typography.body.fontSize,
    marginRight: spacing.sm,
    color: colors.primary[600],
  },
  checkboxText: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
    color: colors.neutral[900],
    flex: 1,
  },
  checkboxTextSelected: {
    color: colors.primary[800],
  },
  noHorseSection: {
    marginTop: spacing.md,
  },
  noHorseTitle: {
    ...typography.h4,
    color: colors.neutral[900],
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  noHorseOptions: {
    gap: spacing.md,
  },
  optButton: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    paddingVertical: spacing.md + 4,
    minHeight: 60, // Better touch target for option cards
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  optButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[700], // Darker for better contrast
    borderWidth: 3,
    ...shadows.md,
  },
  optLabel: {
    ...typography.body,
    fontSize: 16, // Ensure minimum 16px
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  optLabelSelected: {
    color: colors.neutral[50],
  },
  optDesc: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
  optDescSelected: {
    color: colors.neutral[100],
  },
  sectionHeader: {
    ...typography.h3,
    color: colors.neutral[900],
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  formLabel: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  formHelperText: {
    ...typography.bodySmall,
    color: colors.neutral[500],
    fontStyle: 'italic',
    marginBottom: spacing.sm,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  sexOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sexChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  sexChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  sexChipText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    textTransform: 'capitalize',
  },
  sexChipTextSelected: {
    color: colors.neutral[50],
  },
  temperamentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  temperamentChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
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
  energyLevelRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  energyLevelOption: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  energyLevelOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  energyLevelText: {
    ...typography.body,
    fontWeight: '500',
    color: colors.neutral[900],
  },
  energyLevelTextSelected: {
    color: colors.neutral[50],
  },
  methodPreferenceCard: {
    marginBottom: spacing.lg,
  },
  preferenceOptions: {
    gap: spacing.md,
  },
  preferenceOption: {
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    paddingVertical: spacing.lg + 4,
    minHeight: 80, // Better touch target for preference cards
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  preferenceOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[800], // Much darker for better contrast
    borderWidth: 3,
    ...shadows.lg, // Stronger shadow when selected
  },
  preferenceIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  preferenceLabel: {
    ...typography.h4,
    fontSize: 18, // Ensure readable size
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    fontWeight: typography.weights.semibold,
  },
  preferenceLabelSelected: {
    color: colors.neutral[50],
  },
  preferenceDesc: {
    ...typography.bodySmall,
    fontSize: 15, // Slightly larger for better readability
    color: colors.neutral[600],
    lineHeight: 20,
  },
  preferenceDescSelected: {
    color: colors.primary[100],
  },
  previewBox: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
  },
  previewTitle: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  previewText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    marginBottom: spacing.xs / 2,
    lineHeight: 20,
  },
  methodSelectionCard: {
    marginTop: spacing.md,
  },
  methodsByCategory: {
    gap: spacing.lg,
  },
  methodCategory: {
    marginBottom: spacing.md,
  },
  categoryTitle: {
    ...typography.h4,
    color: colors.neutral[700],
    marginBottom: spacing.sm,
    fontWeight: typography.weights.semibold,
  },
  methodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  methodChip: {
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 4,
    minHeight: 44, // Minimum touch target
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[700], // Darker for better contrast
    borderWidth: 3,
    ...shadows.sm,
  },
  methodChipDisabled: {
    opacity: 0.5,
  },
  methodChipText: {
    ...typography.bodySmall,
    fontSize: 15, // Slightly larger for better readability
    color: colors.neutral[700],
  },
  methodChipTextSelected: {
    color: colors.neutral[50],
    fontWeight: typography.weights.semibold,
  },
  loadingSpinner: {
    padding: spacing.xl,
  },
  emptyMethodsContainer: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  errorSubtext: {
    ...typography.bodySmall,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary[500],
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    ...typography.body,
    color: colors.surface,
    fontWeight: '600',
  },
  safetyNote: {
    ...typography.bodySmall,
    color: colors.warning,
    marginBottom: spacing.md,
    fontStyle: 'italic',
    backgroundColor: colors.warning + '20',
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
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
  errorContainer: {
    backgroundColor: colors.errorBg,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  loadingMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[50],
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  loadingMessageText: {
    ...typography.bodySmall,
    color: colors.primary[700],
    flex: 1,
  },
});
