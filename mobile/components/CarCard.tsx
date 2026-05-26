import React from 'react';
import { Image, StyleSheet, Text, View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Star, MapPin, Fuel, Gauge, Users, ChevronRight } from 'lucide-react-native';
import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { PremiumPressable } from './PremiumPressable';

interface CarCardProps {
  car: any;
  onPress?: () => void;
  onBook?: () => void;
}

const CarCard = ({ car, onPress, onBook }: CarCardProps) => {
  return (
    <PremiumPressable scaleTo={0.97} onPress={onPress} style={styles.cardContainer}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: car.imageUrl }} style={styles.image} resizeMode="cover" />
        <LinearGradient
          colors={['transparent', 'rgba(2, 6, 23, 0.8)']}
          style={styles.imageOverlay}
        />
        
        <View style={styles.ratingPill}>
          <Star size={10} color={LuxuryColors.background} fill={LuxuryColors.background} />
          <Text style={styles.ratingText}>{car.rating || 4.9}</Text>
        </View>

        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>
            {car.pricePerDay.toLocaleString()} VNĐ
            <Text style={styles.perDayText}>/d</Text>
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.brandText}>{car.brand}</Text>
            <Text style={styles.modelText}>{car.model}</Text>
            {car.calculatedDistance ? (
              <View style={styles.distanceBadge}>
                <MapPin size={12} color={LuxuryColors.accent} />
                <Text style={styles.distanceTextHighlight}>{(car.calculatedDistance / 1000).toFixed(1)} km from you</Text>
              </View>
            ) : (
              <View style={styles.distanceBadge}>
                <MapPin size={12} color={LuxuryColors.textMuted} />
                <Text style={styles.distanceText}>{car.location || 'Global Hub'}</Text>
              </View>
            )}
          </View>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{car.type || 'LUXURY'}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.bottomRow}>
          <View style={styles.specsRow}>
            <View style={styles.specItem}>
              <Users size={14} color={LuxuryColors.accent} />
              <Text style={styles.specText}>{car.seats || 4}</Text>
            </View>
            <View style={styles.specItem}>
              <Gauge size={14} color={LuxuryColors.accent} />
              <Text style={styles.specText}>{car.transmission === 'Automatic' ? 'Auto' : 'Manual'}</Text>
            </View>
            <View style={styles.specItem}>
              <Fuel size={14} color={LuxuryColors.accent} />
              <Text style={styles.specText}>{car.fuelType || 'EV'}</Text>
            </View>
          </View>
          
          <View style={styles.arrowCircle}>
            <ChevronRight size={16} color={LuxuryColors.background} />
          </View>
        </View>
      </View>
    </PremiumPressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: LuxuryColors.card,
    borderRadius: LuxuryRadius.xl,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
    overflow: 'hidden',
    marginBottom: 20,
    boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.5)',
    elevation: 4,
  },
  imageContainer: {
    height: 180,
    width: '100%',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  ratingPill: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
    gap: 4,
  },
  ratingText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontWeight: '800',
    fontSize: 10,
  },
  priceBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    backgroundColor: 'rgba(2, 6, 23, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LuxuryRadius.md,
    backdropFilter: 'blur(10px)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  priceText: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 18,
  },
  perDayText: {
    fontSize: 10,
    color: LuxuryColors.textMuted,
    fontWeight: '400',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  brandText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    marginBottom: 2,
    letterSpacing: 1.5,
  },
  modelText: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 20,
    marginBottom: 4,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  distanceText: {
    color: LuxuryColors.textSecondary,
    fontSize: 12,
  },
  distanceTextHighlight: {
    color: LuxuryColors.accent,
    fontSize: 12,
    fontWeight: 'bold',
  },
  typeBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  typeText: {
    ...LuxuryTypography.tiny,
    fontSize: 8,
    color: LuxuryColors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  specsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  specText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 12,
  },
  arrowCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: LuxuryColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default CarCard;
