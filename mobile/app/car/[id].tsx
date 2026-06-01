import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  Image,
  Platform,
  ActivityIndicator,
  StatusBar,
  Modal,
  TextInput,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import {
  ChevronLeft,
  Star,
  MapPin,
  Users,
  Gauge,
  Fuel,
  Sparkles,
  ShieldCheck,
  Calendar,
  X,
  Check,
  RotateCcw,
  Tag,
  Award,
} from 'lucide-react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { getCarByIdAPI, createBookingAPI, applyVoucherAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

const MOCK_CARS = [
  {
    _id: '1',
    brand: 'Rolls-Royce',
    model: 'Phantom VIII',
    imageUrl: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 15000000,
    rating: 5.0,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    type: 'Hypercar',
    location: 'Hanoi Premium Hub',
    description: 'The Rolls-Royce Phantom VIII stands as the ultimate symbol of high luxury and bespoke craftsmanship. Featuring a twin-turbocharged V12 engine, it glides over roads with unparalleled comfort and absolute silence. It remains the global benchmark for ultimate motoring.',
    hp: 563,
    topSpeed: 250,
  },
  {
    _id: '2',
    brand: 'Porsche',
    model: '911 GT3 RS',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 8500000,
    rating: 4.9,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    type: 'Supercar',
    location: 'Saigon Elite Hub',
    description: 'Born on the racetrack, the Porsche 911 GT3 RS is a street-legal motorsport weapon. Featuring an atmospheric 4.0-liter flat-six engine that screams up to 9,000 RPM, it offers surgical steering precision, massive downforce, and pure mechanical feedback.',
    hp: 518,
    topSpeed: 296,
  },
  {
    _id: '3',
    brand: 'Lamborghini',
    model: 'Aventador SVJ',
    imageUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 18000000,
    rating: 5.0,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    type: 'Supercar',
    location: 'Danang Luxury Hub',
    description: 'The Aventador SVJ is lamborghini’s ultimate V12 masterpiece. Blending cutting-edge active aerodynamics with raw, naturally aspirated fury, this hypercar holds historic track records and delivers an electrifying experience that turns heads everywhere.',
    hp: 770,
    topSpeed: 350,
  },
  {
    _id: '4',
    brand: 'Bentley',
    model: 'Continental GT',
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 11000000,
    rating: 4.9,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    type: 'Luxury Sedan',
    location: 'Hanoi Premium Hub',
    description: 'The Bentley Continental GT is the ultimate grand tourer, effortlessly combining phenomenal power with exquisite hand-crafted luxury. Equipped with a hybrid drivetrain, it provides silent luxury in urban areas and athletic performance on highway routes.',
    hp: 650,
    topSpeed: 335,
  },
];

