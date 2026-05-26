import { Tabs } from 'expo-router';
import React from 'react';
import { BlurView } from 'expo-blur';
import { StyleSheet, Platform } from 'react-native';
import { LayoutDashboard, Users, Car, CalendarClock } from 'lucide-react-native';

import { LuxuryColors } from '@/constants/luxuryTheme';

export default function AdminTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: LuxuryColors.accent,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.4)',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 24,
          left: 20,
          right: 20,
          height: 64,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(15, 23, 42, 0.95)',
          borderRadius: 32,
          borderTopWidth: 0,
          paddingBottom: 0,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.1)',
          elevation: 10,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView 
              tint="dark" 
              intensity={80} 
              style={{ ...StyleSheet.absoluteFillObject, borderRadius: 32, overflow: 'hidden' }} 
            />
          ) : null
        ),
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginBottom: 4,
        },
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'STATS',
          tabBarIcon: ({ color }) => <LayoutDashboard size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'CLIENTS',
          tabBarIcon: ({ color }) => <Users size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="cars"
        options={{
          title: 'FLEET',
          tabBarIcon: ({ color }) => <Car size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'ORDERS',
          tabBarIcon: ({ color }) => <CalendarClock size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
