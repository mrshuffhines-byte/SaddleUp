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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../constants';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { Input, Button } from '../../components/ui';
import Card from '../../components/ui/Card';
import { ScreenBackground } from '../components/ui/ScreenBackground';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
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
        const error = await response.json();
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
      Alert.alert('Error', error.message || 'Login failed. Please try again.');
      if (error.message.toLowerCase().includes('password')) {
        setErrors({ password: error.message });
      } else if (error.message.toLowerCase().includes('email')) {
        setErrors({ email: error.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenBackground variant="warm">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Header Section - Strengthened hierarchy */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🐴</Text>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.tagline}>
                Sign in to continue your horsemanship journey
              </Text>
            </View>

            {/* Login Card - Enhanced with better spacing and shadow */}
            <Card style={styles.formCard} variant="elevated">
              <View style={styles.formContent}>
                <Input
                  label="Email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect={false}
                  error={errors.email}
                  containerStyle={styles.inputContainer}
                  style={styles.input}
                />

                <View style={styles.passwordContainer}>
                  <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errors.password) setErrors({ ...errors, password: undefined });
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    autoCorrect={false}
                    error={errors.password}
                    containerStyle={styles.inputContainer}
                    style={styles.input}
                    rightIcon={
                      <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                        accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                        accessibilityRole="button"
                      >
                        <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    }
                  />
                </View>

                {/* Forgot Password - More visible but not distracting */}
                <TouchableOpacity 
                  style={styles.forgotPasswordLink}
                  onPress={() => {
                    Alert.alert('Forgot Password', 'Please contact support or try logging in again.');
                  }}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                  accessibilityRole="button"
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

                {/* Primary Button - More confident and tappable */}
                <Button
                  title="Sign In"
                  onPress={handleLogin}
                  loading={loading}
                  disabled={loading || !email || !password}
                  size="lg"
                  style={styles.signInButton}
                  fullWidth
                />
              </View>
            </Card>

            {/* Signup CTA - More inviting */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>New to SaddleUp? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/signup')}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                accessibilityRole="link"
              >
                <Text style={styles.signupLink}>Create an account</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xxl + spacing.lg, // More breathing room at top
    paddingBottom: spacing.xxl + spacing.lg,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  // Header Section - Strengthened visual hierarchy
  headerSection: {
    marginBottom: spacing.xxl, // Increased spacing to separate from card
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl, // Increased from lg
  },
  logoIcon: {
    fontSize: 72,
  },
  title: {
    ...typography.h1,
    fontSize: 40, // Increased from 36 for stronger presence
    fontWeight: '700',
    color: colors.neutral[900], // High contrast for readability
    textAlign: 'center',
    marginBottom: spacing.sm, // Increased from xs
    letterSpacing: -1, // Tighter letter spacing for premium feel
  },
  tagline: {
    ...typography.body,
    fontSize: 17,
    color: colors.neutral[700], // Slightly darker for better contrast (WCAG AA)
    textAlign: 'center',
    lineHeight: 26, // Increased from 24 for better readability
    paddingHorizontal: spacing.md,
  },
  // Login Card - Enhanced with better spacing, border radius, and subtle shadow
  formCard: {
    padding: spacing.xxl, // Increased from xl + md for more breathing room
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl + 4, // Slightly increased for modern feel
    backgroundColor: colors.surface,
    // Shadow will come from Card variant="elevated"
  },
  formContent: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.xl, // Increased from lg for better field separation
  },
  input: {
    fontSize: 16, // Minimum 16px for readability (prevents iOS zoom)
    paddingVertical: spacing.md + 4, // Increased for better tap target and comfort
    minHeight: 56, // Increased from 52 for better accessibility (WCAG AA)
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    padding: spacing.md, // Increased from sm
    minWidth: 48, // Increased for better tap target (WCAG AA)
    minHeight: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 22,
    opacity: 0.65, // Slightly more subtle
  },
  // Primary Button - More confident, tappable, with better contrast
  signInButton: {
    marginTop: spacing.xl, // Increased from lg
    minHeight: 56, // Large tap target (WCAG AA)
    paddingVertical: spacing.md + 8, // Increased for more confident feel
  },
  // Forgot Password - More visible but not distracting
  forgotPasswordLink: {
    marginTop: spacing.xs,
    marginBottom: spacing.md, // Reduced from lg to bring it closer to password field
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    minHeight: 44, // WCAG AA minimum tap target
    justifyContent: 'center',
    paddingVertical: spacing.xs, // Extra padding for easier tapping
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    fontSize: 15,
    color: colors.primary[700], // Darker for better contrast (WCAG AA)
    fontWeight: '600', // Increased from 500 for better visibility
  },
  // Signup CTA - More inviting and prominent
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xxl, // Increased from xl for better separation
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, // Added vertical padding
  },
  signupText: {
    ...typography.body,
    fontSize: 16,
    color: colors.neutral[700], // Darker for better contrast (WCAG AA)
    lineHeight: 24,
  },
  signupLink: {
    ...typography.body,
    fontSize: 16,
    color: colors.primary[700], // Darker for better contrast and prominence
    fontWeight: '700', // Increased from 600 for more inviting feel
    textDecorationLine: 'underline',
    textDecorationColor: colors.primary[400],
  },
});
