import React from 'react';
import { Modal, StyleSheet, Text, View, Dimensions, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react-native';
import { LuxuryColors, LuxuryRadius, LuxuryTypography } from '@/constants/luxuryTheme';
import { PremiumPressable } from './PremiumPressable';
import GlassCard from './GlassCard';

const { width } = Dimensions.get('window');

interface LuxuryModalProps {
  visible: boolean;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

const LuxuryModal = ({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'OK',
  cancelText,
  onConfirm,
  onCancel,
}: LuxuryModalProps) => {
  const Icon = () => {
    switch (type) {
      case 'success': return <CheckCircle2 size={40} color={LuxuryColors.success} />;
      case 'error': return <XCircle size={40} color={LuxuryColors.danger} />;
      case 'warning': return <AlertTriangle size={40} color={LuxuryColors.accent} />;
      default: return <Info size={40} color={LuxuryColors.accent} />;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onConfirm}
    >
      <View style={styles.overlay}>
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
        
        <GlassCard style={styles.modalCard}>
          <View style={styles.iconContainer}>
            <Icon />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          
          <View style={styles.footer}>
            {cancelText && (
              <PremiumPressable 
                onPress={onCancel} 
                style={[styles.button, styles.cancelButton]}
              >
                <Text style={styles.cancelButtonText}>{cancelText}</Text>
              </PremiumPressable>
            )}
            
            <PremiumPressable 
              onPress={onConfirm} 
              style={[
                styles.button, 
                styles.confirmButton,
                !cancelText && { width: '100%' }
              ]}
            >
              <Text style={styles.confirmButtonText}>{confirmText}</Text>
            </PremiumPressable>
          </View>
        </GlassCard>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: Math.min(width * 0.9, 400),
    padding: 30,
    alignItems: 'center',
    borderRadius: LuxuryRadius.xl,
  },
  iconContainer: {
    marginBottom: 20,
  },
  title: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...LuxuryTypography.body,
    color: LuxuryColors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: LuxuryRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  confirmButton: {
    backgroundColor: LuxuryColors.accent,
  },
  cancelButtonText: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
  },
  confirmButtonText: {
    ...LuxuryTypography.bodySemibold,
    color: LuxuryColors.background,
  },
});

export default LuxuryModal;
