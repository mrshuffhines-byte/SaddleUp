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
  useWindowDimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Svg, { Path, Circle, Polyline, Rect, Line } from 'react-native-svg';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { ScreenBackground } from '../components/ui/ScreenBackground';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 900;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    setErrors({});
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    if (!password) {
      setErrors({ password: 'Password is required' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Network error' }));
        throw new Error(error.error || 'Login failed');
      }

      const { token, user } = await response.json();
      await AsyncStorage.setItem('authToken', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));

      if (!user.profile) {
        router.replace('/onboarding');
      } else {
        router.replace('/(tabs)/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection and ensure the backend is running.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
      
      if (errorMessage.toLowerCase().includes('password')) {
        setErrors({ password: errorMessage });
      } else if (errorMessage.toLowerCase().includes('email')) {
        setErrors({ email: errorMessage });
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
      <View style={styles.container}>
        {isDesktop && (
          <View style={styles.desktopLayout}>
            <View style={styles.desktopContent}>
              <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardView}
              >
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
                      <Text style={styles.brandName}>Rein</Text>
                    </View>

                    {/* Auth Card */}
                    <View style={styles.authCard}>
                      <View style={styles.cardHeader}>
                        <View style={styles.accentBar} />
                        <Text style={styles.cardTitle}>Welcome back</Text>
                        <Text style={styles.cardSubtitle}>Sign in to continue your training</Text>
                      </View>

                      <View style={styles.form}>
                        <View style={styles.formGroup}>
                          <Text style={styles.formLabel}>Email</Text>
                          <View style={styles.inputWrapper}>
                            <TextInput
                              style={[styles.formInput, errors.email && styles.inputError]}
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
                            <TextInput
                              style={[styles.formInput, styles.formInputWithToggle, errors.password && styles.inputError]}
                              placeholder="Enter your password"
                              placeholderTextColor={colors.midGray}
                              value={password}
                              onChangeText={(text) => {
                                setPassword(text);
                                if (errors.password) setErrors({ ...errors, password: undefined });
                              }}
                              secureTextEntry={!showPassword}
                              autoCapitalize="none"
                              autoComplete="password"
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
                          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                        </View>

                        <View style={styles.forgotWrapper}>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert('Forgot Password', 'Please contact support or try logging in again.');
                            }}
                            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                            accessible={true}
                            accessibilityRole="button"
                          >
                            <Text style={styles.forgotLink}>Forgot password?</Text>
                          </TouchableOpacity>
                        </View>

                        <Pressable
                          style={[styles.btnPrimary, (loading || !email || !password) && styles.btnPrimaryDisabled]}
                          onPress={handleLogin}
                          disabled={loading || !email || !password}
                          accessible={true}
                          accessibilityRole="button"
                          accessibilityLabel="Continue"
                        >
                          {loading ? (
                            <ActivityIndicator color={colors.offWhite} size="small" />
                          ) : (
                            <Text style={styles.btnPrimaryText}>Continue</Text>
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
                                d="M17.05 20.28c-1.48.55-3.07.72-4.65.72-5.52 0-10-4.48-10-10S6.88 1 12.4 1c2.76 0 5.26 1.12 7.07 2.93l-2.88 2.77c-.97-.93-2.24-1.5-3.69-1.5-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5c2.42 0 4.47-1.56 5.22-3.72h-5.22v-3.5h9.02c.14.68.21 1.38.21 2.11 0 3.44-1.74 6.48-4.58 8.19z"
                                fill="#4285F4"
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
                    <View style={styles.authFooter}>
                      <Text style={styles.footerText}>
                        New to Rein?{' '}
                        <TouchableOpacity
                          onPress={() => router.push('/(auth)/signup')}
                          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                          accessible={true}
                          accessibilityRole="link"
                        >
                          <Text style={styles.footerLink}>Create an account</Text>
                        </TouchableOpacity>
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('Guest Access', 'Guest access is coming soon.');
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        style={styles.guestLinkContainer}
                      >
                        <Text style={styles.guestLink}>Continue as guest (limited)</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </ScrollView>
              </KeyboardAvoidingView>
            </View>

            {/* Desktop Benefits Panel */}
            <View style={styles.benefitsPanel}>
              <View style={styles.benefitsContent}>
                <Text style={styles.benefitsTitle}>Your journey to better horsemanship starts here</Text>
                
                <View style={styles.benefitItem}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <Polyline points="22 4 12 14.01 9 11.01" />
                  </Svg>
                  <Text style={styles.benefitText}>
                    <Text style={styles.benefitTextStrong}>Step-by-step guidance</Text> — Every lesson broken into clear micro-steps with time estimates
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <Line x1="16" y1="2" x2="16" y2="6" />
                    <Line x1="8" y1="2" x2="8" y2="6" />
                    <Line x1="3" y1="10" x2="21" y2="10" />
                  </Svg>
                  <Text style={styles.benefitText}>
                    <Text style={styles.benefitTextStrong}>Flexible routines</Text> — Plans that adapt to your schedule, not the other way around
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Circle cx="12" cy="12" r="10" />
                    <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <Line x1="12" y1="17" x2="12.01" y2="17" />
                  </Svg>
                  <Text style={styles.benefitText}>
                    <Text style={styles.benefitTextStrong}>AI coaching</Text> — Get answers and actionable plans when you're stuck
                  </Text>
                </View>

                <View style={styles.benefitItem}>
                  <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={colors.turquoise} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </Svg>
                  <Text style={styles.benefitText}>
                    <Text style={styles.benefitTextStrong}>Safety-first</Text> — Beginner-friendly guidance with clear boundaries
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {!isDesktop && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardView}
          >
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
                  <Text style={styles.brandName}>Rein</Text>
                </View>

                {/* Auth Card */}
                <View style={styles.authCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.accentBar} />
                    <Text style={styles.cardTitle}>Welcome back</Text>
                    <Text style={styles.cardSubtitle}>Sign in to continue your training</Text>
                  </View>

                  <View style={styles.form}>
                    <View style={styles.formGroup}>
                      <Text style={styles.formLabel}>Email</Text>
                      <View style={styles.inputWrapper}>
                        <TextInput
                          style={[styles.formInput, errors.email && styles.inputError]}
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
                        <TextInput
                          style={[styles.formInput, styles.formInputWithToggle, errors.password && styles.inputError]}
                          placeholder="Enter your password"
                          placeholderTextColor={colors.midGray}
                          value={password}
                          onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors({ ...errors, password: undefined });
                          }}
                          secureTextEntry={!showPassword}
                          autoCapitalize="none"
                          autoComplete="password"
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
                      {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
                    </View>

                    <View style={styles.forgotWrapper}>
                      <TouchableOpacity
                        onPress={() => {
                          Alert.alert('Forgot Password', 'Please contact support or try logging in again.');
                        }}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessible={true}
                        accessibilityRole="button"
                      >
                        <Text style={styles.forgotLink}>Forgot password?</Text>
                      </TouchableOpacity>
                    </View>

                    <Pressable
                      style={[styles.btnPrimary, (loading || !email || !password) && styles.btnPrimaryDisabled]}
                      onPress={handleLogin}
                      disabled={loading || !email || !password}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel="Continue"
                    >
                      {loading ? (
                        <ActivityIndicator color={colors.offWhite} size="small" />
                      ) : (
                        <Text style={styles.btnPrimaryText}>Continue</Text>
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
                            d="M17.05 20.28c-1.48.55-3.07.72-4.65.72-5.52 0-10-4.48-10-10S6.88 1 12.4 1c2.76 0 5.26 1.12 7.07 2.93l-2.88 2.77c-.97-.93-2.24-1.5-3.69-1.5-3.04 0-5.5 2.46-5.5 5.5s2.46 5.5 5.5 5.5c2.42 0 4.47-1.56 5.22-3.72h-5.22v-3.5h9.02c.14.68.21 1.38.21 2.11 0 3.44-1.74 6.48-4.58 8.19z"
                            fill="#4285F4"
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
                <View style={styles.authFooter}>
                  <Text style={styles.footerText}>
                    New to Rein?{' '}
                    <TouchableOpacity
                      onPress={() => router.push('/(auth)/signup')}
                      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                      accessible={true}
                      accessibilityRole="link"
                    >
                      <Text style={styles.footerLink}>Create an account</Text>
                    </TouchableOpacity>
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      Alert.alert('Guest Access', 'Guest access is coming soon.');
                    }}
                    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    style={styles.guestLinkContainer}
                  >
                    <Text style={styles.guestLink}>Continue as guest (limited)</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopContent: {
    flex: 1,
    maxWidth: 560,
  },
  benefitsPanel: {
    flex: 1,
    backgroundColor: colors.bone,
    padding: spacing['4xl'],
    justifyContent: 'center',
  },
  benefitsContent: {
    maxWidth: 400,
  },
  benefitsTitle: {
    fontSize: 32,
    fontWeight: '500',
    color: colors.deepInk,
    marginBottom: spacing['2xl'],
    lineHeight: 40,
    fontFamily: 'Georgia, serif', // Fraunces fallback
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.base,
    marginBottom: spacing.xl,
  },
  benefitText: {
    ...typography.body,
    fontSize: 16,
    color: colors.slate,
    lineHeight: 25.6, // 1.6 * 16
    flex: 1,
  },
  benefitTextStrong: {
    fontWeight: '600',
    color: colors.deepInk,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  content: {
    width: '100%',
    maxWidth: 380,
    alignSelf: 'center',
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: spacing['3xl'],
  },
  logoContainer: {
    marginBottom: spacing.base,
  },
  logoMark: {
    width: 56,
    height: 56,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '600',
    color: colors.deepInk,
    letterSpacing: -0.32,
    lineHeight: 40,
    fontFamily: 'Georgia, serif', // Fraunces fallback - for web use 'Fraunces' font-family
  },
  authCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing['2xl'],
    borderWidth: 1,
    borderColor: colors.borderWarm,
    ...shadows.md,
    marginBottom: spacing['2xl'],
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  accentBar: {
    width: 40,
    height: 3,
    backgroundColor: colors.turquoise,
    borderRadius: 2,
    marginBottom: spacing.lg,
  },
  cardTitle: {
    ...typography.h3,
    fontSize: 20,
    fontWeight: '600',
    color: colors.deepInk,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  cardSubtitle: {
    ...typography.bodySmall,
    fontSize: 14,
    color: colors.slate,
    textAlign: 'center',
    lineHeight: 21,
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
    lineHeight: 19.6,
  },
  inputWrapper: {
    position: 'relative',
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
  forgotWrapper: {
    alignItems: 'flex-end',
    marginBottom: spacing.xl,
    marginTop: -spacing.sm,
  },
  forgotLink: {
    fontSize: 14,
    color: colors.slate,
    fontWeight: '500',
  },
  btnPrimary: {
    width: '100%',
    paddingVertical: spacing.base,
    backgroundColor: colors.deepInk, // #12161C
    borderRadius: borderRadius.md,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnPrimaryDisabled: {
    opacity: 0.5,
    backgroundColor: colors.deepInk, // #12161C - Keep deep ink background even when disabled
  },
  btnPrimaryText: {
    ...typography.body,
    fontSize: 16,
    fontWeight: '600',
    color: colors.offWhite, // #FAF7F2
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
  authFooter: {
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    fontSize: 15,
    color: colors.slate,
    lineHeight: 22.5,
    textAlign: 'center',
    marginBottom: spacing.base,
  },
  footerLink: {
    color: colors.deepInk, // #12161C
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  guestLinkContainer: {
    marginTop: spacing.sm,
  },
  guestLink: {
    fontSize: 14,
    color: colors.midGray,
    textAlign: 'center',
  },
});