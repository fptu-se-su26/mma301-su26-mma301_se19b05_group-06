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
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Lock, Key } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { LuxuryColors, LuxurySpacing, LuxuryTypography, LuxuryRadius } from '@/constants/luxuryTheme';
import { PremiumPressable } from '@/components/PremiumPressable';
import LuxuryInput from '@/components/LuxuryInput';
import LuxuryButton from '@/components/LuxuryButton';
import { resetPasswordAPI } from '@/services/api';

const ResetPasswordScreen = () => {
  const router = useRouter();
  const { email } = useLocalSearchParams();
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!code || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPasswordAPI({ 
        email: email as string, 
        code, 
        newPassword: password 
      });
      
      Alert.alert(
        "Success", 
        "Your password has been reset successfully. Please log in with your new password.",
        [{ text: "Log In", onPress: () => router.push('/login') }]
      );
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.message || "Failed to reset password");
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
        <View style={styles.titleArea}>
          <Text style={styles.title}>Secure Reset</Text>
          <Text style={styles.subtitle}>Resetting password for: <Text style={{ color: '#FFF' }}>{email}</Text></Text>
        </View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.form}>
          <LuxuryInput
            label="Security Code"
            placeholder="6-digit code"
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            maxLength={6}
            leftIcon={<Key size={20} color={LuxuryColors.textMuted} />}
          />

          <LuxuryInput
            label="New Password"
            placeholder="Min 8 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={LuxuryColors.textMuted} />}
          />

          <LuxuryInput
            label="Confirm Password"
            placeholder="Re-type password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            leftIcon={<Lock size={20} color={LuxuryColors.textMuted} />}
          />

          <LuxuryButton
            title={loading ? "RESETTING..." : "CONFIRM NEW PASSWORD"}
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
  titleArea: {
    marginBottom: 40,
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
  },
  form: {
    gap: 20,
  },
  actionBtn: {
    marginTop: 12,
  },
});

export default ResetPasswordScreen;
