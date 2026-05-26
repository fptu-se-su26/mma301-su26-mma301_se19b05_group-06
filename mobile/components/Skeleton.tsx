import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LuxuryColors, LuxuryRadius } from '@/constants/luxuryTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SkeletonProps {
  width?: any;
  height?: any;
  borderRadius?: number;
  style?: ViewStyle | ViewStyle[];
}

export const Skeleton = ({
  width = '100%',
  height = 20,
  borderRadius = LuxuryRadius.sm,
  style,
}: SkeletonProps) => {
  const shimmerValue = useSharedValue(-1);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          shimmerValue.value,
          [-1, 1],
          [-SCREEN_WIDTH, SCREEN_WIDTH]
        ),
      },
    ],
  }));

  return (
    <View
      style={[
        styles.skeletonContainer,
        { width, height, borderRadius },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

export const CarCardSkeleton = () => (
  <View style={styles.cardSkeleton}>
    <Skeleton height={200} borderRadius={LuxuryRadius.xl} />
    <View style={styles.cardContent}>
      <Skeleton width="40%" height={12} style={{ marginBottom: 12 }} />
      <View style={styles.row}>
        <Skeleton width="70%" height={24} />
        <Skeleton width={40} height={40} borderRadius={LuxuryRadius.md} />
      </View>
      <View style={[styles.row, { marginTop: 16 }]}>
        <Skeleton width="28%" height={10} />
        <Skeleton width="28%" height={10} />
        <Skeleton width="28%" height={10} />
      </View>
    </View>
  </View>
);

export const BookingCardSkeleton = () => (
  <View style={styles.bookingCardSkeleton}>
    <View style={styles.row}>
      <Skeleton width={100} height={60} borderRadius={LuxuryRadius.md} />
      <View style={{ flex: 1, marginLeft: 16, gap: 8 }}>
        <Skeleton width="50%" height={12} />
        <Skeleton width="80%" height={20} />
      </View>
    </View>
  </View>
);

export const CarDetailSkeleton = () => (
  <View style={styles.containerSkeleton}>
    <Skeleton height={300} borderRadius={0} style={{ marginBottom: 30 }} />
    <View style={{ padding: 24, gap: 20 }}>
      <View style={styles.row}>
        <View style={{ gap: 8, flex: 1 }}>
          <Skeleton width="40%" height={14} />
          <Skeleton width="70%" height={32} />
        </View>
        <Skeleton width={60} height={30} borderRadius={LuxuryRadius.sm} />
      </View>
      <Skeleton width="60%" height={16} />
      <View style={[styles.row, { marginTop: 20 }]}>
        <Skeleton width="22%" height={80} borderRadius={LuxuryRadius.md} />
        <Skeleton width="22%" height={80} borderRadius={LuxuryRadius.md} />
        <Skeleton width="22%" height={80} borderRadius={LuxuryRadius.md} />
        <Skeleton width="22%" height={80} borderRadius={LuxuryRadius.md} />
      </View>
      <View style={{ marginTop: 20, gap: 12 }}>
        <Skeleton width="100%" height={100} borderRadius={LuxuryRadius.lg} />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  skeletonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: LuxuryRadius.xl,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardContent: {
    padding: 20,
  },
  bookingCardSkeleton: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: LuxuryRadius.xl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  containerSkeleton: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
});
