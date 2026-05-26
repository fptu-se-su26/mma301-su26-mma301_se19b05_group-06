export const LuxuryColors = {
  background: '#020617', // Deep obsidian
  backgroundAlt: '#0f172a',
  card: 'rgba(255, 255, 255, 0.04)',
  cardStrong: 'rgba(255, 255, 255, 0.08)',
  border: 'rgba(255, 255, 255, 0.1)',
  borderStrong: 'rgba(255, 255, 255, 0.18)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
  accent: '#EAB308', // More vibrant gold
  accentRGB: '234, 179, 8',
  accentSoft: 'rgba(234, 179, 8, 0.1)',
  accentStrong: '#FACC15',
  success: '#10B981',
  danger: '#F43F5E',
  overlay: 'rgba(2, 6, 23, 0.8)',
  gold: '#D4AF37',
  silver: '#E2E8F0',
  white: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

export const LuxurySpacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  huge: 48,
  screenPadding: 24,
};

export const LuxuryRadius = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 28,
  full: 999,
};

export const LuxuryTypography = {
  titleXL: {
    fontSize: 40,
    fontWeight: '800' as const,
    letterSpacing: -1,
    lineHeight: 48,
  },
  titleL: {
    fontSize: 28,
    fontWeight: '700' as const,
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  titleM: {
    fontSize: 22,
    fontWeight: '700' as const,
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  bodySemibold: {
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: 0,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
    lineHeight: 20,
  },
  tiny: {
    fontSize: 11,
    fontWeight: '700' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
  },
};
