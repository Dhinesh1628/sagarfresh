import React from 'react';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface FloatingBottomCartBarProps {
  onViewCart: () => void;
  isHidden?: boolean;
}

export const FloatingBottomCartBar: React.FC<FloatingBottomCartBarProps> = ({
  onViewCart,
  isHidden = false
}) => {
  const { items, totalItems, subtotal } = useCart();

  if (items.length === 0 || isHidden) {
    return null;
  }

  return (
    <div className="md:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-md transition-all duration-300 animate-slide-up">
      <button
        onClick={onViewCart}
        type="button"
        className="w-full bg-[#d11243] hover:bg-[#b80f3b] text-white px-5 py-3.5 rounded-2xl shadow-[0_8px_30px_rgba(209,18,67,0.38)] flex items-center justify-between gap-4 cursor-pointer transition active:scale-[0.98] border border-rose-400/30"
      >
        {/* Left: Items Count & Subtotal */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0">
            <ShoppingBag className="w-4 h-4 fill-white text-white" />
          </div>
          <div className="text-left">
            <div className="text-xs font-black tracking-wide">
              {totalItems} {totalItems === 1 ? 'ITEM' : 'ITEMS'} &nbsp;|&nbsp; ₹{subtotal}
            </div>
            <div className="text-[10px] text-rose-100 font-medium leading-none mt-0.5">
              Reusable Cold Box included
            </div>
          </div>
        </div>

        {/* Right: View Cart Action */}
        <div className="flex items-center gap-1.5 font-black text-xs uppercase tracking-wider bg-black/20 hover:bg-black/30 px-3.5 py-1.5 rounded-xl transition">
          <span>View Cart</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </button>
    </div>
  );
};
