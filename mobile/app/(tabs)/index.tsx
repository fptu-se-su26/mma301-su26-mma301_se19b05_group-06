import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  SafeAreaView,
  TextInput,
  StatusBar,
  FlatList,
  Platform,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Bell, Sparkles, SlidersHorizontal, Trophy, Crown, Flame } from 'lucide-react-native';
import {
  LuxuryColors,
  LuxurySpacing,
  LuxuryTypography,
  LuxuryRadius,
} from '@/constants/luxuryTheme';
import { getStoredUser, StoredUser } from '@/services/storage';
import { getCarsAPI } from '@/services/api';
import CarCard from '@/components/CarCard';
import GlassCard from '@/components/GlassCard';
import { PremiumPressable } from '@/components/PremiumPressable';
import FloatingAIButton from '@/components/FloatingAIButton';

const CATEGORIES = ['All', 'Hypercar', 'Supercar', 'SUV', 'Luxury Sedan', 'Electric'];

const MOCK_CARS = [
  {
    _id: '1',
    brand: 'Rolls-Royce',
    model: 'Phantom VIII',
    imageUrl: 'https://images.unsplash.com/photo-1632245889029-e406faaa34cd?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 15000000,
    rating: 5.0,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    type: 'Hypercar',
    location: 'Hanoi Premium Hub',
  },
  {
    _id: '2',
    brand: 'Porsche',
    model: '911 GT3 RS',
    imageUrl: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 8500000,
    rating: 4.9,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    type: 'Supercar',
    location: 'Saigon Elite Hub',
  },
  {
    _id: '3',
    brand: 'Lamborghini',
    model: 'Aventador SVJ',
    imageUrl: 'https://images.unsplash.com/photo-1621135802920-133df287f89c?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 18000000,
    rating: 5.0,
    seats: 2,
    transmission: 'Automatic',
    fuelType: 'Petrol',
    type: 'Supercar',
    location: 'Danang Luxury Hub',
  },
  {
    _id: '4',
    brand: 'Bentley',
    model: 'Continental GT',
    imageUrl: 'https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?q=80&w=600&auto=format&fit=crop',
    pricePerDay: 11000000,
    rating: 4.9,
    seats: 4,
    transmission: 'Automatic',
    fuelType: 'Hybrid',
    type: 'Luxury Sedan',
    location: 'Hanoi Premium Hub',
  },
];

