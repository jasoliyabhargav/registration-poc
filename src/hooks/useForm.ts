import { useState, useEffect, useCallback } from 'react';
import { ValidationRule, FieldError, FormState } from '../types';
import { validateForm } from '../utils/validation';
import { formPersistenceService } from '../services/formPersistenceService';

interface UseFormOptions {
  initialValues: Record<string, string>;
  validationRules: Record<string, ValidationRule>;
  persistenceKey?: string;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

export const useForm = (options: UseFormOptions) => {
  const {
    initialValues,
    validationRules,
    persistenceKey,
    validateOnChange = true,
    validateOnBlur = true,
  } = options;

  const [formState, setFormState] = useState<FormState>({
    values: initialValues,
    errors: {},
    touched: {},
    isValid: false,
    isSubmitting: false,
  });

  // Load persisted form data on mount
  useEffect(() => {
    if (persistenceKey) {
      loadPersistedData();
    }
  }, [persistenceKey]);

  // Validate form whenever values change
  useEffect(() => {
    if (validateOnChange && Object.keys(formState.touched).length > 0) {
      const { errors, isValid } = validateForm(formState.values, validationRules);
      setFormState(prev => ({ ...prev, errors, isValid }));
    }
  }, [formState.values, validationRules, validateOnChange, formState.touched]);

  // Persist form data when values change
  useEffect(() => {
    if (persistenceKey && Object.keys(formState.values).length > 0) {
      const timeoutId = setTimeout(() => {
        persistFormData();
      }, 500); // Debounce persistence

      return () => clearTimeout(timeoutId);
    }
  }, [formState.values, persistenceKey]);

  const loadPersistedData = async () => {
    try {
      if (persistenceKey) {
        const persistedData = await formPersistenceService.getFormData(persistenceKey);
        if (persistedData) {
          setFormState(prev => ({
            ...prev,
            values: { ...initialValues, ...persistedData },
          }));
        }
      }
    } catch (error) {
      console.error('Failed to load persisted form data:', error);
    }
  };

  const persistFormData = async () => {
    try {
      if (persistenceKey) {
        await formPersistenceService.saveFormData(persistenceKey, formState.values);
      }
    } catch (error) {
      console.error('Failed to persist form data:', error);
    }
  };

  const clearPersistedData = async () => {
    try {
      if (persistenceKey) {
        await formPersistenceService.clearFormData(persistenceKey);
      }
    } catch (error) {
      console.error('Failed to clear persisted form data:', error);
    }
  };

  const setValue = useCallback((field: string, value: string) => {
    setFormState(prev => ({
      ...prev,
      values: { ...prev.values, [field]: value },
    }));
  }, []);

  const setError = useCallback((field: string, error: FieldError | undefined) => {
    setFormState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: error },
    }));
  }, []);

  const setTouched = useCallback((field: string, touched: boolean = true) => {
    setFormState(prev => ({
      ...prev,
      touched: { ...prev.touched, [field]: touched },
    }));
  }, []);

  const handleChange = useCallback((field: string, value: string) => {
    setValue(field, value);

    if (validateOnChange && formState.touched[field]) {
      // Validate only this field
      const rule = validationRules[field];
      if (rule) {
        const { errors } = validateForm({ [field]: value }, { [field]: rule });
        setError(field, errors[field]);
      }
    }
  }, [setValue, setError, validateOnChange, validationRules, formState.touched]);

  const handleBlur = useCallback((field: string) => {
    setTouched(field, true);

    if (validateOnBlur) {
      // Validate only this field
      const rule = validationRules[field];
      if (rule) {
        const { errors } = validateForm(formState.values, { [field]: rule });
        setError(field, errors[field]);
      }
    }
  }, [setTouched, setError, validateOnBlur, validationRules, formState.values]);

  const validate = useCallback(() => {
    const { errors, isValid } = validateForm(formState.values, validationRules);

    setFormState(prev => ({
      ...prev,
      errors,
      isValid,
      touched: Object.keys(validationRules).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {} as Record<string, boolean>),
    }));

    return isValid;
  }, [formState.values, validationRules]);

  const reset = useCallback(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isValid: false,
      isSubmitting: false,
    });

    if (persistenceKey) {
      clearPersistedData();
    }
  }, [initialValues, persistenceKey]);

  const setSubmitting = useCallback((submitting: boolean) => {
    setFormState(prev => ({ ...prev, isSubmitting: submitting }));
  }, []);

  const getFieldProps = useCallback((field: string) => ({
    value: formState.values[field] || '',
    onChangeText: (value: string) => handleChange(field, value),
    onBlur: () => handleBlur(field),
    error: formState.touched[field] ? formState.errors[field] : undefined,
  }), [formState.values, formState.touched, formState.errors, handleChange, handleBlur]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    setValue,
    setError,
    setTouched,
    handleChange,
    handleBlur,
    validate,
    reset,
    setSubmitting,
    getFieldProps,
    clearPersistedData,
  };
};