import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LuxuryColors } from '@/constants/luxuryTheme';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace('/login'), 300);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: LuxuryColors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={LuxuryColors.accent} />
    </View>
  );
};

export default Index;
