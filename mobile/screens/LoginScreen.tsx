import { useState } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { ChevronLeft, Mail, Lock, ShieldCheck } from 'lucide-react-native';

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
import { loginAPI } from '@/services/api';
import { storeUser } from '@/services/storage';

const { height } = Dimensions.get('window');

const LoginScreen = () => {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const player = useVideoPlayer('https://assets.mixkit.co/videos/52427/52427-720.mp4', (player) => {
    player.loop = true;
    player.muted = true;
    player.play();
  });

  const handleSubmit = async () => {
    if (!form.email.trim() || !form.password.trim()) {
      setErrorMessage('Please enter both email and passcode');
      return;
    }
    console.log('Login attempt with:', form.email);
    setLoading(true);
    setErrorMessage('');
    try {
      console.log('Calling loginAPI...');
      const { data } = await loginAPI(form);
      console.log('Login success:', data.email, 'Role:', data.role);
      await storeUser(data);
      if (data.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      console.error('Login error detail:', error);
      console.error('Response data:', error.response?.data);
      setErrorMessage(error.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      {/* FULL SCREEN VIDEO HERO BACKGROUND */}
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
              <ShieldCheck size={14} color={LuxuryColors.accent} />
              <Text style={styles.brandBadgeText}>SECURE ACCESS</Text>
            </View>
            <Text style={styles.heroTitle}>Elite Entry</Text>
            <Text style={styles.heroSubtitle}>
              Unlock the doors to the world's most{"\n"}exclusive automotive collections.
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.formWrapper}>
            <GlassCard style={styles.authCard}>
              <Text style={styles.cardTitle}>Welcome Back</Text>
              <Text style={styles.cardSubtitle}>Sign in to your private showroom</Text>

              {errorMessage ? (
                <Animated.View entering={FadeIn} style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMessage}</Text>
                </Animated.View>
              ) : null}

              <View style={styles.inputGap}>
                <LuxuryInput
                  label="CLIENT EMAIL"
                  value={form.email}
                  onChangeText={(v) => setForm((p) => ({ ...p, email: v }))}
                  placeholder="you@exclusive.com"
                  autoCapitalize="none"
                />
                <LuxuryInput
                  label="PASSCODE"
                  value={form.password}
                  onChangeText={(v) => setForm((p) => ({ ...p, password: v }))}
                  placeholder="••••••••"
                  secureTextEntry
                />
                <PremiumPressable 
                  onPress={() => router.push('/forgot-password' as any)} 
                  style={styles.forgotPassBtn}
                >
                  <Text style={styles.forgotPassText}>Forgot Passcode?</Text>
                </PremiumPressable>
              </View>

              <LuxuryButton 
                title={loading ? 'VERIFYING...' : 'LOGIN TO FLEET'} 
                onPress={handleSubmit} 
                disabled={loading}
              />

              <PremiumPressable onPress={() => router.push('/register')} style={styles.switchAuth}>
                <Text style={styles.switchAuthText}>
                  No account? <Text style={{ color: LuxuryColors.accent }}>Request Invitation</Text>
                </Text>
              </PremiumPressable>
            </GlassCard>
            
            <View style={styles.footer}>
              <Text style={styles.footerText}>© 2024 LUXERIDE PRIVATE LIMITED</Text>
              <Text style={styles.footerSubText}>Terms of Excellence • Privacy Policy</Text>
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
    paddingTop: height * 0.08,
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
    marginTop: 40,
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
  forgotPassBtn: {
    alignSelf: 'flex-end',
    paddingVertical: 4,
  },
  forgotPassText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontWeight: '700',
  },
});

export default LoginScreen;
