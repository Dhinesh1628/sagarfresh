import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem } from '../types';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number, selectedCutStyle?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
    
    if (clean === 'FRESH50') {
      setCouponCode('FRESH50');
      setCouponDiscount(50);
      return { success: true, message: '₹50 discount applied with FRESH50!' };
    } else if (clean === 'FIRSTORDER' || clean === 'FIRSTMEAT') {
      if (subtotal < 399) {
        return { success: false, message: 'Min order of ₹399 required for FIRSTORDER' };
      }
      setCouponCode(clean);
      setCouponDiscount(100);
      return { success: true, message: '₹100 discount applied on your first order!' };
    } else if (clean === 'COLDCHAIN' || clean === 'FRESH100') {
      if (subtotal < 499) {
        return { success: false, message: 'Min order of ₹499 required for this coupon' };
      }
      setCouponCode(clean);
      setCouponDiscount(75);
      return { success: true, message: '₹75 cold-chain bonus discount applied!' };
    } else {
      return { success: false, message: 'Invalid or expired coupon code. Try FRESH50 or FIRSTORDER.' };
    }
  };

  const removeCoupon = () => {
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const addItem = (product: Product, quantity = 1, selectedCutStyle?: string) => {
    setItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity, selectedCutStyle: selectedCutStyle || item.selectedCutStyle }
            : item
        );
      }
      return [...prev, { product, quantity, selectedCutStyle: selectedCutStyle || product.cutStyle }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode(null);
    setCouponDiscount(0);
  };

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  
  // Refundable cooler box deposit: ₹250 flat per order
  const coolerDeposit = items.length > 0 ? 250 : 0;
  // Free delivery threshold: ₹799
  const shippingFee = items.length === 0 ? 0 : (subtotal >= 799 ? 0 : 40);
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
