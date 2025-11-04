import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, RegistrationFormData } from '../types';
import { validationRules } from '../utils/validation';
import { useForm } from '../hooks/useForm';
import { useAuth } from '../contexts/AuthContext';
import CustomInput from '../components/CustomInput';
import CustomButton from '../components/CustomButton';

type RegistrationScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Registration'
>;

interface Props {
  navigation: RegistrationScreenNavigationProp;
}

const RegistrationScreen: React.FC<Props> = ({ navigation }) => {
  const { register } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);

  const {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    getFieldProps,
    validate,
    setSubmitting,
    clearPersistedData,
  } = useForm({
    initialValues: {
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      phoneNumber: '',
    },
    validationRules: {
      email: validationRules.email,
      password: validationRules.password,
      confirmPassword: validationRules.confirmPassword,
      firstName: validationRules.firstName,
      lastName: validationRules.lastName,
      phoneNumber: validationRules.phoneNumber,
    },
    persistenceKey: 'registration_form',
    validateOnChange: true,
    validateOnBlur: true,
  });

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert(
        'Validation Error',
        'Please correct the errors in the form before submitting.'
      );
      return;
    }

    setSubmitting(true);

    try {
      const registrationData: RegistrationFormData = {
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        firstName: values.firstName,
        lastName: values.lastName,
        phoneNumber: values.phoneNumber,
      };

      await register(registrationData);
      await clearPersistedData();
      setShowSuccess(true);

      // Show success message briefly before navigation
      setTimeout(() => {
        navigation.navigate('Home');
      }, 1500);
    } catch (error) {
      Alert.alert(
        'Registration Failed',
        error instanceof Error ? error.message : 'An unexpected error occurred'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const isFormValid = isValid && Object.keys(values).every(key => values[key].trim());

  if (showSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Success!</Text>
          <Text style={styles.successMessage}>
            Your account has been created successfully.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Account setup</Text>
          </View>

          <View style={styles.form}>
            <CustomInput
              label="EMAIL ADDRESS"
              placeholder="enter a email"
              keyboardType="email-address"
              autoComplete="email"
              textContentType="emailAddress"
              required
              {...getFieldProps('email')}
            />

            <CustomInput
              label="PASSWORD"
              placeholder="enter a password"
              secureTextEntry
              showPasswordToggle
              autoComplete="new-password"
              textContentType="newPassword"
              required
              {...getFieldProps('password')}
            />

            <CustomInput
              label="CONFIRM PASSWORD"
              placeholder="confirm your password"
              secureTextEntry
              autoComplete="new-password"
              textContentType="newPassword"
              required
              {...getFieldProps('confirmPassword')}
            />

            <CustomInput
              label="FIRST NAME"
              placeholder="enter your first name"
              autoComplete="given-name"
              textContentType="givenName"
              autoCapitalize="words"
              required
              {...getFieldProps('firstName')}
            />

            <CustomInput
              label="LAST NAME"
              placeholder="enter your last name"
              autoComplete="family-name"
              textContentType="familyName"
              autoCapitalize="words"
              required
              {...getFieldProps('lastName')}
            />

            <CustomInput
              label="PHONE NUMBER"
              placeholder="enter a phone number"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              required
              {...getFieldProps('phoneNumber')}
            />

            <View style={styles.buttonContainer}>
              <CustomButton
                title="SAVE & START"
                onPress={handleSubmit}
                disabled={!isFormValid}
                loading={isSubmitting}
                size="large"
                style={styles.submitButton}
                accessibilityHint="Creates your account and logs you in"
              />
            </View>

            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Already registered? </Text>
              <CustomButton
                title="Sign in here"
                onPress={navigateToLogin}
                variant="text"
                size="small"
                accessibilityHint="Navigate to login screen"
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
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  form: {
    flex: 1,
  },
  buttonContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  submitButton: {
    backgroundColor: '#4FC3F7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loginLinkText: {
    fontSize: 14,
    color: '#6C757D',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successIcon: {
    fontSize: 48,
    color: '#28A745',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333333',
    marginBottom: 8,
  },
  successMessage: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default RegistrationScreen;