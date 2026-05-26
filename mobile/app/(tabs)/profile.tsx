import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Image, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { User, Mail, ShieldAlert, LogOut, ShieldCheck, CreditCard } from 'lucide-react-native';
import { LuxuryColors, LuxuryTypography, LuxuryRadius, LuxurySpacing } from '@/constants/luxuryTheme';
import { getStoredUser, clearUser, StoredUser } from '@/services/storage';
import GlassCard from '@/components/GlassCard';
import LuxuryButton from '@/components/LuxuryButton';
import { PremiumPressable } from '@/components/PremiumPressable';

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await clearUser();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <View style={styles.header}>
        <Text style={styles.subtitle}>ACCOUNT DETAILS</Text>
        <Text style={styles.title}>Client Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Avatar Card */}
        <GlassCard style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=300&auto=format&fit=crop' }}
              style={styles.avatarImg}
            />
            <View style={styles.rolePill}>
              <ShieldCheck size={12} color={LuxuryColors.background} />
              <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'CLIENT'}</Text>
            </View>
          </View>
          
          <Text style={styles.clientName}>{user?.name || 'Exclusive Member'}</Text>
          <Text style={styles.clientEmail}>{user?.email || 'member@exclusiveride.com'}</Text>
        </GlassCard>

        {/* Menu Items */}
        <View style={styles.menuGroup}>
          <PremiumPressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <User size={18} color={LuxuryColors.accent} />
              <Text style={styles.menuItemText}>Personal Credentials</Text>
            </View>
          </PremiumPressable>

          <PremiumPressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <CreditCard size={18} color={LuxuryColors.accent} />
              <Text style={styles.menuItemText}>Billing & Payments</Text>
            </View>
          </PremiumPressable>

          <PremiumPressable style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <ShieldAlert size={18} color={LuxuryColors.accent} />
              <Text style={styles.menuItemText}>Security Preferences</Text>
            </View>
          </PremiumPressable>
        </View>

        {/* Logout Button */}
        <View style={{ marginTop: 20 }}>
          <LuxuryButton
            title="LOG OUT OF FLEET"
            onPress={handleLogout}
            style={styles.logoutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  header: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  subtitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    letterSpacing: 2,
  },
  title: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 20,
  },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  avatarImg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: LuxuryColors.accent,
  },
  rolePill: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
    gap: 4,
  },
  roleText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 8,
    fontWeight: '900',
  },
  clientName: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontWeight: 'bold',
  },
  clientEmail: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
  },
  menuGroup: {
    gap: 12,
  },
  menuItem: {
    backgroundColor: LuxuryColors.card,
    borderRadius: LuxuryRadius.md,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuItemText: {
    ...LuxuryTypography.body,
    color: '#FFF',
    fontSize: 15,
  },
  logoutButton: {
    backgroundColor: 'rgba(244, 63, 94, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
});
