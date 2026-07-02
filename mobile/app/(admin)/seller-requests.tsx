import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View, StatusBar, TouchableOpacity } from 'react-native';
import { ChevronLeft, BadgeCheck, XCircle, CheckCircle2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { LuxuryColors, LuxurySpacing, LuxuryTypography, LuxuryRadius } from '@/constants/luxuryTheme';
import GlassCard from '@/components/GlassCard';
import { useAdminGuard } from '@/middleware/adminGuard';
import API from '@/services/api';

const SellerRequestsScreen = () => {
  const router = useRouter();
  useAdminGuard();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      const { data } = await API.get('/admin/seller-requests');
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      Alert.alert('Error', 'Unable to load seller requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadRequests(); }, []);

  const handleDecision = async (id: string, status: 'approved' | 'declined') => {
    try {
      await API.patch(`/admin/seller-requests/${id}/${status}`);
      Alert.alert('Success', `Seller request ${status}`);
      loadRequests();
    } catch (error: any) {
      Alert.alert('Error', error?.response?.data?.message || 'Unable to update request');
    }
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
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ChevronLeft size={24} color={LuxuryColors.accent} />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Seller Requests</Text>
            <Text style={styles.subtitle}>Approve or decline seller onboarding requests</Text>
          </View>
        </View>

        {requests.length === 0 ? (
          <GlassCard style={styles.emptyCard}>
            <BadgeCheck size={40} color={LuxuryColors.textMuted} />
            <Text style={styles.emptyText}>No seller requests found.</Text>
          </GlassCard>
        ) : requests.map((item) => (
          <GlassCard key={item._id} style={styles.requestCard}>
            <View style={styles.requestHeader}>
              <Text style={styles.userName}>{item.userId?.name || 'Unknown user'}</Text>
              <Text style={styles.status}>{(item.status || 'pending').toUpperCase()}</Text>
            </View>
            <Text style={styles.email}>{item.userId?.email || 'No email'}</Text>
            <Text style={styles.message}>{item.message || 'No message provided.'}</Text>
            <View style={styles.actions}>
              <TouchableOpacity style={styles.approveButton} onPress={() => handleDecision(item._id, 'approved')}>
                <CheckCircle2 size={18} color="#FFF" />
                <Text style={styles.buttonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.declineButton} onPress={() => handleDecision(item._id, 'declined')}>
                <XCircle size={18} color="#FFF" />
                <Text style={styles.buttonText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </GlassCard>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: LuxuryColors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: LuxuryColors.background },
  content: { padding: LuxurySpacing.screenPadding, paddingTop: 60, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, gap: 12 },
  backButton: { width: 40, height: 40, borderRadius: LuxuryRadius.md, backgroundColor: 'rgba(234, 179, 8, 0.1)', justifyContent: 'center', alignItems: 'center' },
  title: { ...LuxuryTypography.titleL, color: '#FFF' },
  subtitle: { ...LuxuryTypography.caption, color: 'rgba(255,255,255,0.6)', marginTop: 4 },
  emptyCard: { padding: 24, alignItems: 'center', gap: 12 },
  emptyText: { color: LuxuryColors.textSecondary, fontSize: 14 },
  requestCard: { padding: 16, gap: 10, marginBottom: 12 },
  requestHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  userName: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  status: { color: LuxuryColors.accent, fontSize: 12, fontWeight: '700' },
  email: { color: LuxuryColors.textSecondary, fontSize: 12 },
  message: { color: LuxuryColors.textSecondary, fontSize: 13 },
  actions: { flexDirection: 'row', gap: 12, marginTop: 6 },
  approveButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: LuxuryColors.success, paddingHorizontal: 12, paddingVertical: 8, borderRadius: LuxuryRadius.sm },
  declineButton: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: LuxuryColors.danger, paddingHorizontal: 12, paddingVertical: 8, borderRadius: LuxuryRadius.sm },
  buttonText: { color: '#FFF', fontSize: 13, fontWeight: '700' }
});

export default SellerRequestsScreen;
