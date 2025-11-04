import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  AuthenticationService,
  User,
  LoginFormData,
  RegistrationFormData
} from '../types';

const USER_STORAGE_KEY = '@ClientPoc:CurrentUser';
const USERS_STORAGE_KEY = '@ClientPoc:Users';
const FAILED_ATTEMPTS_KEY = '@ClientPoc:FailedAttempts';

class AuthenticationServiceImpl implements AuthenticationService {
  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getStoredUsers(): Promise<Record<string, User>> {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      return usersJson ? JSON.parse(usersJson) : {};
    } catch (error) {
      console.error('Failed to get stored users:', error);
      return {};
    }
  }

  private async storeUsers(users: Record<string, User>): Promise<void> {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Failed to store users:', error);
      throw new Error('Failed to store user data');
    }
  }

  async register(userData: RegistrationFormData): Promise<User> {
    try {
      const users = await this.getStoredUsers();

      // Check if user already exists
      const existingUser = Object.values(users).find(
        user => user.email.toLowerCase() === userData.email.toLowerCase()
      );

      if (existingUser) {
        throw new Error('An account with this email address already exists');
      }

      // Create new user
      const newUser: User = {
        id: this.generateUserId(),
        email: userData.email.toLowerCase(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        phoneNumber: userData.phoneNumber,
        createdAt: new Date().toISOString(),
      };

      // Store user data (in real app, password would be hashed)
      users[newUser.id] = newUser;
      await this.storeUsers(users);

      // Set current user
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(newUser));

      return newUser;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  async login(credentials: LoginFormData): Promise<User> {
    try {
      const users = await this.getStoredUsers();

      // Find user by email
      const user = Object.values(users).find(
        user => user.email.toLowerCase() === credentials.email.toLowerCase()
      );

      if (!user) {
        throw new Error('Invalid email or password');
      }

      // In a real app, you would verify the password hash here
      // For this demo, we're just checking if the user exists

      // Set current user
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

      return user;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await this.resetFailedAttempts();
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Failed to logout');
    }
  }

  async getCurrentUser(): Promise<User | null> {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      return userJson ? JSON.parse(userJson) : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  async incrementFailedAttempts(): Promise<void> {
    try {
      const attemptsStr = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
      const currentAttempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;
      const newAttempts = currentAttempts + 1;

      await AsyncStorage.setItem(FAILED_ATTEMPTS_KEY, newAttempts.toString());

      if (newAttempts >= 5) {
        const lockoutUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        await AsyncStorage.setItem('@ClientPoc:LockoutUntil', lockoutUntil.toString());
      }
    } catch (error) {
      console.error('Failed to increment failed attempts:', error);
    }
  }

  async resetFailedAttempts(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAILED_ATTEMPTS_KEY);
      await AsyncStorage.removeItem('@ClientPoc:LockoutUntil');
    } catch (error) {
      console.error('Failed to reset failed attempts:', error);
    }
  }

  async isAccountLocked(): Promise<boolean> {
    try {
      const lockoutUntilStr = await AsyncStorage.getItem('@ClientPoc:LockoutUntil');

      if (!lockoutUntilStr) {
        return false;
      }

      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const isLocked = Date.now() < lockoutUntil;

      if (!isLocked) {
        await this.resetFailedAttempts();
      }

      return isLocked;
    } catch (error) {
      console.error('Failed to check account lock status:', error);
      return false;
    }
  }

  async getFailedAttempts(): Promise<number> {
    try {
      const attemptsStr = await AsyncStorage.getItem(FAILED_ATTEMPTS_KEY);
      return attemptsStr ? parseInt(attemptsStr, 10) : 0;
    } catch (error) {
      console.error('Failed to get failed attempts:', error);
      return 0;
    }
  }

  async getLockoutTimeRemaining(): Promise<number> {
    try {
      const lockoutUntilStr = await AsyncStorage.getItem('@ClientPoc:LockoutUntil');

      if (!lockoutUntilStr) {
        return 0;
      }

      const lockoutUntil = parseInt(lockoutUntilStr, 10);
      const timeRemaining = Math.max(0, lockoutUntil - Date.now());

      return timeRemaining;
    } catch (error) {
      console.error('Failed to get lockout time remaining:', error);
      return 0;
    }
  }
}

export const authenticationService = new AuthenticationServiceImpl();