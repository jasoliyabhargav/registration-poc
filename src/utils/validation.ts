import { ValidationRule, FieldError } from '../types';

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_REGEX = /^\+?[\d\s\-\(\)]{10,}$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const validationRules = {
  email: {
    required: true,
    pattern: EMAIL_REGEX,
    message: 'Please enter a valid email address'
  } as ValidationRule,

  password: {
    required: true,
    minLength: 8,
    pattern: PASSWORD_REGEX,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number and special character'
  } as ValidationRule,

  confirmPassword: {
    required: true,
    message: 'Passwords must match'
  } as ValidationRule,

  firstName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'First name must be between 2-50 characters'
  } as ValidationRule,

  lastName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Last name must be between 2-50 characters'
  } as ValidationRule,

  phoneNumber: {
    required: true,
    pattern: PHONE_REGEX,
    message: 'Please enter a valid phone number'
  } as ValidationRule,
};

export const validateField = (
  value: string,
  rule: ValidationRule,
  confirmValue?: string
): FieldError | null => {
  if (rule.required && (!value || value.trim().length === 0)) {
    return {
      type: 'required',
      message: rule.message
    };
  }

  if (value && rule.minLength && value.length < rule.minLength) {
    return {
      type: 'minLength',
      message: rule.message
    };
  }

  if (value && rule.maxLength && value.length > rule.maxLength) {
    return {
      type: 'maxLength',
      message: rule.message
    };
  }

  if (value && rule.pattern && !rule.pattern.test(value)) {
    return {
      type: 'pattern',
      message: rule.message
    };
  }

  if (value && rule.custom && !rule.custom(value)) {
    return {
      type: 'custom',
      message: rule.message
    };
  }

  // Special case for confirm password
  if (confirmValue !== undefined && value !== confirmValue) {
    return {
      type: 'match',
      message: rule.message
    };
  }

  return null;
};

export const validateForm = (
  values: Record<string, string>,
  rules: Record<string, ValidationRule>
): { errors: Record<string, FieldError | undefined>; isValid: boolean } => {
  const errors: Record<string, FieldError | undefined> = {};

  Object.keys(rules).forEach(field => {
    const value = values[field] || '';
    const rule = rules[field];

    let error: FieldError | null = null;

    if (field === 'confirmPassword') {
      error = validateField(value, rule, values.password);
    } else {
      error = validateField(value, rule);
    }

    errors[field] = error || undefined;
  });

  const isValid = Object.values(errors).every(error => error === undefined);

  return { errors, isValid };
};

export const getPasswordStrengthScore = (password: string): number => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[@$!%*?&]/.test(password)) score += 1;

  return score;
};

export const getPasswordStrengthText = (score: number): string => {
  if (score <= 2) return 'Weak';
  if (score <= 4) return 'Medium';
  return 'Strong';
};

export const formatPhoneNumber = (value: string): string => {
  const numbers = value.replace(/\D/g, '');

  if (numbers.length >= 10) {
    const areaCode = numbers.slice(0, 3);
    const prefix = numbers.slice(3, 6);
    const lineNumber = numbers.slice(6, 10);
    return `(${areaCode}) ${prefix}-${lineNumber}`;
  }

  return value;
};