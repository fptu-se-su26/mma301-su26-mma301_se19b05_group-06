import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import {
  Car,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
  Calendar,
  Search,
  Info,
} from 'lucide-react-native';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { getCarsAPI, getAvailabilityByCarAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

// ─── Types ────────────────────────────────────────────────────────────────────
interface CarItem {
  _id: string;
  name?: string;
  model?: string;
  brand?: string;
  pricePerDay: number;
  imageUrl?: string;
  type?: string;
  location?: string;
}

interface AvailabilityEntry {
  date?: string;
  startDate?: string;
  endDate?: string;
  status?: 'booked' | 'available' | 'maintenance';
  bookingId?: string;
  clientName?: string;
}

// ─── Mock Fallback ─────────────────────────────────────────────────────────
const MOCK_AVAILABILITY: AvailabilityEntry[] = [
  { date: '2026-06-05', startDate: '2026-06-05', endDate: '2026-06-07', status: 'booked', clientName: 'Nguyen Van A' },
  { date: '2026-06-08', status: 'available' },
  { date: '2026-06-09', status: 'available' },
  { date: '2026-06-10', startDate: '2026-06-10', endDate: '2026-06-12', status: 'booked', clientName: 'Tran Thi B' },
  { date: '2026-06-13', status: 'maintenance' },
  { date: '2026-06-14', status: 'available' },
  { date: '2026-06-15', startDate: '2026-06-15', endDate: '2026-06-18', status: 'booked', clientName: 'Le Van C' },
];

const MOCK_CARS: CarItem[] = [
  { _id: '1', brand: 'Rolls-Royce', model: 'Phantom VIII', pricePerDay: 15000000, type: 'Hypercar', location: 'Hanoi Premium Hub' },
  { _id: '2', brand: 'Porsche', model: '911 GT3 RS', pricePerDay: 8500000, type: 'Supercar', location: 'Saigon Elite Hub' },
  { _id: '3', brand: 'Lamborghini', model: 'Aventador SVJ', pricePerDay: 18000000, type: 'Supercar', location: 'Danang Luxury Hub' },
  { _id: '4', brand: 'Bentley', model: 'Continental GT', pricePerDay: 11000000, type: 'Luxury Sedan', location: 'Hanoi Premium Hub' },
];

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  booked: { color: '#F43F5E', bg: 'rgba(244, 63, 94, 0.12)', label: 'BOOKED', icon: XCircle },
  available: { color: '#10B981', bg: 'rgba(16, 185, 129, 0.12)', label: 'AVAILABLE', icon: CheckCircle2 },
  maintenance: { color: '#F97316', bg: 'rgba(249, 115, 22, 0.12)', label: 'MAINTENANCE', icon: Info },
};

// ─── Car Selector Item ────────────────────────────────────────────────────────
const CarSelectorItem = ({
  car,
  selected,
  onPress,
}: {
  car: CarItem;
  selected: boolean;
  onPress: () => void;
}) => (
  <PremiumPressable onPress={onPress} style={[styles.carSelectorItem, selected && styles.carSelectorItemActive]}>
    <View style={[styles.carSelectorIcon, selected && styles.carSelectorIconActive]}>
      <Car size={14} color={selected ? LuxuryColors.background : LuxuryColors.accent} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.carSelectorName, selected && styles.carSelectorNameActive]} numberOfLines={1}>
        {car.brand} {car.model}
      </Text>
      <Text style={styles.carSelectorSub} numberOfLines={1}>
        {car.type} · {car.location || 'Hub'}
      </Text>
    </View>
    {selected && <CheckCircle2 size={16} color={LuxuryColors.background} />}
  </PremiumPressable>
);

