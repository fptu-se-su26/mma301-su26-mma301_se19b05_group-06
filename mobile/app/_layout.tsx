import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { LuxuryColors } from '@/constants/luxuryTheme';

const RootLayout = () => (
  <View style={{ flex: 1, backgroundColor: LuxuryColors.background }}>
    <StatusBar style="light" />
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: LuxuryColors.background } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)/login" />
      <Stack.Screen name="(auth)/register" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(admin)" />
      <Stack.Screen name="car/[id]" />
    </Stack>
  </View>
);

export default RootLayout;
