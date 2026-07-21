import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  StatusBar,
  Modal,
  Alert,
  Image,
  Platform,
  TouchableOpacity,
  Pressable,
  TextInput,
} from 'react-native';
import { BlurView } from 'expo-blur';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Calendar,
  MapPin,
  Receipt,
  X,
  ChevronRight,
  CalendarDays,
  Trash2,
  RefreshCw,
  Car,
  XCircle,
  CheckCircle2,
  AlertCircle,
  TimerReset,
  Wallet,
  CreditCard,
  Banknote,
  Smartphone,
  Check,
  Star,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import {
  LuxuryColors,
  LuxuryTypography,
  LuxuryRadius,
  LuxurySpacing,
} from '@/constants/luxuryTheme';
import {
  getMyBookingsAPI,
  extendBookingAPI,
  cancelBookingAPI,
  deleteBookingAPI,
  createPaymentLinkAPI,
  createReviewAPI,
} from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

// Mock bookings for offline fallback
const MOCK_BOOKINGS = [
  {
    _id: 'b1',
    car: {
      _id: '1',
      brand: 'Rolls-Royce',
      model: 'Phantom VIII',
      imageUrl:
        'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=600&auto=format&fit=crop',
      pricePerDay: 15000000,
      location: 'Hanoi Premium Hub',
    },
    startDate: '2026-06-05',
    endDate: '2026-06-08',
    totalPrice: 45000000,
    status: 'Approved',
    paymentStatus: 'paid',
    paymentMethod: 'bank_transfer',
  },
  {
    _id: 'b2',
    car: {
      _id: '2',
      brand: 'Porsche',
      model: '911 GT3 RS',
      imageUrl:
        'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop',
      pricePerDay: 8500000,
      location: 'Saigon Elite Hub',
    },
    startDate: '2026-06-10',
    endDate: '2026-06-12',
    totalPrice: 17000000,
    status: 'Pending',
    paymentStatus: 'pending',
    paymentMethod: 'momo',
  },
  {
    _id: 'b3',
    car: {
      _id: '3',
      brand: 'Lamborghini',
      model: 'Aventador SVJ',
      imageUrl:
        'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=600&auto=format&fit=crop',
      pricePerDay: 18000000,
      location: 'Danang Luxury Hub',
    },
    startDate: '2026-05-01',
    endDate: '2026-05-03',
    totalPrice: 36000000,
    status: 'Completed',
    paymentStatus: 'paid',
    paymentMethod: 'cash',
  },
  {
    _id: 'b4',
    car: {
      _id: '4',
      brand: 'Bentley',
      model: 'Continental GT',
      imageUrl:
        'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=600&auto=format&fit=crop',
      pricePerDay: 11000000,
      location: 'Hanoi Premium Hub',
    },
    startDate: '2026-04-15',
    endDate: '2026-04-18',
    totalPrice: 33000000,
    status: 'Cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'bank_transfer',
  },
];

const STATUS_FILTERS = ['All', 'Pending', 'Approved', 'Completed', 'Cancelled'];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Approved': return LuxuryColors.success;
    case 'Completed': return '#818cf8';
    case 'Cancelled': return LuxuryColors.danger;
    default: return LuxuryColors.accent;
  }
};

