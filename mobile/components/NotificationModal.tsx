import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Modal,
  ActivityIndicator,
  Pressable,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { X, Bell, CheckCheck, Info } from 'lucide-react-native';
import { BlurView } from 'expo-blur';

import { LuxuryColors } from '@/constants/luxuryTheme';
import { PremiumPressable } from './PremiumPressable';
import GlassCard from './GlassCard';
import {
  getNotificationsAPI,
  markNotificationReadAPI,
  markAllNotificationsReadAPI,
} from '@/services/api';

interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationModalProps {
  visible: boolean;
  onClose: () => void;
  onRefreshBadge?: () => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.7;

const NotificationModal: React.FC<NotificationModalProps> = ({
  visible,
  onClose,
  onRefreshBadge,
}) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data } = await getNotificationsAPI();
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible]);

  const handleMarkRead = async (id: string, currentlyRead: boolean) => {
    if (currentlyRead || actionLoading) return;
    setActionLoading(true);
    try {
      await markNotificationReadAPI(id);
      setNotifications((prev) =>
        prev.map((item) => (item._id === id ? { ...item, isRead: true } : item))
      );
      if (onRefreshBadge) onRefreshBadge();
    } catch (error) {
      console.error('Error marking notification read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    if (actionLoading || notifications.every((n) => n.isRead)) return;
    setActionLoading(true);
    try {
      await markAllNotificationsReadAPI();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      if (onRefreshBadge) onRefreshBadge();
    } catch (error) {
      console.error('Error marking all read:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.sheet}>
          <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

          {/* DRAG HANDLE */}
          <View style={styles.dragHandle} />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.bellIconBox}>
                <Bell size={18} color={LuxuryColors.accent} />
              </View>
              <Text style={styles.headerTitle}>Notification Center</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              {notifications.some((n) => !n.isRead) && (
                <TouchableOpacity
                  onPress={handleMarkAllRead}
                  disabled={actionLoading}
                  style={styles.markAllBtn}
                  activeOpacity={0.7}
                >
                  <CheckCheck size={16} color={LuxuryColors.accent} />
                  <Text style={styles.markAllText}>Mark all read</Text>
                </TouchableOpacity>
              )}
              <PremiumPressable onPress={onClose} style={styles.closeBtn}>
                <X size={18} color="rgba(255,255,255,0.6)" />
              </PremiumPressable>
            </View>
          </View>

          {/* CONTENT */}
          {loading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color={LuxuryColors.accent} />
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.centerContainer}>
              <Bell size={48} color="rgba(255,255,255,0.15)" style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>You have no new notifications</Text>
            </View>
          ) : (
            <ScrollView
              style={styles.listArea}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            >
              {notifications.map((item) => (
                <TouchableOpacity
                  key={item._id}
                  activeOpacity={item.isRead ? 1 : 0.7}
                  onPress={() => handleMarkRead(item._id, item.isRead)}
                >
                  <GlassCard
                    style={[
                      styles.notificationCard,
                      !item.isRead && styles.unreadCard,
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Info size={14} color={item.isRead ? LuxuryColors.textMuted : LuxuryColors.accent} />
                        <Text
                          style={[
                            styles.cardTitle,
                            !item.isRead && styles.unreadTitle,
                          ]}
                        >
                          {item.title}
                        </Text>
                      </View>
                      {!item.isRead && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.cardMessage}>{item.message}</Text>
                    <Text style={styles.cardDate}>
                      {new Date(item.createdAt).toLocaleString('en-US')}
                    </Text>
                  </GlassCard>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    height: MODAL_HEIGHT,
    backgroundColor: '#0a1220',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bellIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(212,175,55,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  markAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: 'rgba(212,175,55,0.1)',
  },
  markAllText: {
    fontSize: 12,
    color: LuxuryColors.accent,
    fontWeight: '600',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyText: {
    color: LuxuryColors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  listArea: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    gap: 12,
  },
  notificationCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  unreadCard: {
    borderColor: 'rgba(212,175,55,0.25)',
    backgroundColor: 'rgba(212,175,55,0.04)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: LuxuryColors.textSecondary,
  },
  unreadTitle: {
    color: '#FFF',
    fontWeight: 'bold',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LuxuryColors.accent,
  },
  cardMessage: {
    fontSize: 13,
    color: LuxuryColors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 11,
    color: LuxuryColors.textMuted,
  },
});

export default NotificationModal;
