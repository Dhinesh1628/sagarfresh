import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Zap, Tag, CheckCircle2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    clearCart, 
    isCartOpen, 
    setIsCartOpen, 
    subtotal, 
    coolerDeposit, 
    shippingFee, 
    couponCode,
    couponDiscount,
    applyCoupon,
    removeCoupon,
    total 
  } = useCart();

  const [inputCoupon, setInputCoupon] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showCoolerFaq, setShowCoolerFaq] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      window.history.pushState({ modal: 'cart' }, '');
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeThreshold = 499;
  const diffToFree = Math.max(0, freeThreshold - subtotal);

  const availableCoupons = [
    {
      code: 'MEAT100',
      title: 'Flat ₹100 OFF',
      desc: 'On orders above ₹499. Save ₹100 instantly.',
      minOrder: 499,
      badge: 'Bestseller'
    },
    {
      code: 'FREEDEL',
      title: 'FREE Delivery',
      desc: 'Waives ₹40 courier delivery fee on your box.',
      minOrder: 0,
      badge: 'Zero Delivery Fee'
    },
    {
      code: 'FIRST20',
      title: '20% OFF (Up to ₹120)',
      desc: 'Welcome special on your first fresh meat order.',
      minOrder: 399,
      badge: 'New User'
    },
    {
      code: 'FRESH50',
      title: 'Flat ₹50 OFF',
      desc: 'On orders above ₹249 on chicken and fish cuts.',
      minOrder: 249,
      badge: 'Quick Saver'
    }
  ];

  const handleApplyCoupon = (codeToApply?: string) => {
    const code = (codeToApply || inputCoupon).trim();
    if (!code) {
      setCouponFeedback({ type: 'error', text: 'Enter a valid coupon code' });
      return;
    }
    const res = applyCoupon(code);
    if (res.success) {
      setCouponFeedback({ type: 'success', text: res.message });
      setInputCoupon('');
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponFeedback(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-slate-900 border-l border-gray-200 dark:border-slate-800 shadow-2xl flex flex-col text-gray-800 dark:text-gray-100 h-full">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-950 dark:text-white">My Cart</h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/50 text-[#d11243] dark:text-rose-400 text-[11px] font-bold border border-rose-100 dark:border-rose-900/60">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
                <span>Express 90-Min Delivery</span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Swiggy Instamart Real-Time Free Delivery Progress Bar */}
          <div className="px-4 py-3 bg-gradient-to-r from-rose-50/90 via-amber-50/80 to-emerald-50/90 dark:from-slate-850 dark:to-slate-800 border-b border-rose-100/70 dark:border-slate-700/80 text-xs shrink-0">
            {diffToFree > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-800 dark:text-gray-200 font-bold flex items-center gap-1.5">
                    <span>🚚</span>
                    <span>Add items worth <strong className="text-[#d11243] dark:text-rose-400 font-black">₹{diffToFree}</strong> more to get <strong>FREE Delivery!</strong></span>
                  </span>
                  <span className="text-[10px] font-black text-gray-500 dark:text-gray-400">
                    {Math.min(100, Math.round((subtotal / freeThreshold) * 100))}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200/90 dark:bg-slate-700 rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#d11243] via-amber-500 to-emerald-500 rounded-full transition-all duration-500 shadow-2xs"
                    style={{ width: `${Math.min(100, Math.round((subtotal / freeThreshold) * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-emerald-800 dark:text-emerald-300 font-black flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span>🎉 You unlocked FREE Delivery! (Saved ₹40)</span>
                </p>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-300 dark:border-emerald-700">
                  FREE
                </span>
              </div>
            )}
          </div>

          {/* Fully Scrollable Cart Body (Items + Cold Box Card + Coupons + Bill Breakdown) */}
          <div className="flex-1 overflow-y-auto min-h-0 p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 dark:text-gray-500 text-xs">
                <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center text-[#d11243] dark:text-rose-400 mb-3">
                  <Zap className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-900 dark:text-white text-sm">Your Cart is Empty</p>
                <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-xs">Add fresh chicken, mutton, or fish to get started.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-xl text-xs font-extrabold shadow-sm transition cursor-pointer"
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="space-y-3">
                  {items.map((item) => {
                    const itemKey = item.id || `${item.product.id}_${item.selectedWeight || '500g'}`;
                    const itemPrice = typeof item.unitPrice === 'number' && item.unitPrice > 0 ? item.unitPrice : item.product.price;
                    const itemMrp = typeof item.unitMrp === 'number' && item.unitMrp > 0 ? item.unitMrp : item.product.mrp;
                    const savings = itemMrp && itemMrp > itemPrice ? (itemMrp - itemPrice) * item.quantity : 0;
                    const packWeight = item.selectedWeight || item.product.netWeight || item.product.unit || '500g';

                    return (
                      <div 
                        key={itemKey}
                        className="p-3 bg-white dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 rounded-xl flex gap-3 items-center shadow-2xs hover:border-gray-300 dark:hover:border-slate-600 transition"
                      >
                        <img 
                          src={item.product.image || item.product.imageUrl || `/images/products/${item.product.id}.jpg`} 
                          alt={item.product.name}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-100 dark:border-slate-700 shrink-0" 
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `/images/products/${item.product.id}.jpg`;
                          }}
                        />

                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-extrabold text-gray-950 dark:text-white truncate leading-snug">{item.product.name}</h4>
                          <div className="flex items-center gap-2 text-[11px] text-gray-500 dark:text-gray-400">
                            <span className="font-bold text-gray-900 dark:text-gray-200">₹{itemPrice}</span>
                            <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/70 text-[#d11243] dark:text-rose-400 font-extrabold text-[10px]">
                              {packWeight}
                            </span>
                            {itemMrp && itemMrp > itemPrice && (
                              <span className="text-[10px] text-gray-400 line-through">₹{itemMrp}</span>
                            )}
                          </div>
                          {item.selectedCutStyle && (
                            <div className="inline-block px-2 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-200 text-[10px] font-semibold">
                              Cut: {item.selectedCutStyle}
                            </div>
                          )}
                          {savings > 0 && (
                            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              Save ₹{savings} vs market
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                          <span className="text-xs font-black text-gray-950 dark:text-white">
                            ₹{itemPrice * item.quantity}
                          </span>

                          <div className="flex items-center border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/60">
                            <button
                              onClick={() => updateQuantity(item.id || item.product.id, item.quantity - 1)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                              title="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-extrabold text-gray-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id || item.product.id, item.quantity + 1)}
                              className="p-1 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white cursor-pointer"
                              title="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            onClick={() => removeItem(item.id || item.product.id)}
                            className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition cursor-pointer"
                            title="Remove item"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Reusable Cold Box Deposit Card */}
                <div className="p-3.5 bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 rounded-xl text-xs space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-1.5 font-extrabold text-sky-950 dark:text-sky-200">
                      <span className="text-base">❄️</span>
                      <div>
                        <span>Reusable Cold Box</span>
                        <span className="ml-1.5 px-1.5 py-0.2 rounded bg-sky-200/80 dark:bg-sky-900/80 text-sky-900 dark:text-sky-300 text-[10px] font-bold">
                          100% Refundable
                        </span>
                      </div>
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-black">+₹{coolerDeposit}</span>
                  </div>

                  <p className="text-[11px] text-sky-900 dark:text-sky-300 leading-relaxed">
                    Your order comes in a reusable cold box. Return the box after delivery and get ₹250 back once it's checked.
                  </p>

                  <button
                    type="button"
                    onClick={() => setShowCoolerFaq(!showCoolerFaq)}
                    className="text-[11px] font-bold text-sky-700 dark:text-sky-400 hover:text-sky-900 dark:hover:text-sky-200 flex items-center gap-1 cursor-pointer"
                  >
                    <span>{showCoolerFaq ? 'Hide refund details' : 'How does the ₹250 refund work?'}</span>
                    {showCoolerFaq ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {showCoolerFaq && (
                    <div className="border-t border-sky-200/80 dark:border-sky-800/80 pt-2 text-[11px] text-sky-950 dark:text-sky-200 space-y-1">
                      <p>• <strong>Give it back to the rider:</strong> Unpack your items and hand the box right back.</p>
                      <p>• <strong>Return it later:</strong> Request a pickup anytime from the app to get ₹250 sent to your bank or wallet.</p>
                    </div>
                  )}
                </div>

                {/* Swiggy Style 1-Click Coupon Cards (No typing codes) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-extrabold text-xs text-gray-900 dark:text-white">
                      <Tag className="w-3.5 h-3.5 text-[#d11243]" />
                      <span>Offers & Coupons</span>
                    </div>
                    {couponCode && (
                      <button
                        type="button"
                        onClick={handleRemoveCoupon}
                        className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                      >
                        Remove ({couponCode})
                      </button>
                    )}
                  </div>

                  {/* 1-Click Coupon Cards List */}
                  <div className="space-y-2">
                    {availableCoupons.map((c) => {
                      const isApplied = couponCode === c.code;
                      return (
                        <div
                          key={c.code}
                          className={`p-2.5 rounded-xl border transition flex items-center justify-between gap-2.5 ${
                            isApplied
                              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 shadow-2xs'
                              : 'bg-gray-50/80 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                          }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-black text-xs text-gray-950 dark:text-white font-mono tracking-wide">
                                {c.code}
                              </span>
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 font-extrabold text-[9px]">
                                {c.title}
                              </span>
                            </div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                              {c.desc}
                            </p>
                          </div>

                          {isApplied ? (
                            <div className="flex items-center gap-1 text-[11px] font-black text-emerald-700 dark:text-emerald-400 shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Applied</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleApplyCoupon(c.code)}
                              className="px-3 py-1 rounded-lg text-xs font-black uppercase cursor-pointer transition shrink-0 bg-white dark:bg-slate-900 border border-[#d11243] text-[#d11243] hover:bg-[#d11243] hover:text-white shadow-2xs active:scale-95"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Manual Code Input Option */}
                  <div className="pt-1">
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Or enter coupon code"
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#d11243] uppercase font-bold text-gray-900 dark:text-white"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-1.5 bg-gray-900 dark:bg-rose-600 hover:bg-black dark:hover:bg-rose-700 text-white text-xs font-bold rounded-lg cursor-pointer transition shrink-0"
                      >
                        Apply
                      </button>
                    </div>

                    {couponFeedback && (
                      <p className={`text-[11px] mt-1 font-semibold ${
                        couponFeedback.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {couponFeedback.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* Detailed Bill Breakdown */}
                <div className="space-y-1.5 text-xs border-t border-gray-100 dark:border-slate-800 pt-3">
                  <div className="font-extrabold text-xs text-gray-900 dark:text-white mb-1">
                    Bill Details
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Item Total:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Cold Box Deposit:</span>
                    <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{coolerDeposit} (100% Refundable)</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>Coupon Discount ({couponCode}):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>Delivery Fee:</span>
                    <span>{shippingFee === 0 ? <strong className="text-emerald-700 dark:text-emerald-400">FREE</strong> : `₹${shippingFee}`}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sticky Checkout Bottom Bar (ALWAYS visible and clickable on any screen height) */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.08)] shrink-0 z-20">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-bold block">To Pay</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-xl font-black text-gray-950 dark:text-white">₹{total}</span>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Includes ₹250 refund</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="py-3 px-6 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition active:scale-[0.98]"
                >
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-400 pt-0.5 border-t border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Chilled 0°C–4°C Safe Delivery</span>
                </div>
                <button
                  onClick={clearCart}
                  className="hover:text-red-600 dark:hover:text-red-400 cursor-pointer text-gray-400 font-semibold text-[10px]"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
