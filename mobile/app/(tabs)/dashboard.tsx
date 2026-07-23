import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AdminDashboardScreen from '@/screens/AdminDashboardScreen';
import { LuxuryColors } from '@/constants/luxuryTheme';

export default function DashboardTab() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        setRole(user.role);
        // If not seller or admin, redirect back to showroom
        if (user.role !== 'admin' && user.role !== 'seller') {
          router.replace('/(tabs)');
        }
      } else {
        router.replace('/(auth)/login');
      }
    };
    checkUser();
  }, []);

  if (role === 'admin' || role === 'seller') {
    return <AdminDashboardScreen />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: LuxuryColors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={LuxuryColors.accent} />
    </View>
  );
}
