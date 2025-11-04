import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, LoginFormData } from '../types';
import { validationRules } from '../utils/validation';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { secureStorageService } from '../services/secureStorageService';
import { authenticationService } from '../services/authenticationService';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>;

interface Props {
  navigation: LoginScreenNavigationProp;
}

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { login, authState } = useAuth();
  const { colors } = useTheme();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    getFieldProps,
    validate,
    setSubmitting,
    setValue,
  } = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationRules: {
      email: validationRules.email,
      password: {
        required: true,
        message: 'Password is required',
      },
    },
    validateOnChange: true,
    validateOnBlur: true,
  });

  useEffect(() => {
    checkBiometricAvailability();
    checkAccountLockStatus();
  }, []);

  useEffect(() => {
    // Automatically try biometric login if available and not locked
    if (!authState.isLocked && !authState.isAuthenticated) {
      attemptBiometricLogin();
    }
  }, [authState.isLocked, authState.isAuthenticated]);

  const attemptBiometricLogin = async () => {
    try {
      const biometryType = await secureStorageService.getSupportedBiometryType();
      const hasCredentials = await secureStorageService.hasCredentials();

      if (biometryType && hasCredentials) {
        // Delay slightly to allow the screen to render first
        setTimeout(() => {
          handleBiometricLogin(false); // Don't show error alerts for automatic attempts
        }, 500);
      }
    } catch (error) {
      console.log('Biometric auto-login not available:', error);
    }
  };

  useEffect(() => {
    if (authState.isLocked && authState.lockoutUntil) {
      const updateLockoutTimer = () => {
        const remaining = Math.max(0, authState.lockoutUntil! - Date.now());
        setLockoutTimeRemaining(remaining);

        if (remaining > 0) {
          setTimeout(updateLockoutTimer, 1000);
        }
      };

      updateLockoutTimer();
    }
  }, [authState.isLocked, authState.lockoutUntil]);

  const checkBiometricAvailability = async () => {
    try {
      const biometryType = await secureStorageService.getSupportedBiometryType();
      const hasCredentials = await secureStorageService.hasCredentials();
      setBiometricEnabled(!!biometryType && hasCredentials);
    } catch (error) {
      setBiometricEnabled(false);
    }
  };

  const checkAccountLockStatus = async () => {
    try {
      const isLocked = await authenticationService.isAccountLocked();
      if (isLocked) {
        const timeRemaining = await authenticationService.getLockoutTimeRemaining();
        setLockoutTimeRemaining(timeRemaining);
      }
    } catch (error) {
      console.error('Failed to check account lock status:', error);
    }
  };

  const handleSubmit = async () => {
    if (authState.isLocked) {
      const minutes = Math.ceil(lockoutTimeRemaining / (1000 * 60));
      Alert.alert(
        'Account Locked',
        `Too many failed attempts. Please try again in ${minutes} minute(s).`
      );
      return;
    }

    if (!validate()) {
      Alert.alert(
        'Validation Error',
        'Please enter valid credentials.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const loginData: LoginFormData = {
        email: values.email,
        password: values.password,
      };

      await login(loginData);
    } catch (error) {
      const failedAttempts = authState.failedAttempts + 1;
      const remainingAttempts = Math.max(0, 5 - failedAttempts);

      if (failedAttempts >= 5) {
        Alert.alert(
          'Account Locked',
          'Too many failed login attempts. Your account has been temporarily locked for 15 minutes.'
        );
      } else {
        Alert.alert(
          'Login Failed',
          `${error instanceof Error ? error.message : 'Invalid credentials'}. ${remainingAttempts} attempt(s) remaining.`
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleBiometricLogin = async (showErrorAlert = true) => {
    if (authState.isLocked) {
      const minutes = Math.ceil(lockoutTimeRemaining / (1000 * 60));
      if (showErrorAlert) {
        Alert.alert(
          'Account Locked',
          `Too many failed attempts. Please try again in ${minutes} minute(s).`
        );
      }
      return;
    }

    try {
      setSubmitting(true);
      const credentials = await secureStorageService.getCredentials();

      if (credentials) {
        setValue('email', credentials.username);
        setValue('password', credentials.password);

        const loginData: LoginFormData = {
          email: credentials.username,
          password: credentials.password,
        };

        await login(loginData);
        // Login successful - navigation will be handled by AuthContext
      } else {
        if (showErrorAlert) {
          Alert.alert(
            'Biometric Login Failed',
            'No saved credentials found. Please login manually.'
          );
        }
      }
    } catch (error) {
      // Check if the error is due to user cancellation
      const isUserCancel = error && typeof error === 'object' &&
        ('userCancel' in error || 'message' in error &&
         (error as any).message.includes('cancel') ||
         (error as any).message.includes('Cancel'));

      if (showErrorAlert && !isUserCancel) {
        Alert.alert(
          'Biometric Login Failed',
          'Unable to authenticate with biometrics. Please login manually.'
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToRegistration = () => {
    navigation.navigate('Registration');
  };

  const formatLockoutTime = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const isFormValid = values.email.trim() && values.password.trim();
  const isLocked = authState.isLocked && lockoutTimeRemaining > 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Welcome Back</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Sign in to your account</Text>
          </View>

          {isLocked && (
            <View style={styles.lockoutContainer}>
              <Text style={styles.lockoutText}>
                Account temporarily locked
              </Text>
              <Text style={styles.lockoutTimer}>
                Try again in {formatLockoutTime(lockoutTimeRemaining)}
              </Text>
            </View>
          )}

          {authState.failedAttempts > 0 && !isLocked && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                {5 - authState.failedAttempts} attempt(s) remaining before lockout
              </Text>
            </View>
          )}

          <View style={styles.form}>
            <CustomInput
              label="EMAIL ADDRESS"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              required
              {...getFieldProps('email')}
            />

            <CustomInput
              label="PASSWORD"
              placeholder="Enter your password"
              secureTextEntry
              showPasswordToggle
              autoComplete="current-password"
              textContentType="password"
              required
              {...getFieldProps('password')}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title="SIGN IN"
                onPress={handleSubmit}
                disabled={!isFormValid || isLocked}
                loading={isSubmitting}
                size="large"
                style={styles.signInButton}
                accessibilityHint="Signs you into your account"
              />

              {biometricEnabled && !isLocked && (
                <CustomButton
                  title="Sign in with Biometrics"
                  onPress={() => handleBiometricLogin(true)}
                  variant="outline"
                  size="large"
                  style={styles.biometricButton}
                  accessibilityHint="Sign in using biometric authentication"
                />
              )}
            </View>

            <View style={styles.registerLinkContainer}>
              <Text style={[styles.registerLinkText, { color: colors.textSecondary }]}>Don't have an account? </Text>
              <CustomButton
                title="Create one here"
                onPress={navigateToRegistration}
                variant="text"
                size="small"
                accessibilityHint="Navigate to registration screen"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 40,
    marginTop: 30,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    fontWeight: '400',
  },
  lockoutContainer: {
    backgroundColor: '#FFF3CD',
    borderColor: '#FFEAA7',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  lockoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 4,
  },
  lockoutTimer: {
    fontSize: 18,
    fontWeight: '700',
    color: '#856404',
  },
  warningContainer: {
    backgroundColor: '#F8D7DA',
    borderColor: '#F5C6CB',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  warningText: {
    fontSize: 14,
    color: '#721C24',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  signInButton: {
    backgroundColor: '#007AFF',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  biometricButton: {
    borderColor: '#007AFF',
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  registerLinkText: {
    fontSize: 14,
    color: '#6C757D',
  },
});

export default LoginScreen;