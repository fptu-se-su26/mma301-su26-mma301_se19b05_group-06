import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, UserPlus, Sparkles } from 'lucide-react-native';

import LuxuryButton from '@/components/LuxuryButton';
import LuxuryInput from '@/components/LuxuryInput';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';
import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { registerAPI } from '@/services/api';
import { storeUser } from '@/services/storage';

const { height } = Dimensions.get('window');

const RegisterScreen = () => {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const player = useVideoPlayer('https://assets.mixkit.co/videos/52427/52427-720.mp4', (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const handleSubmit = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setErrorMessage('Please fill in all required fields');
      return;
    }
    if (form.password !== form.confirmPassword) {
      setErrorMessage('Passcodes do not match');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    try {
      const { data } = await registerAPI({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      await storeUser(data);
      if (data.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Membership request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      <View style={StyleSheet.absoluteFill}>
        <VideoView
          player={player}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          nativeControls={false}
        />
        <LinearGradient
          colors={['rgba(2, 6, 23, 0.3)', 'rgba(2, 6, 23, 0.6)', 'rgba(2, 6, 23, 0.9)']}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
        <SafeAreaView style={styles.safeArea}>
          <Animated.View entering={FadeIn.delay(300)} style={styles.heroOverlay}>
            <View style={styles.brandBadge}>
              <Sparkles size={14} color={LuxuryColors.accent} />
              <Text style={styles.brandBadgeText}>EXCLUSIVE MEMBERSHIP</Text>
            </View>
            <Text style={styles.heroTitle}>Join the Fleet</Text>
            <Text style={styles.heroSubtitle}>
              Begin your journey with the world's most{"\n"}advanced automotive ecosystem.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.formWrapper}>
            <GlassCard style={styles.authCard}>
              <Text style={styles.cardTitle}>Create Account</Text>
              <Text style={styles.cardSubtitle}>Request access to our premium fleet</Text>

              {errorMessage ? (
                <Animated.View entering={FadeIn} style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              ) : null}

              <View style={styles.inputGap}>
                <LuxuryInput
                  label="FULL NAME"
                  value={form.name}
                  onChangeText={(v) => setForm((p) => ({ ...p, name: v }))}
                  placeholder="Ex: John Sterling"
                />
                <LuxuryInput
                  label="EMAIL ADDRESS"
                  value={form.email}
                  onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
                  placeholder="you@luxury.com"
                  autoCapitalize="none"
                />
                <LuxuryInput
                  label="NEW PASSCODE"
                  value={form.password}
                  onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
                  placeholder="••••••••"
                  secureTextEntry
                />
                <LuxuryInput
                  label="CONFIRM PASSCODE"
                  value={form.confirmPassword}
                  onChangeText={(v) => setForm((p) => ({ ...p, confirmPassword: v }))}
                  placeholder="••••••••"
                  secureTextEntry
                />
              </View>

              <LuxuryButton 
                title={loading ? 'CREATING...' : 'REQUEST JOIN'} 
                onPress={handleSubmit} 
                disabled={loading}
              />

              <PremiumPressable onPress={() => router.replace('/login')} style={styles.switchAuth}>
                <Text style={styles.switchAuthText}>
                  Already a member? <Text style={{ color: LuxuryColors.accent }}>Sign In</Text>
                </Text>
              </PremiumPressable>
            </GlassCard>

            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2024 LUXERIDE PRIVATE LIMITED</Text>
              <Text style={styles.footerSubText}>Membership Terms • Luxury Policy</Text>
            </View>
          </Animated.View>
        </SafeAreaView>
        </ScrollView>
      </KeyboardAvoidingView>

      <PremiumPressable onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)')} style={styles.backBtn}>
        <ChevronLeft size={24} color="#FFF" />
      </PremiumPressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: height,
    backgroundColor: LuxuryColors.background,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heroOverlay: {
    paddingHorizontal: 20,
    paddingTop: height * 0.05,
    marginBottom: 20,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: LuxuryRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  brandBadgeText: {
    ...LuxuryTypography.tiny,
    color: '#FFF',
    letterSpacing: 1.5,
  },
  heroTitle: {
    ...LuxuryTypography.titleXL,
    color: '#FFF',
    marginBottom: 8,
  },
  heroSubtitle: {
    ...LuxuryTypography.body,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 22,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formWrapper: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: 'center',
  },
  authCard: {
    padding: 30,
    gap: 12,
  },
  cardTitle: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
  },
  cardSubtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: LuxuryRadius.sm,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 8,
  },
  errorText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.danger,
    textAlign: 'center',
  },
  inputGap: {
    gap: 16,
    marginBottom: 12,
  },
  switchAuth: {
    marginTop: 10,
    alignItems: 'center',
  },
  switchAuthText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : (StatusBar.currentHeight || 20) + 15,
    left: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(2, 6, 23, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)'
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    gap: 4,
  },
  footerText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    letterSpacing: 1,
  },
  footerSubText: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.2)',
  },
});

export default RegisterScreen;
