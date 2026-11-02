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

  const freeThreshold = 799;
  const diffToFree = Math.max(0, freeThreshold - subtotal);

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
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col text-gray-800">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-10">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-950">Your Fresh Cold Box</h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#d11243] text-[11px] font-bold border border-rose-100">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-semibold mt-0.5">
                <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Express 90 Mins Delivery Dispatched</span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Delivery progress bar */}
          <div className="px-4 py-2.5 bg-rose-50/70 border-b border-rose-100 text-xs">
            {diffToFree > 0 ? (
              <div className="space-y-1.5">
                <p className="text-gray-700 text-[11px]">
                  Add items worth <span className="font-extrabold text-[#d11243]">₹{diffToFree}</span> to get <strong>FREE Express Delivery</strong>
                </p>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#d11243] rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.round((subtotal / freeThreshold) * 100))}%` }}
                  />
                </div>
              </div>
            ) : (
              <p className="text-emerald-800 font-bold flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Free Express Delivery Unlocked (Order &gt; ₹799)</span>
              </p>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 text-xs">
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center text-[#d11243] mb-3">
                  <Zap className="w-8 h-8" />
                </div>
                <p className="font-bold text-gray-900 text-sm">Your cold box is currently empty</p>
                <p className="text-gray-500 mt-1 max-w-xs">Explore farm-fresh tender chicken, coastal caught fish, and premium mutton cuts.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-5 px-5 py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-xl text-xs font-extrabold shadow-sm transition"
                >
                  Browse Fresh Cuts
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.product.id}
                  className="p-3 bg-white border border-gray-200 rounded-xl flex gap-3 items-center shadow-2xs hover:border-gray-300 transition"
                >
                  <img 
                    src={item.product.image || item.product.imageUrl || `/images/products/${item.product.id}.jpg`} 
                    alt={item.product.name}
                    className="w-16 h-16 rounded-xl object-cover border border-gray-100 shrink-0" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/images/products/${item.product.id}.jpg`;
                    }}
                  />

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs font-extrabold text-gray-950 truncate leading-snug">{item.product.name}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span>₹{item.product.price} / {item.product.unit}</span>
                      {item.product.netWeight && (
                        <span className="text-gray-400">• Net: {item.product.netWeight}</span>
                      )}
                    </div>
                    {item.selectedCutStyle && (
                      <div className="inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[10px] font-semibold">
                        Cut: {item.selectedCutStyle}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-xs font-black text-gray-950">
                      ₹{item.product.price * item.quantity}
                    </span>

                    <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-black cursor-pointer"
                        title="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-extrabold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-black cursor-pointer"
                        title="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer & Bill Breakdown */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-white space-y-3.5 shadow-lg">
              
              {/* Thermal Cooler Box Deposit Card (Figma Key Concept) */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl text-xs space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5 font-extrabold text-sky-950">
                    <span className="text-base">❄️</span>
                    <div>
                      <span>ThermalVault™ Eco-Cooler Box</span>
                      <span className="ml-1.5 px-1.5 py-0.2 rounded bg-sky-200/80 text-sky-900 text-[10px] font-bold">
                        100% Refundable
                      </span>
                    </div>
                  </div>
                  <span className="text-emerald-700 font-black">+₹{coolerDeposit}</span>
                </div>

                <p className="text-[11px] text-sky-900 leading-relaxed">
                  Your meat is delivered in a chilled smart cooler with food-grade ice packs maintaining 0°C–4°C.
                </p>

                <button
                  type="button"
                  onClick={() => setShowCoolerFaq(!showCoolerFaq)}
                  className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>{showCoolerFaq ? 'Hide refund details' : 'How does the ₹250 refund work?'}</span>
                  {showCoolerFaq ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {showCoolerFaq && (
                  <div className="border-t border-sky-200/80 pt-2 text-[11px] text-sky-950 space-y-1">
                    <p>• <strong>Option A (Instant Handover):</strong> Unpack into your kitchen and return the box directly to the rider at delivery.</p>
                    <p>• <strong>Option B (Doorstep Pickup):</strong> Keep it as long as you like. When ready, click "Return Box" in the app for doorstep pickup & instant UPI refund.</p>
                  </div>
                )}
              </div>

              {/* Promo Coupon Section */}
              <div className="space-y-2">
                {couponCode ? (
                  <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-extrabold text-emerald-950">{couponCode} applied</span>
                        <span className="text-[11px] text-emerald-700 ml-1.5 font-semibold">
                          (Saved ₹{couponDiscount})
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-red-600 hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={inputCoupon}
                          onChange={(e) => setInputCoupon(e.target.value)}
                          placeholder="Enter Promo Code"
                          className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#d11243] uppercase font-bold"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon()}
                        className="px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-lg cursor-pointer transition"
                      >
                        Apply
                      </button>
                    </div>

                    {/* Quick coupon chips */}
                    <div className="flex gap-1.5 mt-1.5 overflow-x-auto pb-1">
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FRESH50')}
                        className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-700 hover:border-gray-400 shrink-0"
                      >
                        FRESH50 (₹50 OFF)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyCoupon('FIRSTORDER')}
                        className="px-2 py-0.5 rounded border border-gray-200 bg-gray-50 text-[10px] font-bold text-gray-700 hover:border-gray-400 shrink-0"
                      >
                        FIRSTORDER (₹100 OFF)
                      </button>
                    </div>

                    {couponFeedback && (
                      <p className={`text-[11px] mt-1 font-semibold ${
                        couponFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                      }`}>
                        {couponFeedback.text}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs border-t border-gray-100 pt-3">
                <div className="flex justify-between text-gray-600">
                  <span>Cuts Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Refundable Box Deposit:</span>
                  <span className="font-bold text-emerald-700">₹{coolerDeposit} (100% Refundable)</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Promo Discount:</span>
                    <span>-₹{couponDiscount}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Partner Fee:</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold text-gray-950">
                  <span>Total Payable:</span>
                  <span className="text-lg font-black text-[#d11243]">₹{total}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <div className="pt-1 space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition"
                >
                  <span>Select Slot & Address (₹{total})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>0°C–4°C Chilled Guarantee</span>
                  </div>
                  <button
                    onClick={clearCart}
                    className="hover:text-gray-600 cursor-pointer text-gray-400"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
