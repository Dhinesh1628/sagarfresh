import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {
  Layers,
  Plus,
  Minus,
  AlertTriangle,
  Search,
  CheckCircle2,
} from 'lucide-react-native';
import { theme } from '../theme';
import { usePartner } from '../context/PartnerContext';

export const InventoryScreen: React.FC = () => {
  const { stockItems, adjustStock, loading } = usePartner();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');

  const categories = ['All', 'Chicken', 'Mutton', 'Fish & Seafood', 'Cold Cuts', 'Eggs'];

  const filteredItems = (stockItems.length > 0 ? stockItems : [
    {
      id: 'prod-chicken-curry',
      name: 'Farm Fresh Chicken Curry Cut',
      category: 'Chicken',
      stock: 35,
      price: 189,
      unit: '500g',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-mutton-biryani',
      name: 'Tender Mutton Biryani Cut',
      category: 'Mutton',
      stock: 4,
      price: 520,
      unit: '500g',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'prod-fish-surmai',
      name: 'Mangalore Kingfish (Surmai) Steaks',
      category: 'Fish & Seafood',
      stock: 12,
      price: 680,
      unit: '500g',
      imageUrl: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=400&q=80',
    },
  ]).filter((item) => {
    const matchesCat = selectedCat === 'All' || item.category === selectedCat;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Search & Categories */}
        <View style={styles.searchContainer}>
          <Search size={16} color={theme.colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search cut inventory..."
            placeholderTextColor={theme.colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {categories.map((c) => {
            const active = c === selectedCat;
            return (
              <Pressable
                key={c}
                style={[styles.catPill, active && styles.catPillActive]}
                onPress={() => setSelectedCat(c)}
              >
                <Text style={[styles.catText, active && styles.catTextActive]}>{c}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Stock Items List */}
        <View style={styles.itemsList}>
          {filteredItems.map((item) => {
            const isLowStock = item.stock <= 5;
            const img = item.imageUrl || (item as any).image || 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80';

            return (
              <View key={item.id} style={styles.itemCard}>
                <Image source={{ uri: img }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.itemCategory}>{item.category} • {item.unit}</Text>
                  <Text style={styles.itemPrice}>₹{item.price}</Text>

                  {isLowStock && (
                    <View style={styles.lowStockBadge}>
                      <AlertTriangle size={11} color="#b45309" />
                      <Text style={styles.lowStockText}>Low Stock ({item.stock} left)</Text>
                    </View>
                  )}
                </View>

                {/* Stock Controls */}
                <View style={styles.stockControl}>
                  <Text style={styles.stockLabel}>Available</Text>
                  <View style={styles.stepper}>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => adjustStock(item.id, -1)}
                    >
                      <Minus size={14} color={theme.colors.navy} strokeWidth={2.5} />
                    </Pressable>
                    <Text style={styles.stockCount}>{item.stock}</Text>
                    <Pressable
                      style={styles.stepBtn}
                      onPress={() => adjustStock(item.id, 1)}
                    >
                      <Plus size={14} color={theme.colors.navy} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
    gap: theme.spacing.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    height: 44,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: theme.colors.navy,
  },
  catScroll: {
    gap: 8,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  catPillActive: {
    backgroundColor: theme.colors.teal,
    borderColor: theme.colors.teal,
  },
  catText: {
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.textSecondary,
  },
  catTextActive: {
    color: '#ffffff',
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    ...theme.shadow.card,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: theme.radius.md,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  itemCategory: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginTop: 1,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginTop: 2,
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  lowStockText: {
    fontSize: 10,
    fontWeight: theme.typography.weightBold,
    color: '#b45309',
  },
  stockControl: {
    alignItems: 'center',
  },
  stockLabel: {
    fontSize: 10,
    color: theme.colors.textMuted,
    marginBottom: 4,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.borderStrong,
  },
  stepBtn: {
    padding: 6,
  },
  stockCount: {
    paddingHorizontal: 8,
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
});
