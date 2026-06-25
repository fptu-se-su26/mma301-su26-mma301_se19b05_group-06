import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  RefreshControl,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Car,
  CheckCircle2,
  XCircle,
  Wrench,
  RefreshCw,
} from 'lucide-react-native';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { getAvailabilityCalendarAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DayEntry {
  date: string;          // YYYY-MM-DD
  status: 'available' | 'booked' | 'partial' | 'maintenance';
  bookingsCount?: number;
  carNames?: string[];
}

interface CalendarData {
  [date: string]: DayEntry;
}

// ─── Mock Data Generator ──────────────────────────────────────────────────────
const buildMockCalendar = (year: number, month: number): CalendarData => {
  const data: CalendarData = {};
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const statuses: Array<DayEntry['status']> = ['available', 'available', 'available', 'booked', 'partial', 'maintenance'];
  const carNames = ['Rolls-Royce Phantom', 'Porsche 911', 'Lamborghini Aventador', 'Bentley Continental'];

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const status = statuses[(d * 3 + month) % statuses.length];
    const bookingsCount = status === 'booked' ? Math.floor(Math.random() * 3) + 1 : status === 'partial' ? 1 : 0;
    data[dateStr] = {
      date: dateStr,
      status,
      bookingsCount,
      carNames: status !== 'available' ? carNames.slice(0, bookingsCount) : [],
    };
  }
  return data;
};

// ─── Day Status Config ────────────────────────────────────────────────────────
const DAY_CONFIG = {
  available: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.4)', dot: '#10B981', text: '#FFF' },
  booked: { bg: 'rgba(244, 63, 94, 0.2)', border: 'rgba(244, 63, 94, 0.5)', dot: '#F43F5E', text: '#FFF' },
  partial: { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.4)', dot: '#EAB308', text: '#FFF' },
  maintenance: { bg: 'rgba(249, 115, 22, 0.15)', border: 'rgba(249, 115, 22, 0.4)', dot: '#F97316', text: '#FFF' },
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ─── Day Cell ─────────────────────────────────────────────────────────────────
const DayCell = ({
  day,
  entry,
  onPress,
  isSelected,
}: {
  day: number;
  entry?: DayEntry;
  onPress: () => void;
  isSelected: boolean;
}) => {
  const status = entry?.status ?? 'available';
  const cfg = DAY_CONFIG[status];

  return (
    <PremiumPressable onPress={onPress} style={styles.dayCell}>
      <View
        style={[
          styles.dayCellInner,
          { backgroundColor: cfg.bg, borderColor: isSelected ? LuxuryColors.accent : cfg.border },
          isSelected && styles.dayCellSelected,
        ]}
      >
        <Text style={[styles.dayNumber, { color: isSelected ? LuxuryColors.accent : cfg.text }]}>{day}</Text>
        <View style={[styles.dayDot, { backgroundColor: cfg.dot }]} />
        {entry?.bookingsCount ? (
          <Text style={styles.dayBookingCount}>{entry.bookingsCount}</Text>
        ) : null}
      </View>
    </PremiumPressable>
  );
};

