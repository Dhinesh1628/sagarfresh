import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: Product, 
    quantity?: number, 
    selectedCutStyle?: string,
    selectedWeight?: string,
    unitPrice?: number,
    unitMrp?: number
  ) => void;
  removeItem: (itemIdOrProductId: string) => void;
  updateQuantity: (itemIdOrProductId: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  subtotal: number;
  coolerDeposit: number;
  shippingFee: number;
  couponCode: string | null;
  couponDiscount: number;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  total: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gomeat_cart') || localStorage.getItem('sagar_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  useEffect(() => {
    localStorage.setItem('gomeat_cart', JSON.stringify(items));
  }, [items]);

  const applyCoupon = (code: string): { success: boolean; message: string } => {
    const clean = code.trim().toUpperCase();
    if (!clean) return { success: false, message: 'Please enter a coupon code' };
    
    if (clean === 'MEAT100') {
      if (subtotal < 499) {
        return { success: false, message: 'Add items worth ₹' + (499 - subtotal) + ' more for MEAT100 (Min order ₹499)' };
      }
      setCouponCode('MEAT100');
      setCouponDiscount(100);
      return { success: true, message: '₹100 discount applied with MEAT100!' };
    } else if (clean === 'FIRST20' || clean === 'FIRSTORDER' || clean === 'FIRSTMEAT') {
      if (subtotal < 399) {
        return { success: false, message: 'Add items worth ₹' + (399 - subtotal) + ' more for FIRST20 (Min order ₹399)' };
      }
      const disc = Math.min(120, Math.round(subtotal * 0.20)) || 100;
      setCouponCode(clean);
      setCouponDiscount(disc);
      return { success: true, message: `₹${disc} discount applied on your first order!` };
    } else if (clean === 'FREEDEL') {
      setCouponCode('FREEDEL');
      setCouponDiscount(40);
      return { success: true, message: 'FREE Delivery coupon applied (₹40 saved)!' };
    } else if (clean === 'FRESH50') {
      if (subtotal < 249) {
        return { success: false, message: 'Min order of ₹249 required for FRESH50' };
      }
      setCouponCode('FRESH50');
      setCouponDiscount(50);
      return { success: true, message: '₹50 discount applied with FRESH50!' };
    } else if (clean === 'COLDCHAIN' || clean === 'FRESH100') {
      if (subtotal < 499) {
        return { success: false, message: 'Min order of ₹499 required for this coupon' };
      }
      setCouponCode(clean);
      setCouponDiscount(75);
      return { success: true, message: '₹75 cold-chain bonus discount applied!' };
    } else {
      return { success: false, message: 'Invalid or expired coupon code. Try MEAT100, FIRST20, or FREEDEL.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const addItem = (
    product: Product, 
    quantity = 1, 
    selectedCutStyle?: string,
    selectedWeight?: string,
    unitPrice?: number,
    unitMrp?: number
  ) => {
    const weight = selectedWeight || product.netWeight || product.unit || '500g';
    const cut = selectedCutStyle || product.cutStyle || 'Default';
    const finalPrice = typeof unitPrice === 'number' && unitPrice > 0 ? unitPrice : product.price;
    const finalMrp = typeof unitMrp === 'number' && unitMrp > 0 ? unitMrp : (product.mrp || Math.round(finalPrice * 1.25));
    const itemId = `${product.id}_${weight}_${cut}`.replace(/\s+/g, '_');

    setItems(prev => {
      const existing = prev.find(item => 
        (item.id && item.id === itemId) || 
        (!item.id && item.product.id === product.id && (item.selectedWeight || '500g') === weight)
      );
      if (existing) {
        return prev.map(item =>
          ((item.id && item.id === itemId) || (!item.id && item.product.id === product.id && (item.selectedWeight || '500g') === weight))
            ? { ...item, quantity: item.quantity + quantity, unitPrice: finalPrice, unitMrp: finalMrp, selectedWeight: weight, selectedCutStyle: cut }
            : item
        );
      }
      return [
        ...prev, 
        { 
          id: itemId,
          product, 
          quantity, 
          selectedCutStyle: cut,
          selectedWeight: weight,
          unitPrice: finalPrice,
          unitMrp: finalMrp
        }
      ];
    });
    setIsCartOpen(true);
  };

  const removeItem = (itemIdOrProductId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemIdOrProductId && item.product.id !== itemIdOrProductId));
  };

  const updateQuantity = (itemIdOrProductId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemIdOrProductId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        (item.id === itemIdOrProductId || item.product.id === itemIdOrProductId) ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const subtotal = items.reduce((sum, item) => {
    const price = typeof item.unitPrice === 'number' && item.unitPrice > 0 ? item.unitPrice : item.product.price;
    return sum + price * item.quantity;
  }, 0);
  
  // Refundable cooler box deposit: ₹250 flat per order
  const coolerDeposit = items.length > 0 ? 250 : 0;
  // Free delivery threshold: ₹499 (Swiggy style)
  const shippingFee = items.length === 0 ? 0 : (subtotal >= 499 ? 0 : 40);
  const effectiveDiscount = Math.min(couponDiscount, subtotal);
  const total = Math.max(0, subtotal - effectiveDiscount + coolerDeposit + shippingFee);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        subtotal,
        coolerDeposit,
        shippingFee,
        couponCode,
        couponDiscount: effectiveDiscount,
        applyCoupon,
        removeCoupon,
        total,
        totalItems
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
