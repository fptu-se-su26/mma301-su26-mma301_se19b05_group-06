import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Mail, Info } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LuxuryColors, LuxurySpacing, LuxuryTypography, LuxuryRadius } from '@/constants/luxuryTheme';
import { PremiumPressable } from '@/components/PremiumPressable';
import LuxuryInput from '@/components/LuxuryInput';
import LuxuryButton from '@/components/LuxuryButton';
import GlassCard from '@/components/GlassCard';
import { forgotPasswordAPI } from '@/services/api';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const { data } = await forgotPasswordAPI(email);
      // In this demo, we get the code directly for convenience
      Alert.alert(
        "Reset Code Sent",
        `A 6-digit code has been sent to your email. (Demo Code: ${data.resetCode})`,
        [
          { 
            text: "Continue", 
            onPress: () => router.push({
              pathname: '/reset-password' as any,
              params: { email }
            })
          }
        ]
      );
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <PremiumPressable onPress={() => router.back()} style={styles.backBtn}>
          <ChevronLeft size={24} color="#FFF" />
        </PremiumPressable>
      </View>

      <View style={styles.content}>
        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your email address and we'll send you a 6-digit code to reset your password.</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.form}>
          <LuxuryInput
            label="Email Address"
            placeholder="name@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon={<Mail size={20} color={LuxuryColors.textMuted} />}
          />

          <View style={styles.infoBox}>
            <Info size={16} color={LuxuryColors.accent} />
            <Text style={styles.infoText}>We will send a security code to verify your identity.</Text>
          </View>

          <LuxuryButton
            title={loading ? "SENDING..." : "RESET PASSWORD"}
            onPress={handleSubmit}
            loading={loading}
            style={styles.actionBtn}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  title: {
    ...LuxuryTypography.titleXL,
    color: '#FFF',
    marginBottom: 12,
  },
  subtitle: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textSecondary,
    lineHeight: 24,
    marginBottom: 40,
  },
  form: {
    gap: 24,
  },
  infoBox: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
    padding: 16,
    borderRadius: LuxuryRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.1)',
  },
  infoText: {
    flex: 1,
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    lineHeight: 18,
  },
  actionBtn: {
    marginTop: 8,
  },
});

export default ForgotPasswordScreen;
