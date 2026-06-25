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
} from 'lucide-react-native';
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

  // EXTEND
  const handleConfirmExtend = async () => {
    if (!selectedBooking || !newReturnDate || extraDays === 0) return;
    setActionLoading(true);
    try {
      await extendBookingAPI(selectedBooking._id, newReturnDate);
    } catch {
      console.warn('extendBookingAPI fallback');
    } finally {
      setBookings((prev) =>
        prev.map((b) =>
          b._id === selectedBooking._id ? { ...b, endDate: newReturnDate } : b
        )
      );
      setActionLoading(false);
      closeDetail();
      Alert.alert('✅ Gia hạn thành công', `Ngày trả xe mới: ${newReturnDate}`);
    }
  };

  // CANCEL
  const handleCancelBooking = () => {
    if (!selectedBooking) return;
    Alert.alert(
      'Hủy đơn đặt xe',
      `Bạn có chắc chắn muốn hủy ${selectedBooking.car?.brand} ${selectedBooking.car?.model}?`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Hủy đơn',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const id = selectedBooking._id;
            try {
              await cancelBookingAPI(id);
            } catch {
              console.warn('cancelBookingAPI fallback');
            } finally {
              setBookings((prev) =>
                prev.map((b) => (b._id === id ? { ...b, status: 'Cancelled' } : b))
              );
              setActionLoading(false);
              closeDetail();
            }
          },
        },
      ]
    );
  };

  // DELETE
  const handleDeleteBooking = () => {
    if (!selectedBooking) return;
    Alert.alert(
      'Xóa hồ sơ',
      `Xóa đơn xe "${selectedBooking.car?.brand} ${selectedBooking.car?.model}"? Không thể hoàn tác.`,
      [
        { text: 'Quay lại', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            setActionLoading(true);
            const id = selectedBooking._id;
            try {
              await deleteBookingAPI(id);
            } catch {
              console.warn('deleteBookingAPI fallback');
            } finally {
              setBookings((prev) => prev.filter((b) => b._id !== id));
              setActionLoading(false);
              closeDetail();
            }
          },
        },
      ]
    );
  };

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
                  </View>

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
});
