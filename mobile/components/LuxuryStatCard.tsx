import { Text, View, StyleSheet } from 'react-native';
import { LuxuryColors, LuxurySpacing, LuxuryTypography } from '@/constants/luxuryTheme';

interface LuxuryStatCardProps {
  label: string;
  value: string;
}

const LuxuryStatCard = ({ label, value }: LuxuryStatCardProps) => (
  <View style={styles.card}>
    <Text style={styles.value}>{value}</Text>
    <Text style={styles.label}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: LuxurySpacing.radiusMd,
    borderWidth: 1,
    borderColor: LuxuryColors.border,
    padding: 16,
    alignItems: 'center',
    gap: 4,
  },
  value: {
    color: LuxuryColors.accentStrong,
    fontSize: 24,
    fontWeight: '800',
  },
  label: {
    color: LuxuryColors.textMuted,
    fontSize: LuxuryTypography.tiny,
  },
});

export default LuxuryStatCard;
