import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Users,
  Car,
  Calendar,
  DollarSign,
  Activity,
  TrendingUp,
  LogOut,
  BarChart3,
  CreditCard,
  Zap
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius
} from '@/constants/luxuryTheme';
import { getStatsAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';

const AdminDashboardScreen = () => {
  const router = useRouter();
  const [stats, setStats] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const { data } = await getStatsAPI();
        setStats(data);
      } catch (error) {
        console.error('Stats load error:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          router.replace('/login');
        },
        style: 'destructive'
      }
    ]);
  };

  const StatCard = ({ label, value, icon, index }: any) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.statCardWrapper}
    >
      <GlassCard style={styles.statCard}>
        <View style={styles.statCardHeader}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <TrendingUp size={14} color={LuxuryColors.success} />
        </View>
        <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {value}
        </Text>
        <Text style={styles.statLabel} numberOfLines={1}>{label}</Text>
      </GlassCard>
    </Animated.View>
  );

  const SectionCard = ({ title, icon, onPress, items, index }: any) => (
    <Animated.View
      entering={FadeInDown.delay(index * 150).springify()}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <GlassCard style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              {icon}
            </View>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>{title}</Text>
              {items && <Text style={styles.sectionItems}>{items}</Text>}
            </View>
            <Text style={styles.arrowText}>›</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>
    </Animated.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
      </View>
    );
  }

  const statItems = [
    {
      label: 'Total Clients',
      value: stats.totalUsers || 0,
      icon: <Users size={18} color={LuxuryColors.accent} />
    },
    {
      label: 'Elite Fleet',
      value: stats.totalCars || 0,
      icon: <Car size={18} color={LuxuryColors.accent} />
    },
    {
      label: 'Reservations',
      value: stats.totalBookings || 0,
      icon: <Calendar size={18} color={LuxuryColors.accent} />
    },
    {
      label: 'Revenue',
      value: `$${(stats.revenue || 0).toLocaleString()}`,
      icon: <DollarSign size={18} color={LuxuryColors.accent} />
    }
  ];

  const adminSections = [
    {
      title: 'User Management',
      description: 'View, delete, and manage user accounts',
      icon: <Users size={24} color={LuxuryColors.accent} />,
      onPress: () => router.push('/(admin)/users'),
      items: `${stats.totalUsers || 0} users`
    },
    {
      title: 'Booking Management',
      description: 'Manage all reservations and approvals',
      icon: <Calendar size={24} color={LuxuryColors.accent} />,
      onPress: () => router.push('/(admin)/bookings'),
      items: `${stats.totalBookings || 0} bookings`
    },
    {
      title: 'Payment Verification',
      description: 'Confirm and track all payments',
      icon: <CreditCard size={24} color={LuxuryColors.accent} />,
      onPress: () => router.push('/(admin)/payments'),
      items: 'Pending payments'
    },
    {
      title: 'Analytics & Reports',
      description: 'View booking stats and revenue analytics',
      icon: <BarChart3 size={24} color={LuxuryColors.accent} />,
      onPress: () => router.push('/(admin)/analytics'),
      items: 'Revenue, stats, trends'
    },
    {
      title: 'Pricing Surge Analytics',
      description: 'Monitor dynamic pricing and demand',
      icon: <Zap size={24} color={LuxuryColors.accent} />,
      onPress: () => router.push('/(admin)/pricing'),
      items: 'Real-time surge analysis'
    },
    {
      title: 'Fleet Management',
      description: 'Manage cars and availability',
      icon: <Car size={24} color={LuxuryColors.accent} />,
      onPress: () => router.push('/(admin)/cars'),
      items: `${stats.totalCars || 0} vehicles`
    }
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Control Center</Text>
            <Text style={styles.subtitle}>Executive dashboard</Text>
          </View>
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              padding: 10,
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: LuxuryRadius.md
            }}
          >
            <LogOut size={20} color={LuxuryColors.danger} />
          </TouchableOpacity>
        </View>

        {/* Key Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionHeaderText}>Key Metrics</Text>
          <View style={styles.statsGrid}>
            {statItems.map((item, idx) => (
              <StatCard key={idx} {...item} index={idx} />
            ))}
          </View>
        </View>

        {/* Admin Sections */}
        <View style={styles.adminSection}>
          <Text style={styles.sectionHeaderText}>Administration</Text>
          <View style={styles.sectionsList}>
            {adminSections.map((section, idx) => (
              <SectionCard
                key={idx}
                title={section.title}
                icon={section.icon}
                onPress={section.onPress}
                items={section.items}
                index={idx}
              />
            ))}
          </View>
        </View>

        {/* Performance Insight */}
        <GlassCard style={styles.insightCard}>
          <View style={styles.insightHeader}>
            <Activity size={20} color={LuxuryColors.accent} />
            <Text style={styles.insightTitle}>System Status</Text>
          </View>
          <Text style={styles.insightBody}>
            All systems operational. Fleet utilization is at optimal levels.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LuxuryColors.background
  },
  content: {
    padding: LuxurySpacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 40
  },
  header: {
    marginBottom: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    ...LuxuryTypography.titleL,
    color: LuxuryColors.accent,
    marginBottom: 4
  },
  subtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted
  },

  // Key Metrics Section
  statsSection: {
    marginBottom: 36
  },
  sectionHeaderText: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.textPrimary,
    marginBottom: 16
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  statCardWrapper: {
    width: '48%',
    flexGrow: 0,
    flexShrink: 0
  },
  statCard: {
    padding: 16,
    gap: 10
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: LuxuryRadius.lg,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  statValue: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.textPrimary,
    fontWeight: '700'
  },
  statLabel: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted
  },

  // Admin Sections
  adminSection: {
    marginBottom: 32
  },
  sectionsList: {
    gap: 12
  },
  sectionCard: {
    padding: 18,
    borderRadius: LuxuryRadius.xl
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  sectionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: LuxuryRadius.lg,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  sectionTitleContainer: {
    flex: 1
  },
  sectionTitle: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textPrimary,
    marginBottom: 4
  },
  sectionItems: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted
  },
  arrowText: {
    fontSize: 24,
    color: LuxuryColors.accent,
    fontWeight: '300',
    marginLeft: 8
  },

  // Insight Card
  insightCard: {
    padding: 20,
    marginBottom: 20
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10
  },
  insightTitle: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textPrimary
  },
  insightBody: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textMuted,
    lineHeight: 20
  }
});

export default AdminDashboardScreen;
