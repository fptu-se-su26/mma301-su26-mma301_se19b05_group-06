import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StoredUser {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  token: string;
  refreshToken?: string;
  isVerified?: boolean;
}

// Store user + tokens after login/register
export const storeUser = async (user: StoredUser) => {
  await AsyncStorage.setItem('user', JSON.stringify(user));
};

export const getStoredUser = async (): Promise<StoredUser | null> => {
  const stored = await AsyncStorage.getItem('user');
  return stored ? JSON.parse(stored) : null;
};

// Update only the access token (called by interceptor after refresh)
export const updateStoredToken = async (newToken: string) => {
  const stored = await AsyncStorage.getItem('user');
  if (!stored) return;
  const user = JSON.parse(stored);
  await AsyncStorage.setItem('user', JSON.stringify({ ...user, token: newToken }));
};

export const clearUser = async () => {
  await AsyncStorage.removeItem('user');
};
