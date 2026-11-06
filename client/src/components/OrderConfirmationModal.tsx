import React, { useState } from 'react';
import { CheckCircle2, Zap, Thermometer, ShieldCheck, ArrowRight, RefreshCw, Phone, Clock, RotateCcw, X, MapPin } from 'lucide-react';
import type { Order } from '../types';
import { api } from '../api';

interface OrderConfirmationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onViewLiveTelemetry: () => void;
  onNavigateToReturns: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  order,
  isOpen,
  onClose,
  onViewLiveTelemetry,
  onNavigateToReturns
}) => {
  const [currentOrder, setCurrentOrder] = useState<Order | null>(order);
  const [simulatingSensor, setSimulatingSensor] = useState(false);

  // Synchronize when order prop updates
  React.useEffect(() => {
    if (order) {
      setCurrentOrder(order);
    }
  }, [order]);

  if (!isOpen || !currentOrder) return null;

  const handleSimulateProbe = async () => {
    setSimulatingSensor(true);
    try {
      const updated = await api.simulateTemp(currentOrder.id);
      setCurrentOrder(updated);
    } catch (err) {
      console.error('Probe simulation failed:', err);
    } finally {
      setSimulatingSensor(false);
    }
  };

  const stages = [
    { title: 'Order Confirmed', subtitle: 'Order received' },
    { title: "Preparing Order", subtitle: 'Freshly packed' },
    { title: 'Out for Delivery', subtitle: 'On the way' },
    { title: 'Delivered', subtitle: 'At your door' }
  ];

  const currentStageIndex = currentOrder.status === 'Delivered' 
    ? 3 
    : currentOrder.status === 'Out for Delivery' 
    ? 2 
    : 1;

  const liveTemp = currentOrder.liveTemp ?? 2.1;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-8 text-gray-900 dark:text-gray-100 z-10 max-h-[92vh] overflow-y-auto">
        
        {/* Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Celebratory Banner */}
        <div className="text-center space-y-2 pb-5 border-b border-gray-100 dark:border-slate-800">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border-4 border-emerald-50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 tracking-wide">
              Payment Successful! Your order is confirmed.
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-gray-950 dark:text-white mt-2">
              Order #{currentOrder.id} Placed!
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-md mx-auto">
              Your items are packed in a chilled cold box (Box ID: <strong>{currentOrder.coolerId}</strong>) to stay fresh.
            </p>
          </div>
        </div>

        {/* Live Cold Box Status Card */}
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-slate-900 dark:bg-slate-950 text-white shadow-xl space-y-4 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Cold Box Status
              </span>
            </div>
            <button
              onClick={handleSimulateProbe}
              disabled={simulatingSensor}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-gray-300 hover:text-white flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${simulatingSensor ? 'animate-spin' : ''}`} />
              <span>{simulatingSensor ? 'Checking...' : 'Refresh Temperature'}</span>
            </button>
          </div>

          {/* Temperature & Cold Status readout */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-800/80 dark:bg-slate-900/90 p-3.5 rounded-xl border border-slate-700 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase text-gray-400 font-bold block">Box Temperature</span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {liveTemp.toFixed(1)}°C
                </span>
                <span className="text-[10px] text-gray-400">Safe</span>
              </div>
              <span className="text-[10px] text-emerald-400/90 font-semibold">0°C - 4°C Chilled Fresh</span>
            </div>

            <div>
              <span className="text-[10px] uppercase text-gray-400 font-bold block">Box Seal</span>
              <span className="text-sm font-extrabold text-white mt-1 block">Safely Sealed</span>
              <span className="text-[10px] text-gray-400">Box: {currentOrder.coolerId}</span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[10px] uppercase text-gray-400 font-bold block">Arrives By</span>
              <span className="text-sm font-extrabold text-amber-400 mt-1 block">⚡ 28 - 35 mins</span>
              <span className="text-[10px] text-gray-400 truncate block">{currentOrder.deliverySlot}</span>
            </div>
          </div>

          {/* Stepper */}
          <div className="pt-2">
            <div className="grid grid-cols-4 gap-1 relative text-center">
              {stages.map((stg, idx) => {
                const isPassed = idx <= currentStageIndex;
                const isCurrent = idx === currentStageIndex;
                return (
                  <div key={stg.title} className="space-y-1 relative">
                    <div className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center text-[10px] font-black transition ${
                      isPassed 
                        ? 'bg-emerald-500 text-slate-950 ring-2 ring-emerald-300' 
                        : 'bg-slate-800 text-gray-500'
                    }`}>
                      {idx + 1}
                    </div>
                    <div className={`text-[10px] font-bold leading-tight ${isCurrent ? 'text-emerald-400' : isPassed ? 'text-white' : 'text-gray-500'}`}>
                      {stg.title}
                    </div>
                    <div className="text-[9px] text-gray-400 hidden sm:block">
                      {stg.subtitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Courier & Delivery Partner Details */}
        <div className="mt-4 p-3.5 bg-gray-50 dark:bg-slate-800/70 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 uppercase font-bold">Delivery Partner</span>
            <div className="font-bold text-gray-950 dark:text-white">{currentOrder.deliveryExecutive || 'Ramesh Kumar (Delivery Partner)'}</div>
            <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <span>Trained for safe handling & cold delivery</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => alert('Calling your delivery partner...')}
            className="px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-slate-700 hover:bg-black dark:hover:bg-slate-600 text-white text-[11px] font-bold flex items-center gap-1.5 transition"
          >
            <Phone className="w-3 h-3" />
            <span>Call Partner</span>
          </button>
        </div>

        {/* Delivery Address & Order Items Breakdown */}
        <div className="mt-4 p-3.5 bg-gray-50 dark:bg-slate-800/70 rounded-2xl border border-gray-200 dark:border-slate-700 text-xs space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[#d11243] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-gray-900 dark:text-white">Delivering To:</span>
              <p className="text-gray-600 dark:text-gray-300 mt-0.5 leading-snug">{currentOrder.deliveryAddress}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between font-semibold text-gray-700 dark:text-gray-300">
            <span>{currentOrder.items.length} Items</span>
            <span>Paid: <strong className="text-gray-950 dark:text-white font-black">₹{currentOrder.total}</strong></span>
          </div>
        </div>

        {/* ₹250 Refundable Cold Box Callout */}
        <div className="mt-4 p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 text-xs space-y-2.5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-1.5 font-black text-sky-950 dark:text-sky-200">
              <RotateCcw className="w-4 h-4 text-sky-700 dark:text-sky-400" />
              <span>₹250 Cold Box Refund</span>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800">
              ₹250 Protected
            </span>
          </div>
          <p className="text-[11px] text-sky-900 dark:text-sky-300 leading-relaxed">
            Your order comes in a reusable cold box. Return the box after delivery and get ₹250 back once it's checked.
          </p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => {
                onClose();
                onNavigateToReturns();
              }}
              className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <span>Return Box for ₹250 Refund</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              onClose();
              onViewLiveTelemetry();
            }}
            className="flex-1 py-3 px-4 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
          >
            <span>Track Your Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          
          <button
            onClick={onClose}
            className="py-3 px-5 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 font-bold text-xs transition cursor-pointer"
          >
            Shop Now
          </button>
        </div>

      </div>
    </div>
  );
};
