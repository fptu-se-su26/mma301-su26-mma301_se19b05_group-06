import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import Animated, { FadeInRight, Layout } from 'react-native-reanimated';
import { User, Mail, Shield, Lock, Unlock, Trash2, ChevronRight, UserCheck } from 'lucide-react-native';

import { 
  LuxuryColors, 
  LuxurySpacing, 
  LuxuryTypography, 
  LuxuryRadius 
} from '@/constants/luxuryTheme';
import { getUsersAPI, toggleUserStatusAPI, deleteUserAPI } from '@/services/api';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';

const AdminUsersScreen = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const { data } = await getUsersAPI();
      setUsers(data);
    } catch (error) {
      console.error('Users load error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleToggle = async (id: string) => {
    try {
      await toggleUserStatusAPI(id);
      loadUsers();
    } catch (error) {
      Alert.alert('System Error', 'Could not modify client access privileges.');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    Alert.alert('Revoke Membership', `Are you certain you wish to permanently remove ${name} from the elite network?`, [
      { text: 'Retain', style: 'cancel' },
      { text: 'Revoke', style: 'destructive', onPress: async () => {
        try {
          await deleteUserAPI(id);
          loadUsers();
        } catch (error) {
          Alert.alert('Error', 'Revocation process failed.');
        }
      } }
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={LuxuryColors.accent} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Client Registry</Text>
          <Text style={styles.subtitle}>Manage global membership and access control</Text>
        </View>
        
        <View style={styles.list}>
          {users.map((u, idx) => (
            <Animated.View 
              key={u._id} 
              entering={FadeInRight.delay(idx * 80).duration(500).springify()}
              layout={Layout.springify()}
            >
              <GlassCard style={styles.userCard}>
                <View style={styles.cardMain}>
                  <View style={styles.avatarContainer}>
                    <User size={24} color={LuxuryColors.accent} />
                  </View>
                  <View style={styles.userInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.userName}>{u.name}</Text>
                      <View style={styles.roleBadge}>
                        <Shield size={10} color={LuxuryColors.accent} />
                        <Text style={styles.roleText}>{u.role}</Text>
                      </View>
                    </View>
                    <View style={styles.contactRow}>
                      <Mail size={12} color={LuxuryColors.textMuted} />
                      <Text style={styles.userEmail}>{u.email}</Text>
                    </View>
                    <View style={styles.statusRow}>
                      <View style={[styles.statusDot, { backgroundColor: u.status === 'Active' ? LuxuryColors.success : LuxuryColors.danger }]} />
                      <Text style={[styles.statusText, { color: u.status === 'Active' ? LuxuryColors.success : LuxuryColors.danger }]}>
                        {u.status === 'Active' ? 'AUTHORIZED' : 'LOCKED'}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.cardActions}>
                  <PremiumPressable 
                    onPress={() => handleToggle(u._id)} 
                    style={[styles.actionBtn, styles.toggleBtn]}
                  >
                    {u.status === 'Active' ? <Lock size={18} color="#FFF" /> : <Unlock size={18} color={LuxuryColors.accent} />}
                  </PremiumPressable>
                  <PremiumPressable 
                    onPress={() => handleDelete(u._id, u.name)} 
                    style={[styles.actionBtn, styles.deleteBtn]}
                  >
                    <Trash2 size={18} color={LuxuryColors.danger} />
                  </PremiumPressable>
                </View>
              </GlassCard>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: LuxuryColors.background,
  },
  content: {
    padding: LuxurySpacing.screenPadding,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    ...LuxuryTypography.titleL,
    color: '#FFF',
  },
  subtitle: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textMuted,
    marginTop: 4,
  },
  list: {
    gap: 16,
  },
  userCard: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  userInfo: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    ...LuxuryTypography.bodySemibold,
    color: '#FFF',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleText: {
    fontSize: 9,
    fontWeight: '800',
    color: LuxuryColors.accent,
    textTransform: 'uppercase',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userEmail: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 13,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  toggleBtn: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.1)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
});

export default AdminUsersScreen;
