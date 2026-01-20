import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Polyline, Rect, Line } from 'react-native-svg';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { ScreenBackground } from '../components/ui/ScreenBackground';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
  }>({});
  const router = useRouter();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = (pwd: string): number => {
    let strength = 0;
    if (pwd.length >= 8) strength++;
    if (pwd.match(/[a-z]/) && pwd.match(/[A-Z]/)) strength++;
    if (pwd.match(/\d/)) strength++;
    if (pwd.match(/[^a-zA-Z\d]/)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(password);

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

  const handleGoogleSignIn = async () => {
    Alert.alert('Coming Soon', 'Google sign-in will be available soon.');
  };

  const handleAppleSignIn = async () => {
    Alert.alert('Coming Soon', 'Apple sign-in will be available soon.');
  };

  return (
    <ScreenBackground variant="plain">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        {/* Top Nav - Mobile */}
        <View style={styles.topNav}>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.offWhite} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </Pressable>
          <Text style={styles.navTitle}>Create Account</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Brand Header */}
            <View style={styles.brandHeader}>
              <View style={styles.logoContainer}>
                <Svg width={56} height={56} viewBox="0 0 56 56" style={styles.logoMark}>
                  <Path
                    d="M28 8C17 8 10 16 10 26C10 32 12 37 16 40C16 40 18 42 18 44C18 46 16 48 16 48"
                    stroke={colors.deepInk}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <Path
                    d="M28 8C39 8 46 16 46 26C46 36 40 44 32 46"
                    stroke={colors.deepInk}
                    strokeWidth="3"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <Circle cx={32} cy={46} r={2} fill={colors.turquoise} />
                </Svg>
              </View>
              <Text style={styles.pageTitle}>Create your account</Text>
              <Text style={styles.pageSubtitle}>Start your training journey today</Text>
            </View>

            {/* Benefits Card - Mobile */}
            <View style={styles.benefitsCard}>
              <View style={styles.benefitItem}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Polyline points="20 6 9 17 4 12" />
                </Svg>
                <Text style={styles.benefitText}>Step-by-step training plans</Text>
              </View>
              <View style={styles.benefitItem}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Polyline points="20 6 9 17 4 12" />
                </Svg>
                <Text style={styles.benefitText}>AI coaching for every lesson</Text>
              </View>
              <View style={styles.benefitItem}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <Polyline points="20 6 9 17 4 12" />
                </Svg>
                <Text style={styles.benefitText}>Track your progress and milestones</Text>
              </View>
            </View>

            {/* Signup Card */}
            <View style={styles.signupCard}>
              <View style={styles.form}>
                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Your Name</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.midGray} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <Circle cx="12" cy="7" r="4" />
                      </Svg>
                    </View>
                    <TextInput
                      style={[styles.formInput, styles.formInputWithIcon, errors.name && styles.inputError]}
                      placeholder="What should we call you?"
                      placeholderTextColor={colors.midGray}
                      value={name}
                      onChangeText={(text) => {
                        setName(text);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      autoCapitalize="words"
                      autoComplete="name"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                  {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Email</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.midGray} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <Rect x="2" y="4" width="20" height="16" rx="2" />
                        <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </Svg>
                    </View>
                    <TextInput
                      style={[styles.formInput, styles.formInputWithIcon, errors.email && styles.inputError]}
                      placeholder="you@example.com"
                      placeholderTextColor={colors.midGray}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect={false}
                      editable={!loading}
                    />
                  </View>
                  {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.midGray} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </Svg>
                    </View>
                    <TextInput
                      style={[styles.formInput, styles.formInputWithIcon, styles.formInputWithToggle, errors.password && styles.inputError]}
                      placeholder="Create a password"
                      placeholderTextColor={colors.midGray}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (errors.password) setErrors({ ...errors, password: undefined });
                      }}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <Pressable
                      style={styles.passwordToggle}
                      onPress={() => setShowPassword(!showPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.midGray} strokeWidth="1.75">
                        {showPassword ? (
                          <>
                            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                          </>
                        ) : (
                          <>
                            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                            <Circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </>
                        )}
                      </Svg>
                    </Pressable>
                  </View>
                  <View style={styles.passwordStrength}>
                    {[0, 1, 2, 3].map((index) => {
                      let barStyle = styles.strengthBar;
                      if (index < passwordStrength) {
                        if (passwordStrength === 1) {
                          barStyle = [styles.strengthBar, styles.strengthBarWeak];
                        } else if (passwordStrength === 2) {
                          barStyle = [styles.strengthBar, styles.strengthBarMedium];
                        } else {
                          barStyle = [styles.strengthBar, styles.strengthBarStrong];
                        }
                      }
                      return <View key={index} style={barStyle} />;
                    })}
                  </View>
                  {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <View style={styles.inputIcon}>
                      <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={colors.midGray} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                        <Rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </Svg>
                    </View>
                    <TextInput
                      style={[styles.formInput, styles.formInputWithIcon, styles.formInputWithToggle, errors.confirmPassword && styles.inputError]}
                      placeholder="Re-enter your password"
                      placeholderTextColor={colors.midGray}
                      value={confirmPassword}
                      onChangeText={(text) => {
                        setConfirmPassword(text);
                        if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
                      }}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoComplete="new-password"
                      autoCorrect={false}
                      editable={!loading}
                    />
                    <Pressable
                      style={styles.passwordToggle}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={colors.midGray} strokeWidth="1.75">
                        {showConfirmPassword ? (
                          <>
                            <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                            <Path d="M1 1l22 22" strokeLinecap="round" strokeLinejoin="round" />
                          </>
                        ) : (
                          <>
                            <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                            <Circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
                          </>
                        )}
                      </Svg>
                    </Pressable>
                  </View>
                  {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
                </View>

                <View style={styles.checkboxWrapper}>
                  <Pressable
                    style={[styles.checkboxInput, acceptedTerms && styles.checkboxInputChecked]}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    accessible={true}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: acceptedTerms }}
                    accessibilityLabel="Accept terms and conditions"
                  >
                    {acceptedTerms && (
                      <Svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke={colors.offWhite} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <Polyline points="20 6 9 17 4 12" />
                      </Svg>
                    )}
                  </Pressable>
                  <Pressable
                    style={styles.checkboxLabel}
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                  >
                    <Text style={styles.checkboxLabelText}>
                      I agree to the{' '}
                      <Text style={styles.checkboxLink}>Terms and Conditions</Text>
                      {' '}and{' '}
                      <Text style={styles.checkboxLink}>Privacy Policy</Text>
                    </Text>
                  </Pressable>
                </View>
                {errors.terms && <Text style={styles.errorText}>{errors.terms}</Text>}

                <Pressable
                  style={[styles.btnPrimary, (loading || !acceptedTerms) && styles.btnPrimaryDisabled]}
                  onPress={handleSignup}
                  disabled={loading || !acceptedTerms}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="Create Account"
                >
                  {loading ? (
                    <ActivityIndicator color={colors.offWhite} size="small" />
                  ) : (
                    <Text style={styles.btnPrimaryText}>Create Account</Text>
                  )}
                </Pressable>

                {/* Divider */}
                <View style={styles.divider}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or</Text>
                  <View style={styles.dividerLine} />
                </View>

                {/* SSO Buttons */}
                <View style={styles.ssoButtons}>
                  <Pressable
                    style={styles.btnSecondary}
                    onPress={handleGoogleSignIn}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Google"
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <Path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <Path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <Path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </Svg>
                    <Text style={styles.btnSecondaryText}>Continue with Google</Text>
                  </Pressable>

                  <Pressable
                    style={styles.btnSecondary}
                    onPress={handleAppleSignIn}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityLabel="Continue with Apple"
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24">
                      <Path
                        d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"
                        fill="#000"
                      />
                    </Svg>
                    <Text style={styles.btnSecondaryText}>Continue with Apple</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.signupFooter}>
              <Text style={styles.footerText}>
                Already have an account?{' '}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/login')}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessible={true}
                  accessibilityRole="link"
                >
                  <View style={styles.footerLinkContainer}>
                    <Text style={styles.footerLink}>Sign in</Text>
                    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke={colors.deepInk} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <Path d="M5 12h14M12 5l7 7-7 7" />
                    </Svg>
                  </View>
                </TouchableOpacity>
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topNav: {
    backgroundColor: colors.deepInk,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.base,
    zIndex: 100,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.sm,
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing['3xl'],
    paddingTop: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  logoContainer: {
    marginBottom: spacing.base,
  },
  logoMark: {
    width: 56,
    height: 56,
  },
  pageTitle: {
    ...typography.h2,
    fontSize: 24,
    fontWeight: '700',
    color: colors.deepInk,
    marginBottom: spacing.sm,
    textAlign: 'center',
    lineHeight: 31.2, // 1.3 * 24
  },
  pageSubtitle: {
    ...typography.body,
    fontSize: 15,
    color: colors.slate,
    textAlign: 'center',
    lineHeight: 22.5, // 1.5 * 15
  },
  benefitsCard: {
    backgroundColor: colors.bone,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  benefitText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.deepInk,
    fontWeight: '500',
    lineHeight: 21, // 1.5 * 14
    flex: 1,
  },
  signupCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.md,
    marginBottom: spacing['2xl'],
  },
  form: {
    width: '100%',
  },
  formGroup: {
    marginBottom: spacing.lg,
  },
  formLabel: {
    ...typography.label,
    fontSize: 14,
    fontWeight: '600',
    color: colors.deepInk,
    marginBottom: spacing.sm,
    lineHeight: 19.6, // 1.4 * 14
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: spacing.base,
    top: '50%',
    transform: [{ translateY: -9 }],
    zIndex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formInput: {
    ...typography.body,
    fontSize: 16,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.offWhite,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    color: colors.deepInk,
    minHeight: 44,
  },
  formInputWithIcon: {
    paddingLeft: 44,
  },
  formInputWithToggle: {
    paddingRight: 48,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...typography.bodySmall,
    fontSize: 12,
    color: colors.error,
    marginTop: spacing.xs,
  },
  passwordToggle: {
    position: 'absolute',
    right: spacing.md,
    top: '50%',
    transform: [{ translateY: -10 }],
    padding: spacing.xs,
    borderRadius: borderRadius.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passwordStrength: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  strengthBar: {
    flex: 1,
    height: 3,
    backgroundColor: colors.borderWarm,
    borderRadius: 2,
  },
  strengthBarWeak: {
    backgroundColor: colors.error,
  },
  strengthBarMedium: {
    backgroundColor: colors.warning,
  },
  strengthBarStrong: {
    backgroundColor: colors.success,
  },
  checkboxWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  checkboxInput: {
    width: 20,
    height: 20,
    minWidth: 20,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: 6,
    backgroundColor: colors.offWhite,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxInputChecked: {
    backgroundColor: colors.deepInk,
    borderColor: colors.deepInk,
  },
  checkboxLabel: {
    flex: 1,
    marginTop: 0,
  },
  checkboxLabelText: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.slate,
    lineHeight: 21, // 1.5 * 14
  },
  checkboxLink: {
    color: colors.deepInk,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: spacing.base,
    backgroundColor: colors.deepInk,
    borderRadius: borderRadius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryDisabled: {
    opacity: 0.5,
  },
  btnPrimaryText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.xl,
    gap: spacing.base,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderWarm,
  },
  dividerText: {
    fontSize: 12,
    color: colors.midGray,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '500',
  },
  ssoButtons: {
    gap: spacing.md,
  },
  btnSecondary: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.borderWarm,
    borderRadius: borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    minHeight: 48,
  },
  btnSecondaryText: {
    ...typography.body,
    fontSize: 15,
    fontWeight: '500',
    color: colors.deepInk,
  },
  signupFooter: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    fontSize: 15,
    color: colors.slate,
    lineHeight: 22.5, // 1.5 * 15
    textAlign: 'center',
  },
  footerLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  footerLink: {
    color: colors.deepInk,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});