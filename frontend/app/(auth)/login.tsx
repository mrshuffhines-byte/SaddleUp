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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; code?: string }>({});
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

  const handleRequestCode = async () => {
    setErrors({});
    
    if (!email) {
      setErrors({ email: 'Email is required' });
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send login code');
      }

      setStep('code');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send login code');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    setErrors({});
    
    if (!code || code.length !== 6) {
      setErrors({ code: 'Please enter the 6-digit code' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Invalid code');
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
      Alert.alert('Error', error.message || 'Invalid code. Please try again.');
      setErrors({ code: error.message || 'Invalid code' });
    } finally {
      setLoading(false);
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

          {/* Title and Tagline */}
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.tagline}>
            Your Journey to Confident Horsemanship Starts Here
          </Text>

          <Card style={styles.formCard}>
            {step === 'email' ? (
              <>
                <Input
                  label="Email"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errors.email) setErrors({ ...errors, email: undefined });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  icon="📧"
                  error={errors.email}
                  containerStyle={styles.inputContainer}
                />

                <Button
                  title="Send Login Code"
                  onPress={handleRequestCode}
                  loading={loading}
                  style={styles.button}
                  fullWidth
                />

                <TouchableOpacity 
                  style={styles.forgotPasswordLink}
                  onPress={() => {
                    // TODO: Implement forgot password flow
                    Alert.alert('Forgot Password', 'Please contact support or try logging in again.');
                  }}
                >
                  <Text style={styles.forgotPasswordText}>Forgot your email?</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.codeInstructions}>
                  We sent a 6-digit code to{'\n'}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>

                <Input
                  label="Verification Code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChangeText={(text) => {
                    const numericCode = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setCode(numericCode);
                    if (errors.code) setErrors({ ...errors, code: undefined });
                  }}
                  keyboardType="number-pad"
                  icon="🔒"
                  error={errors.code}
                  containerStyle={styles.inputContainer}
                  maxLength={6}
                />

                <Button
                  title="Sign In"
                  onPress={handleVerifyCode}
                  loading={loading}
                  style={styles.button}
                  fullWidth
                />

                <TouchableOpacity 
                  style={styles.backLink}
                  onPress={() => {
                    setStep('email');
                    setCode('');
                    setErrors({});
                  }}
                >
                  <Text style={styles.backLinkText}>← Change email</Text>
                </TouchableOpacity>
              </>
            )}
          </Card>

          {/* Signup Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>New to horse training? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
              <Text style={styles.signupLink}>Create an account →</Text>
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
    justifyContent: 'center',
    padding: spacing.lg,
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
  tagline: {
    ...typography.body,
    color: colors.neutral[600],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: typography.body.lineHeight,
  },
  formCard: {
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  button: {
    marginTop: spacing.md,
  },
  forgotPasswordLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  forgotPasswordText: {
    ...typography.bodySmall,
    color: colors.primary[600],
    textDecorationLine: 'underline',
  },
  codeInstructions: {
    ...typography.body,
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: typography.body.lineHeight,
  },
  emailText: {
    fontWeight: '600',
    color: colors.neutral[900],
  },
  backLink: {
    marginTop: spacing.md,
    alignItems: 'center',
  },
  backLinkText: {
    ...typography.bodySmall,
    color: colors.primary[600],
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  signupText: {
    ...typography.body,
    color: colors.neutral[600],
  },
  signupLink: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
