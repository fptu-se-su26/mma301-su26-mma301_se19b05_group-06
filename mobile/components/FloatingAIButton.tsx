import React, { useEffect, useState } from 'react';
import { StyleSheet, Platform, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withRepeat, 
  withSequence,
  useSharedValue,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';

import { LuxuryColors } from '@/constants/luxuryTheme';
import { PremiumPressable } from './PremiumPressable';
import AIChatModal from './AIChatModal';

const FloatingAIButton = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const scale = useSharedValue(1);
  const glow = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withSpring(1.2),
        withSpring(1)
      ),
      -1,
      true
    );
  }, []);

  const interpolateGlow = (val: number) => {
    'worklet';
    return (val - 1) * 0.5 + 0.3;
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: interpolateGlow(glow.value),
  }));

  return (
    <>
      <Animated.View style={[styles.container, animatedStyle]}>
        <PremiumPressable
          onPress={() => setModalVisible(true)}
          style={styles.button}
          onPressIn={() => scale.value = withSpring(0.9)}
          onPressOut={() => scale.value = withSpring(1)}
        >
          <Image 
            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }} 
            style={styles.iconImg}
          />
        </PremiumPressable>
      </Animated.View>
      <AIChatModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 140 : 110,
    right: 20,
    width: 65,
    height: 65,
    borderRadius: 33,
    zIndex: 999,
    boxShadow: `0px 4px 10px ${LuxuryColors.accent}`,
    elevation: 8,
  },
  button: {
    width: 65,
    height: 65,
    borderRadius: 33,
    backgroundColor: LuxuryColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  iconImg: {
    width: 40,
    height: 40,
  }
});

export default FloatingAIButton;
