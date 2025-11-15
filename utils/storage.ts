import AsyncStorage from '@react-native-async-storage/async-storage';

export const Storage = {
  set: async <T>(key: string, value: T): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`AsyncStorage set error for key "${key}":`, error);
    }
  },

  get: async <T>(key: string): Promise<T | null> => {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) as T : null;
    } catch (error) {
      console.error(`AsyncStorage get error for key "${key}":`, error);
      return null;
    }
  },

  remove: async (key: string): Promise<void> => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`AsyncStorage remove error for key "${key}":`, error);
    }
  },

  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clearAll error:', error);
    }
  },
};