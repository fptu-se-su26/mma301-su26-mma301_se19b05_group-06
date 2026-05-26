import { Text, View, StyleSheet } from 'react-native';
import { LuxuryColors, LuxuryTypography } from '@/constants/luxuryTheme';

interface LuxurySectionTitleProps {
  title: string;
  subtitle?: string;
  action?: string;
}

const LuxurySectionTitle = ({ title, subtitle, action }: LuxurySectionTitleProps) => (
  <View style={styles.container}>
    <View style={{ flex: 1 }}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ? <Text style={styles.action}>{action}</Text> : null}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  title: {
    color: LuxuryColors.textPrimary,
    fontSize: LuxuryTypography.subtitle,
    fontWeight: '800',
  },
  subtitle: {
    color: LuxuryColors.textSecondary,
    fontSize: LuxuryTypography.small,
    marginTop: 8,
    lineHeight: 20,
  },
  action: {
    color: LuxuryColors.accentStrong,
    fontSize: LuxuryTypography.tiny,
    fontWeight: '600',
  },
});

export default LuxurySectionTitle;
