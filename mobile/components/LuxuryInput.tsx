import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, ViewStyle, StyleProp, TextInputProps } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { LuxuryColors, LuxurySpacing, LuxuryTypography, LuxuryRadius } from '@/constants/luxuryTheme';

interface LuxuryInputProps extends TextInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  containerStyle?: StyleProp<ViewStyle>;
  leftIcon?: React.ReactNode;
}

const LuxuryInput = ({ label, value, onChangeText, containerStyle, leftIcon, ...props }: LuxuryInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isFocused ? LuxuryColors.accent : LuxuryColors.border),
    backgroundColor: withTiming(isFocused ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)'),
  }));

  return (
    <View style={[styles.root, containerStyle]}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.inputContainer, borderStyle]}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}
        <TextInput
          {...props}
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor="rgba(255,255,255,0.3)"
          style={styles.input}
          selectionColor={LuxuryColors.accent}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    width: '100%',
  },
  label: {
    ...LuxuryTypography.tiny,
    color: '#94A3B8',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: 1.5,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  inputContainer: {
    borderRadius: LuxuryRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    ...LuxuryTypography.bodySemibold,
    color: '#FFFFFF',
    fontSize: 15,
  },
});

export default LuxuryInput;
