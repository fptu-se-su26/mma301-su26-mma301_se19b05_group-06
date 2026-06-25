import React, { useEffect, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Tag,
  Plus,
  Trash2,
  Percent,
  DollarSign,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  X,
  Ticket,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import {
  getAdminVouchersAPI,
  createAdminVoucherAPI,
  deleteAdminVoucherAPI,
} from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';
import LuxuryButton from '@/components/LuxuryButton';
import LuxuryInput from '@/components/LuxuryInput';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Voucher {
  _id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minBookingValue?: number;
  expiryDate?: string;
  maxUsage?: number;
  usedCount?: number;
  isActive?: boolean;
  description?: string;
}

interface CreateVoucherForm {
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  minBookingValue: string;
  expiryDate: string;
  maxUsage: string;
  description: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const MOCK_VOUCHERS: Voucher[] = [
  {
    _id: 'v1',
    code: 'SUMMER15',
    discountType: 'percentage',
    discountValue: 15,
    minBookingValue: 5000000,
    expiryDate: '2026-08-31',
    maxUsage: 100,
    usedCount: 34,
    isActive: true,
    description: 'Summer special discount',
  },
  {
    _id: 'v2',
    code: 'VIP500K',
    discountType: 'fixed',
    discountValue: 500000,
    minBookingValue: 10000000,
    expiryDate: '2026-07-15',
    maxUsage: 50,
    usedCount: 12,
    isActive: true,
    description: 'VIP client reward',
  },
  {
    _id: 'v3',
    code: 'NEWUSER20',
    discountType: 'percentage',
    discountValue: 20,
    minBookingValue: 3000000,
    expiryDate: '2026-06-30',
    maxUsage: 200,
    usedCount: 199,
    isActive: false,
    description: 'New user onboarding',
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M VNĐ`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K VNĐ`;
  return `${n} VNĐ`;
};

const isExpired = (dateStr?: string) => {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
};

const usagePercent = (used = 0, max = 0) => (max > 0 ? Math.min((used / max) * 100, 100) : 0);

// ─── Voucher Card ─────────────────────────────────────────────────────────────
const VoucherCard = ({
  voucher,
  onDelete,
  index,
}: {
  voucher: Voucher;
  onDelete: (id: string, code: string) => void;
  index: number;
}) => {
  const expired = isExpired(voucher.expiryDate);
  const inactive = !voucher.isActive || expired;
  const pct = usagePercent(voucher.usedCount, voucher.maxUsage);
  const nearLimit = pct >= 90;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).springify()}
      layout={Layout.springify()}
    >
      <GlassCard style={[styles.voucherCard, inactive ? (styles.voucherCardInactive as any) : null] as any}>
        {/* Top row: code + status + delete */}
        <View style={styles.voucherTopRow}>
          <View style={styles.voucherCodeWrap}>
            <Ticket size={14} color={inactive ? LuxuryColors.textMuted : LuxuryColors.accent} />
            <Text style={[styles.voucherCode, inactive && styles.voucherCodeInactive]}>
              {voucher.code}
            </Text>
          </View>

          <View style={styles.voucherTopRight}>
            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: inactive ? 'rgba(100,100,100,0.12)' : 'rgba(16,185,129,0.12)',
                  borderColor: inactive ? 'rgba(100,100,100,0.3)' : 'rgba(16,185,129,0.4)',
                },
              ]}
            >
              {inactive ? (
                <XCircle size={10} color={LuxuryColors.textMuted} />
              ) : (
                <CheckCircle2 size={10} color="#10B981" />
              )}
              <Text
                style={[
                  styles.statusText,
                  { color: inactive ? LuxuryColors.textMuted : '#10B981' },
                ]}
              >
                {expired ? 'EXPIRED' : voucher.isActive ? 'ACTIVE' : 'INACTIVE'}
              </Text>
            </View>

            <PremiumPressable
              onPress={() => onDelete(voucher._id, voucher.code)}
              style={styles.deleteBtn}
            >
              <Trash2 size={14} color={LuxuryColors.danger} />
            </PremiumPressable>
          </View>
        </View>

        {/* Discount value */}
        <View style={styles.discountRow}>
          {voucher.discountType === 'percentage' ? (
            <Percent size={20} color={inactive ? LuxuryColors.textMuted : LuxuryColors.accent} />
          ) : (
            <DollarSign size={20} color={inactive ? LuxuryColors.textMuted : LuxuryColors.accent} />
          )}
          <Text style={[styles.discountValue, inactive && styles.discountValueInactive]}>
            {voucher.discountType === 'percentage'
              ? `${voucher.discountValue}% OFF`
              : `${formatPrice(voucher.discountValue)} OFF`}
          </Text>
        </View>

        {/* Description */}
        {voucher.description ? (
          <Text style={styles.voucherDesc}>{voucher.description}</Text>
        ) : null}

        {/* Meta info */}
        <View style={styles.metaRow}>
          {voucher.minBookingValue ? (
            <View style={styles.metaItem}>
              <DollarSign size={10} color={LuxuryColors.textMuted} />
              <Text style={styles.metaText}>Min {formatPrice(voucher.minBookingValue)}</Text>
            </View>
          ) : null}

          {voucher.expiryDate ? (
            <View style={styles.metaItem}>
              <Calendar size={10} color={expired ? LuxuryColors.danger : LuxuryColors.textMuted} />
              <Text style={[styles.metaText, expired && { color: LuxuryColors.danger }]}>
                {expired ? 'Expired ' : 'Exp. '}{voucher.expiryDate}
              </Text>
            </View>
          ) : null}
        </View>

        {/* Usage progress */}
        {voucher.maxUsage ? (
          <View style={styles.usageSection}>
            <View style={styles.usageLabelRow}>
              <View style={styles.metaItem}>
                <Users size={10} color={nearLimit ? '#F97316' : LuxuryColors.textMuted} />
                <Text style={[styles.metaText, nearLimit && { color: '#F97316' }]}>
                  {voucher.usedCount ?? 0} / {voucher.maxUsage} used
                </Text>
              </View>
              {nearLimit && <AlertTriangle size={12} color="#F97316" />}
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${pct}%` as any,
                    backgroundColor: pct >= 100 ? LuxuryColors.danger : pct >= 90 ? '#F97316' : LuxuryColors.accent,
                  },
                ]}
              />
            </View>
          </View>
        ) : null}
      </GlassCard>
    </Animated.View>
  );
};

// ─── Create Voucher Modal ──────────────────────────────────────────────────────
const CreateVoucherModal = ({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (newVoucher?: Voucher) => void;
}) => {
  const [form, setForm] = useState<CreateVoucherForm>({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minBookingValue: '',
    expiryDate: '',
    maxUsage: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const resetDatePicker = () => {
    const d = new Date();
    setYear(d.getFullYear());
    setMonth(d.getMonth());
    setShowDatePicker(false);
  };

  const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const prevMonth = () => {
    if (month === 0) {
      setYear(y => y - 1);
      setMonth(11);
    } else {
      setMonth(m => m - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(y => y + 1);
      setMonth(0);
    } else {
      setMonth(m => m + 1);
    }
  };

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();

  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  const updateForm = (key: keyof CreateVoucherForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
  };

  const validate = (): string => {
    if (!form.code.trim()) return 'Voucher code is required.';
    if (!/^[A-Z0-9_-]{3,20}$/.test(form.code.trim()))
      return 'Code must be 3–20 uppercase letters/numbers.';
    if (!form.discountValue || isNaN(Number(form.discountValue)) || Number(form.discountValue) <= 0)
      return 'Discount value must be a positive number.';
    if (form.discountType === 'percentage' && Number(form.discountValue) > 100)
      return 'Percentage discount cannot exceed 100%.';
    return '';
  };

  const handleCreate = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    const newVoucherData = {
      code: form.code.trim().toUpperCase(),
      discountType: form.discountType,
      discountValue: Number(form.discountValue),
      minBookingValue: form.minBookingValue ? Number(form.minBookingValue) : undefined,
      expiryDate: form.expiryDate || undefined,
      maxUsage: form.maxUsage ? Number(form.maxUsage) : undefined,
      description: form.description || undefined,
    };

    setLoading(true);
    try {
      const { data } = await createAdminVoucherAPI(newVoucherData);
      const createdVoucher: Voucher = data?.voucher || {
        _id: data?._id || 'v-' + Date.now(),
        ...newVoucherData,
        usedCount: 0,
        isActive: true,
      };
      setForm({ code: '', discountType: 'percentage', discountValue: '', minBookingValue: '', expiryDate: '', maxUsage: '', description: '' });
      resetDatePicker();
      onCreated(createdVoucher);
    } catch (err: any) {
      console.warn('API error creating voucher, falling back to local simulation.');
      const simulatedVoucher: Voucher = {
        _id: 'mock-' + Date.now(),
        ...newVoucherData,
        usedCount: 0,
        isActive: true,
      };
      setForm({ code: '', discountType: 'percentage', discountValue: '', minBookingValue: '', expiryDate: '', maxUsage: '', description: '' });
      resetDatePicker();
      onCreated(simulatedVoucher);
      Alert.alert('Offline Mode', 'Server offline. Voucher has been created locally for demonstration.');
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    setForm({ code: '', discountType: 'percentage', discountValue: '', minBookingValue: '', expiryDate: '', maxUsage: '', description: '' });
    resetDatePicker();
    setError('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={resetAndClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.modalOverlay}>
          <GlassCard style={styles.modalCard}>
            {/* Modal header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Tag size={18} color={LuxuryColors.accent} />
                <Text style={styles.modalTitle}>CREATE VOUCHER</Text>
              </View>
              <PremiumPressable onPress={resetAndClose} style={styles.modalCloseBtn}>
                <X size={20} color="#FFF" />
              </PremiumPressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
              {/* Code */}
              <LuxuryInput
                label="Voucher Code *"
                value={form.code}
                onChangeText={(v) => updateForm('code', v.toUpperCase())}
                placeholder="e.g. SUMMER20"
                autoCapitalize="characters"
                leftIcon={<Ticket size={16} color={LuxuryColors.textMuted} />}
              />

              {/* Discount Type */}
              <View>
                <Text style={styles.formLabel}>DISCOUNT TYPE *</Text>
                <View style={styles.typeRow}>
                  {(['percentage', 'fixed'] as const).map((t) => (
                    <PremiumPressable
                      key={t}
                      onPress={() => updateForm('discountType', t)}
                      style={[styles.typePill, form.discountType === t && styles.typePillActive]}
                    >
                      {t === 'percentage' ? (
                        <Percent size={14} color={form.discountType === t ? LuxuryColors.background : LuxuryColors.textSecondary} />
                      ) : (
                        <DollarSign size={14} color={form.discountType === t ? LuxuryColors.background : LuxuryColors.textSecondary} />
                      )}
                      <Text style={[styles.typePillText, form.discountType === t && styles.typePillTextActive]}>
                        {t === 'percentage' ? 'Percentage (%)' : 'Fixed Amount'}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

              {/* Discount Value */}
              <LuxuryInput
                label={`Discount Value * ${form.discountType === 'percentage' ? '(%)' : '(VNĐ)'}`}
                value={form.discountValue}
                onChangeText={(v) => updateForm('discountValue', v)}
                placeholder={form.discountType === 'percentage' ? 'e.g. 15' : 'e.g. 500000'}
                keyboardType="numeric"
                leftIcon={form.discountType === 'percentage'
                  ? <Percent size={16} color={LuxuryColors.textMuted} />
                  : <DollarSign size={16} color={LuxuryColors.textMuted} />
                }
              />

              {/* Min Booking Value */}
              <LuxuryInput
                label="Min Booking Value (VNĐ)"
                value={form.minBookingValue}
                onChangeText={(v) => updateForm('minBookingValue', v)}
                placeholder="e.g. 5000000 (optional)"
                keyboardType="numeric"
                leftIcon={<DollarSign size={16} color={LuxuryColors.textMuted} />}
              />

              {/* Expiry Date */}
              <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)} activeOpacity={0.8}>
                <View pointerEvents="none">
                  <LuxuryInput
                    label="Expiry Date"
                    value={form.expiryDate}
                    onChangeText={() => {}}
                    placeholder="Select date (optional)"
                    editable={false}
                    leftIcon={<Calendar size={16} color={LuxuryColors.textMuted} />}
                  />
                </View>
              </TouchableOpacity>

              {showDatePicker && (
                <GlassCard style={styles.inlineCalendarCard}>
                  {/* Month Navigation */}
                  <View style={styles.inlineCalHeader}>
                    <TouchableOpacity onPress={prevMonth} style={styles.inlineCalNavBtn}>
                      <ChevronLeft size={16} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.inlineCalMonthTitle}>
                      {MONTH_NAMES[month]} {year}
                    </Text>
                    <TouchableOpacity onPress={nextMonth} style={styles.inlineCalNavBtn}>
                      <ChevronRight size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Weekday headers */}
                  <View style={styles.inlineCalWeekdaysRow}>
                    {WEEKDAYS.map((wd) => (
                      <Text key={wd} style={styles.inlineCalWeekdayLabel}>{wd}</Text>
                    ))}
                  </View>

                  {/* Day grid */}
                  <View style={styles.inlineCalGrid}>
                    {cells.map((day, idx) => {
                      if (day === null) {
                        return <View key={`empty-${idx}`} style={styles.inlineCalDayCellEmpty} />;
                      }
                      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isSelected = form.expiryDate === dateStr;
                      const isToday = today.toISOString().split('T')[0] === dateStr;
                      const isPast = new Date(year, month, day, 23, 59, 59) < today;

                      return (
                        <TouchableOpacity
                          key={dateStr}
                          disabled={isPast}
                          onPress={() => {
                            updateForm('expiryDate', dateStr);
                            setShowDatePicker(false);
                          }}
                          style={[
                            styles.inlineCalDayCell,
                            isSelected && styles.inlineCalDayCellSelected,
                            isPast && styles.inlineCalDayCellDisabled
                          ]}
                        >
                          <Text
                            style={[
                              styles.inlineCalDayText,
                              isSelected && styles.inlineCalDayTextSelected,
                              isToday && !isSelected && { color: LuxuryColors.accent },
                              isPast && styles.inlineCalDayTextDisabled
                            ]}
                          >
                            {day}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </GlassCard>
              )}

              {/* Max Usage */}
              <LuxuryInput
                label="Max Usage"
                value={form.maxUsage}
                onChangeText={(v) => updateForm('maxUsage', v)}
                placeholder="e.g. 100 (optional)"
                keyboardType="numeric"
                leftIcon={<Users size={16} color={LuxuryColors.textMuted} />}
              />

              {/* Description */}
              <LuxuryInput
                label="Description"
                value={form.description}
                onChangeText={(v) => updateForm('description', v)}
                placeholder="Short description (optional)"
                leftIcon={<Tag size={16} color={LuxuryColors.textMuted} />}
              />

              {/* Error */}
              {error ? (
                <View style={styles.errorBox}>
                  <AlertTriangle size={14} color={LuxuryColors.danger} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              {/* Buttons */}
              <View style={styles.modalFooter}>
                <LuxuryButton title="Cancel" variant="outline" onPress={resetAndClose} style={{ flex: 1 }} />
                <LuxuryButton title="Create" variant="primary" onPress={handleCreate} loading={loading} style={{ flex: 1 }} />
              </View>
            </ScrollView>
          </GlassCard>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const AdminVouchersScreen = () => {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const loadVouchers = async () => {
    try {
      const { data } = await getAdminVouchersAPI();
      const list: Voucher[] = Array.isArray(data) ? data : (data?.vouchers ?? []);
      setVouchers(list.length > 0 ? list : MOCK_VOUCHERS);
    } catch {
      setVouchers(MOCK_VOUCHERS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadVouchers(); }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadVouchers();
  }, []);

  const handleDelete = (id: string, code: string) => {
    Alert.alert(
      'Delete Voucher',
      `Are you sure you want to permanently delete the voucher "${code}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAdminVoucherAPI(id);
              setVouchers((prev) => prev.filter((v) => v._id !== id));
            } catch {
              setVouchers((prev) => prev.filter((v) => v._id !== id));
              Alert.alert('Offline Mode', 'Server offline. Voucher has been deleted locally.');
            }
          },
        },
      ]
    );
  };

  const handleCreated = (newVoucher?: Voucher) => {
    setModalVisible(false);
    if (newVoucher) {
      setVouchers((prev) => [newVoucher, ...prev]);
    } else {
      setLoading(true);
      loadVouchers();
    }
  };

  // Stats
  const activeCount = vouchers.filter((v) => v.isActive && !isExpired(v.expiryDate)).length;
  const expiredCount = vouchers.filter((v) => isExpired(v.expiryDate)).length;
  const totalUsed = vouchers.reduce((acc, v) => acc + (v.usedCount ?? 0), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
        <Text style={styles.loadingText}>Loading vouchers...</Text>
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
            <Text style={styles.title}>Vouchers</Text>
            <Text style={styles.subtitle}>Manage promotional codes</Text>
          </View>
          <PremiumPressable onPress={() => setModalVisible(true)} style={styles.addBtn}>
            <Plus size={20} color={LuxuryColors.background} />
          </PremiumPressable>
        </Animated.View>

        {/* Summary stats */}
        <Animated.View entering={FadeInDown.delay(80).springify()} style={styles.statsRow}>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#10B981' }]}>{activeCount}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statValue, { color: LuxuryColors.danger }]}>{expiredCount}</Text>
            <Text style={styles.statLabel}>Expired</Text>
          </GlassCard>
          <GlassCard style={styles.statCard}>
            <Text style={[styles.statValue, { color: LuxuryColors.accent }]}>{totalUsed}</Text>
            <Text style={styles.statLabel}>Total Used</Text>
          </GlassCard>
        </Animated.View>

        {/* Create CTA if empty */}
        {vouchers.length === 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()}>
            <GlassCard style={styles.emptyCard}>
              <Ticket size={48} color={LuxuryColors.textMuted} />
              <Text style={styles.emptyText}>No vouchers created yet</Text>
              <Text style={styles.emptySubtext}>Tap the + button to create your first promotional voucher</Text>
              <PremiumPressable onPress={() => setModalVisible(true)} style={styles.emptyCreateBtn}>
                <Plus size={16} color={LuxuryColors.background} />
                <Text style={styles.emptyCreateBtnText}>CREATE VOUCHER</Text>
              </PremiumPressable>
            </GlassCard>
          </Animated.View>
        )}

        {/* List header */}
        {vouchers.length > 0 && (
          <View style={styles.listHeader}>
            <Tag size={14} color={LuxuryColors.accent} />
            <Text style={styles.listHeaderTitle}>ALL VOUCHERS</Text>
            <Text style={styles.listHeaderCount}>{vouchers.length}</Text>
          </View>
        )}

        {/* Voucher list */}
        <View style={styles.list}>
          {vouchers.map((v, idx) => (
            <VoucherCard key={v._id} voucher={v} onDelete={handleDelete} index={idx} />
          ))}
        </View>
      </ScrollView>

      {/* Create modal */}
      <CreateVoucherModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onCreated={handleCreated}
      />
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
    marginBottom: 24,
  },
  title: { ...LuxuryTypography.titleL, color: '#FFF' },
  subtitle: { ...LuxuryTypography.caption, color: LuxuryColors.textMuted, marginTop: 4 },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: LuxuryColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: { flex: 1, padding: 14, alignItems: 'center', gap: 6 },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
    textTransform: 'none',
    letterSpacing: 0,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  listHeaderTitle: { ...LuxuryTypography.tiny, color: LuxuryColors.accent, flex: 1 },
  listHeaderCount: { ...LuxuryTypography.tiny, color: LuxuryColors.textMuted, fontSize: 10 },
  list: { gap: 14 },
  // ─── Voucher Card ───
  voucherCard: { padding: 16, gap: 12 },
  voucherCardInactive: { opacity: 0.65 },
  voucherTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  voucherCodeWrap: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  voucherCode: {
    fontFamily: 'monospace',
    fontSize: 16,
    fontWeight: '800',
    color: LuxuryColors.accent,
    letterSpacing: 2,
  },
  voucherCodeInactive: { color: LuxuryColors.textMuted },
  voucherTopRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: LuxuryRadius.full,
    borderWidth: 1,
  },
  statusText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.2)',
  },
  discountRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  discountValue: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 20,
    fontWeight: '800',
  },
  discountValueInactive: { color: LuxuryColors.textMuted },
  voucherDesc: { ...LuxuryTypography.caption, color: LuxuryColors.textSecondary, fontSize: 12 },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { ...LuxuryTypography.caption, color: LuxuryColors.textMuted, fontSize: 11 },
  usageSection: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.06)',
  },
  usageLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
  // ─── Empty ───
  emptyCard: { padding: 40, alignItems: 'center', gap: 12, marginTop: 20 },
  emptyText: { ...LuxuryTypography.bodySemibold, color: '#FFF', textAlign: 'center' },
  emptySubtext: { ...LuxuryTypography.caption, color: LuxuryColors.textMuted, textAlign: 'center', lineHeight: 20 },
  emptyCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: LuxuryRadius.md,
    marginTop: 8,
  },
  emptyCreateBtnText: { ...LuxuryTypography.bodySemibold, color: LuxuryColors.background, fontSize: 13 },
  // ─── Modal ───
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderRadius: LuxuryRadius.xl,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  modalTitle: { ...LuxuryTypography.bodySemibold, color: '#FFF', fontSize: 14, letterSpacing: 1 },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  formLabel: {
    ...LuxuryTypography.tiny,
    color: '#94A3B8',
    marginBottom: 10,
    marginLeft: 4,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    fontSize: 11,
  },
  typeRow: { flexDirection: 'row', gap: 12 },
  typePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: LuxuryRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  typePillActive: {
    backgroundColor: LuxuryColors.accent,
    borderColor: LuxuryColors.accent,
  },
  typePillText: { ...LuxuryTypography.caption, color: LuxuryColors.textSecondary, fontSize: 12 },
  typePillTextActive: { color: LuxuryColors.background, fontWeight: '700' },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(244, 63, 94, 0.1)',
    borderRadius: LuxuryRadius.sm,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(244, 63, 94, 0.25)',
  },
  errorText: { ...LuxuryTypography.caption, color: LuxuryColors.danger, flex: 1, fontSize: 13 },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 8 },
  webDateLabel: {
    ...LuxuryTypography.tiny,
    color: '#94A3B8',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  webDateInputContainer: {
    borderRadius: LuxuryRadius.md,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  inlineCalendarCard: {
    padding: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1.5,
    borderRadius: LuxuryRadius.md,
    gap: 10,
    marginTop: 4,
  },
  inlineCalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inlineCalNavBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inlineCalMonthTitle: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 13,
  },
  inlineCalWeekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inlineCalWeekdayLabel: {
    width: `${100 / 7}%` as any,
    textAlign: 'center',
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 9,
  },
  inlineCalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 2,
  },
  inlineCalDayCell: {
    width: `${(100 - 2 * 6) / 7}%` as any,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  inlineCalDayCellEmpty: {
    width: `${(100 - 2 * 6) / 7}%` as any,
    aspectRatio: 1,
  },
  inlineCalDayCellSelected: {
    backgroundColor: LuxuryColors.accent,
  },
  inlineCalDayCellDisabled: {
    opacity: 0.25,
  },
  inlineCalDayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },
  inlineCalDayTextSelected: {
    color: LuxuryColors.background,
  },
  inlineCalDayTextDisabled: {
    color: LuxuryColors.textMuted,
  },
});

export default AdminVouchersScreen;
