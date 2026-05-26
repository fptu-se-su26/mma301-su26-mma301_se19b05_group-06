import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, Text, View, Dimensions } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withDelay, 
  withSequence,
  FadeInUp,
  FadeOutUp
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { CheckCircle2, AlertCircle, Info, XCircle } from 'lucide-react-native';
import { LuxuryColors, LuxuryRadius, LuxuryTypography } from '@/constants/luxuryTheme';

const { width } = Dimensions.get('window');

export interface ToastRef {
  show: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const LuxuryToast = forwardRef<ToastRef>((props, ref) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'success' | 'error' | 'info'>('info');

  const translateY = useSharedValue(-100);

  useImperativeHandle(ref, () => ({
    show: (msg, t = 'info') => {
      setMessage(msg);
      setType(t);
      setVisible(true);
    },
  }));

  useEffect(() => {
    if (visible) {
      translateY.value = withSequence(
        withSpring(50, { damping: 12, stiffness: 100 }),
        withDelay(3000, withSpring(-100, { damping: 12 }, () => {
          // Reset after hiding
        }))
      );
      
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: interpolate(translateY.value, [-50, 50], [0, 1]),
  }));

  if (!visible) return null;

  const Icon = type === 'success' ? CheckCircle2 : type === 'error' ? XCircle : Info;
  const color = type === 'success' ? LuxuryColors.success : type === 'error' ? LuxuryColors.danger : LuxuryColors.accent;

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={[styles.indicator, { backgroundColor: color }]} />
        <Icon size={20} color={color} />
        <Text style={styles.text}>{message}</Text>
      </BlurView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    width: width - 40,
    alignSelf: 'center',
    zIndex: 9999,
    borderRadius: LuxuryRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  blur: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingLeft: 20,
    gap: 12,
  },
  indicator: {
    position: 'absolute',
    left: 0,
    top: '50%',
    height: 30,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    transform: [{ translateY: -15 }],
  },
  text: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    flex: 1,
  },
});

function interpolate(value: number, inputRange: number[], outputRange: number[]) {
  'worklet';
  const [minIn, maxIn] = inputRange;
  const [minOut, maxOut] = outputRange;
  return minOut + ((value - minIn) * (maxOut - minOut)) / (maxIn - minIn);
}

export default LuxuryToast;
