import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Search, X, Sparkles, Filter, RotateCcw } from 'lucide-react-native';
import { theme } from '../theme';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ThermalBadge } from '../components/ThermalBadge';
import { FloatingCartBar } from '../components/FloatingCartBar';
import type { Product } from '@gomeat/shared';

const CATEGORIES = ['All', 'Chicken', 'Mutton', 'Fish & Seafood', 'Cold Cuts', 'Eggs'];

const POPULAR_SEARCHES = [
  '🍗 Curry Cut',
  '🥩 Biryani Cut',
  '🐟 Surmai Fish',
  '🍗 Boneless',
  '🦐 Jumbo Prawns',
  '🐟 Pomfret',
  '🍢 Fish Tikka',
  '🎁 Feast Combo',
];

interface HomeScreenProps {
  onNavigateToCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  const placeholders = useMemo(() => [
    'Search chicken, mutton, prawns, fish...',
    'Search "mutton biryani cut"...',
    'Search "surmai fish steaks"...',
    'Search "chicken curry cut"...',
    'Search "jumbo sea prawns"...',
    'Search "boneless chicken fillets"...',
  ], []);

  // Cycling placeholder text (Swiggy mobile pattern)
  useEffect(() => {
    if (searchQuery.trim()) return;
    const id = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % placeholders.length);
    }, 2800);
    return () => clearInterval(id);
  }, [searchQuery, placeholders.length]);

  // Debounce search query to prevent excessive queries while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      // When searching, search across all categories (Swiggy standard)
      const catToFilter = debouncedQuery.trim() ? 'All' : selectedCategory;
      const data = await api.getProducts(catToFilter, debouncedQuery.trim());
      setProducts(data || []);
    } catch (err: any) {
      console.log('Error fetching products:', err);
      setError('Unable to load catalog. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, debouncedQuery]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleQuickSearch = (term: string) => {
    // Strip leading emoji if present
    const cleanTerm = term.replace(/^[^\w]+/, '').trim();
    setSearchQuery(cleanTerm);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* INTERACTIVE SEARCH BAR (SWIGGY/ZEPTO GRADE) */}
        <View style={styles.searchSection}>
          <View style={styles.searchBarWrapper}>
            <Search size={18} color={theme.colors.primary} />
            <TextInput
              style={styles.searchInput}
              placeholder={placeholders[placeholderIdx]}
              placeholderTextColor={theme.colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable style={styles.clearBtn} onPress={handleClearSearch}>
                <X size={15} color={theme.colors.textMuted} />
              </Pressable>
            )}
          </View>

          {/* Quick Search Keyword Chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickSearchScroll}
          >
            <View style={styles.trendingTag}>
              <Sparkles size={11} color="#b45309" />
              <Text style={styles.trendingText}>Trending:</Text>
            </View>
            {POPULAR_SEARCHES.map((chip, idx) => (
              <Pressable
                key={idx}
                style={[
                  styles.quickChip,
                  searchQuery.toLowerCase() === chip.replace(/^[^\w]+/, '').trim().toLowerCase() && styles.quickChipActive,
                ]}
                onPress={() => handleQuickSearch(chip)}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    searchQuery.toLowerCase() === chip.replace(/^[^\w]+/, '').trim().toLowerCase() && styles.quickChipTextActive,
                  ]}
                >
                  {chip}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Thermal Vault Cold-Chain Banner */}
        <ThermalBadge currentTemp={2.3} />

        {/* Category Horizontal Filter Pills */}
        <View style={styles.categoryContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {CATEGORIES.map((cat) => {
              const active = cat === selectedCategory;
              return (
                <Pressable
                  key={cat}
                  style={[styles.categoryPill, active && styles.categoryPillActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{cat}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Active Search Results Indicator */}
        {debouncedQuery.length > 0 && (
          <View style={styles.searchActiveBanner}>
            <View style={styles.searchActiveTextRow}>
              <Text style={styles.searchActiveTitle}>
                Showing results for <Text style={styles.searchActiveQuery}>"{debouncedQuery}"</Text>
              </Text>
              <Text style={styles.searchActiveSub}>
                {products.length} {products.length === 1 ? 'cut' : 'cuts'} found
              </Text>
            </View>
            <Pressable style={styles.searchActiveClearBtn} onPress={handleClearSearch}>
              <Text style={styles.searchActiveClearText}>Clear ✕</Text>
            </Pressable>
          </View>
        )}

        {/* Section Header */}
        {debouncedQuery.length === 0 && (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'All' ? 'All Farm Fresh Cuts' : `${selectedCategory} Cuts`}
            </Text>
            <Text style={styles.productCount}>{products.length} Items</Text>
          </View>
        )}

        {/* Loading / Error / Empty States */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Searching fresh cuts...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={fetchProducts}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : products.length === 0 ? (
          /* NO RESULTS FOUND FOR SEARCH */
          <View style={styles.centerContainer}>
            <View style={styles.emptyIconCircle}>
              <Search size={32} color={theme.colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {debouncedQuery.length > 0
                ? `No cuts found for "${debouncedQuery}"`
                : 'No cuts available right now'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {debouncedQuery.length > 0
                ? 'Try searching with simpler terms like "chicken", "biryani", "mutton", or "fish".'
                : 'Check back shortly for incoming fresh morning catch.'}
            </Text>

            {debouncedQuery.length > 0 && (
              <Pressable style={styles.viewAllBtn} onPress={handleClearSearch}>
                <RotateCcw size={14} color="#ffffff" />
                <Text style={styles.viewAllBtnText}>View All Fresh Cuts</Text>
              </Pressable>
            )}
          </View>
        ) : (
          /* Product Cards */
          products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))
        )}
      </ScrollView>

      {/* Floating Bottom Cart Bar */}
      <FloatingCartBar onPress={onNavigateToCart} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    paddingBottom: 90, // room for floating cart bar
  },
  searchSection: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    gap: 8,
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.navy,
    paddingVertical: 0,
  },
  clearBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  quickSearchScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  trendingTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginRight: 2,
  },
  trendingText: {
    fontSize: 11,
    color: '#b45309',
    fontWeight: theme.typography.weightBold,
  },
  quickChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  quickChipText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
  },
  quickChipTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weightBold,
  },
  categoryContainer: {
    marginVertical: theme.spacing.xs,
  },
  categoryScroll: {
    paddingHorizontal: theme.spacing.lg,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryPillActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  searchActiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.primaryLight,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: 8,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.radius.md,
  },
  searchActiveTextRow: {
    flex: 1,
  },
  searchActiveTitle: {
    fontSize: 12,
    color: theme.colors.navy,
  },
  searchActiveQuery: {
    fontWeight: theme.typography.weightBold,
    color: theme.colors.primary,
  },
  searchActiveSub: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  searchActiveClearBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
  },
  searchActiveClearText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: theme.typography.weightBold,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  productCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
  },
  centerContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.danger,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  retryBtnText: {
    color: '#ffffff',
    fontWeight: theme.typography.weightBold,
    fontSize: 13,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 4,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  viewAllBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
});
