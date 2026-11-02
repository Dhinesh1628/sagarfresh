import React, { useState } from 'react';
import { X, MapPin, Clock, CreditCard, AlertCircle, Zap, ShieldCheck, Check, Calendar, Phone, Home, Briefcase, Building } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { Order } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  selectedCity: string;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  selectedCity
}) => {
  const { items, subtotal, coolerDeposit, shippingFee, couponCode, couponDiscount, total, clearCart } = useCart();
  const { user, refreshUser } = useAuth();

  // Address State
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [flatNo, setFlatNo] = useState('Flat 402, Tower B');
  const [building, setBuilding] = useState('Alpine Eco Apartments');
  const [street, setStreet] = useState('Outer Ring Road, Doddanekkundi');
  const [pincode, setPincode] = useState('560037');
  const [phone, setPhone] = useState(user?.phone || '+91 98765 43210');

  // Delivery Slot State
  const [slotMode, setSlotMode] = useState<'express' | 'scheduled'>('express');
  const [scheduledDay, setScheduledDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [selectedSlotTime, setSelectedSlotTime] = useState('05:30 PM - 08:00 PM (Evening)');

  // Instructions & Payment
  const [instructionTag, setInstructionTag] = useState<string>('Leave with security guard');
  const [customNotes, setCustomNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'cod'>('upi');
  const [upiApp, setUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'other'>('gpay');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const scheduledSlots = [
    { label: 'Morning Fresh Lot', time: '07:00 AM - 09:30 AM' },
    { label: 'Lunch Prep', time: '11:30 AM - 02:00 PM' },
    { label: 'Evening Cook (Popular)', time: '05:30 PM - 08:00 PM' },
    { label: 'Late Dinner Slot', time: '08:00 PM - 10:00 PM' }
  ];

  const deliveryInstructionOptions = [
    'Leave with security guard',
    'Do not ring bell (Sleeping baby)',
    'Call upon arrival at gate',
    'Contactless box drop-off at doorstep'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flatNo.trim() || !building.trim() || !street.trim()) {
      setError('Please provide complete delivery address with flat/house number.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fullAddress = `${flatNo}, ${building}, ${street}, ${selectedCity} - ${pincode} (${addressType.toUpperCase()})`;
      const computedSlot = slotMode === 'express'
        ? '⚡ Express Delivery in 90 Mins (Live EV Chilled Courier)'
        : `${scheduledDay}, ${selectedSlotTime}`;

      const finalNotes = customNotes.trim() 
        ? `${instructionTag}. Notes: ${customNotes.trim()}`
        : instructionTag;

      const paymentLabel = paymentMethod === 'upi'
        ? `UPI (${upiApp.toUpperCase()})`
        : paymentMethod === 'card'
        ? 'Credit / Debit Card'
        : 'Cash / UPI on Delivery (COD)';

      const orderPayload = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          selectedCutStyle: item.selectedCutStyle
        })),
        deliveryAddress: fullAddress,
        deliverySlot: computedSlot,
        deliveryNotes: finalNotes,
        paymentMethod: paymentLabel,
        city: selectedCity,
        couponCode: couponCode || null,
        couponDiscount: couponDiscount || 0
      };

      const newOrder = await api.createOrder(orderPayload);
      clearCart();
      await refreshUser();
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error completing checkout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-2xl shadow-2xl p-5 sm:p-7 text-gray-900 z-10 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-950">Checkout & Delivery Details</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-extrabold border border-emerald-200">
                0°C - 4°C FreshSeal
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Delivering to {selectedCity} in reusable ThermalVault™ cold box
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-6 text-xs">
          
          {/* Section 1: Delivery Slot Picker (Figma Step 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#d11243]" />
                <span>1. Select Delivery Slot</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700">Guaranteed Fresh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Express 90 Mins Card */}
              <div
                onClick={() => setSlotMode('express')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  slotMode === 'express'
                    ? 'border-[#d11243] bg-rose-50/70 ring-1 ring-[#d11243]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs text-gray-950">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>⚡ Express 90 Mins Delivery</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#d11243] text-white px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Packed immediately from local cold hub. Arrives at your doorstep in under 90 minutes.
                </p>
              </div>

              {/* Scheduled Delivery Card */}
              <div
                onClick={() => setSlotMode('scheduled')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  slotMode === 'scheduled'
                    ? 'border-[#d11243] bg-rose-50/70 ring-1 ring-[#d11243]'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-950">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span>📅 Choose Scheduled Slot</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500">Flexible</span>
                </div>
                <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                  Select a convenient morning, afternoon, or evening window for seamless delivery.
                </p>
              </div>
            </div>

            {/* If Scheduled, Show Day & Slot Picker */}
            {slotMode === 'scheduled' && (
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                <div className="flex gap-2">
                  {(['Today', 'Tomorrow'] as const).map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setScheduledDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        scheduledDay === day
                          ? 'bg-gray-950 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {scheduledSlots.map(slot => (
                    <div
                      key={slot.time}
                      onClick={() => setSelectedSlotTime(`${slot.time} (${slot.label})`)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer text-xs transition ${
                        selectedSlotTime.startsWith(slot.time)
                          ? 'border-[#d11243] bg-white font-bold text-gray-950 ring-1 ring-[#d11243]'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold text-gray-900">{slot.time}</div>
                      <div className="text-[10px] text-gray-500">{slot.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Delivery Address (Figma Step 4) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d11243]" />
                <span>2. Delivery Address</span>
              </label>
              <div className="flex gap-1.5">
                {[
                  { id: 'home', label: 'Home', icon: Home },
                  { id: 'work', label: 'Work', icon: Briefcase },
                  { id: 'other', label: 'Other', icon: Building }
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setAddressType(item.id as any)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition ${
                        addressType === item.id
                          ? 'bg-[#d11243] text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 text-[11px] font-bold mb-1">
                  Flat / House / Villa Number
                </label>
                <input
                  type="text"
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  placeholder="e.g. Flat 402, Block B"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#d11243]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-[11px] font-bold mb-1">
                  Apartment / Society / Building Name
                </label>
                <input
                  type="text"
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Alpine Eco Apartments"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#d11243]"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 text-[11px] font-bold mb-1">
                  Street / Area / Landmark
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Doddanekkundi"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#d11243]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-600 text-[11px] font-bold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={selectedCity}
                    disabled
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-200 rounded-lg text-xs font-bold text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 text-[11px] font-bold mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    maxLength={6}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#d11243]"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-600 text-[11px] font-bold mb-1">
                Contact Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium focus:outline-none focus:border-[#d11243]"
                  required
                />
              </div>
            </div>

            {/* Delivery Instructions Chips */}
            <div className="space-y-1.5">
              <label className="block text-gray-600 text-[11px] font-bold">
                Delivery Instructions for Rider
              </label>
              <div className="flex flex-wrap gap-1.5">
                {deliveryInstructionOptions.map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setInstructionTag(opt)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition ${
                      instructionTag === opt
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Payment Method (Figma Step 4) */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-gray-900 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-[#d11243]" />
              <span>3. Payment Method</span>
            </label>

            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'upi', label: 'UPI (GPay/PhonePe)', badge: 'Instant' },
                { id: 'card', label: 'Cards / NetBanking', badge: 'Secure' },
                { id: 'cod', label: 'Cash on Delivery', badge: 'Pay at Door' }
              ].map(opt => (
                <div
                  key={opt.id}
                  onClick={() => setPaymentMethod(opt.id as any)}
                  className={`p-3 rounded-xl border text-center cursor-pointer transition ${
                    paymentMethod === opt.id
                      ? 'border-[#d11243] bg-rose-50/70 ring-1 ring-[#d11243]'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="block font-bold text-xs text-gray-950">{opt.label}</span>
                  <span className="text-[10px] font-extrabold text-[#d11243] mt-0.5 block">{opt.badge}</span>
                </div>
              ))}
            </div>

            {paymentMethod === 'upi' && (
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <span className="block text-[11px] font-bold text-gray-700">Select UPI App:</span>
                <div className="flex gap-2">
                  {[
                    { id: 'gpay', label: 'Google Pay' },
                    { id: 'phonepe', label: 'PhonePe' },
                    { id: 'paytm', label: 'Paytm' }
                  ].map(app => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setUpiApp(app.id as any)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        upiApp === app.id
                          ? 'bg-emerald-700 text-white shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      {app.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Final Summary & Cold Box Deposit Transparency */}
          <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal:</span>
              <span className="font-bold text-gray-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>ThermalVault Cooler Deposit:</span>
              <span className="font-bold text-emerald-700">₹{coolerDeposit} (100% Refundable)</span>
            </div>
            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>Coupon ({couponCode}):</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee:</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between items-center text-sm font-black text-gray-950">
              <span>Final Total:</span>
              <span className="text-lg font-black text-[#d11243]">₹{total}</span>
            </div>
          </div>

          {/* Guarantee Pill */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Freshness Guarantee:</strong> 0°C to 4°C continuous cold-chain monitor. If temperature exceeds 4°C at delivery, 100% money back guaranteed.
            </span>
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Packing Cold Box & Placing Order...</span>
            ) : (
              <span>Place Order • ₹{total}</span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
