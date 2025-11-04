import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { FieldError } from '../types';
import { useTheme } from '../contexts/ThemeContext';

interface CustomInputProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: FieldError;
  secureTextEntry?: boolean;
  showPasswordToggle?: boolean;
  required?: boolean;
  containerStyle?: object;
  inputStyle?: object;
  labelStyle?: object;
}

const CustomInput: React.FC<CustomInputProps> = ({
  label,
  error,
  secureTextEntry = false,
  showPasswordToggle = false,
  required = false,
  containerStyle,
  inputStyle,
  labelStyle,
  ...props
}) => {
  const { colors } = useTheme();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const hasError = !!error;

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.textSecondary }, labelStyle, hasError && styles.labelError]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View style={[
        styles.inputContainer,
        { backgroundColor: colors.inputBackground, borderColor: colors.inputBorder },
        hasError && styles.inputContainerError
      ]}>
        <TextInput
          {...props}
          style={[styles.input, { color: colors.inputText }, inputStyle]}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          autoCapitalize="none"
          autoCorrect={false}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={error?.message}
          accessibilityState={{
            selected: false,
            disabled: props.editable === false,
          }}
        />

        {showPasswordToggle && secureTextEntry && (
          <TouchableOpacity
            style={styles.passwordToggle}
            onPress={togglePasswordVisibility}
            accessible={true}
            accessibilityLabel={isPasswordVisible ? 'Hide password' : 'Show password'}
            accessibilityRole="button"
          >
            <Text style={styles.passwordToggleText}>
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {hasError && (
        <Text
          style={styles.errorText}
          accessible={true}
          accessibilityLabel={`Error: ${error.message}`}
          accessibilityRole="alert"
        >
          {error.message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
    letterSpacing: 0.1,
  },
  labelError: {
    color: '#DC3545',
  },
  required: {
    color: '#DC3545',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  inputContainerError: {
    borderColor: '#DC3545',
    backgroundColor: '#FFF5F5',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333333',
    paddingVertical: 0,
  },
  passwordToggle: {
    paddingLeft: 12,
  },
  passwordToggleText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  errorText: {
    fontSize: 12,
    color: '#DC3545',
    marginTop: 4,
    fontWeight: '400',
  },
});

export default CustomInput;