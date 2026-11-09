import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { theme } from '../theme';
import { api } from '../services/api';
import { ProductCard } from '../components/ProductCard';
import { ThermalBadge } from '../components/ThermalBadge';
import { FloatingCartBar } from '../components/FloatingCartBar';
import type { Product } from '@gomeat/shared';

const CATEGORIES = ['All', 'Chicken', 'Mutton', 'Fish & Seafood', 'Cold Cuts', 'Eggs'];

interface HomeScreenProps {
  onNavigateToCart: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToCart }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getProducts(selectedCategory);
      setProducts(data || []);
    } catch (err: any) {
      console.log('Error fetching products:', err);
      setError('Unable to load catalog. Pull down to retry.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
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

        {/* Product Count & Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'All' ? 'All Fresh Cuts' : `${selectedCategory} Cuts`}
          </Text>
          <Text style={styles.productCount}>{products.length} Items</Text>
        </View>

        {/* Loading / Error / Empty States */}
        {loading && !refreshing ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={styles.loadingText}>Fetching farm-fresh cuts...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable style={styles.retryBtn} onPress={fetchProducts}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </Pressable>
          </View>
        ) : products.length === 0 ? (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyTitle}>No cuts available</Text>
            <Text style={styles.emptySubtitle}>Check back shortly for incoming morning catch.</Text>
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
  categoryContainer: {
    marginVertical: theme.spacing.sm,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  productCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weightMedium,
  },
  centerContainer: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
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
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
