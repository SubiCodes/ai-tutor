import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkIfKeyExists = async (key: string): Promise<boolean> => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking key "${key}" in AsyncStorage:`, error);
    return false;
  }
};