import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Image, StatusBar } from 'react-native';
import { Compass, ShieldAlert, Navigation, CompassIcon, Sparkles } from 'lucide-react-native';
import { LuxuryColors, LuxuryTypography, LuxuryRadius, LuxurySpacing } from '@/constants/luxuryTheme';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

export default function DiscoverScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      <View style={styles.header}>
        <Text style={styles.subtitle}>EXCLUSIVE ROUTING</Text>
        <Text style={styles.title}>Scenic Grand Tours</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <GlassCard style={styles.introCard}>
          <Sparkles size={20} color={LuxuryColors.accent} />
          <Text style={styles.introTitle}>Private Driving Experiences</Text>
          <Text style={styles.introText}>
            We curated the world's most spectacular roads and paired them with our elite hypercars. Unlock premium travel maps curated by our concierge.
          </Text>
        </GlassCard>

        {/* Scenic Route Card 1 */}
        <PremiumPressable style={styles.routeCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop' }}
            style={styles.routeImg}
          />
          <View style={styles.routeOverlay}>
            <View style={styles.durationBadge}>
              <Navigation size={12} color={LuxuryColors.background} />
              <Text style={styles.durationText}>3 DAYS TOUR</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeTitle}>The Coastal Highway Tour</Text>
              <Text style={styles.routeDesc}>From Saigon to Mui Ne. Best paired with Porsche 911 GT3 RS.</Text>
            </View>
          </View>
        </PremiumPressable>

        {/* Scenic Route Card 2 */}
        <PremiumPressable style={styles.routeCard}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=600&auto=format&fit=crop' }}
            style={styles.routeImg}
          />
          <View style={styles.routeOverlay}>
            <View style={styles.durationBadge}>
              <Navigation size={12} color={LuxuryColors.background} />
              <Text style={styles.durationText}>5 DAYS TOUR</Text>
            </View>
            <View style={styles.routeInfo}>
              <Text style={styles.routeTitle}>The Alpine Heights Expedition</Text>
              <Text style={styles.routeDesc}>Exploring the Northwest valleys of Sapa. Best paired with Land Rover Range Rover.</Text>
            </View>
          </View>
        </PremiumPressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  header: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  subtitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    letterSpacing: 2,
  },
  title: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: 20,
    paddingBottom: 120,
    gap: 20,
  },
  introCard: {
    padding: 20,
    gap: 8,
  },
  introTitle: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
  },
  introText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    lineHeight: 20,
  },
  routeCard: {
    height: 200,
    borderRadius: LuxuryRadius.lg,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: LuxuryColors.border,
  },
  routeImg: {
    ...StyleSheet.absoluteFillObject,
  },
  routeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
    justifyContent: 'space-between',
    padding: 20,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: LuxuryRadius.xs,
    alignSelf: 'flex-start',
  },
  durationText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 8,
    fontWeight: '950',
  },
  routeInfo: {
    gap: 4,
  },
  routeTitle: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  routeDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
});
