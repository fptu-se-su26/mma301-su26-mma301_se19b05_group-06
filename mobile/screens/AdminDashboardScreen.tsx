import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Users, Car, Calendar, DollarSign, Activity, TrendingUp } from 'lucide-react-native';

import { 
  LuxuryColors, 
  LuxurySpacing, 
  LuxuryTypography, 
  LuxuryRadius 
} from '@/constants/luxuryTheme';
import { getStatsAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';

const AdminDashboardScreen = () => {
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

  const StatCard = ({ label, value, icon, index }: any) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.cardWrapper}
    >
      <GlassCard style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconContainer}>
            {icon}
          </View>
          <TrendingUp size={16} color={LuxuryColors.success} />
        </View>
        <Text style={styles.cardValue}>{value}</Text>
        <Text style={styles.cardLabel}>{label}</Text>
      </GlassCard>
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
    { label: 'Total Clients', value: stats.totalUsers || 0, icon: <Users size={20} color={LuxuryColors.accent} /> },
    { label: 'Elite Fleet', value: stats.totalCars || 0, icon: <Car size={20} color={LuxuryColors.accent} /> },
    { label: 'Reservations', value: stats.totalBookings || 0, icon: <Calendar size={20} color={LuxuryColors.accent} /> },
    { label: 'Gross Revenue', value: `$${stats.revenue?.toLocaleString() || 0}`, icon: <DollarSign size={20} color={LuxuryColors.accent} /> },
    { label: 'Active Today', value: stats.activeUsers || 0, icon: <Activity size={20} color={LuxuryColors.accent} /> },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Control Center</Text>
          <Text style={styles.subtitle}>Executive fleet management overview</Text>
        </View>
        
        <View style={styles.grid}>
          {statItems.map((item, idx) => (
            <StatCard key={idx} {...item} index={idx} />
          ))}
        </View>

        <GlassCard style={styles.mainInsight}>
          <View style={styles.insightHeader}>
            <Activity size={24} color={LuxuryColors.accent} />
            <Text style={styles.insightTitle}>Performance Insight</Text>
          </View>
          <Text style={styles.insightBody}>
            Fleet utilization is up 12% this week. Demand for premium electric vehicles is at an all-time high in the downtown hub.
          </Text>
        </GlassCard>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LuxuryColors.background,
  },
  content: {
    padding: LuxurySpacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...LuxuryTypography.titleL,
    color: LuxuryColors.accent,
  },
  subtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    marginTop: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  cardWrapper: {
    width: '47%',
  },
  card: {
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    textTransform: 'none',
    letterSpacing: 0,
  },
  cardValue: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 22,
  },
  mainInsight: {
    marginTop: 24,
    padding: 24,
    gap: 12,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  insightTitle: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
  },
  insightBody: {
    ...LuxuryTypography.body,
    fontSize: 14,
    color: LuxuryColors.textSecondary,
    lineHeight: 20,
  },
});

export default AdminDashboardScreen;
