import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, ActivityIndicator, StatusBar } from 'react-native';
import { Calendar, ShieldCheck, Clock, MapPin, Receipt, Star } from 'lucide-react-native';
import { LuxuryColors, LuxuryTypography, LuxuryRadius, LuxurySpacing } from '@/constants/luxuryTheme';
import { getMyBookingsAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await getMyBookingsAPI();
        if (response?.data && Array.isArray(response.data)) {
          setBookings(response.data);
        }
      } catch (error) {
        console.warn('Could not load reservations from server, showing default empty state.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <View style={styles.header}>
        <Text style={styles.subtitle}>YOUR PRIVATE GARAGE</Text>
        <Text style={styles.title}>Reservations</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {loading ? (
          <ActivityIndicator size="large" color={LuxuryColors.accent} style={{ marginTop: 40 }} />
        ) : bookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={LuxuryColors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>No Active Reservations</Text>
            <Text style={styles.emptySubtitle}>
              Your upcoming premium travels will appear here. Select a model from the showroom to begin.
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {bookings.map((booking) => (
              <GlassCard key={booking._id} style={styles.bookingCard}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.carBrand}>{booking.car?.brand || 'Luxury'}</Text>
                    <Text style={styles.carModel}>{booking.car?.model || 'Supercar'}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: booking.status === 'Completed' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(234, 179, 8, 0.15)' }]}>
                    <Text style={[styles.statusText, { color: booking.status === 'Completed' ? LuxuryColors.success : LuxuryColors.accent }]}>
                      {booking.status?.toUpperCase() || 'CONFIRMED'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Clock size={16} color={LuxuryColors.accent} />
                  <Text style={styles.detailText}>
                    {new Date(booking.startDate).toLocaleDateString()} to {new Date(booking.endDate).toLocaleDateString()}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MapPin size={16} color={LuxuryColors.accent} />
                  <Text style={styles.detailText}>{booking.car?.location || 'Premium Hub'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Receipt size={16} color={LuxuryColors.accent} />
                  <Text style={styles.detailText}>Total Paid: {booking.totalPrice?.toLocaleString()} VNĐ</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        )}
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
  },
  emptyContainer: {
    paddingVertical: 80,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyTitle: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 18,
  },
  emptySubtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  listContainer: {
    gap: 16,
  },
  bookingCard: {
    padding: 20,
    gap: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  carBrand: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
  },
  carModel: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    ...LuxuryTypography.tiny,
    fontSize: 8,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    marginVertical: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 13,
  },
});
