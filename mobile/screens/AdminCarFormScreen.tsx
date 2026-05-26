import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Car, Save } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { PremiumPressable } from '@/components/PremiumPressable';
import GlassCard from '@/components/GlassCard';
import LuxuryInput from '@/components/LuxuryInput';
import LuxuryButton from '@/components/LuxuryButton';
import LuxuryModal from '@/components/LuxuryModal';
import { createCarAPI, updateCarAPI, getCarByIdAPI } from '@/services/api';

interface CarForm {
  name: string;
  brand: string;
  model: string;
  year: string;
  pricePerDay: string;
  type: string;
  description: string;
  location: string;
  imageUrl: string;
  seats: string;
  transmission: string;
  fuelType: string;
}

const emptyForm: CarForm = {
  name: '',
  brand: '',
  model: '',
  year: new Date().getFullYear().toString(),
  pricePerDay: '',
  type: 'Sedan',
  description: '',
  location: '',
  imageUrl: '',
  seats: '5',
  transmission: 'Automatic',
  fuelType: 'Gas',
};

const transmissionOptions = ['Automatic', 'Manual'];
const fuelOptions = ['Gas', 'Electric', 'Hybrid', 'Diesel'];
const typeOptions = ['Sedan', 'SUV', 'Coupe', 'Electric', 'Supercar', 'Convertible', 'Truck'];

const AdminCarFormScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const editId = params.editId as string | undefined;
  const isEdit = !!editId;

  const [form, setForm] = useState<CarForm>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CarForm, string>>>({});
  const [modalConfig, setModalConfig] = useState<any>({ visible: false, type: 'success', title: '', message: '' });

  useEffect(() => {
    if (isEdit) {
      const loadCar = async () => {
        setFetchLoading(true);
        try {
          const { data } = await getCarByIdAPI(editId);
          setForm({
            name: data.name || '',
            brand: data.brand || '',
            model: data.model || '',
            year: String(data.year || new Date().getFullYear()),
            pricePerDay: String(data.pricePerDay || ''),
            type: data.type || 'Sedan',
            description: data.description || '',
            location: data.location || '',
            imageUrl: data.imageUrl || '',
            seats: String(data.seats || '5'),
            transmission: data.transmission || 'Automatic',
            fuelType: data.fuelType || 'Gas',
          });
        } catch (error) {
          console.error('Load car error:', error);
        } finally {
          setFetchLoading(false);
        }
      };
      loadCar();
    }
  }, [editId]);

  const updateField = (key: keyof CarForm, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CarForm, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.brand.trim()) newErrors.brand = 'Brand is required';
    if (!form.pricePerDay || isNaN(Number(form.pricePerDay))) newErrors.pricePerDay = 'Valid price is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.imageUrl.trim()) newErrors.imageUrl = 'Image URL is required';
    if (!form.seats || isNaN(Number(form.seats))) newErrors.seats = 'Valid seats count is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: Number(form.year),
        pricePerDay: Number(form.pricePerDay),
        type: form.type,
        description: form.description.trim(),
        location: form.location.trim(),
        imageUrl: form.imageUrl.trim(),
        seats: Number(form.seats),
        transmission: form.transmission,
        fuelType: form.fuelType,
      };

      if (isEdit) {
        await updateCarAPI(editId, payload);
      } else {
        await createCarAPI(payload);
      }

      setModalConfig({
        visible: true,
        type: 'success',
        title: isEdit ? 'Car Updated' : 'Car Added',
        message: isEdit
          ? 'The vehicle has been updated in the fleet.'
          : 'A new vehicle has been added to the fleet!',
        confirmText: 'Back to Fleet',
        onConfirm: () => {
          setModalConfig((prev: any) => ({ ...prev, visible: false }));
          router.back();
        }
      });
    } catch (error: any) {
      setModalConfig({
        visible: true,
        type: 'error',
        title: 'Error',
        message: error.response?.data?.error || 'Failed to save car.',
        confirmText: 'Try Again',
        onConfirm: () => setModalConfig((prev: any) => ({ ...prev, visible: false }))
      });
    } finally {
      setLoading(false);
    }
  };

  const OptionSelector = ({ label, options, value, onChange }: {
    label: string;
    options: string[];
    value: string;
    onChange: (v: string) => void;
  }) => (
    <View style={styles.optionGroup}>
      <Text style={styles.optionLabel}>{label}</Text>
      <View style={styles.optionRow}>
        {options.map(opt => (
          <PremiumPressable
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.optionPill, value === opt && styles.optionPillActive]}
          >
            <Text style={[styles.optionText, value === opt && styles.optionTextActive]}>{opt}</Text>
          </PremiumPressable>
        ))}
      </View>
    </View>
  );

  if (fetchLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
        <Text style={styles.loadingText}>Loading vehicle data...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <PremiumPressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFF" />
        </PremiumPressable>
        <Text style={styles.headerTitle}>{isEdit ? 'Edit Vehicle' : 'Add to Fleet'}</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View entering={FadeInDown.delay(100)}>
          <View style={styles.iconRow}>
            <View style={styles.carIconCircle}>
              <Car size={32} color={LuxuryColors.accent} />
            </View>
            <Text style={styles.formTitle}>{isEdit ? 'Modify Fleet Entry' : 'Register New Vehicle'}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200)}>
          <Text style={styles.sectionTitle}>IDENTITY</Text>
          <GlassCard style={styles.inputCard}>
            <LuxuryInput
              label="VEHICLE NAME"
              value={form.name}
              onChangeText={(v) => updateField('name', v)}
              placeholder="e.g. Tesla Model S Plaid"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <LuxuryInput
                  label="BRAND"
                  value={form.brand}
                  onChangeText={(v) => updateField('brand', v)}
                  placeholder="e.g. Tesla"
                />
                {errors.brand && <Text style={styles.errorText}>{errors.brand}</Text>}
              </View>
              <View style={{ flex: 1 }}>
                <LuxuryInput
                  label="MODEL"
                  value={form.model}
                  onChangeText={(v) => updateField('model', v)}
                  placeholder="e.g. Model S"
                />
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={{ flex: 1 }}>
                <LuxuryInput
                  label="YEAR"
                  value={form.year}
                  onChangeText={(v) => updateField('year', v)}
                  placeholder="2024"
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <LuxuryInput
                  label="SEATS"
                  value={form.seats}
                  onChangeText={(v) => updateField('seats', v)}
                  placeholder="5"
                  keyboardType="numeric"
                />
                {errors.seats && <Text style={styles.errorText}>{errors.seats}</Text>}
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300)}>
          <Text style={styles.sectionTitle}>PRICING & LOCATION</Text>
          <GlassCard style={styles.inputCard}>
            <LuxuryInput
              label="PRICE PER DAY ($)"
              value={form.pricePerDay}
              onChangeText={(v) => updateField('pricePerDay', v)}
              placeholder="e.g. 199"
              keyboardType="numeric"
            />
            {errors.pricePerDay && <Text style={styles.errorText}>{errors.pricePerDay}</Text>}

            <LuxuryInput
              label="LOCATION"
              value={form.location}
              onChangeText={(v) => updateField('location', v)}
              placeholder="e.g. Downtown LA Hub"
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400)}>
          <Text style={styles.sectionTitle}>SPECIFICATIONS</Text>
          <GlassCard style={styles.inputCard}>
            <OptionSelector
              label="VEHICLE TYPE"
              options={typeOptions}
              value={form.type}
              onChange={(v) => updateField('type', v)}
            />
            <OptionSelector
              label="TRANSMISSION"
              options={transmissionOptions}
              value={form.transmission}
              onChange={(v) => updateField('transmission', v)}
            />
            <OptionSelector
              label="FUEL TYPE"
              options={fuelOptions}
              value={form.fuelType}
              onChange={(v) => updateField('fuelType', v)}
            />
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={styles.sectionTitle}>MEDIA & DESCRIPTION</Text>
          <GlassCard style={styles.inputCard}>
            <LuxuryInput
              label="IMAGE URL"
              value={form.imageUrl}
              onChangeText={(v) => updateField('imageUrl', v)}
              placeholder="https://example.com/car-image.jpg"
            />
            {errors.imageUrl && <Text style={styles.errorText}>{errors.imageUrl}</Text>}

            <LuxuryInput
              label="DESCRIPTION"
              value={form.description}
              onChangeText={(v) => updateField('description', v)}
              placeholder="Describe the luxury experience..."
              multiline
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </GlassCard>
        </Animated.View>

        <View style={{ marginTop: 10 }}>
          <LuxuryButton
            title={loading ? 'SAVING...' : (isEdit ? 'UPDATE VEHICLE' : 'ADD TO FLEET')}
            onPress={handleSubmit}
            disabled={loading}
          />
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <LuxuryModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.confirmText}
        onConfirm={modalConfig.onConfirm}
      />
    </KeyboardAvoidingView>
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
    gap: 16,
  },
  loadingText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  headerTitle: {
    ...LuxuryTypography.titleM,
    fontSize: 18,
    color: '#FFF',
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 20,
  },
  iconRow: {
    alignItems: 'center',
    marginBottom: 32,
    gap: 12,
  },
  carIconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
  },
  sectionTitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    fontWeight: '800',
    marginBottom: 12,
    marginLeft: 4,
    letterSpacing: 1.5,
  },
  inputCard: {
    padding: 20,
    gap: 16,
    marginBottom: 24,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  errorText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.danger,
    marginTop: -8,
    marginLeft: 4,
    fontSize: 11,
    textTransform: 'none',
    letterSpacing: 0,
  },
  optionGroup: {
    gap: 10,
  },
  optionLabel: {
    ...LuxuryTypography.tiny,
    color: '#94A3B8',
    marginLeft: 4,
  },
  optionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: LuxuryRadius.full,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: LuxuryColors.border,
  },
  optionPillActive: {
    backgroundColor: LuxuryColors.accent,
    borderColor: LuxuryColors.accent,
  },
  optionText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontWeight: '600',
    fontSize: 12,
  },
  optionTextActive: {
    color: LuxuryColors.background,
  },
});

export default AdminCarFormScreen;
