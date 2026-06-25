import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, TrendingUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius
} from '@/constants/luxuryTheme';
import GlassCard from '@/components/GlassCard';
import { useAdminGuard } from '@/middleware/adminGuard';
import {
  getBookingStatisticsAPI,
  getAnalyticsAPI,
  getPricingSurgesAPI
} from '@/services/api';

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const formatNumber = (value: unknown, prefix = '') => {
  const num = typeof value === 'number' && !Number.isNaN(value) ? value : 0;
  return `${prefix}${num.toLocaleString()}`;
};

const formatMonthLabel = (item: { _id?: { year?: number; month?: number }; month?: number; year?: number }) => {
  const month = item._id?.month ?? item.month;
  const year = item._id?.year ?? item.year;
  if (!month || !year) return '-';
  return `${MONTH_NAMES[month - 1] ?? month} ${year}`;
};

const AnalyticsScreen = () => {
  const router = useRouter();
  useAdminGuard();

  const [stats, setStats] = useState<any>({});
  const [analytics, setAnalytics] = useState<any>(null);
  const [surges, setSurges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'analytics' | 'surges'>('bookings');
  const [errors, setErrors] = useState<{ bookings?: string; analytics?: string; surges?: string }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const nextErrors: typeof errors = {};

    const bookingResult = await getBookingStatisticsAPI()
      .then((res) => ({ ok: true as const, data: res.data }))
      .catch(() => {
        nextErrors.bookings = 'Unable to load booking statistics';
        return { ok: false as const, data: null };
      });

    const analyticsResult = await getAnalyticsAPI('month')
      .then((res) => ({ ok: true as const, data: res.data }))
      .catch(() => {
        nextErrors.analytics = 'Unable to load revenue analytics';
        return { ok: false as const, data: null };
      });

    const surgeResult = await getPricingSurgesAPI()
      .then((res) => ({ ok: true as const, data: res.data }))
      .catch(() => {
        nextErrors.surges = 'Unable to load surge pricing data';
        return { ok: false as const, data: null };
      });

    setStats(bookingResult.data || {});
    setAnalytics(analyticsResult.data || null);
    setSurges(Array.isArray(surgeResult.data) ? surgeResult.data : []);
    setErrors(nextErrors);
    setLoading(false);
  };

  const StatGrid = ({ label, value, index }: { label: string; value: string; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).springify()}
      style={styles.statGridWrapper}
    >
      <GlassCard style={styles.statGrid}>
        <Text style={styles.gridLabel} numberOfLines={1}>{label}</Text>
        <Text style={styles.gridValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {value}
        </Text>
      </GlassCard>
    </Animated.View>
  );

  const ErrorBanner = ({ message }: { message: string }) => (
    <GlassCard style={styles.errorBanner}>
      <Text style={styles.errorText}>{message}</Text>
    </GlassCard>
  );

  const monthlyRevenue = Array.isArray(stats.monthlyRevenue) ? stats.monthlyRevenue : [];
  const bookingsByStatus = stats.bookingsByStatus && typeof stats.bookingsByStatus === 'object'
    ? stats.bookingsByStatus
    : {};
  const statusEntries = Object.entries(bookingsByStatus).filter(
    ([status]) => status !== 'null' && status !== 'undefined'
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={LuxuryColors.accent} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Analytics</Text>
            <Text style={styles.subtitle}>Business insights and reports</Text>
          </View>
        </View>

        <View style={styles.tabs}>
          {(['bookings', 'analytics', 'surges'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === 'bookings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Statistics</Text>
            {errors.bookings && <ErrorBanner message={errors.bookings} />}

            <GlassCard style={styles.card}>
              <View style={styles.cardRow}>
                <View style={styles.cardContent}>
                  <Text style={styles.label}>Total Bookings</Text>
                  <Text style={styles.value}>{formatNumber(stats.totalBookings)}</Text>
                </View>
                <TrendingUp size={32} color={LuxuryColors.accent} />
              </View>
            </GlassCard>

            <Text style={styles.subSectionTitle}>By Status</Text>
            {statusEntries.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No booking status data available</Text>
              </GlassCard>
            ) : (
              statusEntries.map(([status, count], idx) => (
                <Animated.View
                  key={status}
                  entering={FadeInDown.delay(idx * 100).springify()}
                >
                  <GlassCard style={styles.statusCard}>
                    <View style={styles.statusRow}>
                      <Text style={styles.statusLabel}>{status}</Text>
                      <Text style={styles.statusValue}>{formatNumber(count)}</Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))
            )}
          </View>
        )}

        {activeTab === 'analytics' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Revenue Analytics</Text>
            {errors.analytics && <ErrorBanner message={errors.analytics} />}

            <Text style={styles.subSectionTitle}>Key Metrics</Text>
            <View style={styles.analyticsGrid}>
              <StatGrid
                label="Period"
                value={(analytics?.period || 'month').toUpperCase()}
                index={0}
              />
              <StatGrid
                label="Total Bookings"
                value={formatNumber(analytics?.totalBookings)}
                index={1}
              />
              <StatGrid
                label="Paid Bookings"
                value={formatNumber(analytics?.paidBookings)}
                index={2}
              />
              <StatGrid
                label="Total Revenue"
                value={formatNumber(analytics?.totalRevenue, '$')}
                index={3}
              />
              <StatGrid
                label="Avg Value"
                value={formatNumber(analytics?.averageBookingValue, '$')}
                index={4}
              />
            </View>

            <Text style={styles.subSectionTitle}>Monthly Revenue Trend</Text>
            {monthlyRevenue.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No revenue trend data available</Text>
              </GlassCard>
            ) : (
              monthlyRevenue.map((item: any, idx: number) => (
                <Animated.View
                  key={`${item._id?.year ?? item.year}-${item._id?.month ?? item.month}-${idx}`}
                  entering={FadeInDown.delay(idx * 100).springify()}
                >
                  <GlassCard style={styles.trendCard}>
                    <View style={styles.trendRow}>
                      <Text style={styles.trendLabel}>{formatMonthLabel(item)}</Text>
                      <Text style={styles.trendValue}>
                        {formatNumber(item.revenue, '$')}
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))
            )}
          </View>
        )}

        {activeTab === 'surges' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pricing Surge Analytics</Text>
            {errors.surges && <ErrorBanner message={errors.surges} />}

            {surges.length === 0 ? (
              <GlassCard style={styles.emptyCard}>
                <Text style={styles.emptyText}>No surge data available</Text>
              </GlassCard>
            ) : (
              surges.map((surge, idx) => (
                <Animated.View
                  key={`${surge.carId ?? 'surge'}-${idx}`}
                  entering={FadeInDown.delay(idx * 100).springify()}
                >
                  <GlassCard style={styles.surgeCard}>
                    <View style={styles.surgeHeader}>
                      <View style={styles.surgeInfo}>
                        <Text style={styles.surgeName} numberOfLines={1}>
                          {surge.carName || 'Unknown Vehicle'}
                        </Text>
                        <Text style={styles.surgeReason} numberOfLines={1}>
                          {surge.reason || '-'}
                        </Text>
                      </View>
                      <View style={styles.surgeMultiplier}>
                        <Text style={styles.multiplierValue}>
                          ×{(surge.surgeMultiplier ?? 1).toFixed(1)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.surgePrice}>
                      <Text style={styles.priceLabel}>Dynamic Price</Text>
                      <Text style={styles.priceValue}>
                        {formatNumber(surge.dynamicPrice, '$')}
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))
            )}
          </View>
        )}
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
    backgroundColor: LuxuryColors.background,
    gap: 12
  },
  loadingText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted
  },
  content: {
    padding: LuxurySpacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 40
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    gap: 12
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: LuxuryRadius.md,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    ...LuxuryTypography.titleL,
    color: LuxuryColors.accent,
    marginBottom: 4
  },
  subtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 4,
    borderRadius: LuxuryRadius.lg
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: LuxuryRadius.md,
    alignItems: 'center'
  },
  activeTab: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)'
  },
  tabText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontWeight: '600'
  },
  activeTabText: {
    color: LuxuryColors.accent
  },
  section: {
    gap: 4
  },
  sectionTitle: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.textPrimary,
    marginBottom: 16
  },
  subSectionTitle: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textSecondary,
    marginTop: 20,
    marginBottom: 12
  },
  errorBanner: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)'
  },
  errorText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.danger
  },
  card: {
    padding: 20,
    marginBottom: 12
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cardContent: {
    flex: 1,
    minWidth: 0
  },
  label: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    marginBottom: 8
  },
  value: {
    ...LuxuryTypography.titleL,
    color: LuxuryColors.accent,
    fontWeight: '700'
  },
  statusCard: {
    padding: 16,
    marginBottom: 12
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusLabel: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textPrimary,
    flex: 1,
    marginRight: 12
  },
  statusValue: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.accent
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
    marginBottom: 8
  },
  statGridWrapper: {
    width: '48%',
    flexGrow: 0,
    flexShrink: 0
  },
  statGrid: {
    padding: 14,
    alignItems: 'flex-start',
    minHeight: 88
  },
  gridLabel: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    marginBottom: 8,
    width: '100%'
  },
  gridValue: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.accent,
    fontWeight: '700',
    width: '100%'
  },
  trendCard: {
    padding: 14,
    marginBottom: 12
  },
  trendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  trendLabel: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textPrimary,
    flex: 1,
    marginRight: 12
  },
  trendValue: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.accent
  },
  surgeCard: {
    padding: 16,
    marginBottom: 12
  },
  surgeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  surgeInfo: {
    flex: 1,
    minWidth: 0,
    marginRight: 12
  },
  surgeName: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textPrimary,
    marginBottom: 4
  },
  surgeReason: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary
  },
  surgeMultiplier: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LuxuryRadius.md
  },
  multiplierValue: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.accent
  },
  surgePrice: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    paddingTop: 12
  },
  priceLabel: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    marginBottom: 4
  },
  priceValue: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.accent,
    fontWeight: '700'
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 12
  },
  emptyText: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textMuted,
    textAlign: 'center'
  }
});

export default AnalyticsScreen;
