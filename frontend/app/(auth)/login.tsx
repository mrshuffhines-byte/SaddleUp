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
import { ScreenBackground } from '../../components/ui';

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
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.logoContainer}>
                <Text style={styles.logoIcon}>🐴</Text>
              </View>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.tagline}>
                Sign in to continue your horsemanship journey
              </Text>
            </View>

            {/* Login Card */}
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
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.eyeIconText}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                      </TouchableOpacity>
                    }
                  />
                </View>

                <TouchableOpacity 
                  style={styles.forgotPasswordLink}
                  onPress={() => {
                    Alert.alert('Forgot Password', 'Please contact support or try logging in again.');
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>

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

            {/* Signup CTA */}
            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>New to SaddleUp? </Text>
              <TouchableOpacity 
                onPress={() => router.push('/(auth)/signup')}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
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
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  // Header Section - Improved hierarchy
  headerSection: {
    marginBottom: spacing.xl,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logoIcon: {
    fontSize: 72,
  },
  title: {
    ...typography.h1,
    fontSize: 36,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: spacing.xs,
    letterSpacing: -0.8,
  },
  tagline: {
    ...typography.body,
    fontSize: 17,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  // Login Card - Enhanced with better spacing and shadow
  formCard: {
    padding: spacing.xl + spacing.md, // Increased from lg to xl + md
    marginBottom: spacing.xl,
    borderRadius: borderRadius.xl,
    backgroundColor: colors.surface,
  },
  formContent: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.lg, // Increased from md to lg
  },
  input: {
    fontSize: 16, // Ensure minimum 16px for readability
    paddingVertical: spacing.md + 2, // Slightly increased for better tap target
    minHeight: 52, // WCAG AA minimum tap target size
  },
  passwordContainer: {
    position: 'relative',
  },
  eyeButton: {
    padding: spacing.sm,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  eyeIconText: {
    fontSize: 22,
    opacity: 0.7,
  },
  // Primary Button - More confident and tappable
  signInButton: {
    marginTop: spacing.lg,
    minHeight: 56, // Large tap target
    paddingVertical: spacing.md + 6,
  },
  // Forgot Password - More visible but not distracting
  forgotPasswordLink: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    fontSize: 15,
    color: colors.primary[600],
    fontWeight: '500',
  },
  // Signup CTA - More inviting
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  signupText: {
    ...typography.body,
    fontSize: 16,
    color: colors.neutral[600],
  },
  signupLink: {
    ...typography.body,
    fontSize: 16,
    color: colors.primary[700],
    fontWeight: '600',
  },
});
