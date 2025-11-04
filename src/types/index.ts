export interface RegistrationFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  failedAttempts: number;
  isLocked: boolean;
  lockoutUntil: number | null;
}

export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: string) => boolean;
  message: string;
}

export interface FieldError {
  type: string;
  message: string;
}

export interface FormState {
  values: Record<string, string>;
  errors: Record<string, FieldError | undefined>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isSubmitting: boolean;
}

export type RootStackParamList = {
  Login: undefined;
  Registration: undefined;
  Home: undefined;
};

export interface KeychainCredentials {
  username: string;
  password: string;
}

export interface SecureStorageService {
  storeCredentials: (credentials: KeychainCredentials) => Promise<void>;
  getCredentials: () => Promise<KeychainCredentials | null>;
  clearCredentials: () => Promise<void>;
}

export interface AuthenticationService {
  login: (credentials: LoginFormData) => Promise<User>;
  register: (userData: RegistrationFormData) => Promise<User>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<User | null>;
  incrementFailedAttempts: () => Promise<void>;
  resetFailedAttempts: () => Promise<void>;
  isAccountLocked: () => Promise<boolean>;
}

export interface FormPersistenceService {
  saveFormData: (formId: string, data: Record<string, string>) => Promise<void>;
  getFormData: (formId: string) => Promise<Record<string, string> | null>;
  clearFormData: (formId: string) => Promise<void>;
}