import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme, ThemeMode } from '../contexts/ThemeContext';
import CustomButton from '../components/CustomButton';

const HomeScreen: React.FC = () => {
  const { authState, logout } = useAuth();
  const { mode, isDark, colors, setTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: performLogout,
        },
      ]
    );
  };

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      Alert.alert(
        'Logout Error',
        'Failed to sign out. Please try again.'
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleThemeChange = (newMode: ThemeMode) => {
    setTheme(newMode);
  };

  const getThemeModeDisplayName = (themeMode: ThemeMode): string => {
    switch (themeMode) {
      case 'light':
        return 'Light';
      case 'dark':
        return 'Dark';
      case 'system':
        return 'System';
      default:
        return 'System';
    }
  };

  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const { user } = authState;

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User information not available</Text>
        </View>
      </SafeAreaView>
    );
  }

  const dynamicStyles = createDynamicStyles(colors);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>Welcome,</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>
            {user.firstName} {user.lastName}
          </Text>
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.separator }]}>Profile Information</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Full Name</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user.firstName} {user.lastName}
            </Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Email Address</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.email}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Phone Number</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.phoneNumber}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Member Since</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{formatDate(user.createdAt)}</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>User ID</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>{user.id}</Text>
          </View>
        </View>

        <View style={[styles.securityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.separator }]}>Security Information</Text>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Status</Text>
            <Text style={[styles.infoValue, styles.statusActive]}>Active</Text>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Failed Login Attempts</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {authState.failedAttempts} of 5
            </Text>
          </View>

          {authState.isLocked && authState.lockoutUntil && (
            <View style={[styles.infoRow, { borderBottomColor: colors.separator }]}>
              <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Account Locked Until</Text>
              <Text style={[styles.infoValue, styles.statusLocked]}>
                {new Date(authState.lockoutUntil).toLocaleString()}
              </Text>
            </View>
          )}
        </View>

        <View style={[styles.profileCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>App Settings</Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>Theme Mode</Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {getThemeModeDisplayName(mode)} {isDark ? '🌙' : '☀️'}
            </Text>
          </View>

          <View style={styles.themeButtonsContainer}>
            <CustomButton
              title="Light"
              onPress={() => handleThemeChange('light')}
              variant={mode === 'light' ? 'primary' : 'outline'}
              size="small"
              style={[styles.themeButton, { borderColor: colors.border }]}
            />
            <CustomButton
              title="Dark"
              onPress={() => handleThemeChange('dark')}
              variant={mode === 'dark' ? 'primary' : 'outline'}
              size="small"
              style={[styles.themeButton, { borderColor: colors.border }]}
            />
            <CustomButton
              title="System"
              onPress={() => handleThemeChange('system')}
              variant={mode === 'system' ? 'primary' : 'outline'}
              size="small"
              style={[styles.themeButton, { borderColor: colors.border }]}
            />
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <CustomButton
            title="Sign Out"
            onPress={handleLogout}
            variant="outline"
            size="large"
            loading={isLoggingOut}
            style={styles.logoutButton}
            textStyle={styles.logoutButtonText}
            accessibilityHint="Signs you out of your account"
          />
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            This is a demo application for account registration and authentication.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 18,
    color: '#6C757D',
    marginBottom: 4,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333333',
    letterSpacing: -0.5,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FA',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6C757D',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333333',
    flex: 2,
    textAlign: 'right',
    fontWeight: '400',
  },
  statusActive: {
    color: '#28A745',
    fontWeight: '600',
  },
  statusLocked: {
    color: '#DC3545',
    fontWeight: '600',
  },
  actionsContainer: {
    marginTop: 20,
    marginBottom: 32,
  },
  logoutButton: {
    borderColor: '#DC3545',
  },
  logoutButtonText: {
    color: '#DC3545',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#ADB5BD',
    textAlign: 'center',
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#DC3545',
    textAlign: 'center',
  },
  themeButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 8,
  },
  themeButton: {
    flex: 1,
    marginHorizontal: 2,
  },
});

const createDynamicStyles = (colors: any) => StyleSheet.create({
  text: {
    color: colors.text,
  },
  textSecondary: {
    color: colors.textSecondary,
  },
  card: {
    backgroundColor: colors.card,
    borderColor: colors.border,
  },
});

export default HomeScreen;