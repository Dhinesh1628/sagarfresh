import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  CreditCard, 
  AlertCircle, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Phone, 
  Home, 
  Briefcase, 
  Building,
  CheckCircle2,
  Lock,
  ArrowRight,
  RefreshCw,
  Info,
  Banknote,
  Wallet
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import type { Order, DeliveryAddress } from '../types';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
  selectedCity: string;
  currentAddress?: DeliveryAddress | null;
  onOpenLocationModal?: () => void;
}

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
  selectedCity,
  currentAddress,
  onOpenLocationModal
}) => {
  const { items, subtotal, coolerDeposit, shippingFee, couponCode, couponDiscount, total, clearCart } = useCart();
  const { user, refreshUser } = useAuth();

  // Contact Info State
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Address State - pre-filled from customer's current selected address or user profile
  const [addressType, setAddressType] = useState<'home' | 'work' | 'other'>(
    (currentAddress?.tag?.toLowerCase() as any) || 'home'
  );
  const [flatNo, setFlatNo] = useState(currentAddress?.flatNo || '');
  const [building, setBuilding] = useState(currentAddress?.building || '');
  const [street, setStreet] = useState(
    currentAddress ? [currentAddress.street, currentAddress.area].filter(Boolean).join(', ') : ''
  );
  const [city, setCity] = useState(currentAddress?.city || selectedCity || 'Bengaluru');
  const [state, setState] = useState(currentAddress?.state || 'Karnataka');
  const [pincode, setPincode] = useState(currentAddress?.pincode || '');

  // Sync with currentAddress when it changes
  useEffect(() => {
    if (currentAddress) {
      if (currentAddress.flatNo) setFlatNo(currentAddress.flatNo);
      if (currentAddress.building) setBuilding(currentAddress.building);
      if (currentAddress.street || currentAddress.area) {
        setStreet([currentAddress.street, currentAddress.area].filter(Boolean).join(', '));
      }
      if (currentAddress.city) setCity(currentAddress.city);
      if (currentAddress.state) setState(currentAddress.state);
      if (currentAddress.pincode) setPincode(currentAddress.pincode);
      if (currentAddress.tag) setAddressType(currentAddress.tag.toLowerCase() as any);
    }
  }, [currentAddress]);

  // Delivery Slot State
  const [slotMode, setSlotMode] = useState<'express' | 'scheduled'>('express');
  const [scheduledDay, setScheduledDay] = useState<'Today' | 'Tomorrow'>('Today');
  const [selectedSlotTime, setSelectedSlotTime] = useState('05:30 PM - 08:00 PM (Evening)');

  // Instructions & Payment Method
  const [instructionTag, setInstructionTag] = useState<string>('Leave with security guard');
  const [customNotes, setCustomNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'cod'>('razorpay');

  // GoMeat In-App Vault Wallet State & Calculations
  const [useWallet, setUseWallet] = useState<boolean>(true);
  const userWalletBalance = user?.walletBalance || 0;
  const isWalletEligible = userWalletBalance > 0;
  const walletDeduction = (useWallet && isWalletEligible) ? Math.min(userWalletBalance, total) : 0;
  const finalPayable = Math.max(0, total - walletDeduction);
  const isFullyWalletPaid = walletDeduction > 0 && finalPayable === 0;

  // Processing & Verification States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentFailedModal, setPaymentFailedModal] = useState<{ reason: string; orderId?: string } | null>(null);

  // Sync with user data if user logs in or profile changes
  useEffect(() => {
    if (user) {
      if (!fullName) setFullName(user.name || '');
      if (!email) setEmail(user.email || '');
      if (user.phone) setPhone(user.phone);
      if (user.address) setStreet(user.address);
      if (user.city) setCity(user.city);
    }
  }, [user]);

  // Load Razorpay Checkout Script dynamically
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (!isOpen) return null;

  const scheduledSlots = [
    { label: 'Morning Fresh Lot', time: '07:00 AM - 09:30 AM' },
    { label: 'Lunch Prep', time: '11:30 AM - 02:00 PM' },
    { label: 'Evening Cook (Popular)', time: '05:30 PM - 08:00 PM' },
    { label: 'Late Dinner Slot', time: '08:00 PM - 10:00 PM' }
  ];

  const deliveryInstructionOptions = [
    'Leave with security guard',
    'Do not ring bell (Baby sleeping)',
    'Call upon arrival at gate',
    'Contactless box drop-off at doorstep'
  ];

  const validateForm = (): boolean => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address for invoice and tracking');
      return false;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    if (!flatNo.trim() || !building.trim() || !street.trim()) {
      setError('Please complete the delivery address with flat/house number and building name');
      return false;
    }
    const cleanPin = pincode.replace(/[^0-9]/g, '');
    if (cleanPin.length !== 6) {
      setError('Please enter a valid 6-digit postal pincode');
      return false;
    }
    return true;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    setPaymentFailedModal(null);

    const fullAddress = `${flatNo}, ${building}, ${street}, ${city}, ${state} - ${pincode} (${addressType.toUpperCase()})`;
    const computedSlot = slotMode === 'express'
      ? '⚡ Express Delivery in 90 Mins (Live EV Chilled Courier)'
      : `${scheduledDay}, ${selectedSlotTime}`;

    const finalNotes = customNotes.trim() 
      ? `${instructionTag}. Notes: ${customNotes.trim()}`
      : instructionTag;

    const addressDetails = {
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      flatNo: flatNo.trim(),
      building: building.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      instructions: finalNotes
    };

    const orderPayload = {
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        selectedCutStyle: item.selectedCutStyle
      })),
      deliveryAddress: fullAddress,
      addressDetails,
      deliverySlot: computedSlot,
      deliveryNotes: finalNotes,
      city,
      couponCode: couponCode || null,
      couponDiscount: couponDiscount || 0,
      paymentMethod,
      useWallet: useWallet && isWalletEligible
    };

    try {
      // 1. Create Order on backend (server calculates prices using MongoDB product records)
      const res = await api.createPaymentOrder(orderPayload);

      // A1) Handle 100% Wallet Paid (₹0 out-of-pocket, 1-second instant confirmation bypassing gateway!)
      if (res.isWalletPaid) {
        clearCart();
        await refreshUser();
        onOrderSuccess(res.order);
        onClose();
        return;
      }

      // A2) Handle Cash on Delivery (with or without partial wallet deduction)
      if (paymentMethod === 'cod' || res.isCod) {
        clearCart();
        await refreshUser();
        onOrderSuccess(res.order);
        onClose();
        return;
      }

      // B) Handle Razorpay Online Payment
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded && !res.isDemoKey) {
        throw new Error('Failed to load secure Razorpay checkout gateway. Please check your connection.');
      }

      // If Razorpay window exists and real keys, open Standard Checkout Modal
      if (window.Razorpay && !res.isDemoKey) {
        const options = {
          key: res.keyId,
          amount: res.amount,
          currency: res.currency,
          name: 'GoMeat',
          description: `Order #${res.orderNumber} - 0°C to 4°C Fresh Cuts`,
          image: '/images/logo.png',
          order_id: res.razorpayOrderId,
          prefill: {
            name: fullName,
            email,
            contact: phone
          },
          theme: {
            color: '#d11243'
          },
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              setPaymentFailedModal({
                reason: 'Payment was cancelled or closed before completion. You can retry with Razorpay or switch to Cash on Delivery.',
                orderId: res.orderId
              });
            }
          },
          handler: async (response: any) => {
            // NEVER trust frontend callbacks alone! Verify actual signature and capture status with backend!
            setVerifyingPayment(true);
            try {
              const verifyRes = await api.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderId: res.orderId
              });

              if (verifyRes.success) {
                clearCart();
                await refreshUser();
                onOrderSuccess(verifyRes.order);
                onClose();
              } else {
                throw new Error(verifyRes.message || 'Signature verification failed.');
              }
            } catch (vErr: any) {
              setPaymentFailedModal({
                reason: vErr.message || 'Payment signature could not be verified by GoMeat security server.',
                orderId: res.orderId
              });
            } finally {
              setVerifyingPayment(false);
              setIsSubmitting(false);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', (resp: any) => {
          setIsSubmitting(false);
          setPaymentFailedModal({
            reason: resp.error?.description || 'Your bank declined the transaction. Please try another card, UPI ID, or netbanking account.',
            orderId: res.orderId
          });
        });
        rzp.open();
      } else {
        // Test Simulation Mode (when running test mode without live banking credentials)
        setVerifyingPayment(true);
        const testPaymentId = `pay_test_${Math.floor(10000000 + Math.random() * 90000000)}`;
        
        // Simulating realistic payment gateway verification delay (800ms)
        setTimeout(async () => {
          try {
            const verifyRes = await api.verifyPayment({
              razorpay_order_id: res.razorpayOrderId,
              razorpay_payment_id: testPaymentId,
              razorpay_signature: 'VALID_RAZORPAY_TEST_SIGNATURE',
              orderId: res.orderId,
              isTestSimulation: true
            });

            clearCart();
            await refreshUser();
            onOrderSuccess(verifyRes.order);
            onClose();
          } catch (tErr: any) {
            setPaymentFailedModal({
              reason: tErr.message || 'Payment verification simulation encountered an issue.',
              orderId: res.orderId
            });
          } finally {
            setVerifyingPayment(false);
            setIsSubmitting(false);
          }
        }, 800);
      }

    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Error processing checkout. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity" />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 text-gray-900 dark:text-gray-100 z-10 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-gray-950 dark:text-white">Secure Checkout & Delivery Details</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 text-[10px] font-extrabold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" />
                <span>256-Bit SSL Encrypted</span>
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Delivering to {city} in reusable ThermalVault™ cold box maintaining 0°C–4°C
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Callout */}
        {error && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Payment Failed / Retry Callout */}
        {paymentFailedModal && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-extrabold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Payment Not Completed</span>
            </div>
            <p className="text-amber-800 dark:text-amber-300 text-[11px] leading-relaxed">
              {paymentFailedModal.reason}
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleCheckoutSubmit}
                className="px-3.5 py-1.5 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs flex items-center gap-1.5 hover:opacity-90 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Payment</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaymentMethod('cod');
                  setPaymentFailedModal(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 hover:bg-emerald-800 cursor-pointer"
              >
                <Banknote className="w-3.5 h-3.5" />
                <span>Switch to Cash on Delivery</span>
              </button>
            </div>
          </div>
        )}

        {/* Verifying Overlay */}
        {verifyingPayment && (
          <div className="my-6 p-6 rounded-2xl bg-slate-900 text-white text-center space-y-3">
            <div className="w-12 h-12 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mx-auto" />
            <h4 className="font-extrabold text-sm text-white">Verifying Payment Signature with Razorpay...</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Confirming transaction status with the banking network. Please do not close or refresh this tab.
            </p>
          </div>
        )}

        <form onSubmit={handleCheckoutSubmit} className="mt-5 space-y-6 text-xs">
          
          {/* Section 1: Customer Contact Details */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase text-gray-900 dark:text-white flex items-center gap-1.5">
              <span>1. Customer Contact Details</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Pooja Sundaram"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                  Email Address (For Invoice) *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. pooja@example.com"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Delivery Slot Picker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-gray-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#d11243]" />
                <span>2. Select Delivery Slot</span>
              </label>
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">Guaranteed Fresh</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Express 90 Mins Card */}
              <div
                onClick={() => setSlotMode('express')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  slotMode === 'express'
                    ? 'border-[#d11243] bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-[#d11243]'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-black text-xs text-gray-950 dark:text-white">
                    <Zap className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>⚡ Express 90 Mins Delivery</span>
                  </div>
                  <span className="text-[10px] font-extrabold bg-[#d11243] text-white px-1.5 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  Packed immediately from local cold hub. Arrives at your doorstep in under 90 minutes.
                </p>
              </div>

              {/* Scheduled Delivery Card */}
              <div
                onClick={() => setSlotMode('scheduled')}
                className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                  slotMode === 'scheduled'
                    ? 'border-[#d11243] bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-[#d11243]'
                    : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-gray-950 dark:text-white">
                    <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <span>📅 Choose Scheduled Slot</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Flexible</span>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                  Select a convenient morning, afternoon, or evening window for seamless delivery.
                </p>
              </div>
            </div>

            {slotMode === 'scheduled' && (
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/60 rounded-xl border border-gray-200 dark:border-slate-700 space-y-3">
                <div className="flex gap-2">
                  {(['Today', 'Tomorrow'] as const).map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => setScheduledDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        scheduledDay === day
                          ? 'bg-gray-950 dark:bg-rose-600 text-white'
                          : 'bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
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
                          ? 'border-[#d11243] bg-white dark:bg-slate-800 font-bold text-gray-950 dark:text-white ring-1 ring-[#d11243]'
                          : 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      <div className="font-bold text-gray-900 dark:text-white">{slot.time}</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">{slot.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Delivery Address */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-black uppercase text-gray-900 dark:text-white flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#d11243]" />
                <span>3. Delivery Address</span>
              </label>

              <div className="flex items-center gap-2">
                {onOpenLocationModal && (
                  <button
                    type="button"
                    onClick={onOpenLocationModal}
                    className="text-[11px] font-bold text-[#d11243] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Change / Saved Addresses</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}

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
                            : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                  Flat / House / Villa Number *
                </label>
                <input
                  type="text"
                  required
                  value={flatNo}
                  onChange={(e) => setFlatNo(e.target.value)}
                  placeholder="e.g. Flat 402, Block B"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                  Apartment / Building Name *
                </label>
                <input
                  type="text"
                  required
                  value={building}
                  onChange={(e) => setBuilding(e.target.value)}
                  placeholder="e.g. Alpine Eco Apartments"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                  Street / Area / Landmark *
                </label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Outer Ring Road, Doddanekkundi"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-bold text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="560037"
                    className="w-full px-2.5 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Instructions */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-gray-600 dark:text-gray-300 text-[11px] font-bold">
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
                        ? 'bg-gray-900 dark:bg-rose-600 text-white'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* GoMeat In-App Vault Wallet Card */}
          <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300 shrink-0">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-extrabold text-xs text-gray-900 dark:text-white flex items-center gap-1.5">
                    <span>Pay using GoMeat Wallet</span>
                    <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/80 text-emerald-800 dark:text-emerald-200 text-[10px] rounded font-bold">
                      Available: ₹{userWalletBalance}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300">
                    {userWalletBalance > 0
                      ? 'Instant store credit from returned cooler boxes. Never expires, 1-click checkout.'
                      : 'Balance is ₹0. Hand your cooler box back to the delivery rider to get ₹250 added here instantly!'}
                  </p>
                </div>
              </div>

              {userWalletBalance > 0 && (
                <label className="flex items-center gap-2 cursor-pointer select-none bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-2xs">
                  <input
                    type="checkbox"
                    checked={useWallet}
                    onChange={(e) => setUseWallet(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    {useWallet ? 'Applied' : 'Use'}
                  </span>
                </label>
              )}
            </div>

            {useWallet && userWalletBalance > 0 && (
              <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                <span>Wallet Discount Deducted:</span>
                <span>-₹{walletDeduction}</span>
              </div>
            )}
            {isFullyWalletPaid && (
              <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 p-2 rounded-lg border border-emerald-300/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>🎉 100% of order covered by your wallet! You pay ₹0 out of pocket.</span>
              </div>
            )}
          </div>

          {/* Section 4: Payment Method Selection */}
          {!isFullyWalletPaid ? (
            <div className="space-y-3">
              <label className="text-xs font-black uppercase text-gray-900 dark:text-white flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#d11243]" />
                <span>4. Select Payment Method for Remaining Balance (₹{finalPayable})</span>
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Online Payment (Razorpay) */}
                <div
                  onClick={() => setPaymentMethod('razorpay')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                    paymentMethod === 'razorpay'
                      ? 'border-[#d11243] bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-[#d11243]'
                      : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-black text-xs text-gray-950 dark:text-white">
                      <Zap className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                      <span>Razorpay Online Gateway</span>
                    </div>
                    <span className="text-[10px] font-extrabold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                      Instant & Secure
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-600 dark:text-gray-300 mt-1.5">
                    UPI (GPay / PhonePe / Paytm), Credit & Debit Cards, NetBanking, and Wallets.
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/60 dark:border-slate-700/60 text-[10px] text-gray-500 dark:text-gray-400">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>Razorpay Standard Checkout Verified</span>
                  </div>
                </div>

                {/* Cash / Pay on Delivery */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-3.5 rounded-xl border cursor-pointer transition relative ${
                    paymentMethod === 'cod'
                      ? 'border-[#d11243] bg-rose-50/70 dark:bg-rose-950/40 ring-1 ring-[#d11243]'
                      : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-gray-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xs text-gray-950 dark:text-white">
                      <Banknote className="w-4 h-4 text-amber-500" />
                      <span>Cash on Delivery (COD)</span>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">Pay at Door</span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
                    Pay via Cash or UPI QR scan directly to the cold-courier partner upon box inspection.
                  </p>
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200/60 dark:border-slate-700/60 text-[10px] text-gray-500 dark:text-gray-400">
                    <Info className="w-3 h-3 text-amber-600" />
                    <span>Exact cash or UPI recommended</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700/70 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <span>Payment Mode: 100% GoMeat Vault Wallet</span>
              </div>
              <span className="text-[11px] font-black text-emerald-700 dark:text-emerald-300">₹0 out-of-pocket</span>
            </div>
          )}

          {/* Section 5: Order Summary & Cold Box Deposit Transparency */}
          <div className="p-3.5 bg-gray-50 dark:bg-slate-800/70 rounded-xl border border-gray-200 dark:border-slate-700 space-y-2">
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Fresh Cuts Subtotal ({items.length} items):</span>
              <span className="font-bold text-gray-900 dark:text-white">₹{subtotal}</span>
            </div>
            
            {/* Refundable Cold Box line item */}
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1">
                <span>❄️ ThermalVault™ Eco-Cooler Deposit:</span>
              </span>
              <span className="font-bold text-emerald-700 dark:text-emerald-400">
                +₹{coolerDeposit} (100% Refundable)
              </span>
            </div>

            {couponDiscount > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                <span>Coupon Applied ({couponCode}):</span>
                <span>-₹{couponDiscount}</span>
              </div>
            )}
            
            <div className="flex justify-between text-gray-600 dark:text-gray-300">
              <span>Chilled Express Delivery:</span>
              <span>{shippingFee === 0 ? <strong className="text-emerald-700 dark:text-emerald-400">FREE</strong> : `₹${shippingFee}`}</span>
            </div>

            {walletDeduction > 0 && (
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-100/70 dark:bg-emerald-900/40 p-2 rounded-lg border border-emerald-300 dark:border-emerald-700">
                <span className="flex items-center gap-1.5">
                  <Wallet className="w-4 h-4 text-emerald-600" />
                  <span>GoMeat Wallet Deduction:</span>
                </span>
                <span>-₹{walletDeduction}</span>
              </div>
            )}
            
            <div className="border-t border-gray-200 dark:border-slate-700 pt-2 flex justify-between items-center text-sm font-black text-gray-950 dark:text-white">
              <span>Final Total Payable:</span>
              <span className="text-xl font-black text-[#d11243] dark:text-rose-400">₹{finalPayable}</span>
            </div>
          </div>

          {/* Freshness & Refund Guarantee Notice */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-300 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>0°C to 4°C Guarantee:</strong> Hand over the box to the courier or schedule a 1-click doorstep pickup in your dashboard anytime for an instant ₹250 refund!
            </span>
          </div>

          {/* Action CTA Button */}
          <button
            type="submit"
            disabled={isSubmitting || verifyingPayment}
            className={`w-full py-3.5 px-4 rounded-xl text-white font-black text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition disabled:opacity-50 ${
              isFullyWalletPaid
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                : 'bg-[#d11243] hover:bg-[#b80f3b]'
            }`}
          >
            {isSubmitting || verifyingPayment ? (
              <span className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{verifyingPayment ? 'Verifying with Razorpay...' : 'Confirming Order...'}</span>
              </span>
            ) : isFullyWalletPaid ? (
              <span className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                <span>Pay ₹0 with GoMeat Wallet & Confirm Order</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            ) : paymentMethod === 'razorpay' ? (
              <span className="flex items-center gap-2">
                <span>Pay Now with Razorpay • ₹{finalPayable}</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Confirm Order (Pay ₹{finalPayable} on Delivery)</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};
