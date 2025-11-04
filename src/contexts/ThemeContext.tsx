import React, { createContext, useContext, useEffect, useReducer, ReactNode } from 'react';
import { Appearance } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;

  // Text colors
  text: string;
  textSecondary: string;
  textDisabled: string;

  // Primary colors
  primary: string;
  primaryLight: string;
  primaryDark: string;

  // Status colors
  success: string;
  warning: string;
  error: string;
  info: string;

  // Border and separator colors
  border: string;
  separator: string;

  // Input colors
  inputBackground: string;
  inputBorder: string;
  inputText: string;
  placeholder: string;

  // Button colors
  buttonText: string;
  buttonDisabled: string;
  buttonDisabledText: string;
}

export interface ThemeContextType {
  mode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const lightColors: ThemeColors = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  text: '#333333',
  textSecondary: '#6C757D',
  textDisabled: '#ADB5BD',

  primary: '#007AFF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0056CC',

  success: '#28A745',
  warning: '#FFC107',
  error: '#DC3545',
  info: '#17A2B8',

  border: '#E1E1E1',
  separator: '#E9ECEF',

  inputBackground: '#FFFFFF',
  inputBorder: '#CED4DA',
  inputText: '#333333',
  placeholder: '#6C757D',

  buttonText: '#FFFFFF',
  buttonDisabled: '#E9ECEF',
  buttonDisabledText: '#6C757D',
};

const darkColors: ThemeColors = {
  background: '#121212',
  surface: '#1E1E1E',
  card: '#2D2D2D',

  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  textDisabled: '#666666',

  primary: '#0A84FF',
  primaryLight: '#4DA3FF',
  primaryDark: '#0066CC',

  success: '#30D158',
  warning: '#FF9F0A',
  error: '#FF453A',
  info: '#64D2FF',

  border: '#3A3A3C',
  separator: '#2C2C2E',

  inputBackground: '#2D2D2D',
  inputBorder: '#3A3A3C',
  inputText: '#FFFFFF',
  placeholder: '#B3B3B3',

  buttonText: '#FFFFFF',
  buttonDisabled: '#2D2D2D',
  buttonDisabledText: '#666666',
};

interface ThemeState {
  mode: ThemeMode;
  systemColorScheme: 'light' | 'dark';
}

type ThemeAction =
  | { type: 'SET_MODE'; payload: ThemeMode }
  | { type: 'SET_SYSTEM_COLOR_SCHEME'; payload: 'light' | 'dark' };

const themeReducer = (state: ThemeState, action: ThemeAction): ThemeState => {
  switch (action.type) {
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_SYSTEM_COLOR_SCHEME':
      return { ...state, systemColorScheme: action.payload };
    default:
      return state;
  }
};

const THEME_STORAGE_KEY = '@ClientPoc:Theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, {
    mode: 'system',
    systemColorScheme: Appearance.getColorScheme() || 'light',
  });

  // Calculate if dark mode should be active
  const isDark = state.mode === 'dark' || (state.mode === 'system' && state.systemColorScheme === 'dark');

  // Get current colors based on theme
  const colors = isDark ? darkColors : lightColors;

  useEffect(() => {
    // Load saved theme preference
    loadThemePreference();

    // Listen for system color scheme changes
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      dispatch({ type: 'SET_SYSTEM_COLOR_SCHEME', payload: colorScheme || 'light' });
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    // Save theme preference when it changes
    saveThemePreference(state.mode);
  }, [state.mode]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        dispatch({ type: 'SET_MODE', payload: savedTheme as ThemeMode });
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    }
  };

  const saveThemePreference = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setTheme = (mode: ThemeMode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const toggleTheme = () => {
    const newMode = state.mode === 'light' ? 'dark' : 'light';
    setTheme(newMode);
  };

  const value: ThemeContextType = {
    mode: state.mode,
    isDark,
    colors,
    setTheme,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};