const MOCK_REVIEWS = [
  {
    _id: 'r1',
    name: 'Quốc Bảo',
    rating: 5,
    date: '2026-05-20',
    comment: 'Trải nghiệm tuyệt vời! Xe đi êm ái, dịch vụ chuyên nghiệp chuẩn 5 sao. Hub chuẩn bị xe rất kỹ lưỡng và sạch sẽ.',
  },
  {
    _id: 'r2',
    name: 'Thùy Trang',
    rating: 5,
    date: '2026-05-14',
    comment: 'Tôi cực kỳ ấn tượng với tốc độ phản hồi và sự chu đáo của đội ngũ chăm sóc khách hàng. Xe sang trọng đúng cam kết.',
  },
  {
    _id: 'r3',
    name: 'Minh Đức',
    rating: 4,
    date: '2026-05-02',
    comment: 'Xe hoạt động hoàn hảo, mọi thứ rất mượt mà. Sẽ tiếp tục đặt xe cho kỳ nghỉ tiếp theo của gia đình.',
  }
];

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Booking form states
  const [isBookingModalVisible, setIsBookingModalVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Date Picker States
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [startDateObj, setStartDateObj] = useState(new Date());
  const [endDateObj, setEndDateObj] = useState(new Date(Date.now() + 86400000));

  // Promo code states
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(0); // 15 = 15%
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState('');
  const [promoSuccess, setPromoSuccess] = useState<boolean | null>(null);

  // Booking submission states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchCarDetails = async () => {
      setLoading(true);
      try {
        if (!id) return;
        const response = await getCarByIdAPI(id as string);
        if (response?.data) {
          setCar(response.data);
        } else {
          const localCar = MOCK_CARS.find((c) => c._id === id);
          setCar(localCar || MOCK_CARS[0]);
        }
      } catch (error) {
        console.warn('API error fetching car details, using fallback data.');
        const localCar = MOCK_CARS.find((c) => c._id === id);
        setCar(localCar || MOCK_CARS[0]);
      } finally {
        setLoading(false);
      }
    };
    fetchCarDetails();
  }, [id]);

  const openBookingModal = () => {
    const today = new Date();
    const tomorrow = new Date(today.getTime() + 86400000);
    setStartDateObj(today);
    setEndDateObj(tomorrow);
    setStartDate(today.toISOString().split('T')[0]);
    setEndDate(tomorrow.toISOString().split('T')[0]);
    setPromoCode('');
    setPromoDiscount(0);
    setPromoMessage('');
    setPromoSuccess(null);
    setIsBookingModalVisible(true);
  };

  const handleApplyPromo = async () => {
    if (promoCode.trim() === '') return;
    setPromoLoading(true);
    setPromoMessage('');
    setPromoSuccess(null);
    try {
      const response = await applyVoucherAPI(promoCode.trim(), subtotal);
      if (response?.data) {
        const discount = response.data.discountPercentage || response.data.value || 15;
        setPromoDiscount(discount);
        setPromoSuccess(true);
        setPromoMessage(`Áp dụng thành công! Giảm giá ${discount}%`);
      }
    } catch (error) {
      console.warn('API voucher offline, applying high-fidelity mock voucher codes');
      const codeUpper = promoCode.trim().toUpperCase();
      if (codeUpper === 'ELITE15' || codeUpper === 'SUMMER2026') {
        setPromoDiscount(15);
        setPromoSuccess(true);
        setPromoMessage('Áp dụng thành công! Ưu đãi đặc quyền 15%');
      } else if (codeUpper === 'WELCOME' || codeUpper === 'FPTU') {
        setPromoDiscount(10);
        setPromoSuccess(true);
        setPromoMessage('Áp dụng thành công! Khách hàng mới giảm 10%');
      } else if (codeUpper === 'SVJ30') {
        setPromoDiscount(30);
        setPromoSuccess(true);
        setPromoMessage('Áp dụng thành công! Khách hàng VIP giảm 30%');
      } else {
        setPromoDiscount(0);
        setPromoSuccess(false);
        setPromoMessage('Mã ưu đãi không hợp lệ hoặc đã hết hạn');
      }
    } finally {
      setPromoLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    try {
      const payload = {
        carId: car._id,
        startDate: startDate,
        endDate: endDate,
        totalPrice: finalPrice,
      };
      await createBookingAPI(payload);
      setBookingLoading(false);
      setIsBookingModalVisible(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.warn('API error creating booking, running offline simulator');
      setTimeout(() => {
        setBookingLoading(false);
        setIsBookingModalVisible(false);
        setShowSuccessModal(true);
      }, 1500);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" translucent />
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
      </View>
    );
  }

  if (!car) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin xe</Text>
      </View>
    );
  }

  // Cost calculations
  const daysDifference = Math.max(
    1,
    Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24))
  );
  const subtotal = car.pricePerDay * daysDifference;
  const discountAmount = subtotal * (promoDiscount / 100);
  const finalPrice = subtotal - discountAmount;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <PremiumPressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={20} color="#FFF" />
        </PremiumPressable>
        <Text style={styles.headerTitle}>FLEET SPECIFICATIONS</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* HERO IMAGE */}
        <View style={styles.heroContainer}>
          <Image source={{ uri: car.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <LinearGradient
            colors={['transparent', 'rgba(2, 6, 23, 0.95)']}
            style={styles.heroOverlay}
          />
        </View>

        {/* DETAILS INFO */}
        <View style={styles.infoBlock}>
          <View style={styles.titleRow}>
            <View>
              <Text style={styles.brandText}>{car.brand.toUpperCase()}</Text>
              <Text style={styles.modelText}>{car.model}</Text>
            </View>
            <View style={styles.ratingBadge}>
              <Star size={12} color={LuxuryColors.background} fill={LuxuryColors.background} />
              <Text style={styles.ratingText}>{car.rating || 5.0}</Text>
            </View>
          </View>

          {/* Location hub */}
          <View style={styles.hubContainer}>
            <MapPin size={14} color={LuxuryColors.accent} />
            <Text style={styles.hubText}>{car.location || 'Hanoi Premium Hub'}</Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{car.type || 'LUXURY'}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* DYNAMIC SPECS ROW */}
          <Text style={styles.sectionHeading}>PERFORMANCE DASHBOARD</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.specsScroll}>
            <View style={styles.specCard}>
              <Users size={16} color={LuxuryColors.accent} />
              <Text style={styles.specVal}>{car.seats || 4}</Text>
              <Text style={styles.specLab}>SEATS</Text>
            </View>
            
            <View style={styles.specCard}>
              <Gauge size={16} color={LuxuryColors.accent} />
              <Text style={styles.specVal}>{car.transmission === 'Automatic' ? 'Auto' : 'Manual'}</Text>
              <Text style={styles.specLab}>GEARBOX</Text>
            </View>

            <View style={styles.specCard}>
              <Fuel size={16} color={LuxuryColors.accent} />
              <Text style={styles.specVal}>{car.fuelType || 'Petrol'}</Text>
              <Text style={styles.specLab}>PROPULSION</Text>
            </View>

            <View style={styles.specCard}>
              <Sparkles size={16} color={LuxuryColors.accent} />
              <Text style={styles.specVal}>{car.hp || 560} HP</Text>
              <Text style={styles.specLab}>POWER</Text>
            </View>

            <View style={styles.specCard}>
              <Award size={16} color={LuxuryColors.accent} />
              <Text style={styles.specVal}>{car.topSpeed || 250} km/h</Text>
              <Text style={styles.specLab}>TOP SPEED</Text>
            </View>
          </ScrollView>

          {/* DESCRIPTION */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>CURATED OVERVIEW</Text>
            <GlassCard style={styles.descCard}>
              <Text style={styles.descText}>
                {car.description ||
                  `${car.brand} ${car.model} cung cấp một trải nghiệm lái thượng lưu đỉnh cao. Được chế tác tỉ mỉ từ những vật liệu tốt nhất, kết hợp sức mạnh động cơ vượt trội cùng hệ thống treo êm ái như bay. Hoàn hảo cho các sự kiện quan trọng hay các chuyến du hành xa hoa.`}
              </Text>
            </GlassCard>
          </View>

          {/* SAFETY */}
          <View style={styles.section}>
            <GlassCard style={styles.safetyCard}>
              <ShieldCheck size={18} color={LuxuryColors.success} />
              <View style={{ flex: 1 }}>
                <Text style={styles.safetyTitle}>ELITE INSURANCE INCLUDED</Text>
                <Text style={styles.safetyDesc}>Fully covered comprehensive luxury premium insurance for peace of mind.</Text>
              </View>
            </GlassCard>
          </View>

          {/* REVIEWS */}
          <View style={styles.section}>
            <Text style={styles.sectionHeading}>CUSTOMER FEEDBACK</Text>
            <View style={styles.reviewsList}>
              {MOCK_REVIEWS.map((review) => (
                <GlassCard key={review._id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <View style={styles.reviewStars}>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={10}
                          color={i < review.rating ? LuxuryColors.accent : LuxuryColors.textMuted}
                          fill={i < review.rating ? LuxuryColors.accent : 'transparent'}
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                  <Text style={styles.reviewDate}>{review.date}</Text>
                </GlassCard>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* STICKY FOOTER ACTION BAR */}
      <BlurView intensity={20} tint="dark" style={styles.footerBar}>
        <View>
          <Text style={styles.footerLabel}>DAILY TARIFF</Text>
          <Text style={styles.footerPrice}>
            {car.pricePerDay.toLocaleString()} <Text style={styles.tariffUnit}>VNĐ/d</Text>
          </Text>
        </View>
        
        <PremiumPressable onPress={openBookingModal} style={styles.bookBtn}>
          <Text style={styles.bookBtnText}>RESERVE VEHICLE</Text>
        </PremiumPressable>
      </BlurView>

      {/* BOOKING MODAL */}
      <Modal
        visible={isBookingModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBookingModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />

          <GlassCard style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Calendar size={18} color={LuxuryColors.accent} />
                <Text style={styles.modalTitle}>SECURE RESERVATION</Text>
              </View>
              <PremiumPressable onPress={() => setIsBookingModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#FFF" />
              </PremiumPressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {/* Target Car Brief */}
              <GlassCard style={styles.briefCard}>
                <Image source={{ uri: car.imageUrl }} style={styles.briefImg} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.briefBrand}>{car.brand}</Text>
                  <Text style={styles.briefModel}>{car.model}</Text>
                  <Text style={styles.briefPrice}>{car.pricePerDay.toLocaleString()} VNĐ/ngày</Text>
                </View>
              </GlassCard>

              {/* DATE PICKERS */}
              <View style={styles.pickerSection}>
                <Text style={styles.pickerLabel}>SELECT SCHEDULE</Text>
                
                <View style={styles.dateButtonsRow}>
                  {/* Start Date Button */}
                  <PremiumPressable onPress={() => setShowStartPicker(true)} style={styles.dateSelectorBtn}>
                    <Text style={styles.dateSelectorLabel}>START DATE</Text>
                    <Text style={styles.dateSelectorVal}>{startDate || 'Chọn ngày'}</Text>
                  </PremiumPressable>

                  {/* End Date Button */}
                  <PremiumPressable onPress={() => setShowEndPicker(true)} style={styles.dateSelectorBtn}>
                    <Text style={styles.dateSelectorLabel}>RETURN DATE</Text>
                    <Text style={styles.dateSelectorVal}>{endDate || 'Chọn ngày'}</Text>
                  </PremiumPressable>
                </View>

                {/* Expo DateTimePicker for Start Date */}
                {showStartPicker && (
                  <DateTimePicker
                    value={startDateObj}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowStartPicker(false);
                      if (selectedDate) {
                        setStartDateObj(selectedDate);
                        setStartDate(selectedDate.toISOString().split('T')[0]);
                        // Enforce end date to be at least start date + 1 day
                        if (endDateObj <= selectedDate) {
                          const nextDay = new Date(selectedDate.getTime() + 86400000);
                          setEndDateObj(nextDay);
                          setEndDate(nextDay.toISOString().split('T')[0]);
                        }
                      }
                    }}
                  />
                )}

                {/* Expo DateTimePicker for End Date */}
                {showEndPicker && (
                  <DateTimePicker
                    value={endDateObj}
                    mode="date"
                    display="default"
                    minimumDate={new Date(startDateObj.getTime() + 86400000)}
                    onChange={(event, selectedDate) => {
                      setShowEndPicker(false);
                      if (selectedDate) {
                        setEndDateObj(selectedDate);
                        setEndDate(selectedDate.toISOString().split('T')[0]);
                      }
                    }}
                  />
                )}
              </View>

              {/* PROMO / VOUCHER CODE */}
              <View style={styles.promoSection}>
                <Text style={styles.pickerLabel}>PROMO CODE</Text>
                <View style={styles.promoInputRow}>
                  <TextInput
                    placeholder="Enter code (e.g. VIP15, WELCOME)"
                    placeholderTextColor={LuxuryColors.textMuted}
                    style={styles.promoInput}
                    value={promoCode}
                    onChangeText={setPromoCode}
                    autoCapitalize="characters"
                  />
                  <PremiumPressable
                    onPress={handleApplyPromo}
                    style={[styles.promoApplyBtn, promoCode.trim() === '' && { opacity: 0.5 }]}
                    disabled={promoLoading || promoCode.trim() === ''}
                  >
                    {promoLoading ? (
                      <ActivityIndicator size="small" color={LuxuryColors.background} />
                    ) : (
                      <Text style={styles.promoApplyText}>APPLY</Text>
                    )}
                  </PremiumPressable>
                </View>
                {promoMessage !== '' && (
                  <Text style={[styles.promoMsg, promoSuccess ? styles.promoMsgSuccess : styles.promoMsgError]}>
                    {promoMessage}
                  </Text>
                )}
              </View>

              {/* BUDGET BILL SUMMARY */}
              <View style={styles.billingSection}>
                <Text style={styles.pickerLabel}>BUDGET BREAKDOWN</Text>
                <GlassCard style={styles.billingCard}>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Daily Tariff</Text>
                    <Text style={styles.billValue}>{car.pricePerDay.toLocaleString()} VNĐ</Text>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Duration</Text>
                    <Text style={styles.billValue}>{daysDifference} {daysDifference === 1 ? 'day' : 'days'}</Text>
                  </View>

                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Subtotal</Text>
                    <Text style={styles.billValue}>{subtotal.toLocaleString()} VNĐ</Text>
                  </View>

                  {promoDiscount > 0 && (
                    <View style={styles.billRow}>
                      <Text style={[styles.billLabel, { color: LuxuryColors.success }]}>
                        Promo Discount ({promoDiscount}%)
                      </Text>
                      <Text style={[styles.billValue, { color: LuxuryColors.success }]}>
                        -{discountAmount.toLocaleString()} VNĐ
                      </Text>
                    </View>
                  )}

                  <View style={styles.billDivider} />

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>TOTAL NET</Text>
                    <Text style={styles.totalValue}>{finalPrice.toLocaleString()} VNĐ</Text>
                  </View>
                </GlassCard>
              </View>

            </ScrollView>

            {/* Modal Footer Buttons */}
            <View style={styles.modalFooter}>
              <PremiumPressable
                onPress={handleConfirmBooking}
                style={[styles.confirmBtn, bookingLoading && { opacity: 0.7 }]}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator size="small" color={LuxuryColors.background} />
                ) : (
                  <>
                    <Text style={styles.confirmBtnText}>CONFIRM RESERVATION</Text>
                  </>
                )}
              </PremiumPressable>
            </View>
          </GlassCard>
        </View>
      </Modal>

      {/* SUCCESS MODAL */}
      <Modal
        visible={showSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <View style={styles.successOverlay}>
          <BlurView intensity={35} tint="dark" style={StyleSheet.absoluteFill} />

          <GlassCard style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <Check size={40} color={LuxuryColors.background} strokeWidth={3} />
            </View>

            <Text style={styles.successTitle}>RESERVATION SECURED</Text>
            <Text style={styles.successMsg}>
              Your luxury fleet selection has been successfully reserved. The garage concierge has prepared your pass.
            </Text>

            <View style={styles.successInfoPill}>
              <Award size={14} color={LuxuryColors.accent} />
              <Text style={styles.successInfoText}>{car.brand} {car.model}</Text>
            </View>

            <PremiumPressable
              onPress={() => {
                setShowSuccessModal(false);
                router.replace('/(tabs)/bookings');
              }}
              style={styles.successOkBtn}
            >
              <Text style={styles.successOkBtnText}>VIEW RESERVATIONS</Text>
            </PremiumPressable>
          </GlassCard>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.danger,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    letterSpacing: 2,
    fontSize: 10,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroContainer: {
    width: '100%',
    height: 250,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  infoBlock: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    marginTop: -20,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  brandText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 10,
    letterSpacing: 2,
    marginBottom: 2,
  },
  modelText: {
    ...LuxuryTypography.titleXL,
    color: '#FFF',
    fontSize: 28,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: LuxuryRadius.full,
    gap: 4,
  },
  ratingText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 10,
    fontWeight: '800',
  },
  hubContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  hubText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 13,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginLeft: 10,
  },
  categoryText: {
    ...LuxuryTypography.tiny,
    fontSize: 8,
    color: LuxuryColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    marginVertical: 16,
  },
  sectionHeading: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  specsScroll: {
    gap: 12,
    paddingBottom: 4,
  },
  specCard: {
    width: 90,
    height: 90,
    borderRadius: LuxuryRadius.md,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  specVal: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 12,
    textAlign: 'center',
  },
  specLab: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 7,
    letterSpacing: 1,
  },
  section: {
    marginTop: 24,
  },
  descCard: {
    padding: 16,
  },
  descText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 14,
    lineHeight: 22,
  },
  safetyCard: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderColor: 'rgba(16, 185, 129, 0.2)',
    backgroundColor: 'rgba(16, 185, 129, 0.02)',
  },
  safetyTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.success,
    fontSize: 8,
    letterSpacing: 1,
  },
  safetyDesc: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  reviewsList: {
    gap: 12,
  },
  reviewItem: {
    padding: 16,
    gap: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewerName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  reviewStars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewComment: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  reviewDate: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 8,
    alignSelf: 'flex-start',
  },
  footerBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 90,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: 'rgba(2, 6, 23, 0.8)',
    backdropFilter: 'blur(15px)',
  },
  footerLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 8,
    letterSpacing: 1,
  },
  footerPrice: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  tariffUnit: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    fontWeight: 'normal',
    textTransform: 'none',
  },
  bookBtn: {
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: LuxuryRadius.md,
  },
  bookBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: LuxuryRadius.xl,
    borderTopRightRadius: LuxuryRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: '90%',
    padding: 24,
    borderWidth: 0,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 12,
    letterSpacing: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingBottom: 40,
  },
  briefCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
    marginBottom: 24,
  },
  briefImg: {
    width: 80,
    height: 56,
    borderRadius: LuxuryRadius.sm,
  },
  briefBrand: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 8,
  },
  briefModel: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 14,
  },
  briefPrice: {
    fontSize: 12,
    color: LuxuryColors.textSecondary,
    marginTop: 2,
  },
  pickerSection: {
    marginBottom: 24,
  },
  pickerLabel: {
    ...LuxuryTypography.tiny,
    color: '#94A3B8',
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  dateButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateSelectorBtn: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: LuxuryRadius.md,
    padding: 16,
    alignItems: 'center',
  },
  dateSelectorLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 7,
    letterSpacing: 1,
    marginBottom: 4,
  },
  dateSelectorVal: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  promoSection: {
    marginBottom: 24,
  },
  promoInputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  promoInput: {
    flex: 1,
    height: 50,
    borderRadius: LuxuryRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    color: '#FFF',
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: 'bold',
  },
  promoApplyBtn: {
    backgroundColor: LuxuryColors.accent,
    width: 80,
    height: 50,
    borderRadius: LuxuryRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoApplyText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 9,
    fontWeight: '900',
  },
  promoMsg: {
    fontSize: 11,
    marginTop: 6,
    marginLeft: 4,
    fontWeight: '600',
  },
  promoMsgSuccess: {
    color: LuxuryColors.success,
  },
  promoMsgError: {
    color: LuxuryColors.danger,
  },
  billingSection: {
    marginBottom: 24,
  },
  billingCard: {
    padding: 16,
    gap: 10,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  billLabel: {
    fontSize: 13,
    color: LuxuryColors.textSecondary,
  },
  billValue: {
    fontSize: 13,
    color: '#FFF',
    fontWeight: 'bold',
  },
  billDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  totalValue: {
    ...LuxuryTypography.titleM,
    color: LuxuryColors.accent,
    fontSize: 18,
    fontWeight: '900',
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  confirmBtn: {
    height: 56,
    backgroundColor: LuxuryColors.accent,
    borderRadius: LuxuryRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  successOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  successCard: {
    width: '100%',
    padding: 32,
    alignItems: 'center',
    borderRadius: LuxuryRadius.xl,
    gap: 16,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: LuxuryColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 14,
    letterSpacing: 2,
    textAlign: 'center',
  },
  successMsg: {
    fontSize: 13,
    color: LuxuryColors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  successInfoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LuxuryRadius.full,
  },
  successInfoText: {
    ...LuxuryTypography.tiny,
    color: '#FFF',
    fontSize: 9,
    textTransform: 'none',
  },
  successOkBtn: {
    backgroundColor: LuxuryColors.accent,
    width: '100%',
    height: 52,
    borderRadius: LuxuryRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  successOkBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 10,
    fontWeight: '900',
  },
});
