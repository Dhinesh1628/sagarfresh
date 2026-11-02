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
  Navigation, 
  Package, 
  Activity, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { Order } from '../types';
import { api } from '../api';

interface OrderTrackingPageProps {
  onNavigateToReturns: () => void;
}

export const OrderTrackingPage: React.FC<OrderTrackingPageProps> = ({ onNavigateToReturns }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [simulatingSensor, setSimulatingSensor] = useState(false);
  const [liveTemp, setLiveTemp] = useState<number>(2.3);
  const [riderProgress, setRiderProgress] = useState<number>(68); // percentage along route
  const [isDemoOrder, setIsDemoOrder] = useState<boolean>(false);

  // Default Demo Order if no real orders exist yet (allows first-time users to explore)
  const demoOrder: Order = {
    id: 'ORD-84920',
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
    status: 'Out for Delivery',
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
    paymentMethod: 'UPI (Google Pay)',
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
        // Fallback to rich interactive demo order
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
        // Local simulation jitter between 1.4°C and 2.9°C
        setTimeout(() => {
          const newT = Number((1.5 + Math.random() * 1.4).toFixed(1));
          setLiveTemp(newT);
          setRiderProgress(prev => Math.min(95, prev + 6));
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

  const stages = [
    { title: 'Order Confirmed', time: '07:15 AM', desc: 'Precision cut trimmed & weighed' },
    { title: 'Cold Box Packed', time: '07:30 AM', desc: 'Packed at 0.8°C with gel ice' },
    { title: 'Out for Delivery', time: '07:45 AM', desc: 'EV courier on road (In Transit)' },
    { title: 'Delivered', time: 'ETA 08:25 AM', desc: 'Handover & box verification' }
  ];

  const currentOrder = selectedOrder || demoOrder;
  const currentStageIndex = currentOrder.status === 'Delivered' 
    ? 3 
    : currentOrder.status === 'Out for Delivery' 
    ? 2 
    : 1;

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Top Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-lg sm:text-xl font-black text-gray-950 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-[#d11243]" />
              <span>Live Cold-Chain Tracking & Map</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-black border border-emerald-200 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>0°C - 4°C Active Cold Chain</span>
            </span>
            {isDemoOrder && (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                Interactive Preview Order
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Real-time IoT core telemetry inside your reusable ThermalVault™ insulated cold box
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateProbe}
            disabled={simulatingSensor}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
          >
            <Activity className={`w-3.5 h-3.5 ${simulatingSensor ? 'animate-spin' : ''}`} />
            <span>{simulatingSensor ? 'Reading Sensor...' : 'Ping Cold Probe'}</span>
          </button>
          
          <button
            onClick={fetchOrders}
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Orders Selector & Live Tracking Map / Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Orders List (Desktop 4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-500">
              Your Cold Box Orders ({orders.length})
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold">100% Chilled</span>
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {orders.map((ord) => {
              const isSelected = currentOrder.id === ord.id;
              return (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setLiveTemp(ord.liveTemp || 2.2);
                  }}
                  className={`p-4 rounded-2xl border text-xs cursor-pointer transition relative ${
                    isSelected
                      ? 'bg-rose-50/70 border-[#d11243] ring-1 ring-[#d11243] shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300 shadow-2xs'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-sm text-gray-950">#{ord.id}</span>
                        {ord.id === 'ORD-84920' && (
                          <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">
                            Live Demo
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 block mt-0.5">
                        {ord.items.length} Fresh Cut(s) • ₹{ord.total}
                      </span>
                    </div>

                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white text-[#d11243] border border-rose-200 shadow-2xs">
                      {ord.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-1 text-gray-600">
                      <span>Box:</span>
                      <strong className="text-gray-900 font-mono">{ord.coolerId}</strong>
                    </div>

                    <div className="flex items-center gap-1 text-emerald-700 font-black">
                      <Thermometer className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{ord.liveTemp}°C (Safe)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cooler Box Return Prompt Card */}
          <div className="p-4 bg-sky-50/80 border border-sky-200 rounded-2xl text-xs space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-sky-950">
                <RotateCcw className="w-4 h-4 text-sky-700" />
                <span>₹250 Reusable Box Refund</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-black">
                Active Deposit
              </span>
            </div>
            <p className="text-[11px] text-sky-900 leading-relaxed">
              When empty, return to courier or request a free 1-click doorstep pickup in the app for an instant ₹250 UPI refund.
            </p>
            <button
              onClick={onNavigateToReturns}
              className="w-full py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl font-bold text-xs cursor-pointer transition shadow-xs"
            >
              Go to Box Returns &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Live Map, IoT Telemetry Gauge & Progress (Desktop 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Live Delivery Map Simulator Widget (Figma Live Tracking Visual) */}
          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-2 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                  Live Courier GPS Route
                </span>
                <span className="text-gray-300">•</span>
                <span className="text-xs font-extrabold text-[#d11243]">
                  ⚡ Arriving in 22 - 28 Mins
                </span>
              </div>
              
              <div className="text-[11px] font-semibold text-gray-500">
                Speed: <strong className="text-gray-900 font-mono">28 km/h</strong> (Cold EV Courier)
              </div>
            </div>

            {/* Simulated Live Route Canvas / Visual Graphic */}
            <div className="relative h-64 sm:h-72 bg-slate-900 p-6 flex flex-col justify-between overflow-hidden">
              {/* Map grid lines background */}
              <div 
                className="absolute inset-0 opacity-15"
                style={{
                  backgroundImage: 'radial-gradient(#fff 1px, transparent 1px), radial-gradient(#fff 1px, #0f172a 1px)',
                  backgroundSize: '24px 24px',
                  backgroundPosition: '0 0, 12px 12px'
                }}
              />

              {/* Simulated Road Paths (SVG) */}
              <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                {/* Secondary roads */}
                <path d="M 0,140 Q 200,90 400,160 T 800,100" fill="none" stroke="#334155" strokeWidth="3" opacity="0.4" />
                <path d="M 100,280 Q 300,180 500,220 T 900,140" fill="none" stroke="#334155" strokeWidth="2" opacity="0.3" />
                
                {/* Main active courier delivery route */}
                <path 
                  d="M 60,60 C 160,60 220,180 340,180 C 460,180 520,100 680,110 C 760,115 820,190 920,190" 
                  fill="none" 
                  stroke="#d11243" 
                  strokeWidth="5" 
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Top Depot Marker */}
              <div className="relative z-10 flex items-center gap-2 self-start bg-slate-800/95 border border-slate-700 px-3 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-rose-500 ring-4 ring-rose-950" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Depot Hub</span>
                  <span className="text-xs font-black text-white">Indiranagar Cold Hub Depot #04</span>
                </div>
              </div>

              {/* Moving Courier Scooter Icon positioned on the path */}
              <div 
                className="absolute z-20 flex flex-col items-center transition-all duration-700"
                style={{ left: `${riderProgress}%`, top: '42%' }}
              >
                <div className="px-2.5 py-1 rounded-lg bg-emerald-500 text-slate-950 font-black text-[10px] shadow-lg flex items-center gap-1 mb-1 animate-bounce">
                  <Zap className="w-3 h-3 fill-current" />
                  <span>Ramesh Kumar (1.8 km)</span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-[#d11243] text-white flex items-center justify-center shadow-2xl ring-4 ring-rose-400/30">
                  <Navigation className="w-5 h-5 fill-current rotate-45" />
                </div>
              </div>

              {/* Bottom Customer Destination Marker */}
              <div className="relative z-10 flex items-center gap-2 self-end bg-slate-800/95 border border-slate-700 px-3.5 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
                <div className="w-3 h-3 rounded-full bg-emerald-400 ring-4 ring-emerald-950 animate-ping" />
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">Destination</span>
                  <span className="text-xs font-black text-white">Your Doorstep (Doddanekkundi)</span>
                </div>
              </div>

              {/* Bottom Telemetry Floating Pill */}
              <div className="absolute bottom-3 left-4 z-10 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <Thermometer className="w-3.5 h-3.5" />
                  <span>Internal Box: {liveTemp}°C</span>
                </div>
                <span className="text-gray-500">|</span>
                <span className="text-gray-300 font-medium">EPP Ice-Gel Seal Intact</span>
              </div>
            </div>
          </div>

          {/* High-Tech IoT Cold-Chain Telemetry Card */}
          <div className="bg-slate-950 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                  IoT Cold-Chain Telemetry Protocol (Box: {currentOrder.coolerId})
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-extrabold">
                FSSAI 0°C - 4°C FreshSeal Certified
              </span>
            </div>

            {/* Digital Readout Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Internal Cold Box</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl font-black font-mono text-emerald-400">{liveTemp}°C</span>
                  <span className="text-xs text-gray-400">Target: 0°C–4°C</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Optimal Safe FreshZone</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">FreshSeal Integrity</span>
                <div className="text-base font-extrabold text-white mt-1">Digital Seal Active</div>
                <div className="text-[11px] text-gray-400">
                  Lock ID: <span className="font-mono text-gray-300">#FS-84920</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Reusable Box Security</span>
                <div className="text-base font-extrabold text-emerald-400 mt-1">₹250 Deposit Logged</div>
                <div className="text-[11px] text-gray-400">Instant UPI refund upon return</div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="pt-2 border-t border-slate-800">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                {stages.map((st, idx) => {
                  const isPassed = idx <= currentStageIndex;
                  const isCurrent = idx === currentStageIndex;
                  return (
                    <div key={st.title} className="space-y-1.5">
                      <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center text-xs font-black transition ${
                        isCurrent 
                          ? 'bg-emerald-500 text-slate-950 ring-4 ring-emerald-500/30' 
                          : isPassed 
                          ? 'bg-emerald-700 text-white' 
                          : 'bg-slate-800 text-gray-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className={`text-xs font-extrabold ${isCurrent ? 'text-emerald-400' : isPassed ? 'text-white' : 'text-gray-500'}`}>
                        {st.title}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {st.time}
                      </div>
                      <div className="text-[10px] text-gray-500 hidden sm:block leading-tight">
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Assigned Delivery Courier Partner Card */}
          <div className="bg-white p-4 sm:p-5 rounded-3xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xl shrink-0">
                🛵
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                  Assigned Delivery Partner
                </span>
                <div className="font-black text-sm text-gray-950">
                  {currentOrder.deliveryExecutive || 'Ramesh Kumar (EV Cold Fleet #12)'}
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Vaccinated • Cold-Chain Protocol Trained</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                type="button"
                onClick={() => alert('Calling Ramesh Kumar at +91 94481 02911...')}
                className="flex-1 sm:flex-none px-3.5 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Courier</span>
              </button>
              
              <button
                type="button"
                onClick={() => alert('Opening WhatsApp chat with delivery partner...')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Cuts Breakdown inside this Cold Box */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#d11243]" />
                <span>Packed Cuts in this ThermalVault ({currentOrder.items.length})</span>
              </h4>
              <span className="text-xs font-bold text-gray-500">
                Paid: <strong className="text-gray-950 font-black">₹{currentOrder.total}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {currentOrder.items.map((it, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between text-xs">
                  <div className="space-y-0.5">
                    <div className="font-extrabold text-gray-950">{it.name}</div>
                    <div className="text-[11px] text-gray-500">
                      {it.quantity} x {it.unit} {it.netWeight ? `(Net: ${it.netWeight})` : ''}
                    </div>
                    {it.cutStyle && (
                      <span className="inline-block text-[10px] font-bold text-[#d11243]">
                        Cut: {it.cutStyle}
                      </span>
                    )}
                  </div>
                  <span className="font-black text-sm text-gray-950">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Telemetry Log Table */}
          <div className="bg-white p-5 rounded-3xl border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-950 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-500" />
                <span>Continuous Cold Chain Audit Log</span>
              </h4>
              <span className="text-[11px] text-emerald-700 font-bold">100% Compliant</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-500 border-b border-gray-200 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Time</th>
                    <th className="py-2.5 px-3">IoT Probe</th>
                    <th className="py-2.5 px-3">Event / Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[11px]">
                  {currentOrder.tempLog?.map((l, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-mono text-gray-500 whitespace-nowrap">{l.time}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-700 font-bold whitespace-nowrap">{l.temp}°C</td>
                      <td className="py-2.5 px-3 text-gray-700 font-medium">{l.event}</td>
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
