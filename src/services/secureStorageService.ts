import * as Keychain from 'react-native-keychain';
import { KeychainCredentials, SecureStorageService } from '../types';

const SERVICE_NAME = 'ClientPocApp';

class SecureStorageServiceImpl implements SecureStorageService {
  async storeCredentials(credentials: KeychainCredentials): Promise<void> {
    try {
      await Keychain.setInternetCredentials(
        SERVICE_NAME,
        credentials.username,
        credentials.password,
        {
          accessControl: Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET_OR_DEVICE_PASSCODE,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        }
      );
    } catch (error) {
      console.error('Failed to store credentials securely:', error);
      throw new Error('Failed to store credentials securely');
    }
  }

  async getCredentials(): Promise<KeychainCredentials | null> {
    try {
      const credentials = await Keychain.getInternetCredentials(SERVICE_NAME, {
        authenticationPrompt: {
          title: 'Authenticate',
          subtitle: 'Access your saved credentials',
          description: 'Use biometric authentication to sign in automatically',
          fallbackLabel: 'Use Passcode',
          cancelLabel: 'Cancel',
        },
      });

      if (credentials && credentials.username && credentials.password) {
        return {
          username: credentials.username,
          password: credentials.password,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve credentials:', error);
      return null;
    }
  }

  async clearCredentials(): Promise<void> {
    try {
      await Keychain.resetInternetCredentials(SERVICE_NAME);
    } catch (error) {
      console.error('Failed to clear credentials:', error);
      throw new Error('Failed to clear credentials');
    }
  }

  async hasCredentials(): Promise<boolean> {
    try {
      const credentials = await Keychain.getInternetCredentials(SERVICE_NAME);
      return credentials !== false;
    } catch (error) {
      console.error('Failed to check for credentials:', error);
      return false;
    }
  }

  async getSupportedBiometryType(): Promise<string | null> {
    try {
      const biometryType = await Keychain.getSupportedBiometryType();
      return biometryType;
    } catch (error) {
      console.error('Failed to get supported biometry type:', error);
      return null;
    }
  }
}

export const secureStorageService = new SecureStorageServiceImpl();