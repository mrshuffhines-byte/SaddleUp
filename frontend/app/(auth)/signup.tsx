import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Animated,
  TouchableOpacity,
  CheckBox,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Input, Button } from '../../components/ui';
import Card from '../../components/ui/Card';

interface PasswordStrength {
  level: 'weak' | 'medium' | 'strong';
  score: number;
}

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const [validatedFields, setValidatedFields] = useState<{
    name: boolean;
    email: boolean;
    password: boolean;
  }>({ name: false, email: false, password: false });
  const router = useRouter();
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const calculatePasswordStrength = (pwd: string): PasswordStrength => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score++;
    if (/\d/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 2) return { level: 'weak', score };
    if (score <= 4) return { level: 'medium', score };
    return { level: 'strong', score };
  };

  const passwordStrength = password ? calculatePasswordStrength(password) : null;

  const handleNameChange = (text: string) => {
    setName(text);
    if (errors.name) setErrors({ ...errors, name: undefined });
    setValidatedFields({ ...validatedFields, name: text.trim().length > 0 });
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    if (errors.email) setErrors({ ...errors, email: undefined });
    const isValid = validateEmail(text);
    setValidatedFields({ ...validatedFields, email: isValid });
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    if (errors.password) setErrors({ ...errors, password: undefined });
    if (errors.confirmPassword && confirmPassword) {
      setErrors({ ...errors, confirmPassword: text === confirmPassword ? undefined : 'Passwords do not match' });
    }
    setValidatedFields({ ...validatedFields, password: text.length >= 8 });
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    if (errors.confirmPassword) {
      setErrors({ ...errors, confirmPassword: text === password ? undefined : 'Passwords do not match' });
    }
  };

  const handleSignup = async () => {
    const newErrors: typeof errors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!acceptedTerms) {
      newErrors.terms = 'Please accept the terms and conditions';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create account');
      }

      const { token, user } = await response.json();
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      router.replace('/onboarding');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create account');
      if (error.message.includes('email')) {
        setErrors({ email: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (!passwordStrength) return colors.neutral[200];
    switch (passwordStrength.level) {
      case 'weak':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'strong':
        return colors.success;
      default:
        return colors.neutral[200];
    }
  };

  const getPasswordStrengthLabel = () => {
    if (!passwordStrength) return '';
    switch (passwordStrength.level) {
      case 'weak':
        return 'Weak';
      case 'medium':
        return 'Medium';
      case 'strong':
        return 'Strong';
      default:
        return '';
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
          {/* Logo/Icon */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🐴</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Create Your Account</Text>
          <Text style={styles.subtitle}>
            Start your personalized horse training journey today
          </Text>

          {/* Benefits List */}
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Custom AI-powered training plans</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Expert guidance for every lesson</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitIcon}>✓</Text>
              <Text style={styles.benefitText}>Track your progress and milestones</Text>
            </View>
          </View>

          <Card style={styles.formCard}>
            <Input
              label="Your Name"
              placeholder="What should we call you?"
              value={name}
              onChangeText={handleNameChange}
              icon="👤"
              error={errors.name}
              containerStyle={styles.inputContainer}
              autoCapitalize="words"
            />
            {validatedFields.name && (
              <View style={styles.validationCheck}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}

            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={handleEmailChange}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              icon="📧"
              error={errors.email}
              containerStyle={styles.inputContainer}
            />
            {validatedFields.email && (
              <View style={styles.validationCheck}>
                <Text style={styles.checkIcon}>✓</Text>
              </View>
            )}

            <View style={styles.passwordContainer}>
              <Input
                label="Password"
                placeholder="Create a password"
                value={password}
                onChangeText={handlePasswordChange}
                secureTextEntry={!showPassword}
                icon="🔒"
                error={errors.password}
                containerStyle={styles.inputContainer}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                }
              />
              {validatedFields.password && (
                <View style={styles.validationCheck}>
                  <Text style={styles.checkIcon}>✓</Text>
                </View>
              )}
            </View>

            {/* Password Strength Indicator */}
            {password && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${(passwordStrength?.score || 0) * 20}%`,
                        backgroundColor: getPasswordStrengthColor(),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.passwordStrengthLabel, { color: getPasswordStrengthColor() }]}>
                  {getPasswordStrengthLabel()}
                </Text>
              </View>
            )}

            <View style={styles.passwordContainer}>
              <Input
                label="Confirm Password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                secureTextEntry={!showConfirmPassword}
                icon="🔒"
                error={errors.confirmPassword}
                containerStyle={styles.inputContainer}
                rightIcon={
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Text style={styles.eyeIconText}>{showConfirmPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                }
              />
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => {
                setAcceptedTerms(!acceptedTerms);
                if (errors.terms) setErrors({ ...errors, terms: undefined });
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, acceptedTerms && styles.checkboxChecked]}>
                {acceptedTerms && <Text style={styles.checkboxIcon}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                I agree to the Terms and Conditions and Privacy Policy
              </Text>
            </TouchableOpacity>
            {errors.terms && (
              <Text style={styles.errorText}>{errors.terms}</Text>
            )}

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={loading}
              style={styles.button}
              fullWidth
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign in →</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[50],
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 64,
  },
  title: {
    ...typography.h1,
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.body.lineHeight,
  },
  benefitsList: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  benefitIcon: {
    fontSize: 18,
    color: colors.primary[700],
    marginRight: spacing.sm,
  },
  benefitText: {
    ...typography.bodySmall,
    color: colors.neutral[800],
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    padding: spacing.xs,
  },
  eyeIconText: {
    fontSize: 20,
  },
  validationCheck: {
    position: 'absolute',
    right: spacing.md + 32,
    top: 40,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    backgroundColor: colors.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    color: colors.neutral[50],
    fontSize: 14,
    fontWeight: '700',
  },
  passwordStrengthContainer: {
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: borderRadius.sm,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: borderRadius.sm,
  },
  passwordStrengthLabel: {
    ...typography.caption,
    fontWeight: '600',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: borderRadius.sm,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  checkboxIcon: {
    color: colors.neutral[50],
    fontSize: 14,
    fontWeight: '700',
  },
  termsText: {
    ...typography.bodySmall,
    color: colors.neutral[700],
    flex: 1,
    lineHeight: typography.bodySmall.lineHeight,
  },
  errorText: {
    ...typography.caption,
    color: colors.error,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginText: {
    ...typography.body,
    color: colors.neutral[600],
  },
  loginLink: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
