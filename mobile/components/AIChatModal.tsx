import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  Pressable,
} from 'react-native';
import { Send, X, ExternalLink } from 'lucide-react-native';
import { useRouter } from 'expo-router';

import { LuxuryColors, LuxuryTypography } from '@/constants/luxuryTheme';
import { PremiumPressable } from '@/components/PremiumPressable';
import { chatAIAPI } from '@/services/api';

export interface SuggestedCar {
  id?: string;
  carName: string;
  image: string;
  price: number;
  rating: number;
  location: string;
  reason: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedCars?: SuggestedCar[];
  timestamp: Date;
}

interface AIChatModalProps {
  visible: boolean;
  onClose: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.62;

const AIChatModal: React.FC<AIChatModalProps> = ({ visible, onClose }) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Xin chào! Tôi là Trợ lý Elite của bạn. Tôi có thể giúp bạn tìm xe hoàn hảo, tư vấn giá cả hoặc giải đáp bất kỳ thắc mắc nào về dịch vụ của chúng tôi. Bạn cần tôi hỗ trợ gì hôm nay? 🚘',
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSend = async () => {
    if (!inputText.trim() || loading) return;
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText('');
    setLoading(true);
    try {
      const chatHistory = messages.map(msg => ({ 
        role: msg.role, 
        content: msg.content,
        suggestedCars: msg.suggestedCars 
      }));
      
      const { data } = await chatAIAPI(currentInput, chatHistory);

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.replyText || 'Xin lỗi, tôi không thể xử lý yêu cầu lúc này.',
        suggestedCars: data.suggestedCars || [],
        timestamp: new Date(),
      }]);
    } catch (e: any) {
      console.error('AI error:', e?.message || e);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Xin lỗi, đang có sự cố kỹ thuật. Vui lòng thử lại sau.',
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 150);
    }
  }, [messages, visible]);

  return (
    <Modal transparent visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          {/* DRAG HANDLE */}
          <View style={styles.dragHandle} />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.robotAvatar}>
                <Image
                  source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4712/4712035.png' }}
                  style={styles.robotImg}
                />
                <View style={styles.onlineBadge} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Elite Concierge</Text>
                <Text style={styles.headerStatus}>● Always ready to assist</Text>
              </View>
            </View>
            <PremiumPressable onPress={onClose} style={styles.closeBtn}>
              <X size={18} color="rgba(255,255,255,0.5)" />
            </PremiumPressable>
          </View>

          {/* MESSAGES */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.chatArea}
            contentContainerStyle={styles.chatContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[
                  styles.messageWrapper,
                  msg.role === 'user' ? styles.userWrapper : styles.assistantWrapper,
                  msg.suggestedCars && msg.suggestedCars.length > 0 ? { maxWidth: '100%' } : null
                ]}
              >
                <View style={[
                  styles.messageBubble,
                  msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
                ]}>
                  <Text style={[
                    styles.messageText,
                    msg.role === 'user' ? styles.userText : styles.assistantText,
                  ]}>
                    {msg.content}
                  </Text>
                </View>

                  {msg.suggestedCars && msg.suggestedCars.length > 0 && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false} 
                    style={styles.carCarousel} 
                    contentContainerStyle={styles.carCarouselContent}
                    keyboardShouldPersistTaps="handled"
                  >
                    {msg.suggestedCars.map((car, idx) => (
                      <View key={idx} style={styles.carCard}>
                        <Image source={{ uri: car.image }} style={styles.carImage} resizeMode="cover" />
                        <View style={styles.carInfo}>
                          <Text style={styles.carName} numberOfLines={1}>{car.carName}</Text>
                          <Text style={styles.carPrice}>{Number(car.price).toLocaleString()} VNĐ/ngày</Text>
                          <Text style={styles.carReason} numberOfLines={2}>{car.reason}</Text>
                          {car.id && (
                            <Pressable
                              onPress={() => {
                                onClose();
                                setTimeout(() => {
                                  router.push({ pathname: '/car/[id]', params: { id: car.id! } });
                                }, 300);
                              }}
                              style={styles.detailBtn}
                            >
                              <ExternalLink size={12} color={LuxuryColors.background} />
                              <Text style={styles.detailBtnText}>Xem chi tiết</Text>
                            </Pressable>
                          )}
                        </View>
                      </View>
                    ))}
                  </ScrollView>
                )}
              </View>
            ))}
            {loading && (
              <View style={styles.loadingBubble}>
                <ActivityIndicator size="small" color={LuxuryColors.accent} />
              </View>
            )}
          </ScrollView>

          {/* INPUT */}
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          >
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Ask about our fleet..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={300}
                returnKeyType="send"
                onSubmitEditing={handleSend}
              />
              <PremiumPressable
                onPress={handleSend}
                disabled={!inputText.trim() || loading}
                style={[styles.sendBtn, !inputText.trim() && { opacity: 0.45 }]}
              >
                <Send size={16} color={LuxuryColors.background} />
              </PremiumPressable>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: MODAL_HEIGHT,
    backgroundColor: '#0d1a2d',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderBottomWidth: 0,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  robotAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  robotImg: {
    width: 28,
    height: 28,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#0d1a2d',
  },
  headerTitle: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 15,
  },
  headerStatus: {
    ...LuxuryTypography.tiny,
    color: '#10B981',
    fontSize: 10,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatArea: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    gap: 10,
  },
  messageWrapper: {
    maxWidth: '82%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
  },
  assistantWrapper: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    padding: 10,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: LuxuryColors.accent,
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: LuxuryColors.background,
    fontWeight: '600',
  },
  assistantText: {
    color: '#EEE',
  },
  loadingBubble: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 28 : 14,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(0,0,0,0.25)',
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    maxHeight: 80,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: LuxuryColors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  carCarousel: {
    marginTop: 10,
  },
  carCarouselContent: {
    gap: 12,
    paddingRight: 20,
  },
  carCard: {
    width: 220,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  carImage: {
    width: '100%',
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  carInfo: {
    padding: 12,
  },
  carName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
    fontSize: 14,
    marginBottom: 4,
  },
  carPrice: {
    ...LuxuryTypography.body,
    fontWeight: '500',
    color: LuxuryColors.accent,
    fontSize: 13,
    marginBottom: 8,
  },
  carReason: {
    ...LuxuryTypography.tiny,
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    lineHeight: 16,
  },
  detailBtn: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  detailBtnText: {
    color: '#0a0a0a',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default AIChatModal;
