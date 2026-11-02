import React, { useEffect } from 'react';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
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
    total 
  } = useCart();

  useEffect(() => {
    if (isCartOpen) {
      window.history.pushState({ modal: 'cart' }, '');
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const freeThreshold = 799;
  const diffToFree = Math.max(0, freeThreshold - subtotal);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        onClick={() => setIsCartOpen(false)}
        className="absolute inset-0 bg-black/60 transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-gray-200 shadow-2xl flex flex-col text-gray-800">
          
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div>
              <h2 className="text-sm font-extrabold text-gray-900">Your Fresh Order</h2>
              <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-0.5">
                <Zap className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                <span>Express 90 Mins Delivery</span>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1 rounded text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Delivery progress */}
          <div className="px-4 py-2 bg-rose-50/60 border-b border-rose-100 text-xs">
            {diffToFree > 0 ? (
              <p className="text-gray-700">
                Add items worth <span className="font-bold text-[#d11243]">₹{diffToFree}</span> to get <strong>Free Express Delivery</strong>
              </p>
            ) : (
              <p className="text-emerald-700 font-semibold flex items-center gap-1">
                <span>Free Express Delivery Unlocked (Order &gt; ₹799)</span>
              </p>
            )}
          </div>

          {/* Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400 text-xs">
                <p className="font-bold text-gray-800 text-sm">Your cart is empty</p>
                <p className="text-gray-500 mt-1">Explore farm-fresh chicken, coastal fish, and tender mutton.</p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="mt-4 px-4 py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg text-xs font-bold"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div 
                  key={item.product.id}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex gap-3 items-center shadow-2xs"
                >
                  <img 
                    src={item.product.image || item.product.imageUrl || `/images/products/${item.product.id}.jpg`} 
                    alt={item.product.name}
                    className="w-14 h-14 rounded-lg object-cover border border-gray-100 shrink-0" 
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/images/products/${item.product.id}.jpg`;
                    }}
                  />

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-gray-900 truncate">{item.product.name}</h4>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      ₹{item.product.price} / {item.product.unit}
                    </div>
                    {item.selectedCutStyle && (
                      <div className="text-[10px] text-[#d11243] font-medium mt-0.5">
                        Style: {item.selectedCutStyle}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center border border-gray-200 rounded-md bg-gray-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-black"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-black"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Bill details */}
          {items.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-white space-y-3">
              
              {/* Reusable Cooler Box Deposit Callout */}
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs space-y-1">
                <div className="flex justify-between font-bold text-gray-900">
                  <span>Reusable Cold Box Deposit:</span>
                  <span className="text-emerald-700 font-extrabold">+₹{coolerDeposit} (Refundable)</span>
                </div>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Delivered in an insulated cold box with gel packs. When empty, request 1-click collection in the app to get ₹250 back immediately via UPI.
                </p>
              </div>

              {/* Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Item Subtotal:</span>
                  <span className="font-semibold text-gray-900">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Refundable Box Deposit:</span>
                  <span className="font-semibold text-emerald-700">₹{coolerDeposit}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Partner Fee:</span>
                  <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-bold text-gray-950">
                  <span>Total Payable:</span>
                  <span className="text-base font-black text-[#d11243]">₹{total}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-1 space-y-2">
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onCheckout();
                  }}
                  className="w-full py-3 px-4 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition"
                >
                  Proceed to Checkout (₹{total})
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={clearCart}
                  className="w-full py-1 text-center text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
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