const getStatusBg = (status: string) => {
  switch (status) {
    case 'Approved': return 'rgba(16, 185, 129, 0.15)';
    case 'Completed': return 'rgba(129, 140, 248, 0.15)';
    case 'Cancelled': return 'rgba(244, 63, 94, 0.15)';
    default: return 'rgba(234, 179, 8, 0.15)';
  }
};

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');

  // Detail modal
  const [selectedBooking, setSelectedBooking] = useState<any | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

  // Extend
  const [isExtendVisible, setIsExtendVisible] = useState(false);
  const [newReturnDateObj, setNewReturnDateObj] = useState(new Date());
  const [newReturnDate, setNewReturnDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [actionLoading, setActionLoading] = useState(false);

  // Cancel confirm modal (for Web — Alert.alert not supported)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  // Delete confirm modal (for Web)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Cross-platform toast notification
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (msg: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Review states
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const handleOpenReview = () => {
    setIsDetailModalVisible(false);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const executeSubmitReview = async () => {
    if (!selectedBooking) return;
    if (!reviewComment.trim()) {
      showToast('Please enter your review content', 'error');
      return;
    }
    setReviewLoading(true);
    try {
      await createReviewAPI({
        bookingId: selectedBooking._id,
        rating: reviewRating,
        comment: reviewComment.trim()
      });
      showToast('Trip reviewed successfully!', 'success');
      setShowReviewModal(false);
      fetchBookings();
    } catch (err: any) {
      console.error(err);
      showToast(err?.response?.data?.message || 'Unable to submit review', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getMyBookingsAPI();
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        setBookings(response.data);
      } else {
        setBookings(MOCK_BOOKINGS);
      }
    } catch {
      setBookings(MOCK_BOOKINGS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings =
    activeFilter === 'All' ? bookings : bookings.filter((b) => b.status === activeFilter);

  const openDetail = (booking: any) => {
    setSelectedBooking(booking);
    setIsExtendVisible(false);
    setNewReturnDate('');
    const currentEnd = new Date(booking.endDate);
    const nextDay = new Date(currentEnd.getTime() + 86400000);
    setNewReturnDateObj(nextDay);
    setNewReturnDate(nextDay.toISOString().split('T')[0]);
    setIsDetailModalVisible(true);
  };

  const closeDetail = () => {
    setIsDetailModalVisible(false);
    setIsExtendVisible(false);
    setSelectedBooking(null);
    setActionLoading(false);
  };

  // EXTEND — Gọi PayOS để thanh toán phí gia hạn
  const handleConfirmExtend = async () => {
    if (!selectedBooking || !newReturnDate || extraDays === 0) return;
    setActionLoading(true);
    try {
      // 1. Gọi API extend → nhận checkoutUrl từ PayOS
      const response = await extendBookingAPI(selectedBooking._id, newReturnDate);
      const checkoutUrl = response?.data?.checkoutUrl;
      const fee = response?.data?.addedFee || 0;
      const days = response?.data?.extraDays || extraDays;

      if (!checkoutUrl) {
        throw new Error('Không nhận được link thanh toán gia hạn từ máy chủ.');
      }

      closeDetail();

      // 2. Mở PayOS để thanh toán phí gia hạn
      if (Platform.OS === 'web') {
        window.open(checkoutUrl, '_blank');
        showToast(`⌛ Đang chờ thanh toán gia hạn ${days} ngày (${fee.toLocaleString()} VNĐ). Tải lại trang sau khi hoàn tất.`, 'info');
      } else {
        const redirectUrl = Linking.createURL('bookings');
        await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);
        showToast(`✅ Gia hạn ${days} ngày (${fee.toLocaleString()} VNĐ) thành công!`, 'success');
      }

      // 3. Tải lại danh sách để đồng bộ
      fetchBookings();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err.message || 'Không thể gia hạn đơn đặt xe.';
      showToast('❌ ' + msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // CANCEL — Xác nhận hủy booking
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    // Trên web dùng custom confirm modal, trên native dùng Alert
    if (Platform.OS === 'web') {
      setShowCancelConfirm(true);
      return;
    }
    Alert.alert(
      'Hủy đơn đặt xe',
      `Bạn có chắc chắn muốn hủy đặt xe ${selectedBooking.car?.brand} ${selectedBooking.car?.model}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        { text: 'Xác nhận hủy', style: 'destructive', onPress: executeCancelBooking },
      ]
    );
  };

  const executeCancelBooking = async () => {
    if (!selectedBooking) return;
    setShowCancelConfirm(false);
    setActionLoading(true);
    const bookingId = selectedBooking._id;
    const carName = `${selectedBooking.car?.brand || ''} ${selectedBooking.car?.model || ''}`;
    try {
      await cancelBookingAPI(bookingId);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId
            ? { ...b, status: 'Cancelled', paymentStatus: 'refunded' }
            : b
        )
      );
      closeDetail();
      showToast(`✅ Đã hủy đơn xe ${carName} thành công!`, 'success');
      fetchBookings();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || 'Không thể hủy đặt xe.';
      showToast('❌ ' + msg, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE
  // DELETE — Xóa hồ sơ booking đã Completed/Cancelled
  const handleDeleteBooking = () => {
    if (!selectedBooking) return;
    if (Platform.OS === 'web') {
      setShowDeleteConfirm(true);
      return;
    }
    Alert.alert(
      'Xóa hồ sơ',
      `Xóa đơn xe "${selectedBooking.car?.brand} ${selectedBooking.car?.model}"? Không thể hoàn tác.`,
      [
        { text: 'Quay lại', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: executeDeleteBooking },
      ]
    );
  };

  const executeDeleteBooking = async () => {
    if (!selectedBooking) return;
    setShowDeleteConfirm(false);
    setActionLoading(true);
    const id = selectedBooking._id;
    const carName = `${selectedBooking.car?.brand || ''} ${selectedBooking.car?.model || ''}`;
    try {
      await deleteBookingAPI(id);
      setBookings((prev) => prev.filter((b) => b._id !== id));
      closeDetail();
      showToast(`🗑️ Đã xóa hồ sơ đơn xe ${carName} thành công.`, 'info');
    } catch (err: any) {
      setBookings((prev) => prev.filter((b) => b._id !== id));
      closeDetail();
      showToast('🗑️ Đã xóa hồ sơ đơn xe.', 'info');
    } finally {
      setActionLoading(false);
    }
  };

  // PAY NOW — Mở PayOS WebBrowser
  const handlePayNow = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      const paymentResponse = await createPaymentLinkAPI(selectedBooking._id);
      const checkoutUrl = paymentResponse?.data?.checkoutUrl;

      if (!checkoutUrl) throw new Error('Không thể tạo link thanh toán PayOS');

      if (Platform.OS === 'web') {
        window.open(checkoutUrl, '_blank');
        showToast('⌛ Trang thanh toán PayOS đã mở trong tab mới. Reload lại trang sau khi hoàn tất.', 'info');
      } else {
        const redirectUrl = Linking.createURL('bookings');
        await WebBrowser.openAuthSessionAsync(checkoutUrl, redirectUrl);
      }
      fetchBookings();
    } catch (e: any) {
      showToast('❌ ' + (e?.response?.data?.message || e.message || 'Lỗi khi kết nối đến PayOS.'), 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Bỏ modal thanh toán thủ công
  const handleConfirmPayment = () => {};

  const computeExtendInfo = () => {
    if (!selectedBooking || !newReturnDate) return { extraDays: 0, addedFee: 0 };
    const originalEnd = new Date(selectedBooking.endDate);
    const newEnd = new Date(newReturnDate);
    const extraDays = Math.max(
      0,
      Math.ceil((newEnd.getTime() - originalEnd.getTime()) / (1000 * 60 * 60 * 24))
    );
    return { extraDays, addedFee: extraDays * (selectedBooking.car?.pricePerDay || 0) };
  };

  const { extraDays, addedFee } = computeExtendInfo();
  const canExtend =
    selectedBooking?.status === 'Pending' || selectedBooking?.status === 'Approved';
  const canCancel =
    selectedBooking?.status === 'Pending' || selectedBooking?.status === 'Approved';
  const canDelete =
    selectedBooking?.status === 'Completed' || selectedBooking?.status === 'Cancelled';
  const canPay =
    selectedBooking?.paymentStatus === 'pending' &&
    selectedBooking?.status !== 'Cancelled';

  const getPaymentStatusLabel = (ps: string) => {
    switch (ps) {
      case 'paid': return 'Đã thanh toán';
      case 'refunded': return 'Đã hoàn tiền';
      default: return 'Chưa thanh toán';
    }
  };
  const getPaymentStatusColor = (ps: string) => {
    switch (ps) {
      case 'paid': return LuxuryColors.success;
      case 'refunded': return '#818cf8';
      default: return LuxuryColors.danger;
    }
  };
  const getPaymentMethodLabel = (pm: string) => {
    switch (pm) {
      case 'vietqr': return 'VietQR Online';
      case 'bank_transfer': return 'Chuyển khoản online';
      default: return 'Thanh toán online';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>YOUR PRIVATE GARAGE</Text>
        <Text style={styles.headerTitle}>Reservations</Text>
      </View>

      {/* FILTER BAR — dùng Pressable thường để tránh layout bug */}
      <View style={styles.filterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {STATUS_FILTERS.map((filter) => (
            <Pressable
              key={filter}
              onPress={() => setActiveFilter(filter)}
              style={[styles.filterPill, activeFilter === filter && styles.filterPillActive]}
            >
              <Text
                style={[styles.filterText, activeFilter === filter && styles.filterTextActive]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* LIST */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color={LuxuryColors.accent}
            style={{ marginTop: 40 }}
          />
        ) : filteredBookings.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Calendar size={48} color={LuxuryColors.textMuted} style={{ marginBottom: 16 }} />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'All' ? 'No Active Reservations' : `No ${activeFilter} Reservations`}
            </Text>
            <Text style={styles.emptySubtitle}>
              {activeFilter === 'All'
                ? 'Your upcoming premium travels will appear here.'
                : `No reservations with status "${activeFilter}".`}
            </Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredBookings.map((booking) => (
              <PremiumPressable
                key={booking._id}
                onPress={() => openDetail(booking)}
                scaleTo={0.98}
              >
                <GlassCard style={styles.bookingCard}>
                  <View style={styles.cardTop}>
                    {booking.car?.imageUrl ? (
                      <Image
                        source={{ uri: booking.car.imageUrl }}
                        style={styles.cardImage}
                      />
                    ) : (
                      <View style={styles.cardImagePlaceholder}>
                        <Car size={22} color={LuxuryColors.textMuted} />
                      </View>
                    )}
                    <View style={styles.cardInfo}>
                      <Text style={styles.carBrand}>{booking.car?.brand || 'Luxury'}</Text>
                      <Text style={styles.carModel} numberOfLines={1}>
                        {booking.car?.model || 'Vehicle'}
                      </Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusBg(booking.status) },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(booking.status) },
                          ]}
                        >
                          {booking.status?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={16} color={LuxuryColors.textMuted} />
                  </View>

                  <View style={styles.cardDivider} />

                  <View style={styles.cardBottom}>
                    <View style={styles.detailRow}>
                      <CalendarDays size={13} color={LuxuryColors.accent} />
                      <Text style={styles.detailText}>
                        {new Date(booking.startDate).toLocaleDateString('vi-VN')}
                        {' → '}
                        {new Date(booking.endDate).toLocaleDateString('vi-VN')}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MapPin size={13} color={LuxuryColors.accent} />
                      <Text style={styles.detailText} numberOfLines={1}>
                        {booking.car?.location || 'Premium Hub'}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Receipt size={13} color={LuxuryColors.accent} />
                      <Text style={[styles.detailText, { color: LuxuryColors.accentStrong, fontWeight: 'bold' }]}>
                        {booking.totalPrice?.toLocaleString()} VNĐ
                      </Text>
                    </View>
                    {/* Payment Status Badge */}
                    <View style={styles.detailRow}>
                      <Wallet size={13} color={getPaymentStatusColor(booking.paymentStatus || 'pending')} />
                      <Text style={[styles.detailText, { color: getPaymentStatusColor(booking.paymentStatus || 'pending'), fontWeight: '600' }]}>
                        {getPaymentStatusLabel(booking.paymentStatus || 'pending')}
                      </Text>
                    </View>
                  </View>
                </GlassCard>
              </PremiumPressable>
            ))}
          </View>
        )}
      </ScrollView>

      {/* ─── DETAIL MODAL ─── */}
      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        transparent
        onRequestClose={closeDetail}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

          <View style={styles.modalSheet}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Car size={16} color={LuxuryColors.accent} />
                <Text style={styles.modalTitle}>CHI TIẾT ĐẶT XE</Text>
              </View>
              <TouchableOpacity onPress={closeDetail} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScroll}
            >
              {selectedBooking && (
                <>
                  {/* Hero image */}
                  {selectedBooking.car?.imageUrl && (
                    <Image
                      source={{ uri: selectedBooking.car.imageUrl }}
                      style={styles.modalHeroImg}
                    />
                  )}

                  {/* Name + status */}
                  <View style={styles.modalCarRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.modalBrand}>{selectedBooking.car?.brand}</Text>
                      <Text style={styles.modalModel}>{selectedBooking.car?.model}</Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadgeLg,
                        { backgroundColor: getStatusBg(selectedBooking.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusTextLg,
                          { color: getStatusColor(selectedBooking.status) },
                        ]}
                      >
                        {selectedBooking.status?.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Schedule */}
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>LỊCH TRÌNH</Text>
                    <View style={styles.dateRow}>
                      <View style={styles.dateBlock}>
                        <Text style={styles.dateLabelSmall}>NHẬN XE</Text>
                        <Text style={styles.dateValueLg}>
                          {new Date(selectedBooking.startDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                      <ChevronRight size={18} color={LuxuryColors.textMuted} />
                      <View style={[styles.dateBlock, { alignItems: 'flex-end' }]}>
                        <Text style={styles.dateLabelSmall}>TRẢ XE</Text>
                        <Text style={styles.dateValueLg}>
                          {new Date(selectedBooking.endDate).toLocaleDateString('vi-VN')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Location */}
                  <View style={styles.locationRow}>
                    <MapPin size={14} color={LuxuryColors.accent} />
                    <Text style={styles.locationText}>
                      {selectedBooking.car?.location || 'Premium Hub'}
                    </Text>
                  </View>

                  {/* Price */}
                  <View style={styles.infoCard}>
                    <Text style={styles.infoCardTitle}>THANH TOÁN</Text>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Giá / ngày</Text>
                      <Text style={styles.priceValue}>
                        {selectedBooking.car?.pricePerDay?.toLocaleString()} VNĐ
                      </Text>
                    </View>
                    <View style={styles.priceDivider} />
                    <View style={styles.priceRow}>
                      <Text style={[styles.priceLabel, { color: LuxuryColors.accent }]}>
                        TỔNG CỘNG
                      </Text>
                      <Text style={[styles.priceValue, { color: LuxuryColors.accent, fontSize: 18 }]}>
                        {selectedBooking.totalPrice?.toLocaleString()} VNĐ
                      </Text>
                    </View>
                    <View style={styles.priceDivider} />
                    {/* Payment Status + Method */}
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Phương thức</Text>
                      <Text style={styles.priceValue}>
                        {getPaymentMethodLabel(selectedBooking.paymentMethod || 'cash')}
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.priceLabel}>Trạng thái</Text>
                      <View style={[styles.paymentBadge, { backgroundColor: `${getPaymentStatusColor(selectedBooking.paymentStatus || 'pending')}20` }]}>
                        <Text style={[styles.paymentBadgeText, { color: getPaymentStatusColor(selectedBooking.paymentStatus || 'pending') }]}>
                          {getPaymentStatusLabel(selectedBooking.paymentStatus || 'pending')}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* ── PAY NOW ── */}
                  {canPay && (
                    <TouchableOpacity
                      onPress={handlePayNow}
                      disabled={actionLoading}
                      style={[
                        styles.actionBtn,
                        styles.payBtn,
                        actionLoading && { opacity: 0.45 },
                      ]}
                      activeOpacity={0.8}
                    >
                      {actionLoading ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <>
                          <CreditCard size={16} color="#FFF" />
                          <Text style={styles.actionBtnText}>XÁC NHẬN THANH TOÁN</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  )}

                  {/* ── EXTEND ── */}
                  {canExtend && (
                    <View style={{ gap: 10 }}>
                      <TouchableOpacity
                        onPress={() => setIsExtendVisible(!isExtendVisible)}
                        style={[styles.actionBtn, { backgroundColor: LuxuryColors.accent }]}
                        activeOpacity={0.8}
                      >
                        <TimerReset size={16} color={LuxuryColors.background} />
                        <Text style={[styles.actionBtnText, { color: LuxuryColors.background }]}>
                          {isExtendVisible ? 'ẨN GIA HẠN' : 'GIA HẠN THUÊ XE'}
                        </Text>
                      </TouchableOpacity>

                      {isExtendVisible && (
                        <View style={styles.extendPanel}>
                          <Text style={styles.infoCardTitle}>CHỌN NGÀY TRẢ XE MỚI</Text>

                          {Platform.OS === 'web' ? (
                            <input
                              type="date"
                              value={newReturnDate}
                              min={selectedBooking ? new Date(new Date(selectedBooking.endDate).getTime() + 86400000).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                              onChange={(e) => {
                                const val = e.target.value;
                                setNewReturnDate(val);
                                const [y, m, d] = val.split('-').map(Number);
                                setNewReturnDateObj(new Date(y, m - 1, d));
                              }}
                              style={{
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                color: '#FFF',
                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                borderRadius: 8,
                                padding: 12,
                                outline: 'none',
                                fontSize: 14,
                                width: '100%',
                                boxSizing: 'border-box',
                                marginTop: 6
                              }}
                            />
                          ) : (
                            <>
                              <TouchableOpacity
                                onPress={() => setShowDatePicker(true)}
                                style={styles.dateSelectorBtn}
                                activeOpacity={0.8}
                              >
                                <CalendarDays size={14} color={LuxuryColors.accent} />
                                <Text style={styles.dateSelectorText}>
                                  {newReturnDate || 'Chọn ngày'}
                                </Text>
                              </TouchableOpacity>

                              {showDatePicker && (
                                <DateTimePicker
                                  value={newReturnDateObj}
                                  mode="date"
                                  display="default"
                                  minimumDate={
                                    new Date(
                                      new Date(selectedBooking.endDate).getTime() + 86400000
                                    )
                                  }
                                  onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) {
                                      setNewReturnDateObj(selectedDate);
                                      setNewReturnDate(
                                        selectedDate.toISOString().split('T')[0]
                                      );
                                    }
                                  }}
                                />
                              )}
                            </>
                          )}

                          {extraDays > 0 && (
                            <View style={styles.extendCalc}>
                              <View style={styles.priceRow}>
                                <Text style={styles.priceLabel}>Số ngày gia hạn</Text>
                                <Text style={styles.priceValue}>{extraDays} ngày</Text>
                              </View>
                              <View style={styles.priceRow}>
                                <Text style={[styles.priceLabel, { color: LuxuryColors.accent }]}>
                                  Phí gia hạn
                                </Text>
                                <Text style={[styles.priceValue, { color: LuxuryColors.accent }]}>
                                  +{addedFee.toLocaleString()} VNĐ
                                </Text>
                              </View>
                            </View>
                          )}

                          <TouchableOpacity
                            onPress={handleConfirmExtend}
                            disabled={actionLoading || extraDays === 0}
                            style={[
                              styles.actionBtn,
                              { backgroundColor: LuxuryColors.success, marginTop: 8 },
                              (actionLoading || extraDays === 0) && { opacity: 0.45 },
                            ]}
                            activeOpacity={0.8}
                          >
                            {actionLoading ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <>
                                <RefreshCw size={14} color="#FFF" />
                                <Text style={styles.actionBtnText}>XÁC NHẬN GIA HẠN</Text>
                              </>
                            )}
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}

                  {/* ── CANCEL ── */}
                  {canCancel && (
                    <TouchableOpacity
                      onPress={handleCancelBooking}
                      disabled={actionLoading}
                      style={[
                        styles.actionBtn,
                        styles.cancelBtn,
                        actionLoading && { opacity: 0.45 },
                      ]}
                      activeOpacity={0.8}
                    >
                      <XCircle size={16} color={LuxuryColors.danger} />
                      <Text style={[styles.actionBtnText, { color: LuxuryColors.danger }]}>
                        HỦY ĐẶT XE
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* ── REVIEW ── */}
                  {selectedBooking?.status === 'Completed' && (
                    <TouchableOpacity
                      onPress={handleOpenReview}
                      style={[styles.actionBtn, { backgroundColor: LuxuryColors.accent, marginBottom: 10 }]}
                      activeOpacity={0.8}
                    >
                      <Star size={16} color={LuxuryColors.background} fill={LuxuryColors.background} />
                      <Text style={[styles.actionBtnText, { color: LuxuryColors.background }]}>
                        RATE YOUR TRIP
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* ── DELETE ── */}
                  {canDelete && (
                    <TouchableOpacity
                      onPress={handleDeleteBooking}
                      disabled={actionLoading}
                      style={[
                        styles.actionBtn,
                        styles.deleteBtn,
                        actionLoading && { opacity: 0.45 },
                      ]}
                      activeOpacity={0.8}
                    >
                      <Trash2 size={16} color="#94A3B8" />
                      <Text style={[styles.actionBtnText, { color: '#94A3B8' }]}>
                        XÓA HỒ SƠ
                      </Text>
                    </TouchableOpacity>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ─── CANCEL CONFIRM MODAL (web) ─── */}
      <Modal
        visible={showCancelConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowCancelConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalSheet, { maxHeight: 320, justifyContent: 'center', padding: 28, gap: 18 }]}>
            {/* Icon + Title */}
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(244,63,94,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <XCircle size={28} color={LuxuryColors.danger} />
              </View>
              <Text style={[styles.modalTitle, { textAlign: 'center' }]}>XÁC NHẬN HỦY ĐẶT XE</Text>
            </View>
            {/* Message */}
            <Text style={{ color: LuxuryColors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
              Bạn có chắc chắn muốn hủy đặt xe{'\n'}
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {selectedBooking?.car?.brand} {selectedBooking?.car?.model}
              </Text>
              {'\n'}không? Hành động này không thể hoàn tác.
            </Text>
            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setShowCancelConfirm(false)}
                style={[styles.actionBtn, { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)' }]}
              >
                <Text style={[styles.actionBtnText, { color: LuxuryColors.textSecondary }]}>QUAY LẠI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={executeCancelBooking}
                disabled={actionLoading}
                style={[styles.actionBtn, styles.cancelBtn, { flex: 1 }, actionLoading && { opacity: 0.45 }]}
              >
                {actionLoading
                  ? <ActivityIndicator size="small" color={LuxuryColors.danger} />
                  : <Text style={[styles.actionBtnText, { color: LuxuryColors.danger }]}>XÁC NHẬN HỦY</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── DELETE CONFIRM MODAL (web) ─── */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalSheet, { maxHeight: 340, justifyContent: 'center', padding: 28, gap: 18 }]}>
            {/* Icon + Title */}
            <View style={{ alignItems: 'center', gap: 10 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(148,163,184,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Trash2 size={28} color="#94A3B8" />
              </View>
              <Text style={[styles.modalTitle, { textAlign: 'center' }]}>XÓA HỒ SƠ ĐẶT XE</Text>
            </View>
            {/* Message */}
            <Text style={{ color: LuxuryColors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 }}>
              Bạn chắc chắn muốn xóa hồ sơ đặt xe{'\n'}
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {selectedBooking?.car?.brand} {selectedBooking?.car?.model}
              </Text>
              {'\n'}khỏi hệ thống? Hành động này{' '}
              <Text style={{ color: LuxuryColors.danger, fontWeight: '700' }}>không thể hoàn tác</Text>.
            </Text>
            {/* Buttons */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <TouchableOpacity
                onPress={() => setShowDeleteConfirm(false)}
                style={[styles.actionBtn, { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)' }]}
              >
                <Text style={[styles.actionBtnText, { color: LuxuryColors.textSecondary }]}>QUAY LẠI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={executeDeleteBooking}
                disabled={actionLoading}
                style={[styles.actionBtn, styles.deleteBtn, { flex: 1 }, actionLoading && { opacity: 0.45 }]}
              >
                {actionLoading
                  ? <ActivityIndicator size="small" color="#94A3B8" />
                  : <Text style={[styles.actionBtnText, { color: '#94A3B8' }]}>XÓA HỒ SƠ</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── REVIEW MODAL ─── */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={[styles.modalSheet, { maxHeight: 420, padding: 24, gap: 16 }]}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Star size={16} color={LuxuryColors.accent} fill={LuxuryColors.accent} />
                <Text style={styles.modalTitle}>RATE YOUR TRIP</Text>
              </View>
              <TouchableOpacity onPress={() => setShowReviewModal(false)} style={styles.closeBtn} activeOpacity={0.7}>
                <X size={18} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: LuxuryColors.textSecondary, fontSize: 13, textAlign: 'center' }}>
              Please share your feedback on the vehicle{' '}
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>
                {selectedBooking?.car?.brand} {selectedBooking?.car?.model}
              </Text>
            </Text>

            {/* Stars selection */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginVertical: 8 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setReviewRating(star)}>
                  <Star
                    size={32}
                    color={star <= reviewRating ? LuxuryColors.accent : 'rgba(255,255,255,0.2)'}
                    fill={star <= reviewRating ? LuxuryColors.accent : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            {/* Comment input */}
            <TextInput
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#FFF',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: 12,
                fontSize: 14,
                height: 100,
                textAlignVertical: 'top',
              }}
              placeholder="Enter your feedback about the trip..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              multiline
              value={reviewComment}
              onChangeText={setReviewComment}
              maxLength={200}
            />

            {/* Submit button */}
            <TouchableOpacity
              onPress={executeSubmitReview}
              disabled={reviewLoading}
              style={[
                styles.actionBtn,
                { backgroundColor: LuxuryColors.accent, marginTop: 8 },
                reviewLoading && { opacity: 0.5 },
              ]}
              activeOpacity={0.8}
            >
              {reviewLoading ? (
                <ActivityIndicator size="small" color={LuxuryColors.background} />
              ) : (
                <Text style={[styles.actionBtnText, { color: LuxuryColors.background }]}>
                  SUBMIT REVIEW
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ─── TOAST NOTIFICATION ─── */}
      {toast && (
        <View
          style={[
            styles.toastContainer,
            toast.type === 'success' && { borderColor: LuxuryColors.success, backgroundColor: 'rgba(16,185,129,0.15)' },
            toast.type === 'error'   && { borderColor: LuxuryColors.danger,  backgroundColor: 'rgba(244,63,94,0.15)'  },
            toast.type === 'info'    && { borderColor: LuxuryColors.accent,   backgroundColor: 'rgba(234,179,8,0.12)'  },
          ]}
        >
          <Text style={[
            styles.toastText,
            toast.type === 'success' && { color: LuxuryColors.success },
            toast.type === 'error'   && { color: LuxuryColors.danger  },
            toast.type === 'info'    && { color: LuxuryColors.accent   },
          ]}>
            {toast.msg}
          </Text>
        </View>
      )}

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
    paddingTop:
      Platform.OS === 'android'
        ? (StatusBar.currentHeight ?? 0) + 10
        : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerSub: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    letterSpacing: 2,
  },
  headerTitle: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },

  // Filter bar — có height cố định để tránh stretch
  filterWrapper: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
  },
  filterScroll: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    alignItems: 'center',
    gap: 10,
  },
  filterPill: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: LuxuryRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterPillActive: {
    borderColor: LuxuryColors.accent,
    backgroundColor: 'rgba(234, 179, 8, 0.12)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: LuxuryColors.textSecondary,
  },
  filterTextActive: {
    color: LuxuryColors.accent,
    fontWeight: '700',
  },

  scrollContent: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: 18,
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
    gap: 14,
  },
  bookingCard: {
    padding: 16,
    gap: 12,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardImage: {
    width: 72,
    height: 52,
    borderRadius: LuxuryRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cardImagePlaceholder: {
    width: 72,
    height: 52,
    borderRadius: LuxuryRadius.sm,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 4,
  },
  carBrand: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 8,
    letterSpacing: 1.5,
  },
  carModel: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 14,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginTop: 2,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  cardBottom: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 12,
    flex: 1,
  },

  // ── MODAL ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: LuxuryRadius.xl,
    borderTopRightRadius: LuxuryRadius.xl,
    borderTopWidth: 1.5,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    maxHeight: '92%',
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
  },
  modalTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 11,
    letterSpacing: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingBottom: 40,
    gap: 14,
  },
  modalHeroImg: {
    width: '100%',
    height: 170,
    borderRadius: LuxuryRadius.lg,
  },
  modalCarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  modalBrand: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    letterSpacing: 2,
  },
  modalModel: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  statusBadgeLg: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusTextLg: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  infoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: LuxuryRadius.md,
    padding: 14,
    gap: 10,
  },
  infoCardTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 8,
    letterSpacing: 1.5,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateBlock: {
    flex: 1,
    gap: 4,
  },
  dateLabelSmall: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 7,
    letterSpacing: 1,
  },
  dateValueLg: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  locationText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 13,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 13,
    color: LuxuryColors.textSecondary,
  },
  priceValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },
  priceDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.07)',
  },

  // Action buttons — dùng TouchableOpacity
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: LuxuryRadius.md,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#FFF',
    textTransform: 'uppercase',
  },
  cancelBtn: {
    backgroundColor: 'rgba(244, 63, 94, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(244, 63, 94, 0.35)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },

  extendPanel: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: LuxuryRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.2)',
    padding: 14,
    gap: 12,
  },
  dateSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: LuxuryRadius.sm,
    padding: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  dateSelectorText: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  extendCalc: {
    gap: 8,
    padding: 12,
    backgroundColor: 'rgba(234,179,8,0.04)',
    borderRadius: LuxuryRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.15)',
  },
  // ─── Payment Styles ───────────────────────────────────────────
  payBtn: {
    backgroundColor: LuxuryColors.success,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  // ─── QR Payment Modal Styles ──────────────────────────────────
  qrAmountBanner: {
    backgroundColor: 'rgba(234,179,8,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234,179,8,0.25)',
    borderRadius: LuxuryRadius.md,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  qrAmountLabel: {
    fontSize: 11,
    color: LuxuryColors.textSecondary,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  qrAmountValue: {
    fontSize: 28,
    fontWeight: '900',
    color: LuxuryColors.accent,
    letterSpacing: 0.5,
  },
  qrAmountSub: {
    fontSize: 12,
    color: LuxuryColors.textSecondary,
    marginTop: 4,
  },
  qrImageWrapper: {
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: LuxuryRadius.md,
    padding: 16,
  },
  qrImage: {
    width: 220,
    height: 220,
  },
  qrScanHint: {
    marginTop: 8,
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  bankInfoCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: LuxuryRadius.md,
    padding: 16,
    gap: 0,
    marginBottom: 14,
  },
  bankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  bankLabel: {
    fontSize: 12,
    color: LuxuryColors.textSecondary,
  },
  bankValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: '600',
    maxWidth: '60%',
    textAlign: 'right',
  },
  qrNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: 'rgba(251,191,36,0.06)',
    borderRadius: LuxuryRadius.sm,
    padding: 12,
    marginBottom: 4,
  },
  qrNoticeText: {
    flex: 1,
    fontSize: 12,
    color: LuxuryColors.textSecondary,
    lineHeight: 18,
  },
  // ── Toast Notification ──
  toastContainer: {
    position: 'absolute',
    bottom: 90,
    left: 20,
    right: 20,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 20,
    textAlign: 'center',
  },
});
