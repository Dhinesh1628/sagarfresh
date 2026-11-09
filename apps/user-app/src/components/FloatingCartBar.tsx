import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ShoppingBag, ArrowRight } from 'lucide-react-native';
import { theme } from '../theme';
import { useCart } from '../context/CartContext';

interface FloatingCartBarProps {
  onPress: () => void;
}

export const FloatingCartBar: React.FC<FloatingCartBarProps> = ({ onPress }) => {
  const { totalItemCount, grandTotal } = useCart();

  if (totalItemCount === 0) return null;

  return (
    <View style={styles.floatingWrapper}>
      <Pressable style={styles.bar} onPress={onPress}>
        <View style={styles.left}>
          <View style={styles.iconBadge}>
            <ShoppingBag size={18} color="#ffffff" />
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{totalItemCount}</Text>
            </View>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.itemsLabel}>{totalItemCount} {totalItemCount === 1 ? 'Item' : 'Items'} added</Text>
            <Text style={styles.totalPrice}>₹{grandTotal}</Text>
          </View>
        </View>

        <View style={styles.right}>
          <Text style={styles.viewCartText}>View Cart</Text>
          <ArrowRight size={16} color="#ffffff" strokeWidth={2.5} />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  floatingWrapper: {
    position: 'absolute',
    bottom: 12,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    zIndex: 999,
  },
  bar: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadow.floating,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBadge: {
    position: 'relative',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.colors.emerald,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  countText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: theme.typography.weightBold,
  },
  textContainer: {},
  itemsLabel: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: theme.typography.weightMedium,
  },
  totalPrice: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: theme.typography.weightBold,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
  },
  viewCartText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
  },
});
