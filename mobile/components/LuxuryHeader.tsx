import { LinearGradient } from 'expo-linear-gradient';
import { View, Text, StyleSheet } from 'react-native';
import { LuxuryColors, LuxuryTypography } from '@/constants/luxuryTheme';

interface LuxuryHeaderProps {
  badge?: string;
  title: string;
  subtitle?: string;
}

const LuxuryHeader = ({ badge, title, subtitle }: LuxuryHeaderProps) => (
  <View style={styles.container}>
    {badge ? (
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{badge}</Text>
      </View>
    ) : null}
    <Text style={styles.title}>{title}</Text>
    {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    <LinearGradient colors={['rgba(245,158,11,0.35)', 'transparent']} style={styles.glow} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 16,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fcd34d',
    fontSize: 11,
    letterSpacing: 2.4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {
    color: LuxuryColors.textPrimary,
    fontSize: LuxuryTypography.hero,
    fontWeight: '800',
    lineHeight: 44,
  },
  subtitle: {
    color: LuxuryColors.textSecondary,
    fontSize: LuxuryTypography.body,
    lineHeight: 24,
  },
  glow: {
    height: 2,
    width: 140,
    borderRadius: 999,
  },
});

export default LuxuryHeader;
