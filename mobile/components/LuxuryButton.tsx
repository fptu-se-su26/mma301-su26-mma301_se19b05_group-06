import { StyleSheet, Text, ViewStyle, View, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { LuxuryColors, LuxurySpacing, LuxuryTypography, LuxuryRadius } from '@/constants/luxuryTheme';
import { PremiumPressable } from './PremiumPressable';

interface LuxuryButtonProps {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'glass';
  style?: ViewStyle | ViewStyle[];
  disabled?: boolean;
  loading?: boolean;
}

const LuxuryButton = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  style, 
  disabled,
  loading 
}: LuxuryButtonProps) => {

  const content = (
    <View style={[
      styles.base,
      variant === 'primary' && styles.primary,
      variant === 'outline' && styles.outline,
      variant === 'glass' && styles.glass,
      (disabled || loading) && styles.disabled,
    ]}>
      {variant === 'primary' && !(disabled || loading) && (
        <LinearGradient 
          colors={['#FBBF24', '#F59E0B']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      )}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? LuxuryColors.background : LuxuryColors.accent} size="small" />
      ) : (
        <Text style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'outline' && styles.outlineText,
          variant === 'glass' && styles.glassText,
          disabled && styles.disabledText,
        ]}>
          {title}
        </Text>
      )}
    </View>
  );

  return (
    <PremiumPressable 
      onPress={onPress} 
      disabled={disabled || loading}
      style={[styles.wrapper, style]}
      scaleTo={0.96}
    >
      {content}
    </PremiumPressable>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  base: {
    height: 56,
    borderRadius: LuxuryRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  primary: {
    backgroundColor: LuxuryColors.accent,
  },
  primaryText: {
    color: LuxuryColors.background,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  outline: {
    borderWidth: 1.5,
    borderColor: LuxuryColors.borderStrong,
    backgroundColor: 'transparent',
  },
  outlineText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  glass: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  glassText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  text: {
    ...LuxuryTypography.bodySemibold,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 14,
  },
  disabled: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.05)',
  },
  disabledText: {
    color: LuxuryColors.textMuted,
  },
});

export default LuxuryButton;