export default function ShowroomScreen() {
  const router = useRouter();
  const [user, setUser] = useState<StoredUser | null>(null);
  const [cars, setCars] = useState<any[]>(MOCK_CARS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await getStoredUser();
      setUser(storedUser);
    };

    const fetchCars = async () => {
      setLoading(true);
      try {
        const response = await getCarsAPI();
        if (response?.data && Array.isArray(response.data)) {
          setCars(response.data.length > 0 ? response.data : MOCK_CARS);
        }
      } catch (error) {
        console.warn('Backend API offline or error, falling back to mock cars data.');
        setCars(MOCK_CARS);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
    fetchCars();
  }, []);

  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      car.type?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" translucent />
      
      {/* HEADER SECTION */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>WELCOME CLIENT</Text>
          <Text style={styles.userName}>{user?.name || user?.email?.split('@')[0] || 'Exclusive Guest'}</Text>
        </View>
        <PremiumPressable style={styles.notificationBtn}>
          <Bell size={20} color="#FFF" />
          <View style={styles.badgeDot} />
        </PremiumPressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* BANNER PROMOTION */}
        <AnimatedBanner />

        {/* SEARCH AND FILTER BAR */}
        <View style={styles.searchContainer}>
          <GlassCard style={styles.searchBar}>
            <Search size={18} color={LuxuryColors.textSecondary} />
            <TextInput
              placeholder="Search premium fleet..."
              placeholderTextColor={LuxuryColors.textSecondary}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <PremiumPressable style={styles.filterBtn}>
              <SlidersHorizontal size={18} color={LuxuryColors.accent} />
            </PremiumPressable>
          </GlassCard>
        </View>

        {/* CATEGORY FILTER */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
            {CATEGORIES.map((category) => (
              <PremiumPressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={[
                  styles.categoryPill,
                  selectedCategory === category && styles.categoryPillActive,
                ]}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category && styles.categoryTextActive,
                  ]}
                >
                  {category}
                </Text>
              </PremiumPressable>
            ))}
          </ScrollView>
        </View>

        {/* SHOWROOM COLLECTION */}
        <View style={styles.showroomHeader}>
          <View style={styles.sectionTitleRow}>
            <Crown size={16} color={LuxuryColors.accent} />
            <Text style={styles.showroomTitle}>EXQUISITE FLEET</Text>
          </View>
          <Text style={styles.showroomSubtitle}>Selected for your taste</Text>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={LuxuryColors.accent} style={{ marginTop: 40 }} />
        ) : filteredCars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No premium models match your criteria</Text>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {filteredCars.map((car) => (
              <CarCard
                key={car._id}
                car={car}
                onPress={() => router.push(`/car/${car._id}` as any)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FLOATING AI ASSISTANT BUTTON */}
      <FloatingAIButton />
    </SafeAreaView>
  );
}

function AnimatedBanner() {
  return (
    <GlassCard style={styles.banner}>
      <View style={styles.bannerLeft}>
        <View style={styles.bannerBadge}>
          <Flame size={12} color={LuxuryColors.accent} />
          <Text style={styles.bannerBadgeText}>ELITE OFFER</Text>
        </View>
        <Text style={styles.bannerTitle}>Summer Grand Tour</Text>
        <Text style={styles.bannerSubtitle}>Get 15% off hypercars reservations this week.</Text>
        <PremiumPressable style={styles.bannerBtn}>
          <Text style={styles.bannerBtnText}>UNVEIL PASS</Text>
        </PremiumPressable>
      </View>
      <View style={styles.bannerRight}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?q=80&w=400&auto=format&fit=crop' }}
          style={styles.bannerImg}
        />
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: LuxuryColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: LuxurySpacing.screenPadding,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 40 : 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  welcomeText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 9,
    letterSpacing: 2,
  },
  userName: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  notificationBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: LuxuryColors.accent,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  banner: {
    marginHorizontal: LuxurySpacing.screenPadding,
    marginTop: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: LuxuryRadius.lg,
    overflow: 'hidden',
  },
  bannerLeft: {
    flex: 1,
    marginRight: 10,
    gap: 8,
  },
  bannerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(234, 179, 8, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  bannerBadgeText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 8,
    fontWeight: 'bold',
  },
  bannerTitle: {
    ...LuxuryTypography.titleM,
    color: '#FFF',
    fontSize: 18,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: LuxuryColors.textSecondary,
    lineHeight: 16,
  },
  bannerBtn: {
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  bannerBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 8,
    fontWeight: '900',
  },
  bannerRight: {
    width: 100,
    height: 100,
    borderRadius: LuxuryRadius.md,
    overflow: 'hidden',
  },
  bannerImg: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    marginTop: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: LuxuryRadius.md,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
    height: '100%',
  },
  filterBtn: {
    padding: 4,
  },
  categoriesContainer: {
    marginTop: 16,
  },
  categoriesScroll: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    gap: 10,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: LuxuryRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  categoryPillActive: {
    borderColor: LuxuryColors.accent,
    backgroundColor: 'rgba(234, 179, 8, 0.1)',
  },
  categoryText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textSecondary,
    fontSize: 9,
  },
  categoryTextActive: {
    color: LuxuryColors.accent,
    fontWeight: 'bold',
  },
  showroomHeader: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    marginTop: 28,
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  showroomTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 12,
    letterSpacing: 2,
  },
  showroomSubtitle: {
    ...LuxuryTypography.body,
    fontSize: 14,
    color: LuxuryColors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: LuxurySpacing.screenPadding,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    color: LuxuryColors.textSecondary,
    fontSize: 14,
  },
});
