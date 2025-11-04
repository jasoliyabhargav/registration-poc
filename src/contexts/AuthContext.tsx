import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthState, User, LoginFormData, RegistrationFormData } from '../types';
import { authenticationService } from '../services/authenticationService';
import { secureStorageService } from '../services/secureStorageService';

interface AuthContextType {
  authState: AuthState;
  login: (credentials: LoginFormData) => Promise<void>;
  register: (userData: RegistrationFormData) => Promise<void>;
  logout: () => Promise<void>;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'REGISTER_START' }
  | { type: 'REGISTER_SUCCESS'; payload: User }
  | { type: 'REGISTER_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'INCREMENT_FAILED_ATTEMPTS' }
  | { type: 'RESET_FAILED_ATTEMPTS' }
  | { type: 'LOCK_ACCOUNT'; payload: number }
  | { type: 'UNLOCK_ACCOUNT' }
  | { type: 'RESTORE_SESSION'; payload: User };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  failedAttempts: 0,
  isLocked: false,
  lockoutUntil: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN_START':
    case 'REGISTER_START':
      return { ...state, isLoading: true };

    case 'LOGIN_SUCCESS':
    case 'REGISTER_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
      };

    case 'LOGIN_FAILURE':
    case 'REGISTER_FAILURE':
      return { ...state, isLoading: false };

    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'INCREMENT_FAILED_ATTEMPTS':
      const newFailedAttempts = state.failedAttempts + 1;
      const shouldLock = newFailedAttempts >= 5;
      return {
        ...state,
        failedAttempts: newFailedAttempts,
        isLocked: shouldLock,
        lockoutUntil: shouldLock ? Date.now() + 15 * 60 * 1000 : null, // 15 minutes
      };

    case 'RESET_FAILED_ATTEMPTS':
      return {
        ...state,
        failedAttempts: 0,
        isLocked: false,
        lockoutUntil: null,
      };

    case 'LOCK_ACCOUNT':
      return {
        ...state,
        isLocked: true,
        lockoutUntil: action.payload,
      };

    case 'UNLOCK_ACCOUNT':
      return {
        ...state,
        isLocked: false,
        lockoutUntil: null,
        failedAttempts: 0,
      };

    case 'RESTORE_SESSION':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload,
        isLoading: false,
      };

    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    initializeAuth();
  }, []);

  useEffect(() => {
    if (authState.isLocked && authState.lockoutUntil) {
      const timeout = setTimeout(() => {
        if (Date.now() >= authState.lockoutUntil!) {
          dispatch({ type: 'UNLOCK_ACCOUNT' });
        }
      }, authState.lockoutUntil - Date.now());

      return () => clearTimeout(timeout);
    }
  }, [authState.isLocked, authState.lockoutUntil]);

  const initializeAuth = async () => {
    try {
      const currentUser = await authenticationService.getCurrentUser();
      if (currentUser) {
        dispatch({ type: 'RESTORE_SESSION', payload: currentUser });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginFormData) => {
    if (authState.isLocked) {
      throw new Error('Account is temporarily locked due to too many failed attempts. Please try again later.');
    }

    dispatch({ type: 'LOGIN_START' });

    try {
      const user = await authenticationService.login(credentials);

      // Store credentials securely
      await secureStorageService.storeCredentials({
        username: credentials.email,
        password: credentials.password,
      });

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      dispatch({ type: 'RESET_FAILED_ATTEMPTS' });
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' });
      dispatch({ type: 'INCREMENT_FAILED_ATTEMPTS' });
      throw error;
    }
  };

  const register = async (userData: RegistrationFormData) => {
    dispatch({ type: 'REGISTER_START' });

    try {
      const user = await authenticationService.register(userData);

      // Store credentials securely
      await secureStorageService.storeCredentials({
        username: userData.email,
        password: userData.password,
      });

      dispatch({ type: 'REGISTER_SUCCESS', payload: user });
    } catch (error) {
      dispatch({ type: 'REGISTER_FAILURE' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authenticationService.logout();
      await secureStorageService.clearCredentials();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      // Even if logout fails, clear local state
      dispatch({ type: 'LOGOUT' });
    }
  };

  const value: AuthContextType = {
    authState,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};