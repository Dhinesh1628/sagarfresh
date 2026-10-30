import React, { useState } from 'react';
import { X, MapPin, Clock, CreditCard, AlertCircle, Zap } from 'lucide-react';
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
  const { items, subtotal, coolerDeposit, shippingFee, total, clearCart } = useCart();
  const { user, refreshUser } = useAuth();

  const [address, setAddress] = useState(user?.address || 'Flat 402, Alpine Eco Apartments, Doddanekkundi, Marathahalli');
  const [pincode, setPincode] = useState('560037');
  const [deliverySlot, setDeliverySlot] = useState('Today, Express Delivery in 90 Mins');
  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm)');
  const [notes, setNotes] = useState('Leave with building security or ring Flat 402 doorbell.');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      setError('Please provide a complete delivery address with flat number and street name');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const fullAddress = `${address}, ${selectedCity} - ${pincode}`;
      const orderPayload = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        deliveryAddress: fullAddress,
        deliverySlot,
        deliveryNotes: notes,
        paymentMethod,
        city: selectedCity
      };

      const newOrder = await api.createOrder(orderPayload);
      clearCart();
      await refreshUser();
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error completing checkout');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60" />

      <div className="relative w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-2xl p-6 text-gray-800 z-10 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div>
            <h2 className="text-base font-extrabold text-gray-950">Confirm Fresh Delivery</h2>
            <p className="text-xs text-gray-500">Delivering in {selectedCity} in FreshSeal™ Reusable Box</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-gray-700 font-bold mb-1">
                Delivery Address (Flat / House / Apartment / Street)
              </label>
              <input 
                type="text" 
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                placeholder="Flat / Building Name, Street"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-bold mb-1">
                PIN Code
              </label>
              <input 
                type="text" 
                required
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
                placeholder="560037"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#d11243]" />
                <span>Delivery Window</span>
              </label>
              <select
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
              >
                <option value="Today, Express Delivery in 90 Mins">⚡ Today, Express in 90 Mins</option>
                <option value="Tomorrow Morning, 7:00 AM - 9:00 AM">Tomorrow Morning, 7:00 AM - 9:00 AM</option>
                <option value="Tomorrow Evening, 5:00 PM - 8:00 PM">Tomorrow Evening, 5:00 PM - 8:00 PM</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 font-bold mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#d11243]" />
                <span>Payment Mode</span>
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
              >
                <option value="UPI (Google Pay / PhonePe / Paytm)">UPI (Google Pay / PhonePe / Paytm)</option>
                <option value="Net Banking (HDFC / ICICI / SBI)">Net Banking (HDFC / ICICI / SBI)</option>
                <option value="Credit / Debit Card">Credit / Debit Card</option>
                <option value="Cash on Delivery">Cash on Delivery</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-gray-700 font-bold mb-1">
              Delivery Notes (Gate instructions / landmarks)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus:bg-white focus:outline-none focus:border-[#d11243]"
              placeholder="e.g. Ring flat doorbell"
            />
          </div>

          {/* Reusable Cooler Box Deposit Callout */}
          <div className="p-3.5 rounded-lg bg-rose-50/60 border border-rose-100 space-y-1">
            <div className="flex justify-between font-bold text-gray-900">
              <span className="text-gray-900">Reusable Cold-Gel Box Deposit:</span>
              <span className="text-emerald-800 font-extrabold">₹250 (100% Refundable)</span>
            </div>
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Zero single-use thermocol. Your meat & seafood arrives in a food-grade insulated cold box with gel packs. Tap "Box Returns" anytime for free doorstep collection and receive ₹250 back to your UPI ID.
            </p>
          </div>

          {/* Breakdown */}
          <div className="bg-gray-50 p-3.5 rounded-lg border border-gray-200 space-y-1.5">
            <div className="flex justify-between text-gray-600">
              <span>Items Subtotal ({items.length} items):</span>
              <span className="font-semibold text-gray-900">₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Refundable Box Deposit:</span>
              <span className="font-semibold text-emerald-800">+₹{coolerDeposit}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Express Delivery Fee:</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${shippingFee}`}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-950 pt-2 border-t border-gray-200 text-sm">
              <span>Total Amount Payable:</span>
              <span className="text-[#d11243] text-base font-black">₹{total}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs transition disabled:opacity-50"
          >
            {isSubmitting ? 'Confirming Dispatch...' : `Place Express Order (₹${total})`}
          </button>
        </form>

      </div>
    </div>
  );
};
