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

const TOTAL_STEPS = 5;

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

  useEffect(() => {
    // Load methods when component mounts (for step 5)
    loadMethods();
  }, []);

  const loadMethods = async () => {
    try {
      setLoadingMethods(true);
      const response = await fetch(`${API_URL}/api/methods`);
      if (response.ok) {
        const data = await response.json();
        setMethods(data);
      }
    } catch (error) {
      console.error('Failed to load methods:', error);
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
    if (step === 4 && formData.ownsHorse && !formData.horseName.trim()) {
      Alert.alert('Horse name required', 'Please enter your horse\'s name');
      return;
    }
    if (step === 5 && formData.methodPreference !== 'explore' && formData.selectedMethods.length === 0) {
      Alert.alert('Please select', 'Please select at least one horsemanship method');
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

  const toggleIssue = (issue: string) => {
    setFormData({
      ...formData,
      horseIssues: formData.horseIssues.includes(issue)
        ? formData.horseIssues.filter(i => i !== issue)
        : [...formData.horseIssues, issue],
    });
  };

  const handleSubmit = async () => {
    // Validate horse name if ownsHorse is true
    if (formData.ownsHorse && !formData.horseName.trim()) {
      Alert.alert('Horse name required', 'Please enter your horse\'s name');
      return;
    }

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
        throw new Error('Failed to save profile');
      }

      let horseId = null;

      // Create horse profile if user owns a horse
      if (formData.ownsHorse && formData.horseName.trim()) {
        const horseData: any = {
          name: formData.horseName.trim(),
        };

        if (formData.horseBreed?.trim()) horseData.breed = formData.horseBreed.trim();
        if (formData.horseAge) horseData.age = formData.horseAge;
        if (formData.horseSex) horseData.sex = formData.horseSex;
        if (formData.horseTemperament) {
          // Store temperament as array for consistency with schema
          horseData.temperament = [formData.horseTemperament];
        }
        if (formData.horseTrained) {
          horseData.isProfessionallyTrained = formData.horseTrained === 'Yes';
        }
        if (formData.horseIssues.length > 0) {
          // Filter out "None that I know of" if other issues are selected
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
          throw new Error('Failed to create horse profile');
        }

        const horse = await horseResponse.json();
        horseId = horse.id;
      }

      // Generate training plan with horse ID if available
      const planResponse = await fetch(`${API_URL}/api/training/generate-plan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...(horseId && { horseIds: [horseId] }),
        }),
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
    <ScreenBackground variant="default">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
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
                  <View style={styles.horseProfileSection}>
                    <Text style={styles.sectionTitle}>Tell us about your horse</Text>
                    
                    <Input
                      label="Horse's Name *"
                      placeholder="What's your horse's name?"
                      value={formData.horseName}
                      onChangeText={(text) => setFormData({ ...formData, horseName: text })}
                      containerStyle={styles.inputContainer}
                    />

                    <Text style={styles.formLabel}>Horse's age</Text>
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

                    <Text style={styles.formLabel}>How would you describe your horse's temperament?</Text>
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

                    <Text style={styles.formLabel}>Has this horse been professionally trained?</Text>
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

                    <Text style={styles.formLabel}>Does your horse have any known issues? (Select all that apply)</Text>
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

          {/* Step 5: Horsemanship Method Selection */}
          {step === 5 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>What horsemanship approach interests you?</Text>
              <Text style={styles.stepSubtitle}>
                We'll blend methods to create the best training for you and your horse
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
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.preferenceOption,
                      formData.methodPreference === 'blend' && styles.preferenceOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, methodPreference: 'blend' });
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
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.preferenceOption,
                      formData.methodPreference === 'single' && styles.preferenceOptionSelected,
                    ]}
                    onPress={() => {
                      setFormData({ ...formData, methodPreference: 'single' });
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
                  ) : (
                    <View style={styles.methodsByCategory}>
                      {Object.entries(
                        methods.reduce((acc: any, method: any) => {
                          if (!acc[method.category]) acc[method.category] = [];
                          acc[method.category].push(method);
                          return acc;
                        }, {})
                      ).map(([category, categoryMethods]: [string, any]) => (
                        <View key={category} style={styles.methodCategory}>
                          <Text style={styles.categoryTitle}>{category}</Text>
                          <View style={styles.methodGrid}>
                            {categoryMethods.map((method: any) => {
                              const isSelected = formData.selectedMethods.includes(method.id);
                              const canSelect = formData.methodPreference === 'blend' 
                                ? formData.selectedMethods.length < 4 
                                : formData.selectedMethods.length === 0;
                              
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
                                      setFormData({ ...formData, selectedMethods: [method.id] });
                                    } else {
                                      if (isSelected) {
                                        setFormData({ 
                                          ...formData, 
                                          selectedMethods: formData.selectedMethods.filter(id => id !== method.id) 
                                        });
                                      } else if (canSelect) {
                                        setFormData({ 
                                          ...formData, 
                                          selectedMethods: [...formData.selectedMethods, method.id] 
                                        });
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
      borderColor: backgroundColor.value === 1 ? colors.primary[600] : colors.neutral[200],
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
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
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
    marginBottom: spacing.xs,
    fontWeight: typography.weights.semibold,
  },
  optionDescription: {
    ...typography.bodySmall,
    textAlign: 'center',
    lineHeight: typography.bodySmall.lineHeight,
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
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  timeGapSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  timeGapText: {
    ...typography.body,
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
  sectionTitle: {
    ...typography.h3,
    color: colors.neutral[900],
    marginBottom: spacing.md,
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
    backgroundColor: colors.neutral[50],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  ageButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  ageButtonText: {
    ...typography.body,
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
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  tempButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  tempLabel: {
    ...typography.body,
    fontWeight: typography.weights.semibold,
    color: colors.neutral[900],
    marginBottom: spacing.xs / 2,
  },
  tempLabelSelected: {
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
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  radioSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  radioButtonText: {
    ...typography.body,
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
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  checkboxItemSelected: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[300],
  },
  checkboxIcon: {
    fontSize: typography.body.fontSize,
    marginRight: spacing.sm,
    color: colors.primary[600],
  },
  checkboxText: {
    ...typography.body,
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
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  optButtonSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  optLabel: {
    ...typography.body,
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
    borderWidth: 2,
    borderColor: colors.neutral[200],
    ...shadows.sm,
  },
  preferenceOptionSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
    ...shadows.md,
  },
  preferenceIcon: {
    fontSize: 32,
    marginBottom: spacing.sm,
  },
  preferenceLabel: {
    ...typography.h4,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
    fontWeight: typography.weights.semibold,
  },
  preferenceLabelSelected: {
    color: colors.neutral[50],
  },
  preferenceDesc: {
    ...typography.bodySmall,
    color: colors.neutral[600],
  },
  preferenceDescSelected: {
    color: colors.primary[100],
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  methodChipSelected: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[600],
  },
  methodChipDisabled: {
    opacity: 0.5,
  },
  methodChipText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
  },
  methodChipTextSelected: {
    color: colors.neutral[50],
    fontWeight: typography.weights.semibold,
  },
  loadingSpinner: {
    padding: spacing.xl,
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
});
