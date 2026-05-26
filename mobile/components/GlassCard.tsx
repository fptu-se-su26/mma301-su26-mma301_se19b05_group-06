import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LuxuryColors, LuxuryRadius } from '@/constants/luxuryTheme';

interface GlassCardProps {
  children?: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  intensity?: number;
}

const GlassCard = ({ children, style, intensity = 40 }: GlassCardProps) => {
  if (Platform.OS === 'ios') {
    return (
      <BlurView tint="dark" intensity={intensity} style={[styles.card, style]}>
        {children}
      </BlurView>
    );
  }

  // Fallback for Android/Web where BlurView might be different or less performant
  return (
    <View style={[styles.card, styles.androidFallback, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: LuxuryRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
  },
  androidFallback: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    boxShadow: '0px 10px 20px rgba(0,0,0,0.3)',
    elevation: 5,
  },
});

export default GlassCard;
