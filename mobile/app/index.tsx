import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { LuxuryColors } from '@/constants/luxuryTheme';
import { getStoredUser } from '@/services/storage';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      try {
        const user = await getStoredUser();
        if (user) {
          if (user.role === 'admin') {
            router.replace('/(admin)/dashboard' as any);
          } else {
            router.replace('/(tabs)');
          }
        } else {
          router.replace('/(auth)/login');
        }
      } catch (error) {
        router.replace('/(auth)/login');
      }
    };
    checkUser();
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: LuxuryColors.background, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color={LuxuryColors.accent} />
    </View>
  );
};

export default Index;
