import React, { createContext, useContext, useState, useMemo } from 'react';
import type { Product, CartItem } from '@gomeat/shared';
import { config } from '../config';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, weight?: string, cutStyle?: string) => void;
  updateQuantity: (productId: string, weight: string, delta: number) => void;
  removeItem: (productId: string, weight: string) => void;
  clearCart: () => void;
  getItemQuantity: (productId: string, weight?: string) => number;
  
  // Financial calculations
  subtotal: number;
  coldBoxDeposit: number;
  deliveryFee: number;
  discount: number;
  tip: number;
  grandTotal: number;
  
  // Coupons & tips
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  setTip: (amount: number) => void;
  
  // Threshold progress
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  freeDeliveryProgress: number; // 0 to 1
  totalItemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [tip, setTip] = useState<number>(0);

  const coldBoxDeposit = config.coldBoxDeposit; // ₹250 refundable
  const freeDeliveryThreshold = config.freeDeliveryThreshold; // ₹499

  const addItem = (product: Product, weight?: string, cutStyle?: string) => {
    const selectedWeight = weight || product.unit || '500g';
    const selectedCut = cutStyle || product.cutStyle || 'Standard Curry Cut';
    
    // Determine unit price based on weight option if available
    let price = product.price;
    let mrp = product.mrp || Math.round(product.price * 1.25);

    if (product.weightOptions && product.weightOptions.length > 0) {
      const opt = product.weightOptions.find((w) => w.weight === selectedWeight);
      if (opt) {
        price = opt.price;
        mrp = opt.mrp;
      }
    }

    setItems((prev) => {
      const existingIdx = prev.findIndex(
        (it) => it.product.id === product.id && it.selectedWeight === selectedWeight
      );

      if (existingIdx > -1) {
        const copy = [...prev];
        copy[existingIdx].quantity += 1;
        return copy;
      }

      return [
        ...prev,
        {
          id: `${product.id}-${selectedWeight}`,
          product,
          quantity: 1,
          selectedWeight,
          selectedCutStyle: selectedCut,
          unitPrice: price,
          unitMrp: mrp,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, weight: string, delta: number) => {
    setItems((prev) => {
      return prev
        .map((it) => {
          if (it.product.id === productId && it.selectedWeight === weight) {
            const nextQty = it.quantity + delta;
            return nextQty > 0 ? { ...it, quantity: nextQty } : null;
          }
          return it;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeItem = (productId: string, weight: string) => {
    setItems((prev) => prev.filter((it) => !(it.product.id === productId && it.selectedWeight === weight)));
  };

  const clearCart = () => {
    setItems([]);
    setAppliedCoupon(null);
    setTip(0);
  };

  const getItemQuantity = (productId: string, weight?: string): number => {
    if (weight) {
      const item = items.find((it) => it.product.id === productId && it.selectedWeight === weight);
      return item?.quantity || 0;
    }
    // Aggregate all weights for this product
    return items
      .filter((it) => it.product.id === productId)
      .reduce((sum, it) => sum + it.quantity, 0);
  };

  const subtotal = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.unitPrice || it.product.price) * it.quantity, 0);
  }, [items]);

  const totalItemCount = useMemo(() => {
    return items.reduce((sum, it) => sum + it.quantity, 0);
  }, [items]);

  const deliveryFee = useMemo(() => {
    if (subtotal === 0) return 0;
    if (subtotal >= freeDeliveryThreshold) return 0;
    if (appliedCoupon === 'FREEDEL') return 0;
    return config.standardDeliveryFee;
  }, [subtotal, appliedCoupon, freeDeliveryThreshold]);

  const discount = useMemo(() => {
    if (subtotal === 0) return 0;
    if (appliedCoupon === 'MEAT100') return Math.min(100, Math.round(subtotal * 0.2));
    if (appliedCoupon === 'FREEDEL') return config.standardDeliveryFee;
    return 0;
  }, [appliedCoupon, subtotal]);

  const grandTotal = useMemo(() => {
    if (items.length === 0) return 0;
    return subtotal - discount + deliveryFee + tip + coldBoxDeposit;
  }, [items.length, subtotal, discount, deliveryFee, tip, coldBoxDeposit]);

  const amountNeededForFreeDelivery = useMemo(() => {
    return Math.max(0, freeDeliveryThreshold - subtotal);
  }, [freeDeliveryThreshold, subtotal]);

  const freeDeliveryProgress = useMemo(() => {
    if (subtotal >= freeDeliveryThreshold) return 1;
    return Math.min(1, Math.max(0, subtotal / freeDeliveryThreshold));
  }, [subtotal, freeDeliveryThreshold]);

  const applyCoupon = (code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'MEAT100' || clean === 'FREEDEL') {
      setAppliedCoupon(clean);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        getItemQuantity,
        subtotal,
        coldBoxDeposit: items.length > 0 ? coldBoxDeposit : 0,
        deliveryFee,
        discount,
        tip,
        grandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        setTip,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        freeDeliveryProgress,
        totalItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
