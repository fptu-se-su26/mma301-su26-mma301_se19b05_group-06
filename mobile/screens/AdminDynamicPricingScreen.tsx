import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Car,
  AlertTriangle,
  BarChart3,
  Clock,
  ChevronLeft,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { getPricingSurgesAPI, getCarsAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';
import { useAdminGuard } from '@/middleware/adminGuard';

// ─── Types ────────────────────────────────────────────────────────────────────
interface SurgeItem {
  carId?: string;
  carName?: string;
  date?: string;
  surgeMultiplier?: number;
  basePrice?: number;
  dynamicPrice?: number;
  reason?: string;
}

interface CarItem {
  _id: string;
  name?: string;
  model?: string;
  brand?: string;
  pricePerDay: number;
  imageUrl?: string;
  type?: string;
}

// ─── Mock Fallback ─────────────────────────────────────────────────────────
// Removed mock fallback — show empty/error states instead of fake data

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (price: number) => {
  if (price >= 1_000_000) return `${(price / 1_000_000).toFixed(1)}M`;
  return price.toLocaleString();
};

const getSurgeColor = (multiplier: number) => {
  if (multiplier >= 1.8) return '#F43F5E';
  if (multiplier >= 1.4) return '#F97316';
  if (multiplier >= 1.1) return '#EAB308';
  return '#10B981';
};

const getSurgeLabel = (multiplier: number) => {
  if (multiplier >= 1.8) return 'CRITICAL';
  if (multiplier >= 1.4) return 'HIGH';
  if (multiplier >= 1.1) return 'ELEVATED';
  return 'NORMAL';
};

// ─── Summary Card ─────────────────────────────────────────────────────────────
const SummaryCard = ({ label, value, icon, color, index }: any) => (
  <Animated.View entering={FadeInDown.delay(index * 80).springify()} style={styles.summaryCardWrapper}>
    <GlassCard style={styles.summaryCard}>
      <View style={[styles.summaryIcon, { backgroundColor: `${color}18` }]}>
        {icon}
      </View>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </GlassCard>
  </Animated.View>
);

// ─── Surge Row ────────────────────────────────────────────────────────────────
const SurgeRow = ({ item, index }: { item: SurgeItem; index: number }) => {
  const multiplier = item.surgeMultiplier ?? 1.0;
  const surgeColor = getSurgeColor(multiplier);
  const label = getSurgeLabel(multiplier);
  const isSurge = multiplier > 1.0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <GlassCard style={styles.surgeRow}>
        {/* Left: Car info */}
        <View style={styles.surgeLeft}>
          <View style={styles.surgeIconWrap}>
            <Car size={16} color={LuxuryColors.accent} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.surgeCarName} numberOfLines={1}>
              {item.carName || 'Unknown Vehicle'}
            </Text>
            <View style={styles.surgeMetaRow}>
              <Clock size={10} color={LuxuryColors.textMuted} />
              <Text style={styles.surgeDateText}>{item.date || '—'}</Text>
            </View>
            {item.reason ? (
              <Text style={styles.surgeReason} numberOfLines={1}>
                {item.reason}
              </Text>
            ) : null}
          </View>
        </View>

        {/* Right: Pricing */}
        <View style={styles.surgeRight}>
          <View style={[styles.surgeBadge, { backgroundColor: `${surgeColor}22`, borderColor: `${surgeColor}55` }]}>
            {isSurge ? (
              <TrendingUp size={10} color={surgeColor} />
            ) : (
              <TrendingDown size={10} color={surgeColor} />
            )}
            <Text style={[styles.surgeBadgeText, { color: surgeColor }]}>{label}</Text>
          </View>
          <Text style={[styles.surgeMultiplierText, { color: surgeColor }]}>
            ×{multiplier.toFixed(1)}
          </Text>
          <Text style={styles.surgeDynamicPrice}>
            {formatPrice(item.dynamicPrice ?? 0)}đ
          </Text>
          {item.basePrice && item.basePrice !== item.dynamicPrice && (
            <Text style={styles.surgeBasePrice}>
              Base: {formatPrice(item.basePrice)}đ
            </Text>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdminDynamicPricingScreen = () => {
  const router = useRouter();
  useAdminGuard(); // Check admin access
  
  const [surges, setSurges] = useState<SurgeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const { data } = await getPricingSurgesAPI();
      const list: SurgeItem[] = Array.isArray(data) ? data : (data?.surges ?? []);
      setSurges(list);
      setLoadError(null);
    } catch {
      setSurges([]);
      setLoadError('Unable to load surge pricing data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, []);

  // Compute summary stats
  const totalSurge = surges.filter((s) => (s.surgeMultiplier ?? 1) > 1).length;
  const avgMultiplier = surges.length
    ? (surges.reduce((acc, s) => acc + (s.surgeMultiplier ?? 1), 0) / surges.length).toFixed(2)
    : '1.00';
  const maxSurge = surges.reduce((max, s) => Math.max(max, s.surgeMultiplier ?? 1), 1).toFixed(1);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
        <Text style={styles.loadingText}>Loading pricing data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={LuxuryColors.accent}
          />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={LuxuryColors.accent} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Dynamic Pricing</Text>
            <Text style={styles.subtitle}>Real-time surge & demand pricing</Text>
          </View>
          <View style={styles.headerBadge}>
            <Zap size={14} color={LuxuryColors.accent} />
            <Text style={styles.headerBadgeText}>LIVE</Text>
          </View>
        </Animated.View>

        {/* Summary Stats */}
        {loadError && (
          <GlassCard style={styles.errorBanner}>
            <Text style={styles.errorText}>{loadError}</Text>
          </GlassCard>
        )}

        <View style={styles.summaryRow}>
          <SummaryCard
            label="Surge Active"
            value={totalSurge}
            icon={<AlertTriangle size={18} color="#F43F5E" />}
            color="#F43F5E"
            index={0}
          />
          <SummaryCard
            label="Avg Multiplier"
            value={`×${avgMultiplier}`}
            icon={<BarChart3 size={18} color={LuxuryColors.accent} />}
            color={LuxuryColors.accent}
            index={1}
          />
          <SummaryCard
            label="Peak Rate"
            value={`×${maxSurge}`}
            icon={<TrendingUp size={18} color="#F97316" />}
            color="#F97316"
            index={2}
          />
        </View>

        {/* Legend */}
        <GlassCard style={styles.legendCard}>
          <Text style={styles.legendTitle}>PRICING TIERS</Text>
          <View style={styles.legendRow}>
            {[
              { color: '#10B981', label: 'Normal (×1.0)' },
              { color: '#EAB308', label: 'Elevated (×1.1+)' },
              { color: '#F97316', label: 'High (×1.4+)' },
              { color: '#F43F5E', label: 'Critical (×1.8+)' },
            ].map((tier) => (
              <View key={tier.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: tier.color }]} />
                <Text style={styles.legendLabel}>{tier.label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        {/* Surge List */}
        <View style={styles.sectionHeader}>
          <DollarSign size={16} color={LuxuryColors.accent} />
          <Text style={styles.sectionTitle}>ACTIVE PRICING EVENTS</Text>
          <Text style={styles.sectionCount}>{surges.length}</Text>
        </View>

        <View style={styles.list}>
          {surges.map((item, idx) => (
            <SurgeRow key={`${item.carId}-${idx}`} item={item} index={idx} />
          ))}
        </View>

        {surges.length === 0 && (
          <GlassCard style={styles.emptyCard}>
            <DollarSign size={40} color={LuxuryColors.textMuted} />
            <Text style={styles.emptyText}>No surge data available</Text>
            <Text style={styles.emptySubtext}>
              {loadError ? 'Please try again later' : 'All vehicles are at base rate'}
            </Text>
          </GlassCard>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
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
    gap: 16,
  },
  loadingText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
  },
  content: {
    padding: LuxurySpacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: LuxuryRadius.md,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...LuxuryTypography.titleL,
    color: '#FFF',
  },
  subtitle: {
    ...LuxuryTypography.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 4,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
    borderRadius: LuxuryRadius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.3)',
  },
  headerBadgeText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  summaryCardWrapper: {
    flex: 1,
    minWidth: 0,
  },
  summaryCard: {
    padding: 14,
    alignItems: 'flex-start',
    gap: 8,
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryValue: {
    ...LuxuryTypography.titleM,
    fontSize: 18,
    fontWeight: '800',
    width: '100%',
  },
  summaryLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    textAlign: 'left',
    textTransform: 'none',
    letterSpacing: 0,
    width: '100%',
  },
  legendCard: {
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  legendTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 10,
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 11,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    flex: 1,
  },
  sectionCount: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 10,
  },
  list: {
    gap: 12,
  },
  surgeRow: {
    padding: 14,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  surgeLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  surgeIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  surgeCarName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
    marginBottom: 4,
  },
  surgeMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  surgeDateText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    textTransform: 'none',
    letterSpacing: 0,
  },
  surgeReason: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 10,
    fontStyle: 'italic',
  },
  surgeRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  surgeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LuxuryRadius.full,
    borderWidth: 1,
  },
  surgeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  surgeMultiplierText: {
    fontSize: 20,
    fontWeight: '800',
  },
  surgeDynamicPrice: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  surgeBasePrice: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    fontSize: 10,
    textDecorationLine: 'line-through',
  },
  emptyCard: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
  },
  emptyText: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    textAlign: 'center',
  },
  emptySubtext: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    textAlign: 'center',
  },
  errorBanner: {
    padding: 12,
    marginBottom: 16,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderColor: 'rgba(244, 63, 94, 0.3)',
  },
  errorText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.danger,
  },
});

export default AdminDynamicPricingScreen;
