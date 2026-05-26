import { StyleSheet, Platform } from 'react-native';
import { LuxuryColors, LuxurySpacing, LuxuryTypography, LuxuryRadius } from './luxuryTheme';

export const luxuryStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  content: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingVertical: 24,
  },
  section: {
    marginBottom: LuxurySpacing.xl,
  },
  glassCard: {
    backgroundColor: LuxuryColors.card,
    borderRadius: LuxuryRadius.lg,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
    boxShadow: `0px 10px 18px ${LuxuryColors.shadow}`,
    elevation: 12,
  },
  glassCardStrong: {
    backgroundColor: LuxuryColors.cardStrong,
    borderRadius: LuxuryRadius.lg,
    borderWidth: 1,
    borderColor: LuxuryColors.borderStrong,
    boxShadow: `0px 14px 24px ${LuxuryColors.shadow}`,
    elevation: 14,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: LuxuryColors.accentSoft,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
  },
  pillText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accentStrong,
    letterSpacing: 1.8,
  },
  gradientButton: {
    backgroundColor: LuxuryColors.accent,
    borderRadius: LuxuryRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  gradientButtonText: {
    ...LuxuryTypography.bodySemibold,
    color: '#0f172a',
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: LuxuryColors.borderStrong,
    borderRadius: LuxuryRadius.md,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  outlineButtonText: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.textPrimary,
  },
});
