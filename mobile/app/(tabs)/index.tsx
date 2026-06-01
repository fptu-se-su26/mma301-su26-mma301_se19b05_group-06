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
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { Search, Bell, Sparkles, SlidersHorizontal, Trophy, Crown, Flame, X, RotateCcw, MapPin, ArrowUpDown, Check } from 'lucide-react-native';
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
  
  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Advanced filters states
  const [filterLocation, setFilterLocation] = useState('All');
  const [filterPriceRange, setFilterPriceRange] = useState('All');
  const [filterTransmission, setFilterTransmission] = useState('All');
  const [filterFuelType, setFilterFuelType] = useState('All');
  const [filterSeats, setFilterSeats] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  
  // Modal visibility
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  
  // Temporary states for interaction within the filter modal
  const [tempLocation, setTempLocation] = useState('All');
  const [tempPriceRange, setTempPriceRange] = useState('All');
  const [tempTransmission, setTempTransmission] = useState('All');
  const [tempFuelType, setTempFuelType] = useState('All');
  const [tempSeats, setTempSeats] = useState('All');
  const [tempSortBy, setTempSortBy] = useState('rating');

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

  const openFilterModal = () => {
    setTempLocation(filterLocation);
    setTempPriceRange(filterPriceRange);
    setTempTransmission(filterTransmission);
    setTempFuelType(filterFuelType);
    setTempSeats(filterSeats);
    setTempSortBy(sortBy);
    setIsFilterModalVisible(true);
  };

  const applyFilters = () => {
    setFilterLocation(tempLocation);
    setFilterPriceRange(tempPriceRange);
    setFilterTransmission(tempTransmission);
    setFilterFuelType(tempFuelType);
    setFilterSeats(tempSeats);
    setSortBy(tempSortBy);
    setIsFilterModalVisible(false);
  };

  const resetTempFilters = () => {
    setTempLocation('All');
    setTempPriceRange('All');
    setTempTransmission('All');
    setTempFuelType('All');
    setTempSeats('All');
    setTempSortBy('rating');
  };

  const clearAllFilters = () => {
    setFilterLocation('All');
    setFilterPriceRange('All');
    setFilterTransmission('All');
    setFilterFuelType('All');
    setFilterSeats('All');
    setSortBy('rating');
    setSearchQuery('');
    setSelectedCategory('All');
  };

  // Helper to remove a single active filter
  const removeFilter = (filterKey: string) => {
    if (filterKey === 'location') setFilterLocation('All');
    else if (filterKey === 'price') setFilterPriceRange('All');
    else if (filterKey === 'transmission') setFilterTransmission('All');
    else if (filterKey === 'fuelType') setFilterFuelType('All');
    else if (filterKey === 'seats') setFilterSeats('All');
    else if (filterKey === 'sortBy') setSortBy('rating');
  };

  // Calculate live count of matching items based on temp filters inside the modal
  const getMatchingCount = (
    loc: string,
    price: string,
    trans: string,
    fuel: string,
    seats: string
  ) => {
    return cars.filter((car) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (car.location && car.location.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        selectedCategory === 'All' ||
        car.type?.toLowerCase() === selectedCategory.toLowerCase();

      const matchesLocation =
        loc === 'All' ||
        (car.location && car.location.toLowerCase().includes(loc.toLowerCase()));

      let matchesPrice = true;
      if (price === 'under-10m') {
        matchesPrice = car.pricePerDay < 10000000;
      } else if (price === '10m-15m') {
        matchesPrice = car.pricePerDay >= 10000000 && car.pricePerDay <= 15000000;
      } else if (price === 'over-15m') {
        matchesPrice = car.pricePerDay > 15000000;
      }

      const matchesTransmission =
        trans === 'All' ||
        (car.transmission && car.transmission.toLowerCase() === trans.toLowerCase());

      const matchesFuelType =
        fuel === 'All' ||
        (car.fuelType && car.fuelType.toLowerCase() === fuel.toLowerCase());

      let matchesSeats = true;
      if (seats !== 'All') {
        const seatsCount = parseInt(seats, 10);
        if (seatsCount === 5) {
          matchesSeats = car.seats >= 5;
        } else {
          matchesSeats = car.seats === seatsCount;
        }
      }

      return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesTransmission && matchesFuelType && matchesSeats;
    }).length;
  };

  // Primary filtering logic
  const filteredCars = cars.filter((car) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      car.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (car.location && car.location.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory =
      selectedCategory === 'All' ||
      car.type?.toLowerCase() === selectedCategory.toLowerCase();

    const matchesLocation =
      filterLocation === 'All' ||
      (car.location && car.location.toLowerCase().includes(filterLocation.toLowerCase()));

    let matchesPrice = true;
    if (filterPriceRange === 'under-10m') {
      matchesPrice = car.pricePerDay < 10000000;
    } else if (filterPriceRange === '10m-15m') {
      matchesPrice = car.pricePerDay >= 10000000 && car.pricePerDay <= 15000000;
    } else if (filterPriceRange === 'over-15m') {
      matchesPrice = car.pricePerDay > 15000000;
    }

    const matchesTransmission =
      filterTransmission === 'All' ||
      (car.transmission && car.transmission.toLowerCase() === filterTransmission.toLowerCase());

    const matchesFuelType =
      filterFuelType === 'All' ||
      (car.fuelType && car.fuelType.toLowerCase() === filterFuelType.toLowerCase());

    let matchesSeats = true;
    if (filterSeats !== 'All') {
      const seatsCount = parseInt(filterSeats, 10);
      if (seatsCount === 5) {
        matchesSeats = car.seats >= 5;
      } else {
        matchesSeats = car.seats === seatsCount;
      }
    }

    return matchesSearch && matchesCategory && matchesLocation && matchesPrice && matchesTransmission && matchesFuelType && matchesSeats;
  });

  // Primary sorting logic
  const sortedAndFilteredCars = [...filteredCars].sort((a, b) => {
    if (sortBy === 'price-low-high') {
      return a.pricePerDay - b.pricePerDay;
    }
    if (sortBy === 'price-high-low') {
      return b.pricePerDay - a.pricePerDay;
    }
    // Default: rating high to low
    return (b.rating || 0) - (a.rating || 0);
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
              placeholder="Search by brand, model, location..."
              placeholderTextColor={LuxuryColors.textSecondary}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery !== '' && (
              <PremiumPressable onPress={() => setSearchQuery('')} style={styles.clearSearchBtn}>
                <X size={16} color={LuxuryColors.textSecondary} />
              </PremiumPressable>
            )}
            <PremiumPressable
              onPress={openFilterModal}
              style={[
                styles.filterBtn,
                (filterLocation !== 'All' ||
                  filterPriceRange !== 'All' ||
                  filterTransmission !== 'All' ||
                  filterFuelType !== 'All' ||
                  filterSeats !== 'All' ||
                  sortBy !== 'rating') &&
                  styles.filterBtnActive,
              ]}
            >
              <SlidersHorizontal
                size={18}
                color={
                  filterLocation !== 'All' ||
                  filterPriceRange !== 'All' ||
                  filterTransmission !== 'All' ||
                  filterFuelType !== 'All' ||
                  filterSeats !== 'All' ||
                  sortBy !== 'rating'
                    ? LuxuryColors.background
                    : LuxuryColors.accent
                }
              />
            </PremiumPressable>
          </GlassCard>
        </View>

        {/* ACTIVE ADVANCED FILTERS BAR */}
        {(filterLocation !== 'All' ||
          filterPriceRange !== 'All' ||
          filterTransmission !== 'All' ||
          filterFuelType !== 'All' ||
          filterSeats !== 'All' ||
          sortBy !== 'rating') && (
          <View style={styles.activeFiltersContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.activeFiltersScroll}>
              <Text style={styles.activeFiltersLabel}>Filters:</Text>
              
              {filterLocation !== 'All' && (
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText}>{filterLocation}</Text>
                  <PremiumPressable onPress={() => removeFilter('location')} style={styles.removePillBtn}>
                    <X size={10} color={LuxuryColors.accent} />
                  </PremiumPressable>
                </View>
              )}

              {filterPriceRange !== 'All' && (
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText}>
                    {filterPriceRange === 'under-10m'
                      ? '< 10M'
                      : filterPriceRange === '10m-15m'
                      ? '10M - 15M'
                      : '> 15M'}
                  </Text>
                  <PremiumPressable onPress={() => removeFilter('price')} style={styles.removePillBtn}>
                    <X size={10} color={LuxuryColors.accent} />
                  </PremiumPressable>
                </View>
              )}

              {filterTransmission !== 'All' && (
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText}>{filterTransmission}</Text>
                  <PremiumPressable onPress={() => removeFilter('transmission')} style={styles.removePillBtn}>
                    <X size={10} color={LuxuryColors.accent} />
                  </PremiumPressable>
                </View>
              )}

              {filterFuelType !== 'All' && (
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText}>{filterFuelType}</Text>
                  <PremiumPressable onPress={() => removeFilter('fuelType')} style={styles.removePillBtn}>
                    <X size={10} color={LuxuryColors.accent} />
                  </PremiumPressable>
                </View>
              )}

              {filterSeats !== 'All' && (
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText}>{filterSeats} Seats</Text>
                  <PremiumPressable onPress={() => removeFilter('seats')} style={styles.removePillBtn}>
                    <X size={10} color={LuxuryColors.accent} />
                  </PremiumPressable>
                </View>
              )}

              {sortBy !== 'rating' && (
                <View style={styles.filterPill}>
                  <Text style={styles.filterPillText}>
                    {sortBy === 'price-low-high' ? 'Price ↑' : 'Price ↓'}
                  </Text>
                  <PremiumPressable onPress={() => removeFilter('sortBy')} style={styles.removePillBtn}>
                    <X size={10} color={LuxuryColors.accent} />
                  </PremiumPressable>
                </View>
              )}

              <PremiumPressable onPress={clearAllFilters} style={styles.clearAllBtn}>
                <RotateCcw size={10} color={LuxuryColors.textSecondary} />
                <Text style={styles.clearAllBtnText}>Reset</Text>
              </PremiumPressable>
            </ScrollView>
          </View>
        )}

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
        ) : sortedAndFilteredCars.length === 0 ? (
          <View style={styles.emptyContainer}>
            <GlassCard style={styles.emptyCard}>
              <SlidersHorizontal size={40} color={LuxuryColors.accent} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>No premium models match your criteria</Text>
              <Text style={styles.emptySubtext}>Try adjusting or clearing your search filters</Text>
              <PremiumPressable onPress={clearAllFilters} style={styles.emptyResetBtn}>
                <Text style={styles.emptyResetBtnText}>RESET ALL FILTERS</Text>
              </PremiumPressable>
            </GlassCard>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {sortedAndFilteredCars.map((car) => (
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

      {/* ADVANCED FILTERS MODAL */}
      <Modal
        visible={isFilterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={25} tint="dark" style={StyleSheet.absoluteFill} />
          
          <GlassCard style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <SlidersHorizontal size={18} color={LuxuryColors.accent} />
                <Text style={styles.modalTitle}>ADVANCED SELECTION</Text>
              </View>
              <PremiumPressable onPress={() => setIsFilterModalVisible(false)} style={styles.modalCloseBtn}>
                <X size={20} color="#FFF" />
              </PremiumPressable>
            </View>

            {/* Scrollable Filters */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              
              {/* LOCATION */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>PRESENCE HUB</Text>
                <View style={styles.optionsGrid}>
                  {['All', 'Hanoi', 'Saigon', 'Danang'].map((loc) => (
                    <PremiumPressable
                      key={loc}
                      onPress={() => setTempLocation(loc)}
                      style={[
                        styles.optionPill,
                        tempLocation === loc && styles.optionPillActive,
                      ]}
                    >
                      {tempLocation === loc && <Check size={10} color={LuxuryColors.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.optionText, tempLocation === loc && styles.optionTextActive]}>
                        {loc === 'All' ? 'All Hubs' : loc}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

              {/* PRICE RANGE */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>DAILY BUDGET</Text>
                <View style={styles.optionsGrid}>
                  {[
                    { label: 'All budgets', value: 'All' },
                    { label: '< 10M VNĐ', value: 'under-10m' },
                    { label: '10M - 15M VNĐ', value: '10m-15m' },
                    { label: '> 15M VNĐ', value: 'over-15m' },
                  ].map((item) => (
                    <PremiumPressable
                      key={item.value}
                      onPress={() => setTempPriceRange(item.value)}
                      style={[
                        styles.optionPill,
                        tempPriceRange === item.value && styles.optionPillActive,
                        { width: '48%' }
                      ]}
                    >
                      {tempPriceRange === item.value && <Check size={10} color={LuxuryColors.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.optionText, tempPriceRange === item.value && styles.optionTextActive]}>
                        {item.label}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

              {/* TRANSMISSION */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>TRANSMISSION</Text>
                <View style={styles.optionsGrid}>
                  {['All', 'Automatic', 'Manual'].map((trans) => (
                    <PremiumPressable
                      key={trans}
                      onPress={() => setTempTransmission(trans)}
                      style={[
                        styles.optionPill,
                        tempTransmission === trans && styles.optionPillActive,
                      ]}
                    >
                      {tempTransmission === trans && <Check size={10} color={LuxuryColors.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.optionText, tempTransmission === trans && styles.optionTextActive]}>
                        {trans}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

              {/* FUEL TYPE */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>PROPULSION SYSTEM</Text>
                <View style={styles.optionsGrid}>
                  {['All', 'Petrol', 'Hybrid', 'Electric'].map((fuel) => (
                    <PremiumPressable
                      key={fuel}
                      onPress={() => setTempFuelType(fuel)}
                      style={[
                        styles.optionPill,
                        tempFuelType === fuel && styles.optionPillActive,
                      ]}
                    >
                      {tempFuelType === fuel && <Check size={10} color={LuxuryColors.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.optionText, tempFuelType === fuel && styles.optionTextActive]}>
                        {fuel}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

              {/* SEAT COUNT */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>CABIN CAPACITY</Text>
                <View style={styles.optionsGrid}>
                  {[
                    { label: 'All', value: 'All' },
                    { label: '2 Seats', value: '2' },
                    { label: '4 Seats', value: '4' },
                    { label: '5+ Seats', value: '5' },
                  ].map((item) => (
                    <PremiumPressable
                      key={item.value}
                      onPress={() => setTempSeats(item.value)}
                      style={[
                        styles.optionPill,
                        tempSeats === item.value && styles.optionPillActive,
                      ]}
                    >
                      {tempSeats === item.value && <Check size={10} color={LuxuryColors.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.optionText, tempSeats === item.value && styles.optionTextActive]}>
                        {item.label}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

              {/* SORT BY */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>SORTING ORDER</Text>
                <View style={styles.optionsGrid}>
                  {[
                    { label: 'Rating (Top Class)', value: 'rating' },
                    { label: 'Price: Low to High', value: 'price-low-high' },
                    { label: 'Price: High to Low', value: 'price-high-low' },
                  ].map((sortOption) => (
                    <PremiumPressable
                      key={sortOption.value}
                      onPress={() => setTempSortBy(sortOption.value)}
                      style={[
                        styles.optionPill,
                        tempSortBy === sortOption.value && styles.optionPillActive,
                        { width: '100%' }
                      ]}
                    >
                      {tempSortBy === sortOption.value && <Check size={10} color={LuxuryColors.background} style={{ marginRight: 4 }} />}
                      <Text style={[styles.optionText, tempSortBy === sortOption.value && styles.optionTextActive]}>
                        {sortOption.label}
                      </Text>
                    </PremiumPressable>
                  ))}
                </View>
              </View>

            </ScrollView>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <PremiumPressable onPress={resetTempFilters} style={styles.resetBtn}>
                <RotateCcw size={14} color="#FFF" />
                <Text style={styles.resetBtnText}>RESET</Text>
              </PremiumPressable>
              
              <PremiumPressable onPress={applyFilters} style={styles.applyBtn}>
                <Text style={styles.applyBtnText}>
                  APPLY ({getMatchingCount(tempLocation, tempPriceRange, tempTransmission, tempFuelType, tempSeats)} FOUND)
                </Text>
              </PremiumPressable>
            </View>
          </GlassCard>
        </View>
      </Modal>
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
  clearSearchBtn: {
    padding: 8,
    marginRight: -4,
  },
  filterBtnActive: {
    backgroundColor: LuxuryColors.accent,
    borderRadius: LuxuryRadius.xs,
    padding: 6,
  },
  activeFiltersContainer: {
    marginTop: 10,
    marginBottom: 2,
  },
  activeFiltersScroll: {
    paddingHorizontal: LuxurySpacing.screenPadding,
    alignItems: 'center',
    gap: 8,
  },
  activeFiltersLabel: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textMuted,
    fontSize: 8,
    marginRight: 2,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(234, 179, 8, 0.08)',
    borderColor: 'rgba(234, 179, 8, 0.3)',
    borderWidth: 1,
    paddingLeft: 10,
    paddingRight: 6,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
    gap: 6,
  },
  filterPillText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 8,
    textTransform: 'none',
  },
  removePillBtn: {
    padding: 2,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: LuxuryRadius.full,
  },
  clearAllBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.textSecondary,
    fontSize: 8,
    textTransform: 'none',
  },
  emptyCard: {
    width: '100%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LuxuryRadius.xl,
    gap: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: LuxuryColors.textMuted,
    marginBottom: 16,
  },
  emptyResetBtn: {
    backgroundColor: LuxuryColors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: LuxuryRadius.md,
  },
  emptyResetBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 10,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: LuxuryRadius.xl,
    borderTopRightRadius: LuxuryRadius.xl,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    height: '80%',
    padding: 24,
    borderWidth: 0,
    borderTopWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.accent,
    fontSize: 12,
    letterSpacing: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScroll: {
    paddingBottom: 40,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    ...LuxuryTypography.tiny,
    color: '#94A3B8',
    fontSize: 9,
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: LuxuryRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  optionPillActive: {
    borderColor: LuxuryColors.accent,
    backgroundColor: LuxuryColors.accent,
  },
  optionText: {
    ...LuxuryTypography.caption,
    color: LuxuryColors.textSecondary,
    fontSize: 12,
  },
  optionTextActive: {
    color: LuxuryColors.background,
    fontWeight: 'bold',
  },
  modalFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'transparent',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    flex: 1,
    height: 52,
    borderRadius: LuxuryRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  resetBtnText: {
    ...LuxuryTypography.tiny,
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  applyBtn: {
    flex: 2,
    height: 52,
    backgroundColor: LuxuryColors.accent,
    borderRadius: LuxuryRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyBtnText: {
    ...LuxuryTypography.tiny,
    color: LuxuryColors.background,
    fontSize: 10,
    fontWeight: '900',
  },
});