// ─── Availability Row ─────────────────────────────────────────────────────────
const AvailabilityRow = ({ entry, index }: { entry: AvailabilityEntry; index: number }) => {
  const status = entry.status ?? 'available';
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.available;
  const IconComp = cfg.icon;

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <GlassCard style={styles.availRow}>
        <View style={[styles.availStatusIcon, { backgroundColor: cfg.bg }]}>
          <IconComp size={16} color={cfg.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.availDate}>
            {entry.startDate && entry.endDate
              ? `${entry.startDate} → ${entry.endDate}`
              : entry.date ?? '—'}
          </Text>
          {entry.clientName ? (
            <Text style={styles.availClient}>Client: {entry.clientName}</Text>
          ) : null}
        </View>
        <View style={[styles.availBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '44' }]}>
          <Text style={[styles.availBadgeText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </GlassCard>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdminCarAvailabilityScreen = () => {
  const [cars, setCars] = useState<CarItem[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarItem | null>(null);
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([]);
  const [loadingCars, setLoadingCars] = useState(true);
  const [loadingAvail, setLoadingAvail] = useState(false);
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Load car list
  const loadCars = async () => {
    try {
      const { data } = await getCarsAPI();
      const list: CarItem[] = Array.isArray(data) ? data : [];
      setCars(list.length > 0 ? list : MOCK_CARS);
    } catch {
      setCars(MOCK_CARS);
    } finally {
      setLoadingCars(false);
    }
  };

  useEffect(() => { loadCars(); }, []);

  // Load availability for selected car
  const loadAvailability = useCallback(async (car: CarItem) => {
    setLoadingAvail(true);
    try {
      const { data } = await getAvailabilityByCarAPI(car._id);
      const list: AvailabilityEntry[] = Array.isArray(data) ? data : (data?.availability ?? []);
      setAvailability(list.length > 0 ? list : MOCK_AVAILABILITY);
    } catch {
      setAvailability(MOCK_AVAILABILITY);
    } finally {
      setLoadingAvail(false);
      setRefreshing(false);
    }
  }, []);

  const handleSelectCar = (car: CarItem) => {
    setSelectedCar(car);
    setSelectorOpen(false);
    loadAvailability(car);
  };

  const onRefresh = useCallback(() => {
    if (selectedCar) {
      setRefreshing(true);
      loadAvailability(selectedCar);
    }
  }, [selectedCar, loadAvailability]);

  // Compute stats
  const totalBooked = availability.filter((a) => a.status === 'booked').length;
  const totalAvail = availability.filter((a) => a.status === 'available').length;
  const totalMaint = availability.filter((a) => a.status === 'maintenance').length;

  if (loadingCars) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
        <Text style={styles.loadingText}>Loading fleet data...</Text>
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={LuxuryColors.accent} />
        }
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500).springify()} style={styles.header}>
          <View>
            <Text style={styles.title}>Car Availability</Text>
            <Text style={styles.subtitle}>Check real-time vehicle schedules</Text>
          </View>
          <View style={styles.headerIconWrap}>
            <Search size={18} color={LuxuryColors.accent} />
          </View>
        </Animated.View>

        {/* Car Selector */}
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <PremiumPressable
            onPress={() => setSelectorOpen(!selectorOpen)}
            style={[styles.selectorToggle, selectorOpen && styles.selectorToggleOpen]}
          >
            <Car size={18} color={LuxuryColors.accent} />
            <Text style={styles.selectorToggleText} numberOfLines={1}>
              {selectedCar ? `${selectedCar.brand} ${selectedCar.model}` : 'Select a vehicle to check...'}
            </Text>
            {selectorOpen ? (
              <ChevronUp size={16} color={LuxuryColors.textMuted} />
            ) : (
              <ChevronDown size={16} color={LuxuryColors.textMuted} />
            )}
          </PremiumPressable>
        </Animated.View>

        {selectorOpen && (
          <Animated.View entering={FadeIn.duration(200)} style={styles.selectorDropdown}>
            <GlassCard>
              {cars.map((car, idx) => (
                <CarSelectorItem
                  key={car._id}
                  car={car}
                  selected={selectedCar?._id === car._id}
                  onPress={() => handleSelectCar(car)}
                />
              ))}
            </GlassCard>
          </Animated.View>
        )}

        {/* No car selected */}
        {!selectedCar && !selectorOpen && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.emptyCard}>
              <Calendar size={48} color={LuxuryColors.textMuted} />
              <Text style={styles.emptyText}>Select a vehicle above</Text>
              <Text style={styles.emptySubtext}>
                Choose any car from the fleet to view its booking schedule and availability status
              </Text>
            </GlassCard>
          </Animated.View>
        )}

        {/* Loading availability */}
        {selectedCar && loadingAvail && (
          <View style={styles.availLoading}>
            <ActivityIndicator size="small" color={LuxuryColors.accent} />
            <Text style={styles.loadingText}>Fetching schedule...</Text>
          </View>
        )}

        {/* Stats */}
        {selectedCar && !loadingAvail && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            {/* Car Info */}
            <GlassCard style={styles.carInfoCard}>
              <View style={styles.carInfoHeader}>
                <View style={styles.carInfoIcon}>
                  <Car size={20} color={LuxuryColors.accent} />
                </View>
                <View>
                  <Text style={styles.carInfoName}>
                    {selectedCar.brand} {selectedCar.model}
                  </Text>
                  <Text style={styles.carInfoSub}>
                    {selectedCar.type} · {selectedCar.location || 'Hub'}
                  </Text>
                </View>
              </View>

              {/* Stats row */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#F43F5E' }]}>{totalBooked}</Text>
                  <Text style={styles.statLabel}>Booked</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#10B981' }]}>{totalAvail}</Text>
                  <Text style={styles.statLabel}>Available</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: '#F97316' }]}>{totalMaint}</Text>
                  <Text style={styles.statLabel}>Maintenance</Text>
                </View>
              </View>
            </GlassCard>

            {/* Timeline header */}
            <View style={styles.timelineHeader}>
              <Calendar size={14} color={LuxuryColors.accent} />
              <Text style={styles.timelineTitle}>BOOKING SCHEDULE</Text>
              <Text style={styles.timelineCount}>{availability.length} entries</Text>
            </View>

            {/* Availability list */}
            <View style={styles.list}>
              {availability.map((entry, idx) => (
                <AvailabilityRow key={`${entry.date ?? idx}`} entry={entry} index={idx} />
              ))}
            </View>

            {availability.length === 0 && (
              <GlassCard style={styles.emptyCard}>
                <CheckCircle2 size={40} color="#10B981" />
                <Text style={styles.emptyText}>No bookings found</Text>
                <Text style={styles.emptySubtext}>This vehicle is fully available</Text>
              </GlassCard>
            )}
          </Animated.View>
        )}
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxuryColors.background },
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: { ...LuxuryTypography.titleL, color: '#FFF' },
  subtitle: { ...LuxuryTypography.caption, color: LuxuryColors.textMuted, marginTop: 4 },
  headerIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  selectorToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: LuxuryRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 4,
  },
  selectorToggleOpen: {
    borderColor: LuxuryColors.accent,
    backgroundColor: 'rgba(234, 179, 8, 0.06)',
  },
  selectorToggleText: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    flex: 1,
    fontSize: 14,
  },
  selectorDropdown: {
    marginBottom: 20,
  },
  carSelectorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  carSelectorItemActive: {
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  carSelectorIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carSelectorIconActive: {
    backgroundColor: LuxuryColors.accent,
  },
  carSelectorName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  carSelectorNameActive: {
    color: LuxuryColors.accent,
  },
  carSelectorSub: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    fontSize: 11,
    marginTop: 2,
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
    lineHeight: 20,
  },
  availLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    justifyContent: 'center',
  },
  carInfoCard: {
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    gap: 16,
  },
  carInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  carInfoIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  carInfoName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 15,
  },
  carInfoSub: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    textTransform: 'none',
    letterSpacing: 0,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignSelf: 'stretch',
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  timelineTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    flex: 1,
  },
  timelineCount: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 10,
  },
  list: { gap: 10 },
  availRow: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availStatusIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  availDate: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  availClient: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  availBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
    borderWidth: 1,
  },
  availBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});

export default AdminCarAvailabilityScreen;
