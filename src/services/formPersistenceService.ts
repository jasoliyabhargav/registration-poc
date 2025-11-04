import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormPersistenceService } from '../types';

const FORM_DATA_PREFIX = '@ClientPoc:FormData:';

class FormPersistenceServiceImpl implements FormPersistenceService {
  private getStorageKey(formId: string): string {
    return `${FORM_DATA_PREFIX}${formId}`;
  }

  async saveFormData(formId: string, data: Record<string, string>): Promise<void> {
    try {
      const key = this.getStorageKey(formId);
      const jsonData = JSON.stringify({
        data,
        timestamp: Date.now(),
      });
      await AsyncStorage.setItem(key, jsonData);
    } catch (error) {
      console.error('Failed to save form data:', error);
      throw new Error('Failed to save form data');
    }
  }

  async getFormData(formId: string): Promise<Record<string, string> | null> {
    try {
      const key = this.getStorageKey(formId);
      const jsonData = await AsyncStorage.getItem(key);

      if (!jsonData) {
        return null;
      }

      const parsedData = JSON.parse(jsonData);

      // Check if data is older than 24 hours
      const isExpired = Date.now() - parsedData.timestamp > 24 * 60 * 60 * 1000;

      if (isExpired) {
        await this.clearFormData(formId);
        return null;
      }

      return parsedData.data;
    } catch (error) {
      console.error('Failed to retrieve form data:', error);
      return null;
    }
  }

  async clearFormData(formId: string): Promise<void> {
    try {
      const key = this.getStorageKey(formId);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to clear form data:', error);
      throw new Error('Failed to clear form data');
    }
  }

  async clearAllFormData(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const formDataKeys = keys.filter(key => key.startsWith(FORM_DATA_PREFIX));

      if (formDataKeys.length > 0) {
        await AsyncStorage.multiRemove(formDataKeys);
      }
    } catch (error) {
      console.error('Failed to clear all form data:', error);
      throw new Error('Failed to clear all form data');
    }
  }

  async getFormDataList(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const formDataKeys = keys
        .filter(key => key.startsWith(FORM_DATA_PREFIX))
        .map(key => key.replace(FORM_DATA_PREFIX, ''));

      return formDataKeys;
    } catch (error) {
      console.error('Failed to get form data list:', error);
      return [];
    }
  }
}

export const formPersistenceService = new FormPersistenceServiceImpl();