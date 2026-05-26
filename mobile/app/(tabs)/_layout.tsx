import { Tabs } from 'expo-router';
import { ShieldCheck, Compass, Calendar, User } from 'lucide-react-native';
import { LuxuryColors, LuxuryTypography } from '@/constants/luxuryTheme';
import { Platform } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#020617', // Dark background matching theme
          borderTopColor: 'rgba(255, 255, 255, 0.08)',
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 10,
          boxShadow: '0px -10px 30px rgba(0, 0, 0, 0.5)',
          elevation: 8,
        },
        tabBarActiveTintColor: LuxuryColors.accent,
        tabBarInactiveTintColor: LuxuryColors.textSecondary,
        tabBarLabelStyle: {
          ...LuxuryTypography.tiny,
          fontSize: 9,
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'SHOWROOM',
          tabBarIcon: ({ color, size }) => <ShieldCheck size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'DISCOVER',
          tabBarIcon: ({ color, size }) => <Compass size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'RESERVATIONS',
          tabBarIcon: ({ color, size }) => <Calendar size={20} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
          tabBarIcon: ({ color, size }) => <User size={20} color={color} />,
        }}
      />
    </Tabs>
  );
}
