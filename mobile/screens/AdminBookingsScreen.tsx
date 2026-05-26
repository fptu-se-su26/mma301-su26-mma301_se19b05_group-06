import React, { useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Calendar, User, Car, Clock, CheckCircle2, XCircle, ArrowRight, RotateCcw } from 'lucide-react-native';

import { 
  LuxuryColors, 
  LuxurySpacing, 
  LuxuryTypography, 
  LuxuryRadius 
} from '@/constants/luxuryTheme';
import { getAllBookingsAPI, updateBookingStatusAPI, completeBookingAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

const AdminBookingsScreen = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');

  const loadBookings = async () => {
    setLoading(true);
    try {
      const { data } = await getAllBookingsAPI();
      setBookings(data);
    } catch (error) {
      console.error('All bookings load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const filteredBookings = useMemo(() => {
    if (activeFilter === 'All') return bookings;
    return bookings.filter(b => b.status === activeFilter);
  }, [bookings, activeFilter]);

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await updateBookingStatusAPI(id, status);
      loadBookings();
    } catch (error) {
      Alert.alert('System Error', 'Could not update reservation status.');
    }
  };

  const handleComplete = async (id: string) => {
    Alert.alert(
      'Complete Booking',
      'Mark this booking as completed (car returned)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            try {
              const { data } = await completeBookingAPI(id);
              if (data.lateFee > 0) {
                Alert.alert('Booking Completed', `Late fee applied: $${data.lateFee}. Updated total: $${data.totalPrice}`);
              }
              loadBookings();
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'Could not complete booking.');
            }
          }
        }
      ]
    );
  };

  if (loading && bookings.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
      </View>
    );
  }

  const StatusPill = ({ status }: { status: string }) => {
    const isApproved = status === 'Approved';
    const isCancelled = status === 'Cancelled';
    const isPending = status === 'Pending';
    const isCompleted = status === 'Completed';

    return (
      <View style={[
        styles.statusPill,
        isApproved && styles.pillApproved,
        isCancelled && styles.pillCancelled,
        isPending && styles.pillPending,
        isCompleted && styles.pillCompleted,
      ]}>
        <Text style={[
          styles.pillText,
          isApproved && styles.textApproved,
          isCancelled && styles.textCancelled,
          isPending && styles.textPending,
          isCompleted && styles.textCompleted,
        ]}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View style={styles.badgeRow}>
            <View style={styles.adminBadge}>
              <Text style={styles.adminBadgeText}>CONCIERGE MOD</Text>
            </View>
          </View>
          <Text style={styles.title}>Global Reservations</Text>
          <Text style={styles.subtitle}>Pending = chờ chuyển QR · Approved = đã thanh toán · Complete khi xe trả về</Text>
        </View>

        {/* STATUS FILTERS */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContent}
        >
          {['All', 'Pending', 'Approved', 'Completed', 'Cancelled'].map((f) => (
            <PremiumPressable 
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[
                styles.filterBtn,
                activeFilter === f && styles.filterBtnActive
              ]}
            >
              <Text style={[
                styles.filterBtnText,
                activeFilter === f && styles.filterBtnTextActive
              ]}>{f}</Text>
            </PremiumPressable>
          ))}
        </ScrollView>
        
        <View style={styles.list}>
          {filteredBookings.length === 0 && !loading ? (
            <View style={styles.emptyState}>
              <Clock size={40} color={LuxuryColors.textMuted} />
              <Text style={styles.emptyText}>No {activeFilter.toLowerCase()} reservations found.</Text>
            </View>
          ) : (
            filteredBookings.map((b, idx) => (
              <Animated.View 
                key={b._id} 
                entering={FadeInDown.delay(idx * 100).duration(500).springify()}
                layout={Layout.springify()}
              >
                <GlassCard style={styles.bookingCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.carInfo}>
                      <Car size={18} color={LuxuryColors.accent} />
                      <View>
                        <Text style={styles.carBrand}>{b.car?.brand || 'Luxury'}</Text>
                        <Text style={styles.carName}>{b.car?.model || 'Exclusive Fleet'}</Text>
                      </View>
                    </View>
                    <StatusPill status={b.status} />
                  </View>

                  <View style={styles.clientSection}>
                    <User size={16} color={LuxuryColors.accent} />
                    <View>
                      <Text style={styles.clientName}>{b.user?.name || 'Private Client'}</Text>
                      <Text style={styles.clientEmail}>{b.user?.email}</Text>
                    </View>
                  </View>

                  <View style={styles.timeSection}>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>PICKUP</Text>
                      <View style={styles.dateValueRow}>
                        <Calendar size={14} color={LuxuryColors.textMuted} />
                        <Text style={styles.timeValue}>{new Date(b.pickupDate).toLocaleDateString()}</Text>
                      </View>
                    </View>
                    <View style={styles.timeDivider}>
                      <ArrowRight size={14} color={LuxuryColors.textMuted} />
                    </View>
                    <View style={styles.timeBlock}>
                      <Text style={styles.timeLabel}>RETURN</Text>
                      <View style={styles.dateValueRow}>
                        <Calendar size={14} color={LuxuryColors.textMuted} />
                        <Text style={styles.timeValue}>{new Date(b.returnDate).toLocaleDateString()}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.footer}>
                    <View>
                      <Text style={styles.priceLabel}>TOTAL REVENUE</Text>
                      <Text style={styles.priceValue}>{b.totalPrice?.toLocaleString()} VNĐ</Text>
                      <Text style={[styles.priceLabel, { marginTop: 4 }]}>
                        {b.paymentStatus === 'paid' ? '💳 Đã thanh toán' : '⏳ Chờ chuyển khoản'}
                      </Text>
                    </View>
                    
                    {b.status === 'Pending' && (
                      <View style={styles.actions}>
                        <View style={styles.pendingInfo}>
                          <Clock size={13} color={LuxuryColors.accent} />
                          <Text style={styles.pendingInfoText}>Chờ QR</Text>
                        </View>
                        <PremiumPressable 
                          onPress={() => handleStatusUpdate(b._id, 'Cancelled')} 
                          style={[styles.actionBtn, styles.cancelActionBtn]}
                        >
                          <XCircle size={16} color={LuxuryColors.danger} />
                        </PremiumPressable>
                      </View>
                    )}

                    {b.status === 'Approved' && (
                      <View style={styles.actions}>
                        <PremiumPressable 
                          onPress={() => handleComplete(b._id)} 
                          style={[styles.actionBtn, styles.completeBtn]}
                        >
                          <RotateCcw size={16} color={LuxuryColors.background} />
                          <Text style={styles.approveBtnText}>Trả xe</Text>
                        </PremiumPressable>
                      </View>
                    )}

                    {b.status === 'Completed' && b.lateFee > 0 && (
                      <View style={styles.lateFeeBox}>
                        <Text style={styles.lateFeeLabel}>LATE FEE</Text>
                        <Text style={styles.lateFeeValue}>+${b.lateFee}</Text>
                      </View>
                    )}
                  </View>
                </GlassCard>
              </Animated.View>
            ))
          )}
        </View>
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
    marginBottom: 24,
  },
  badgeRow: {
    marginBottom: 12,
  },
  adminBadge: {
    backgroundColor: LuxuryColors.accentSoft,
    borderColor: LuxuryColors.accent,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
    alignSelf: 'flex-start',
  },
  adminBadgeText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
  },
  title: {
    ...LuxuryTypography.titleXL,
    color: '#FFF',
    fontSize: 32,
  },
  subtitle: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  filterScroll: {
    marginBottom: 24,
    marginHorizontal: -LuxurySpacing.screenPadding,
  },
  filterContent: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    gap: 12,
  },
  filterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: LuxuryRadius.full,
    backgroundColor: LuxuryColors.card,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
  },
  filterBtnActive: {
    backgroundColor: LuxuryColors.accent,
    borderColor: LuxuryColors.accent,
  },
  filterBtnText: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textSecondary,
    fontSize: 13,
  },
  filterBtnTextActive: {
    color: LuxuryColors.background,
  },
  list: {
    gap: 16,
  },
  bookingCard: {
    padding: 24,
    borderRadius: LuxuryRadius.xl,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  carInfo: {
    flexDirection: 'row',
    gap: 16,
  },
  carBrand: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    marginBottom: 2,
  },
  carName: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 18,
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  pillApproved: { backgroundColor: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.3)' },
  pillCancelled: { backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.3)' },
  pillPending: { backgroundColor: 'rgba(234, 179, 8, 0.1)', borderColor: 'rgba(234, 179, 8, 0.3)' },
  pillCompleted: { backgroundColor: 'rgba(99, 102, 241, 0.1)', borderColor: 'rgba(99, 102, 241, 0.3)' },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  textApproved: { color: LuxuryColors.success },
  textCancelled: { color: LuxuryColors.danger },
  textPending: { color: LuxuryColors.accent },
  textCompleted: { color: '#818cf8' },
  pendingInfo: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(234,179,8,0.08)', paddingHorizontal: 10,
    paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(234,179,8,0.2)',
  },
  pendingInfoText: { color: LuxuryColors.accent, fontSize: 11, fontWeight: '600' },
  
  clientSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: LuxuryRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  clientName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 16,
  },
  clientEmail: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textMuted,
    fontSize: 13,
    marginTop: 2,
  },
  timeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
    borderRadius: LuxuryRadius.md,
  },
  timeBlock: {
    flex: 1,
    gap: 6,
  },
  timeLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
  },
  dateValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeValue: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 14,
  },
  timeDivider: {
    paddingHorizontal: 16,
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 10,
    marginBottom: 4,
  },
  priceValue: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.accentStrong,
    fontSize: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    height: 48,
    borderRadius: LuxuryRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 20,
  },
  approveBtnText: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.background,
    fontSize: 14,
  },
  cancelActionBtn: {
    width: 48,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.4)',
  },
  completeBtn: {
    backgroundColor: LuxuryColors.success,
    paddingHorizontal: 20,
  },
  lateFeeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  lateFeeLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.danger,
    fontSize: 9,
  },
  lateFeeValue: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.danger,
    fontSize: 14,
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textMuted,
    textAlign: 'center',
  },
});

export default AdminBookingsScreen;
