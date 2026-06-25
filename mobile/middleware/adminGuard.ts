import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Admin Access Guard
 * Ensures only admin users can access protected admin screens
 * Redirects non-admin users to login
 */
export const useAdminGuard = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (!userJson) {
          // Not logged in
          router.replace('/login');
          return;
        }

        const user = JSON.parse(userJson);
        if (user.role !== 'admin') {
          // Not an admin
          router.replace('/');
          return;
        }
      } catch (error) {
        console.error('Admin guard error:', error);
        router.replace('/login');
      }
    };

    checkAdminAccess();
  }, [router]);
};

/**
 * Get user data and verify admin status
 */
export const getAdminUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem('user');
    if (!userJson) return null;
    
    const user = JSON.parse(userJson);
    return user.role === 'admin' ? user : null;
  } catch (error) {
    console.error('Error getting admin user:', error);
    return null;
  }
};

/**
 * Check if user is admin without navigation
 */
export const isUserAdmin = async () => {
  const user = await getAdminUser();
  return user !== null;
};
