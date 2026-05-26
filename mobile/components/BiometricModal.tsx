import React, { useEffect } from 'react';
import { Modal, StyleSheet, Text, View, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { Fingerprint, Scan, ShieldCheck } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming, 
  withSequence,
  withDelay,
  FadeIn
} from 'react-native-reanimated';
import { LuxuryColors, LuxuryRadius, LuxuryTypography } from '@/constants/luxuryTheme';
import GlassCard from './GlassCard';

const { width } = Dimensions.get('window');

interface BiometricModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
  type?: 'face' | 'fingerprint';
}

const BiometricModal = ({
  visible,
  onSuccess,
  onCancel,
  type = 'face',
}: BiometricModalProps) => {
  const scanLineY = useSharedValue(-20);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    if (visible) {
      // Animation for the scanning line
      scanLineY.value = withRepeat(
        withSequence(
          withTiming(100, { duration: 1500 }),
          withTiming(-20, { duration: 1500 })
        ),
        -1,
        true
      );

      // Pulse animation for the icon
      scale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );

      // Success trigger after delay
      const timer = setTimeout(() => {
        onSuccess();
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: 1,
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />
        
        <Animated.View entering={FadeIn} style={styles.container}>
          <GlassCard style={styles.modalCard}>
            <View style={styles.iconContainer}>
              <Animated.View style={[styles.scanFrame, iconStyle]}>
                {type === 'face' ? (
                  <Scan size={60} color={LuxuryColors.accent} strokeWidth={1.5} />
                ) : (
                  <Fingerprint size={60} color={LuxuryColors.accent} strokeWidth={1.5} />
                )}
                <Animated.View style={[styles.scanLine, lineStyle]} />
              </Animated.View>
            </View>
            
            <Text style={styles.title}>
              {type === 'face' ? 'AUTHENTICATING FACE ID' : 'SCANNING BIOMETRICS'}
            </Text>
            <Text style={styles.message}>
              Elite Secure Authorization in progress...
            </Text>
            
            <View style={styles.securityBadge}>
              <ShieldCheck size={14} color={LuxuryColors.success} />
              <Text style={styles.securityText}>BIOMETRIC ENCRYPTED</Text>
            </View>
          </GlassCard>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '100%',
    alignItems: 'center',
  },
  modalCard: {
    width: Math.min(width * 0.8, 320),
    padding: 40,
    alignItems: 'center',
    borderRadius: LuxuryRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  iconContainer: {
    marginBottom: 30,
    position: 'relative',
  },
  scanFrame: {
    width: 100,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 25,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    width: '120%',
    height: 2,
    backgroundColor: LuxuryColors.accent,
    boxShadow: `0px 0px 10px ${LuxuryColors.accent}`,
  },
  title: {
    ...LuxuryTypography.caption,
    color: '#FFF',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 10,
  },
  message: {
    ...LuxuryTypography.body,
    fontSize: 14,
    color: LuxuryColors.textSecondary,
    textAlign: 'center',
    marginBottom: 25,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LuxuryRadius.full,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  securityText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.success,
    fontSize: 9,
  },
});

export default BiometricModal;
