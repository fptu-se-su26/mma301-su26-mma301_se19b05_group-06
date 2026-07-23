import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AdminLayout() {
  const router = useRouter();

  useEffect(() => {
    // Check admin or seller access on layout mount
    const checkAdminAccess = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (!userJson) {
          router.replace('/login');
          return;
        }

        const user = JSON.parse(userJson);
        if (user.role !== 'admin' && user.role !== 'seller') {
          router.replace('/');
        }
      } catch (error) {
        console.error('Admin check error:', error);
        router.replace('/login');
      }
    };

    checkAdminAccess();
  }, [router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Dashboard (entry point) */}
      <Stack.Screen name="dashboard" />
      
      {/* Admin Management Screens */}
      <Stack.Screen name="users" />
      <Stack.Screen name="bookings" />
      <Stack.Screen name="payments" />
      <Stack.Screen name="analytics" />
      <Stack.Screen name="cars" />
      <Stack.Screen name="car-form" />
      <Stack.Screen name="availability" />
      <Stack.Screen name="calendar" />
      <Stack.Screen name="seller-requests" />
      <Stack.Screen name="vouchers" />
    </Stack>
  );
}
