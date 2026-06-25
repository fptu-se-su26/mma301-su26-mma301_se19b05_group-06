import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  TouchableOpacity,
  Alert,
  FlatList,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, CreditCard, Check, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius
} from '@/constants/luxuryTheme';
import GlassCard from '@/components/GlassCard';
import { useAdminGuard } from '@/middleware/adminGuard';
import { getAllPaymentsAPI, confirmPaymentAPI } from '@/services/api';

const PaymentsScreen = () => {
  const router = useRouter();
  useAdminGuard(); // Check admin access
  
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      const response = await getAllPaymentsAPI();
      const data = response?.data?.payments || response?.data || [];
      setPayments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Load payments error:', error);
      Alert.alert('Error', 'Failed to load payments');
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = (paymentId: string, bookingId: string) => {
    Alert.alert('Confirm Payment', 'Mark this payment as confirmed?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            setConfirming(paymentId);
            await confirmPaymentAPI(bookingId);
            Alert.alert('Success', 'Payment confirmed successfully');
            // Refresh payments list
            await loadPayments();
          } catch (error: any) {
            console.error('Confirm payment error:', error);
            Alert.alert('Error', error?.response?.data?.message || 'Failed to confirm payment');
          } finally {
            setConfirming(null);
          }
        }
      }
    ]);
  };

  // Group payments by status
  const groupedPayments = payments.reduce((acc: any, payment: any) => {
    const status = payment.paymentStatus || 'unknown';
    if (!acc[status]) acc[status] = [];
    acc[status].push(payment);
    return acc;
  }, {});

  const PaymentCard = ({ payment, index }: any) => (
    <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
      <GlassCard style={styles.paymentCard}>
        <View style={styles.paymentHeader}>
          <View style={styles.paymentInfo}>
            <Text style={styles.bookingId}>{payment.bookingId}</Text>
            <Text style={styles.userName}>{payment.userId?.name || 'Unknown User'}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              payment.paymentStatus === 'paid'
                ? styles.statusPaid
                : styles.statusPending
            ]}
          >
            <Text style={styles.statusText}>
              {(payment.paymentStatus || 'unknown').toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.paymentDetails}>
          <Text style={styles.amount}>${payment.totalPrice || 0}</Text>
          <Text style={styles.email}>{payment.userId?.email || 'No email'}</Text>
        </View>

        {payment.paymentStatus === 'pending' && (
          <TouchableOpacity
            style={[styles.confirmButton, confirming === payment._id && { opacity: 0.6 }]}
            onPress={() => handleConfirmPayment(payment._id, payment.bookingId || payment._id)}
            disabled={confirming === payment._id}
          >
            {confirming === payment._id ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <>
                <Check size={18} color="#FFF" />
                <Text style={styles.buttonText}>Confirm Payment</Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </GlassCard>
    </Animated.View>
  );

  const CategorySection = ({ title, payments, icon }: any) => {
    if (!payments || payments.length === 0) return null;

    return (
      <View style={styles.categorySection}>
        <View style={styles.categoryHeader}>
          {icon}
          <Text style={styles.categoryTitle}>{title}</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{payments.length}</Text>
          </View>
        </View>
        <View style={styles.categoryPayments}>
          {payments.map((payment: any, idx: number) => (
            <PaymentCard key={payment._id} payment={payment} index={idx} />
          ))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
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
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={LuxuryColors.accent} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Payment Verification</Text>
            <Text style={styles.subtitle}>Confirm pending payments</Text>
          </View>
        </View>

        {/* Payments List - Grouped by Status */}
        {Object.keys(groupedPayments).length > 0 ? (
          <View style={styles.paymentsList}>
            {/* Pending Payments */}
            <CategorySection
              title="Pending Verification"
              payments={groupedPayments['pending']}
              icon={<CreditCard size={20} color={LuxuryColors.accent} />}
            />

            {/* Confirmed Payments */}
            <CategorySection
              title="Confirmed"
              payments={groupedPayments['paid']}
              icon={<Check size={20} color={LuxuryColors.success} />}
            />

            {/* Failed Payments */}
            {groupedPayments['failed'] && (
              <CategorySection
                title="Failed"
                payments={groupedPayments['failed']}
                icon={<X size={20} color={LuxuryColors.danger} />}
              />
            )}

            {/* Refunded Payments */}
            {groupedPayments['refunded'] && (
              <CategorySection
                title="Refunded"
                payments={groupedPayments['refunded']}
                icon={<CreditCard size={20} color="#94A3B8" />}
              />
            )}
          </View>
        ) : (
          <GlassCard style={styles.emptyCard}>
            <CreditCard size={48} color={LuxuryColors.textSecondary} />
            <Text style={styles.emptyText}>No pending payments</Text>
          </GlassCard>
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
    backgroundColor: LuxuryColors.background
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
  paymentsList: {
    gap: 24
  },
  categorySection: {
    gap: 12,
    marginBottom: 8
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)'
  },
  categoryTitle: {
    flex: 1,
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textPrimary
  },
  badge: {
    backgroundColor: 'rgba(234, 179, 8, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full
  },
  badgeText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.accent,
    fontWeight: '700'
  },
  categoryPayments: {
    gap: 12
  },
  paymentCard: {
    padding: 18,
    borderRadius: LuxuryRadius.xl
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  paymentInfo: {
    flex: 1
  },
  bookingId: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textPrimary,
    marginBottom: 4
  },
  userName: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LuxuryRadius.full,
    backgroundColor: 'rgba(234, 179, 8, 0.2)'
  },
  statusPaid: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)'
  },
  statusPending: {
    backgroundColor: 'rgba(251, 146, 60, 0.2)'
  },
  statusText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.accent,
    fontWeight: '600'
  },
  paymentDetails: {
    marginBottom: 12
  },
  amount: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.textPrimary,
    fontWeight: '700',
    marginBottom: 4
  },
  email: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: LuxuryRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)'
  },
  buttonText: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.success
  },
  emptyCard: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16
  },
  emptyText: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textSecondary,
    textAlign: 'center'
  }
});

export default PaymentsScreen;