// ─── Detail Panel ─────────────────────────────────────────────────────────────
const DetailPanel = ({ entry }: { entry: DayEntry | null }) => {
  if (!entry) return null;

  const cfg = DAY_CONFIG[entry.status];
  const StatusIcon =
    entry.status === 'booked' ? XCircle :
    entry.status === 'maintenance' ? Wrench :
    entry.status === 'partial' ? CalendarDays :
    CheckCircle2;

  return (
    <Animated.View entering={FadeInDown.duration(300).springify()}>
      <GlassCard style={styles.detailPanel}>
        <View style={styles.detailHeader}>
          <View style={[styles.detailIcon, { backgroundColor: cfg.bg }]}>
            <StatusIcon size={20} color={cfg.dot} />
          </View>
          <View>
            <Text style={styles.detailDate}>{entry.date}</Text>
            <Text style={[styles.detailStatus, { color: cfg.dot }]}>
              {entry.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {entry.carNames && entry.carNames.length > 0 && (
          <View style={styles.detailCars}>
            <Text style={styles.detailCarsTitle}>VEHICLES BOOKED</Text>
            {entry.carNames.map((name, i) => (
              <View key={i} style={styles.detailCarRow}>
                <Car size={12} color={LuxuryColors.accent} />
                <Text style={styles.detailCarName}>{name}</Text>
              </View>
            ))}
          </View>
        )}

        {(entry.status === 'available') && (
          <Text style={styles.detailAvailText}>All vehicles are available for booking on this date.</Text>
        )}
      </GlassCard>
    </Animated.View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdminAvailabilityCalendarScreen = () => {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [calendarData, setCalendarData] = useState<CalendarData>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadCalendar = async (y: number, m: number) => {
    try {
      const { data } = await getAvailabilityCalendarAPI();
      // Try to parse API response; fallback to mock
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        setCalendarData(data as CalendarData);
      } else if (Array.isArray(data) && data.length > 0) {
        // Convert array format to map
        const map: CalendarData = {};
        data.forEach((item: any) => {
          if (item.date) map[item.date] = item;
        });
        setCalendarData(Object.keys(map).length > 0 ? map : buildMockCalendar(y, m));
      } else {
        setCalendarData(buildMockCalendar(y, m));
      }
    } catch {
      setCalendarData(buildMockCalendar(y, m));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadCalendar(year, month);
  }, [year, month]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCalendar(year, month);
  }, [year, month]);

  const prevMonth = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };

  const nextMonth = () => {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  // Build calendar grid
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const calCells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) calCells.push(d);
  while (calCells.length % 7 !== 0) calCells.push(null);

  // Stats for the month
  const monthEntries = Object.values(calendarData).filter((e) =>
    e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  );
  const bookedCount = monthEntries.filter((e) => e.status === 'booked').length;
  const availCount = monthEntries.filter((e) => e.status === 'available').length;
  const partialCount = monthEntries.filter((e) => e.status === 'partial').length;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
        <Text style={styles.loadingText}>Loading calendar...</Text>
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
            <Text style={styles.title}>Availability Calendar</Text>
            <Text style={styles.subtitle}>Fleet-wide booking overview</Text>
          </View>
          <PremiumPressable onPress={onRefresh} style={styles.refreshBtn}>
            <RefreshCw size={18} color={LuxuryColors.accent} />
          </PremiumPressable>
        </Animated.View>

        {/* Month stats */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.statsRow}>
          {[
            { label: 'Booked', count: bookedCount, color: '#F43F5E' },
            { label: 'Partial', count: partialCount, color: '#EAB308' },
            { label: 'Available', count: availCount, color: '#10B981' },
          ].map((s, i) => (
            <GlassCard key={s.label} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.count}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </GlassCard>
          ))}
        </Animated.View>

        {/* Calendar Card */}
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <GlassCard style={styles.calendarCard}>
            {/* Month Navigation */}
            <View style={styles.monthNav}>
              <PremiumPressable onPress={prevMonth} style={styles.navBtn}>
                <ChevronLeft size={20} color="#FFF" />
              </PremiumPressable>
              <Text style={styles.monthTitle}>
                {MONTH_NAMES[month]} {year}
              </Text>
              <PremiumPressable onPress={nextMonth} style={styles.navBtn}>
                <ChevronRight size={20} color="#FFF" />
              </PremiumPressable>
            </View>

            {/* Weekday headers */}
            <View style={styles.weekdayRow}>
              {WEEKDAYS.map((wd) => (
                <Text key={wd} style={styles.weekdayLabel}>{wd}</Text>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.grid}>
              {calCells.map((day, idx) => {
                if (day === null) {
                  return <View key={`empty-${idx}`} style={styles.dayCell} />;
                }
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const entry = calendarData[dateStr];
                return (
                  <DayCell
                    key={dateStr}
                    day={day}
                    entry={entry}
                    isSelected={selectedDate === dateStr}
                    onPress={() => setSelectedDate(selectedDate === dateStr ? null : dateStr)}
                  />
                );
              })}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
              {[
                { color: '#10B981', label: 'Available' },
                { color: '#EAB308', label: 'Partial' },
                { color: '#F43F5E', label: 'Booked' },
                { color: '#F97316', label: 'Maintenance' },
              ].map((l) => (
                <View key={l.label} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                  <Text style={styles.legendLabel}>{l.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Selected day detail */}
        {selectedDate && (
          <View style={{ marginTop: 16 }}>
            <DetailPanel entry={calendarData[selectedDate] ?? { date: selectedDate, status: 'available' }} />
          </View>
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
  loadingText: { ...LuxuryTypography.caption, color: LuxuryColors.textMuted },
  content: {
    padding: LuxurySpacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: { ...LuxuryTypography.titleL, color: '#FFF' },
  subtitle: { ...LuxuryTypography.caption, color: LuxuryColors.textMuted, marginTop: 4 },
  refreshBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.2)',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 14,
    alignItems: 'center',
    gap: 6,
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
  calendarCard: {
    padding: 16,
    gap: 16,
  },
  monthNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  monthTitle: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 18,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekdayLabel: {
    width: `${100 / 7}%` as any,
    textAlign: 'center',
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  dayCell: {
    width: `${(100 - 4 * 6) / 7}%` as any,
    aspectRatio: 1,
  },
  dayCellInner: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dayCellSelected: {
    borderColor: LuxuryColors.accent,
    borderWidth: 2,
  },
  dayNumber: {
    fontSize: 12,
    fontWeight: '700',
  },
  dayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
  dayBookingCount: {
    fontSize: 7,
    color: 'rgba(255,255,255,0.5)',
    fontWeight: '600',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
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
  detailPanel: {
    padding: 20,
    gap: 16,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  detailIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailDate: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 15,
  },
  detailStatus: {
    ...LuxuryTypography.tiny,
    fontSize: 10,
    marginTop: 2,
  },
  detailCars: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  detailCarsTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    marginBottom: 4,
  },
  detailCarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailCarName: {
    ...LuxuryTypography.caption,
    color: '#FFF',
    fontSize: 13,
  },
  detailAvailText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    lineHeight: 20,
  },
});

export default AdminAvailabilityCalendarScreen;
