import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { getStoredUser } from '@/services/storage';
import { View, ActivityIndicator } from 'react-native';
import { LuxuryColors } from '@/constants/luxuryTheme';

interface UseAdminGuardReturn {
  isAdmin: boolean;
  isLoading: boolean;
}

export const useAdminGuard = (): UseAdminGuardReturn => {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const user = await getStoredUser();
        if (!user || user.role !== 'admin') {
          // Redirect non-admin users to login
          await new Promise(r => setTimeout(r, 500)); // Brief delay for smooth transition
          router.replace('/(tabs)');
          return;
        }
        setIsAdmin(true);
      } catch (error) {
        console.error('Admin guard check error:', error);
        router.replace('/(tabs)');
      } finally {
        setIsLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

  return { isAdmin, isLoading };
};

// ─── Admin Guard Component ────────────────────────────────────────────────────
interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { isAdmin, isLoading } = useAdminGuard();

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: LuxuryColors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
      </View>
    );
  }

  if (!isAdmin) {
    return null; // useAdminGuard will handle redirect
  }

  return <>{children}</>;
};

export default useAdminGuard;
