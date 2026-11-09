import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  MapPin, 
  CheckCircle2, 
  Zap, 
  Thermometer, 
  ShieldCheck, 
  Phone, 
  MessageSquare, 
  RotateCcw, 
  Clock, 
  Package, 
  Activity, 
  AlertCircle,
  Truck,
  Box,
  CreditCard,
  FileText
} from 'lucide-react';
import type { Order } from '../types';
import { api } from '../api';
import { generateAndPrintInvoice } from '../utils/invoiceGenerator';
import { getOrderDeliveryPin } from '../utils/pinHelper';

interface OrderTrackingPageProps {
  onNavigateToReturns: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onNavigateToReturns }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatingSensor, setSimulatingSensor] = useState(false);
  const [liveTemp, setLiveTemp] = useState<number>(2.3);
  const [isDemoOrder, setIsDemoOrder] = useState<boolean>(false);

  // Fallback demo order for previewing when database has 0 customer orders
  const demoOrder: Order = {
    id: 'ORD-84920',
    orderNumber: 'GM-20261102-84920',
    userId: 'demo-user',
    customerName: 'Dinesh Kandukuri',
    customerEmail: 'dinesh@example.com',
    customerPhone: '+91 97412 88301',
    deliveryAddress: 'Flat 402, Alpine Eco Apartments, Outer Ring Road, Doddanekkundi, Bengaluru - 560037',
    city: 'Bengaluru',
    items: [
      {
        productId: 'prod_chicken_curry',
        name: 'Fresh Farm Chicken Curry Cut (Skinless)',
        price: 249,
        quantity: 2,
        unit: '500g',
        netWeight: '450g',
        chillingMethod: '0°C to 4°C FreshSeal™ Cold Chain',
        cutStyle: 'Curry Cut (Medium Bone-in)',
        image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80'
      },
      {
        productId: 'prod_mutton_biryani',
        name: 'Tender Lamb Biryani Cut (Rich Marrow)',
        price: 499,
        quantity: 1,
        unit: '500g',
        netWeight: '500g',
        chillingMethod: '0°C to 4°C FreshSeal™ Cold Chain',
        cutStyle: 'Biryani Cut (Large Pieces)',
        image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
      }
    ],
    subtotal: 997,
    coolerDeposit: 250,
    shippingFee: 0,
    total: 1247,
    orderStatus: 'OUT_FOR_DELIVERY',
    status: 'Out for Delivery',
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay Online (UPI)',
    razorpayPaymentId: 'pay_P1r9demo84920',
    coolerId: 'BOX-BLR-412',
    coolerModel: 'ThermalVault 18L - Reusable EPP Cold-Gel Box',
    liveTemp: 2.3,
    deliveryExecutive: 'Ramesh Kumar (EV Cold Fleet #12, +91 94481 02911)',
    tempLog: [
      { time: '07:15 AM', temp: 0.8, event: 'Order confirmed & cut inspected at Bio-Secure Dark Depot' },
      { time: '07:30 AM', temp: 1.2, event: 'Packed inside sanitized ThermalVault Box with ice gel bricks' },
      { time: '07:45 AM', temp: 1.8, event: 'Assigned to EV Cold Courier #12; FreshSeal digital lock engaged' },
      { time: '08:05 AM', temp: 2.3, event: 'Courier in transit on Outer Ring Road (1.8 km from doorstep)' }
    ],
    deliverySlot: '⚡ Express Delivery in 90 Mins (Live EV Courier)',
    trackingCode: 'SAGAR-TRK-84920',
    deliveryPin: '6133',
    createdAt: new Date().toISOString(),
    deliveryNotes: 'Leave with building security or ring Flat 402 doorbell.'
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      if (data && data.length > 0) {
        setOrders(data);
        setSelectedOrder(data[0]);
        setLiveTemp(data[0].liveTemp || 2.1);
        setIsDemoOrder(false);
      } else {
        setOrders([demoOrder]);
        setSelectedOrder(demoOrder);
        setLiveTemp(demoOrder.liveTemp);
        setIsDemoOrder(true);
      }
    } catch (err) {
      console.error('Failed to fetch orders, using interactive demo:', err);
      setOrders([demoOrder]);
      setSelectedOrder(demoOrder);
      setLiveTemp(demoOrder.liveTemp);
      setIsDemoOrder(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Simulate probe ping
  const handleSimulateProbe = async () => {
    setSimulatingSensor(true);
    try {
      if (isDemoOrder || !selectedOrder) {
        setTimeout(() => {
          const newT = Number((1.5 + Math.random() * 1.4).toFixed(1));
          setLiveTemp(newT);
          if (selectedOrder) {
            const now = new Date();
            const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
            const updatedOrder = {
              ...selectedOrder,
              liveTemp: newT,
              tempLog: [
                ...selectedOrder.tempLog,
                { time: timeStr, temp: newT, event: `IoT Sensor Telemetry Ping: ThermalVault internal temp confirmed at ${newT}°C` }
              ]
            };
            setSelectedOrder(updatedOrder);
          }
          setSimulatingSensor(false);
        }, 600);
      } else {
        const updated = await api.simulateTemp(selectedOrder.id);
        setSelectedOrder(updated);
        setLiveTemp(updated.liveTemp);
        setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
        setSimulatingSensor(false);
      }
    } catch (err) {
      console.error('Probe simulation error:', err);
      setSimulatingSensor(false);
    }
  };

  // 6-stage delivery status per UX guidelines:
  // 1. Order Confirmed -> 2. We're Preparing Your Order -> 3. Quality Check Done -> 4. Packed and Ready -> 5. Out for Delivery -> 6. Delivered!
  const timelineStages = [
    { 
      key: 'CONFIRMED', 
      title: 'Order Confirmed', 
      timeEst: '0 - 10 mins',
      desc: 'Your order is confirmed and sent to the preparation team.' 
    },
    { 
      key: 'PREPARING', 
      title: "We're Preparing Your Order", 
      timeEst: '10 - 25 mins',
      desc: 'Fresh cuts are freshly sliced and cleaned for your order.' 
    },
    { 
      key: 'QUALITY_CHECK', 
      title: 'Quality Check Done', 
      timeEst: '25 - 35 mins',
      desc: 'Checked for freshness, hygiene, and safe chilling.' 
    },
    { 
      key: 'PACKED', 
      title: 'Packed and Ready', 
      timeEst: '35 - 50 mins',
      desc: 'Packed in a cold box with ice gel packs to stay fresh.' 
    },
    { 
      key: 'OUT_FOR_DELIVERY', 
      title: 'Out for Delivery', 
      timeEst: '50 - 75 mins',
      desc: 'Your delivery partner is on the way to your home.' 
    },
    { 
      key: 'DELIVERED', 
      title: 'Delivered!', 
      timeEst: 'Within 90 mins',
      desc: 'Delivered fresh to your door. Return the box anytime for ₹250 back.' 
    }
  ];

  const currentOrder = selectedOrder || demoOrder;
  const orderPin = getOrderDeliveryPin(currentOrder);

  const getStageIndex = (order: Order): number => {
    const rawStatus = (order.orderStatus || order.status || '').toUpperCase().replace(/[\s-]/g, '_');
    if (rawStatus === 'DELIVERED') return 5;
    if (rawStatus === 'OUT_FOR_DELIVERY') return 4;
    if (rawStatus === 'PACKED' || rawStatus === 'PACKED_IN_COLD_BOX') return 3;
    if (rawStatus === 'QUALITY_CHECK') return 2;
    if (rawStatus === 'PREPARING' || rawStatus === 'PREPARING_YOUR_ORDER') return 1;
    return 0; // CONFIRMED or PENDING
  };

  const isCancelled = (currentOrder.orderStatus || currentOrder.status || '').toUpperCase() === 'CANCELLED';
  const currentStageIndex = isCancelled ? -1 : getStageIndex(currentOrder);

  // Status notification text
  const getStatusNotification = (order: Order) => {
    if (isCancelled) {
      return {
        badge: 'Order Cancelled',
        color: 'rose',
        message: 'This order was cancelled. Payment cancelled. Your refund of ₹' + order.total + ' will be credited back to your account.'
      };
    }
    switch (currentStageIndex) {
      case 0:
        return {
          badge: 'Order Confirmed',
          color: 'blue',
          message: 'Your order is confirmed and sent to our team.'
        };
      case 1:
        return {
          badge: "We're Preparing Your Order",
          color: 'amber',
          message: 'Your meat is being freshly cut and cleaned.'
        };
      case 2:
        return {
          badge: 'Quality Check Done',
          color: 'amber',
          message: 'Passed our freshness and temperature check.'
        };
      case 3:
        return {
          badge: 'Packed and Ready',
          color: 'emerald',
          message: 'Packed in a cold box with ice gel packs to stay fresh at 0°C - 4°C.'
        };
      case 4:
        return {
          badge: 'Out for Delivery',
          color: 'emerald',
          message: 'Your delivery partner is on the way to your door.'
        };
      case 5:
        return {
          badge: 'Delivered!',
          color: 'emerald',
          message: "Delivered! Hand back the box anytime to get your ₹250 deposit back."
        };
      default:
        return {
          badge: 'Preparing Your Order',
          color: 'gray',
          message: 'We are working on your order.'
        };
    }
  };

  const notification = getStatusNotification(currentOrder);

  // Calculate delivery ETA
  const calculateEta = (createdAt?: string) => {
    const start = createdAt ? new Date(createdAt) : new Date();
    const etaDate = new Date(start.getTime() + 90 * 60 * 1000);
    const hours = etaDate.getHours();
    const mins = String(etaDate.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `Today by ${formattedHours}:${mins} ${ampm} (Within 90 mins)`;
  };

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#d11243] dark:text-rose-500" />
              <span>Track Your Order</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Chilled at 0°C - 4°C</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Follow your order status and cold box temperature in real-time
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateProbe}
            disabled={simulatingSensor}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${simulatingSensor ? 'animate-spin' : ''}`} />
            <span>{simulatingSensor ? 'Checking...' : 'Check Temperature'}</span>
          </button>
          
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Orders Selector & Detailed Tracking View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Orders List (Desktop 4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500 dark:text-gray-400">
              My Orders ({orders.length})
            </h3>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Chilled & Fresh</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = currentOrder.id === ord.id;
              const ordStatus = ord.orderStatus || ord.status || 'PENDING';
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setLiveTemp(ord.liveTemp || 2.2);
                  }}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition relative ${
                    isSelected
                      ? 'bg-rose-50/70 dark:bg-rose-950/40 border-[#d11243] ring-1 ring-[#d11243] shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-gray-950 dark:text-white">
                          #{ord.orderNumber || ord.id}
                        </span>
                        {ord.id === 'ORD-84920' && (
                          <span className="px-1.5 py-0.2 bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 rounded text-[9px] font-bold border border-amber-200 dark:border-amber-800">
                            Demo
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 block mt-0.5">
                        {ord.items.length} Fresh Cut(s) • ₹{ord.total}
                      </span>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border shadow-2xs ${
                      ordStatus === 'DELIVERED'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : ordStatus === 'CANCELLED'
                        ? 'bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800'
                        : 'bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 border-rose-200 dark:border-rose-900'
                    }`}>
                      {ordStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                      <span>Box:</span>
                      <strong className="text-gray-900 dark:text-gray-200 font-mono">{ord.coolerId}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold border border-amber-200 dark:border-amber-800">
                        PIN: {getOrderDeliveryPin(ord)}
                      </span>
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-black">
                        <Thermometer className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{ord.liveTemp || 2.1}°C</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Reusable Cold Box System Card */}
          <div className="p-4 bg-sky-50/80 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/70 rounded-2xl text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sky-950 dark:text-sky-200">
                <RotateCcw className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                <span>₹250 Cold Box Deposit</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                100% Refundable
              </span>
            </div>
            <p className="text-[11px] text-sky-900 dark:text-sky-300 leading-relaxed">
              Your order comes in a reusable cold box. Return the box after delivery and get ₹250 back once it's checked.
            </p>
            <button
              onClick={onNavigateToReturns}
              className="w-full py-2 bg-sky-700 dark:bg-sky-600 hover:bg-sky-800 dark:hover:bg-sky-500 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-xs"
            >
              Return Box for ₹250 Refund &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Visual Timeline, Status Notifications & Full Order Details */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Delivery Status Notification Banner */}
          <div className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center text-[#d11243] shrink-0 mt-0.5">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-[#d11243] dark:text-rose-400 font-extrabold text-[10px] uppercase">
                    {notification.badge}
                  </span>
                  <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                    Order #{currentOrder.orderNumber || currentOrder.id}
                  </span>
                </div>
                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 mt-1">
                  {notification.message}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-slate-800 px-3.5 py-2 rounded-2xl border border-gray-200 dark:border-slate-700 shrink-0 text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Arrives By</span>
              <span className="text-xs font-black text-gray-950 dark:text-white">
                {calculateEta(currentOrder.createdAt)}
              </span>
            </div>
          </div>

          {/* Module 5: Exact 6-Stage Visual Timeline */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#d11243]" />
                  <span>Order Status</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Follow each step as your fresh meat is prepped and delivered
                </p>
              </div>

              <button
                onClick={() => generateAndPrintInvoice(currentOrder)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-gray-200 hover:text-black hover:border-gray-400 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5 text-[#d11243]" />
                <span>Download Bill</span>
              </button>
            </div>

            {/* Stepper Grid */}
            <div className="relative">
              {/* Progress Line */}
              <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-gray-200 dark:bg-slate-800 -z-0">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-500"
                  style={{
                    width: isCancelled 
                      ? '0%' 
                      : `${Math.min(100, (currentStageIndex / (timelineStages.length - 1)) * 100)}%`
                  }}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 relative z-10">
                {timelineStages.map((st, idx) => {
                  const isPassed = !isCancelled && idx <= currentStageIndex;
                  const isCurrent = !isCancelled && idx === currentStageIndex;

                  return (
                    <div key={st.key} className="flex sm:flex-col items-start sm:items-center text-left sm:text-center gap-3 sm:gap-2">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 transition-all ${
                        isCurrent
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-400/30 shadow-lg scale-110'
                          : isPassed
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-slate-700'
                      }`}>
                        {isPassed && !isCurrent ? (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        ) : (
                          <span>{idx + 1}</span>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <div className={`text-xs font-black leading-snug ${
                          isCurrent 
                            ? 'text-emerald-600 dark:text-emerald-400 font-extrabold' 
                            : isPassed 
                            ? 'text-gray-900 dark:text-white' 
                            : 'text-gray-400 dark:text-gray-500'
                        }`}>
                          {st.title}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-mono">
                          {st.timeEst}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 leading-tight hidden lg:block mt-1">
                          {st.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {isCancelled && (
              <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center gap-2.5 text-xs text-rose-800 dark:text-rose-200">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>This order was cancelled. Payment refund initiated to your bank account.</span>
              </div>
            )}
          </div>

          {/* Cold-Chain IoT Telemetry Card */}
          <div className="bg-slate-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  Cold Box Temperature • Box #{currentOrder.coolerId}
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold">
                0°C - 4°C Fresh & Chilled
              </span>
            </div>

            {/* Readout Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Cold Box Temperature</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-emerald-400">{liveTemp}°C</span>
                  <span className="text-xs text-gray-400">Safe: 0°C–4°C</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Fresh & Safe</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Box Seal</span>
                <div className="text-base font-extrabold text-white mt-1">Safely Sealed</div>
                <div className="text-[11px] text-gray-400">
                  Chilled gel packs keep your meat cold and fresh
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reusable Box</span>
                <div className="text-base font-extrabold text-emerald-400 mt-1">₹250 Deposit Recorded</div>
                <div className="text-[11px] text-gray-400">
                  Get ₹250 back when you return the box
                </div>
              </div>
            </div>
          </div>

          {/* Swiggy Style 4-Digit Handover PIN Card */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/70 dark:from-slate-850 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 dark:bg-amber-600 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
                🔒
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-amber-950 dark:text-amber-200 uppercase tracking-wider">
                    Cold Box Handover PIN
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-200 text-[10px] font-black">
                    Required on Arrival
                  </span>
                </div>
                <p className="text-[11px] text-amber-900/90 dark:text-amber-300/90 mt-0.5">
                  Share this 4-digit PIN with your delivery partner to verify your identity and safely receive your insulated cold box.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto bg-white dark:bg-slate-900 px-4 py-2.5 rounded-2xl border-2 border-amber-400 dark:border-amber-500 shadow-sm">
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">PIN:</span>
              <span className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-[#d11243] dark:text-rose-400">
                {orderPin}
              </span>
            </div>
          </div>

          {/* Assigned Delivery Courier Partner Card */}
          <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 flex items-center justify-center text-xl shrink-0">
                🛵
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Delivery Partner
                </span>
                <div className="font-black text-sm text-gray-950 dark:text-white">
                  {currentOrder.deliveryExecutive || 'Ramesh Kumar (Delivery Partner)'}
                </div>
                <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Trained for safe handling & cold delivery</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => alert('Calling your delivery partner...')}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-gray-900 dark:bg-slate-800 hover:bg-black dark:hover:bg-slate-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Partner</span>
              </button>
              
              <button
                type="button"
                onClick={() => alert('Opening WhatsApp chat with customer support...')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chat with Us</span>
              </button>
            </div>
          </div>

          {/* Order Details & Summary */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 dark:text-white flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#d11243] dark:text-rose-500" />
                <span>Your Items ({currentOrder.items.length})</span>
              </h4>
              <span className="text-xs font-extrabold text-[#d11243] dark:text-rose-400">
                Paid: ₹{currentOrder.total} ({currentOrder.paymentMethod || 'Online'})
              </span>
            </div>

            {/* Items List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentOrder.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-2xl border border-gray-200 dark:border-slate-700 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-gray-950 dark:text-white">{it.name}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      {it.quantity} x {it.unit} {it.netWeight ? `(Net: ${it.netWeight})` : ''}
                    </div>
                    {it.cutStyle && (
                      <span className="inline-block text-[10px] font-bold text-[#d11243] dark:text-rose-400">
                        Cut: {it.cutStyle}
                      </span>
                    )}
                  </div>
                  <span className="font-black text-sm text-gray-950 dark:text-white">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Financial Ledger & Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-gray-100 dark:border-slate-800 text-xs">
              {/* Delivery Address Details */}
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-1">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#d11243]" />
                  <span>Delivery Address</span>
                </span>
                <p className="font-bold text-gray-900 dark:text-white">{currentOrder.customerName}</p>
                <p className="text-gray-600 dark:text-gray-400 text-[11px] leading-relaxed">
                  {typeof currentOrder.deliveryAddress === 'object' && currentOrder.deliveryAddress !== null ? `${(currentOrder.deliveryAddress as any).flatNo || (currentOrder.deliveryAddress as any).line1 || ''} ${(currentOrder.deliveryAddress as any).street || ''}, ${(currentOrder.deliveryAddress as any).city || ''}` : String(currentOrder.deliveryAddress || '')}
                </p>
                {currentOrder.deliveryNotes && (
                  <p className="text-[10px] text-amber-700 dark:text-amber-400 italic pt-1">
                    Note: "{currentOrder.deliveryNotes}"
                  </p>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="p-3.5 bg-gray-50 dark:bg-slate-800/50 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-1.5">
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                  <span>Item Total:</span>
                  <span className="font-bold text-gray-900 dark:text-white">₹{currentOrder.subtotal}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                  <span>Cold Box Deposit (Refundable):</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{currentOrder.coolerDeposit || 250}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400 text-xs">
                  <span>Delivery Fee:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">
                    {currentOrder.shippingFee === 0 ? 'FREE' : `₹${currentOrder.shippingFee}`}
                  </span>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-between font-black text-sm">
                  <span className="text-gray-950 dark:text-white">Total Amount:</span>
                  <span className="text-[#d11243] dark:text-rose-400">₹{currentOrder.total}</span>
                </div>
                {currentOrder.razorpayPaymentId && (
                  <div className="text-[10px] text-gray-400 font-mono pt-1">
                    Payment ID: {currentOrder.razorpayPaymentId}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Temperature Log */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                <span>Temperature Log</span>
              </h4>
              <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">Always Chilled</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800/80 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-slate-700 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">IoT Probe</th>
                    <th className="py-2.5 px-3">Event / Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-[11px]">
                  {currentOrder.tempLog?.map((l, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-3 font-mono text-gray-500 dark:text-gray-400 whitespace-nowrap">{l.time}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 dark:text-emerald-400 font-bold whitespace-nowrap">{l.temp}°C</td>
                      <td className="py-2.5 px-3 text-gray-700 dark:text-gray-300 font-medium">{l.event}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
