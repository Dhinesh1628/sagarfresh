import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  Trash2,
  Plus,
  Minus,
  Tag,
  ShieldCheck,
  CheckCircle2,
  Truck,
  ArrowRight,
  Heart,
  Info,
} from 'lucide-react-native';
import { theme } from '../theme';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface CartScreenProps {
  onOrderPlaced: (orderId: string) => void;
  onContinueShopping: () => void;
}

export const CartScreen: React.FC<CartScreenProps> = ({
  onOrderPlaced,
  onContinueShopping,
}) => {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    subtotal,
    coldBoxDeposit,
    deliveryFee,
    discount,
    tip,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    setTip,
    amountNeededForFreeDelivery,
    freeDeliveryProgress,
  } = useCart();

  const { user } = useAuth();
  const [selectedInstruction, setSelectedInstruction] = useState<string>('Leave at door');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const tipsList = [20, 30, 50];
  const instructionsList = ['Leave at door', 'Do not ring bell', 'Call upon arrival'];

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;

    setIsPlacingOrder(true);
    try {
      const orderPayload = {
        items: items.map((it) => ({
          productId: it.product.id,
          name: it.product.name,
          price: it.unitPrice || it.product.price,
          quantity: it.quantity,
          unit: it.selectedWeight || it.product.unit || '500g',
          cutStyle: it.selectedCutStyle || it.product.cutStyle || 'Standard Curry Cut',
          image: it.product.imageUrl || it.product.image,
        })),
        total: grandTotal,
        subtotal,
        depositAmount: coldBoxDeposit,
        deliveryFee,
        discount,
        tip,
        couponCode: appliedCoupon,
        paymentMethod: 'razorpay',
        paymentStatus: 'paid',
        deliveryNotes: selectedInstruction,
        customerName: user?.name || 'GoMeat Guest Customer',
        customerEmail: user?.email || 'customer@gomeat.com',
        customerPhone: user?.phone || '9876543210',
        shippingAddress: {
          address: user?.address || '100ft Road, Indiranagar',
          city: user?.city || 'Bengaluru',
          pincode: '560038',
        },
      };

      const res = await api.createOrder(orderPayload);
      const createdOrderId = res?.id || res?.order?.id || `ORD-${Date.now().toString().slice(-6)}`;
      clearCart();
      onOrderPlaced(createdOrderId);
    } catch (err: any) {
      console.log('Error creating order:', err);
      Alert.alert('Checkout Notice', err.message || 'Unable to place order. Please try again.');
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Truck size={42} color={theme.colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Stock up on farm-fresh cuts, fresh sea catch, and ready-to-cook delicacies.
        </Text>
        <Pressable style={styles.shopNowBtn} onPress={onContinueShopping}>
          <Text style={styles.shopNowText}>Explore Cuts</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Free Delivery Milestone Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressRow}>
            <Truck size={16} color={deliveryFee === 0 ? theme.colors.emerald : theme.colors.primary} />
            <Text style={styles.progressText}>
              {deliveryFee === 0
                ? '🎉 Congratulations! You have unlocked FREE Delivery.'
                : `Add ₹${amountNeededForFreeDelivery} more for FREE Delivery`}
            </Text>
          </View>
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(freeDeliveryProgress * 100)}%`,
                  backgroundColor: deliveryFee === 0 ? theme.colors.emerald : theme.colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Cart Items List */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Selected Cuts ({items.length})</Text>
          {items.map((it, idx) => {
            const img = it.product.imageUrl || it.product.image || 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=400&q=80';
            const price = it.unitPrice || it.product.price;
            return (
              <View
                key={`${it.product.id}-${it.selectedWeight}-${idx}`}
                style={[styles.itemRow, idx !== items.length - 1 && styles.itemRowBorder]}
              >
                <Image source={{ uri: img }} style={styles.itemImage} resizeMode="cover" />
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {it.product.name}
                  </Text>
                  <Text style={styles.itemWeight}>
                    {it.selectedWeight} • {it.selectedCutStyle}
                  </Text>
                  <Text style={styles.itemPrice}>₹{price * it.quantity}</Text>
                </View>

                {/* Stepper */}
                <View style={styles.stepperContainer}>
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity(it.product.id, it.selectedWeight || '', -1)}
                  >
                    {it.quantity === 1 ? (
                      <Trash2 size={13} color={theme.colors.danger} />
                    ) : (
                      <Minus size={13} color={theme.colors.primary} strokeWidth={2.5} />
                    )}
                  </Pressable>
                  <Text style={styles.stepperQty}>{it.quantity}</Text>
                  <Pressable
                    style={styles.stepperBtn}
                    onPress={() => updateQuantity(it.product.id, it.selectedWeight || '', 1)}
                  >
                    <Plus size={13} color={theme.colors.primary} strokeWidth={2.5} />
                  </Pressable>
                </View>
              </View>
            );
          })}
        </View>

        {/* 100% Refundable Cold Box Deposit Banner */}
        <View style={styles.depositCard}>
          <View style={styles.depositTop}>
            <View style={styles.depositShield}>
              <ShieldCheck size={20} color="#0284c7" />
            </View>
            <View style={styles.depositContent}>
              <View style={styles.depositTitleRow}>
                <Text style={styles.depositTitle}>₹{coldBoxDeposit} Refundable Cold Box Deposit</Text>
                <View style={styles.safeTag}>
                  <Text style={styles.safeTagText}>100% REFUNDABLE</Text>
                </View>
              </View>
              <Text style={styles.depositDesc}>
                Guarantees sub-4°C chill during transit. Return the insulated cooler box anytime to rider or doorstep collection for instant ₹250 refund to your GoMeat Vault.
              </Text>
            </View>
          </View>
        </View>

        {/* 1-Click Coupons */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Tag size={16} color={theme.colors.navy} />
            <Text style={styles.cardHeader}>Offers & Coupons</Text>
          </View>
          <View style={styles.couponRow}>
            <Pressable
              style={[
                styles.couponChip,
                appliedCoupon === 'MEAT100' && styles.couponChipActive,
              ]}
              onPress={() => (appliedCoupon === 'MEAT100' ? removeCoupon() : applyCoupon('MEAT100'))}
            >
              <Text style={[styles.couponText, appliedCoupon === 'MEAT100' && styles.couponTextActive]}>
                MEAT100 (₹100 OFF)
              </Text>
              {appliedCoupon === 'MEAT100' && <CheckCircle2 size={14} color="#ffffff" />}
            </Pressable>

            <Pressable
              style={[
                styles.couponChip,
                appliedCoupon === 'FREEDEL' && styles.couponChipActive,
              ]}
              onPress={() => (appliedCoupon === 'FREEDEL' ? removeCoupon() : applyCoupon('FREEDEL'))}
            >
              <Text style={[styles.couponText, appliedCoupon === 'FREEDEL' && styles.couponTextActive]}>
                FREEDEL (Free Delivery)
              </Text>
              {appliedCoupon === 'FREEDEL' && <CheckCircle2 size={14} color="#ffffff" />}
            </Pressable>
          </View>
        </View>

        {/* Delivery Partner Tip */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Heart size={16} color={theme.colors.primary} />
            <Text style={styles.cardHeader}>Tip Your Cold-Chain Partner</Text>
          </View>
          <Text style={styles.tipSubtext}>100% of the tip goes directly to your delivery partner.</Text>
          <View style={styles.tipRow}>
            {tipsList.map((amt) => {
              const active = tip === amt;
              return (
                <Pressable
                  key={amt}
                  style={[styles.tipChip, active && styles.tipChipActive]}
                  onPress={() => setTip(active ? 0 : amt)}
                >
                  <Text style={[styles.tipChipText, active && styles.tipChipTextActive]}>₹{amt}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Delivery Instructions */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Delivery Instructions</Text>
          <View style={styles.instructionRow}>
            {instructionsList.map((inst) => {
              const active = selectedInstruction === inst;
              return (
                <Pressable
                  key={inst}
                  style={[styles.instructionChip, active && styles.instructionChipActive]}
                  onPress={() => setSelectedInstruction(inst)}
                >
                  <Text
                    style={[
                      styles.instructionText,
                      active && styles.instructionTextActive,
                    ]}
                  >
                    {inst}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Bill Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardHeader}>Bill Details</Text>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Item Total</Text>
            <Text style={styles.billValue}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <View style={styles.row}>
              <Text style={styles.billLabel}>Cold Box Deposit</Text>
              <Text style={styles.refundableHint}> (Refundable)</Text>
            </View>
            <Text style={styles.billValue}>₹{coldBoxDeposit}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billLabel}>Delivery Partner Fee</Text>
            <Text style={[styles.billValue, deliveryFee === 0 && styles.freeValue]}>
              {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
            </Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billLabel, styles.discountLabel]}>Coupon Discount ({appliedCoupon})</Text>
              <Text style={[styles.billValue, styles.discountValue]}>- ₹{discount}</Text>
            </View>
          )}
          {tip > 0 && (
            <View style={styles.billRow}>
              <Text style={styles.billLabel}>Delivery Partner Tip</Text>
              <Text style={styles.billValue}>₹{tip}</Text>
            </View>
          )}
          <View style={[styles.billRow, styles.grandTotalRow]}>
            <View>
              <Text style={styles.grandTotalLabel}>To Pay</Text>
              <Text style={styles.inclTaxesText}>Incl. all taxes & ₹{coldBoxDeposit} deposit</Text>
            </View>
            <Text style={styles.grandTotalValue}>₹{grandTotal}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Checkout Action */}
      <View style={styles.checkoutBar}>
        <View style={styles.checkoutLeft}>
          <Text style={styles.checkoutTotalLabel}>Grand Total</Text>
          <Text style={styles.checkoutTotalAmount}>₹{grandTotal}</Text>
        </View>
        <Pressable
          style={[styles.checkoutBtn, isPlacingOrder && styles.checkoutBtnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isPlacingOrder}
        >
          {isPlacingOrder ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Text style={styles.checkoutBtnText}>Place Cold Order</Text>
              <ArrowRight size={18} color="#ffffff" strokeWidth={2.5} />
            </>
          )}
        </Pressable>
      </View>
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
    paddingBottom: 110,
    gap: theme.spacing.md,
  },
  progressCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  progressText: {
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
    flex: 1,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: theme.radius.full,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadow.card,
  },
  cardHeader: {
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 10,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: theme.radius.md,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
  },
  itemWeight: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginVertical: 2,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primaryLight,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    paddingHorizontal: 2,
    paddingVertical: 2,
  },
  stepperBtn: {
    padding: 6,
  },
  stepperQty: {
    paddingHorizontal: 8,
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.primary,
  },
  depositCard: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  depositTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  depositShield: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositContent: {
    flex: 1,
  },
  depositTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  depositTitle: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: '#0369a1',
  },
  safeTag: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  safeTagText: {
    color: '#15803d',
    fontSize: 9,
    fontWeight: theme.typography.weightBold,
  },
  depositDesc: {
    fontSize: 11,
    color: '#0284c7',
    lineHeight: 16,
  },
  couponRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  couponChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  couponChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  couponText: {
    fontSize: 12,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
  },
  couponTextActive: {
    color: '#ffffff',
  },
  tipSubtext: {
    fontSize: 11,
    color: theme.colors.textMuted,
    marginBottom: 8,
  },
  tipRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tipChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  tipChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  tipChipText: {
    fontSize: 13,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.textSecondary,
  },
  tipChipTextActive: {
    color: theme.colors.primary,
  },
  instructionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  instructionChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  instructionChipActive: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  instructionText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: theme.typography.weightMedium,
  },
  instructionTextActive: {
    color: theme.colors.primary,
    fontWeight: theme.typography.weightBold,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billLabel: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  refundableHint: {
    fontSize: 11,
    color: theme.colors.emerald,
    fontWeight: theme.typography.weightSemi,
  },
  billValue: {
    fontSize: 13,
    fontWeight: theme.typography.weightSemi,
    color: theme.colors.navy,
  },
  freeValue: {
    color: theme.colors.emerald,
    fontWeight: theme.typography.weightBold,
  },
  discountLabel: {
    color: theme.colors.emerald,
  },
  discountValue: {
    color: theme.colors.emerald,
    fontWeight: theme.typography.weightBold,
  },
  grandTotalRow: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'baseline',
  },
  grandTotalLabel: {
    fontSize: 15,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  inclTaxesText: {
    fontSize: 10,
    color: theme.colors.textMuted,
  },
  grandTotalValue: {
    fontSize: 20,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.primary,
  },
  checkoutBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadow.floating,
  },
  checkoutLeft: {},
  checkoutTotalLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
  },
  checkoutTotalAmount: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
  },
  checkoutBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: theme.radius.lg,
  },
  checkoutBtnDisabled: {
    opacity: 0.7,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: theme.typography.weightBold,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxl,
    backgroundColor: theme.colors.bg,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: theme.typography.weightBold,
    color: theme.colors.navy,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: theme.colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  shopNowBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: theme.radius.md,
  },
  shopNowText: {
    color: '#ffffff',
    fontWeight: theme.typography.weightBold,
    fontSize: 13,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
