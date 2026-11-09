import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { Plus, Minus, Snowflake, Sparkles } from 'lucide-react-native';
import { theme } from '../theme';
import { useCart } from '../context/CartContext';
import type { Product } from '@gomeat/shared';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { items, addItem, updateQuantity } = useCart();

  // If product has weight options, select the first one by default
  const availableWeights = product.weightOptions && product.weightOptions.length > 0
    ? product.weightOptions.map((o) => o.weight)
    : [product.unit || '500g'];

  const [selectedWeight, setSelectedWeight] = useState<string>(availableWeights[0]);

  // Find corresponding weight option
  const activeOption = product.weightOptions?.find((o) => o.weight === selectedWeight);
  const activePrice = activeOption ? activeOption.price : product.price;
  const activeMrp = activeOption ? activeOption.mrp : (product.mrp || Math.round(product.price * 1.25));
  const savings = activeMrp > activePrice ? activeMrp - activePrice : 0;
  const discountPct = activeMrp > activePrice ? Math.round(((activeMrp - activePrice) / activeMrp) * 100) : 0;

  // Find quantity for current selected weight
  const cartItem = items.find(
    (it) => it.product.id === product.id && it.selectedWeight === selectedWeight
  );
  const currentQuantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addItem(product, selectedWeight, product.cutStyle);
  };

  const handleIncrement = () => {
    updateQuantity(product.id, selectedWeight, 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, selectedWeight, -1);
  };

  const imageUrl = product.imageUrl || product.image || 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80';

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Sparkles size={10} color="#ffffff" />
            <Text style={styles.discountText}>{discountPct}% OFF</Text>
          </View>
        )}
        <View style={styles.coldBadge}>
          <Snowflake size={10} color={theme.colors.sky} />
          <Text style={styles.coldText}>0°C–4°C Fresh</Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.categoryRow}>
          <Text style={styles.categoryBadge}>{product.category.toUpperCase()}</Text>
          {product.origin ? (
            <Text style={styles.originText}>• {product.origin}</Text>
          ) : null}
        </View>

        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.productMeta} numberOfLines={1}>
          {product.netWeight || selectedWeight} {product.serves ? `• Serves ${product.serves}` : ''} {product.pieces ? `• ${product.pieces}` : ''}
        </Text>

        {/* Weight Selector Pills */}
        {availableWeights.length > 1 && (
          <View style={styles.weightSelector}>
            {availableWeights.map((w) => {
              const isSelected = w === selectedWeight;
              return (
                <Pressable
                  key={w}
                  onPress={() => setSelectedWeight(w)}
                  style={[styles.weightPill, isSelected && styles.weightPillActive]}
                >
                  <Text style={[styles.weightPillText, isSelected && styles.weightPillTextActive]}>
                    {w}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        {/* Pricing and Stepper Row */}
        <View style={styles.bottomRow}>
          <View style={styles.priceContainer}>
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>₹{activePrice}</Text>
              {activeMrp > activePrice && (
                <Text style={styles.mrpText}>₹{activeMrp}</Text>
              )}
            </View>
            {savings > 0 && (
              <Text style={styles.savingsText}>Save ₹{savings}</Text>
            )}
          </View>

          {currentQuantity === 0 ? (
            <Pressable style={styles.addBtn} onPress={handleAdd}>
              <Text style={styles.addBtnText}>ADD</Text>
              <Plus size={14} color="#ffffff" strokeWidth={3} />
            </Pressable>
          ) : (
            <View style={styles.stepperContainer}>
              <Pressable style={styles.stepperBtn} onPress={handleDecrement}>
                <Minus size={14} color={theme.colors.primary} strokeWidth={3} />
              </Pressable>
              <Text style={styles.stepperQuantity}>{currentQuantity}</Text>
              <Pressable style={styles.stepperBtn} onPress={handleIncrement}>
                <Plus size={14} color={theme.colors.primary} strokeWidth={3} />
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  imageContainer: {
    height: 150,
    width: '100%',
    backgroundColor: theme.colors.surfaceSubtle,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: theme.typography.weightBold,
  },
  coldBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: theme.radius.sm,
  },
  coldText: {
    color: theme.colors.sky,
    fontSize: 10,
    fontWeight: theme.typography.weightSemi,
  },
  details: {
    padding: theme.spacing.md,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  categoryBadge: {
    fontSize: 10,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  originText: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  productName: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    lineHeight: 20,
    marginBottom: 2,
  },
  productMeta: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  weightSelector: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  weightPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  weightPillActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  weightPillText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
  },
  weightPillTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weightBold,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  priceContainer: {
    flex: 1,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  currentPrice: {
    fontSize: 17,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  mrpText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textDecorationLine: 'line-through',
  },
  savingsText: {
    fontSize: 10,
    color: theme.colors.emerald,
    fontWeight: theme.typography.weightSemi,
  },
  addBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    gap: 4,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperQuantity: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.primary,
  },
});
