import React, { useEffect, useState, useCallback } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, Image, StatusBar } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Plus, Trash2, MapPin, Gauge, Star, Filter, Pencil } from 'lucide-react-native';
import { useRouter, useFocusEffect } from 'expo-router';

import { 
  LuxuryColors, 
  LuxurySpacing, 
  LuxuryTypography, 
  LuxuryRadius 
} from '@/constants/luxuryTheme';
import { getCarsAPI, deleteCarAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

const AdminCarsScreen = () => {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCars = async () => {
    try {
      const { data } = await getCarsAPI();
      setCars(data);
    } catch (error) {
      console.error('Cars fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  // Reload when screen gets focus (after adding/editing)
  useFocusEffect(
    useCallback(() => {
      loadCars();
    }, [])
  );

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Decommission Vehicle', `Are you certain you wish to completely remove the ${name} from the active fleet collection?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Decommission', style: 'destructive', onPress: async () => {
        try {
          await deleteCarAPI(id);
          loadCars();
        } catch (error) {
          Alert.alert('System Error', 'Could not complete decompression process.');
        }
      } }
    ]);
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Fleet Inventory</Text>
            <Text style={styles.subtitle}>Curate and manage your ultimate collection</Text>
          </View>
          <PremiumPressable 
            onPress={() => router.push('/admin-car-form' as any)}
            style={styles.addBtn}
          >
            <Plus size={20} color={LuxuryColors.background} />
          </PremiumPressable>
        </View>

        <View style={styles.filterBar}>
          <Filter size={16} color={LuxuryColors.textMuted} />
          <Text style={styles.filterText}>Filtering by All Categories</Text>
        </View>
        
        <View style={styles.list}>
          {cars.map((c, idx) => (
            <Animated.View 
              key={c._id} 
              entering={FadeInDown.delay(idx * 100).duration(500).springify()}
              layout={Layout.springify()}
            >
              <GlassCard style={styles.carCard}>
                <Image source={{ uri: c.imageUrl }} style={styles.carImage} />
                <View style={styles.info}>
                  <View style={styles.infoTop}>
                    <Text style={styles.carModel}>{c.name || c.model}</Text>
                    <View style={styles.ratingBox}>
                      <Star size={10} color={LuxuryColors.accent} fill={LuxuryColors.accent} />
                      <Text style={styles.ratingText}>{c.rating || 5.0}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.detailsRow}>
                    <Text style={styles.detailsText}>{c.brand} • {c.year || 2024}</Text>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.metaItem}>
                      <MapPin size={12} color={LuxuryColors.textMuted} />
                      <Text style={styles.metaText} numberOfLines={1}>{c.location || 'Hub'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Gauge size={12} color={LuxuryColors.textMuted} />
                      <Text style={styles.metaText}>{c.transmission?.slice(0, 4)}</Text>
                    </View>
                  </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.priceText}>
                        ${c.pricePerDay} <Text style={styles.perDay}>/day</Text>
                      </Text>
                      <View style={styles.footerActions}>
                        <PremiumPressable 
                          onPress={() => router.push({ pathname: '/admin-car-form' as any, params: { editId: c._id } })}
                          style={styles.editBtn}
                        >
                          <Pencil size={14} color={LuxuryColors.accent} />
                        </PremiumPressable>
                        <PremiumPressable 
                          onPress={() => handleDelete(c._id, c.name)} 
                          style={styles.deleteBtn}
                        >
                          <Trash2 size={16} color={LuxuryColors.danger} />
                        </PremiumPressable>
                      </View>
                    </View>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    ...LuxuryTypography.titleL,
    color: '#FFF',
  },
  subtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    marginTop: 4,
  },
  addBtn: {
    backgroundColor: LuxuryColors.accent,
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LuxuryRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: 20,
  },
  filterText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    letterSpacing: 0,
    textTransform: 'none',
  },
  list: {
    gap: 16,
  },
  carCard: {
    padding: 12,
    flexDirection: 'row',
    gap: 16,
  },
  carImage: {
    width: 110,
    height: 110,
    borderRadius: LuxuryRadius.md,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  info: {
    flex: 1,
    justifyContent: 'center',
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  carModel: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 15,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontWeight: '800',
  },
  detailsRow: {
    marginBottom: 4,
  },
  detailsText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textSecondary,
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    color: LuxuryColors.textMuted,
    maxWidth: 60,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
  },
  priceText: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 16,
  },
  perDay: {
    fontSize: 10,
    color: LuxuryColors.textMuted,
    fontWeight: '400',
  },
  deleteBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  editBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  footerActions: {
    flexDirection: 'row',
    gap: 8,
  },
});

export default AdminCarsScreen;
