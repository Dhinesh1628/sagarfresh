import React from 'react';
import { CheckCircle2, Clock, PackageCheck, ArrowRight, X, ShieldCheck, MapPin } from 'lucide-react';
import type { Order } from '../types';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewLiveTelemetry: () => void;
  onNavigateToReturns?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewLiveTelemetry,
  onNavigateToReturns
}) => {
  if (!isOpen || !order) return null;

  const estimatedDeliveryTime = order.deliverySlot 
    ? order.deliverySlot 
    : '25 – 35 Mins (Express Cold-Chain Delivery)';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 5. Pop-up background: slightly dark and blurred */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity animate-fade-in" 
      />

      {/* 1. Centered pop-up card */}
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-900 dark:text-gray-100 z-10 animate-scale-up">
        
        {/* 4. Close X button on top-right corner */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close Order Confirmed Pop-up"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebratory Checkmark Icon */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 border-4 border-emerald-50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          {/* 2. Pop-up Title & Subtext */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white tracking-tight">
              Order Confirmed!
            </h2>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1">
              Your fresh meat is on its way.
            </p>
          </div>
        </div>

        {/* 2. Order Details Highlight Card: Order ID & Estimated Delivery Time */}
        <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-orange-50/60 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-slate-800/80 border border-rose-100 dark:border-slate-700 space-y-3.5 shadow-xs">
          
          {/* Order ID */}
          <div className="flex items-center justify-between py-1 border-b border-rose-100/60 dark:border-slate-700/60">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-[#d11243] shrink-0" />
              <span>Order ID</span>
            </span>
            <span className="font-mono text-sm sm:text-base font-extrabold text-gray-950 dark:text-white bg-white/80 dark:bg-slate-900/80 px-2.5 py-0.5 rounded-lg border border-gray-200/80 dark:border-slate-700">
              #{order.id}
            </span>
          </div>

          {/* Estimated Delivery Time */}
          <div className="flex items-center justify-between py-1">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Estimated Delivery Time</span>
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 text-right">
              {estimatedDeliveryTime}
            </span>
          </div>

          {/* Cold Chain Packaging & Delivery Address Snippet */}
          <div className="pt-2 border-t border-rose-100/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>0°C – 4°C FreshSeal™ Box</span>
            </span>
            {order.deliveryAddress && (
              <span className="truncate max-w-[180px] sm:max-w-[220px] text-right font-medium text-gray-700 dark:text-gray-300">
                {order.deliveryAddress}
              </span>
            )}
          </div>
        </div>

        {/* 3. Pop-up Action Buttons: Track Order & Continue Shopping */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Button 1: Track Order */}
          <button
            type="button"
            onClick={onViewLiveTelemetry}
            className="w-full py-3 px-4 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-98 transition duration-150"
          >
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Button 2: Continue Shopping */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm flex items-center justify-center cursor-pointer active:scale-98 transition duration-150"
          >
            <span>Continue Shopping</span>
          </button>
        </div>

      </div>
    </div>
  );
};
