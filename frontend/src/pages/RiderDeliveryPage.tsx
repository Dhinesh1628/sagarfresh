import React, { useState, useEffect, useRef } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  Navigation, 
  CheckCircle2, 
  ShieldCheck, 
  Camera, 
  QrCode, 
  RotateCcw, 
  RefreshCw, 
  AlertCircle, 
  Lock, 
  Thermometer, 
  Package, 
  ChevronRight,
  Store,
  DollarSign,
  Compass,
  ArrowLeft,
  Sparkles,
  Award,
  Zap
} from 'lucide-react';
import { api } from '../api';
import type { Order } from '../types';

interface RiderDeliveryPageProps {
  onBackToStore?: () => void;
}

export const RiderDeliveryPage: React.FC<RiderDeliveryPageProps> = ({ onBackToStore }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'runs' | 'returns' | 'map' | 'earnings'>('runs');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Doorstep Handover State
  const [deliveryPin, setDeliveryPin] = useState(['', '', '', '']);
  const pinInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [handoverSuccess, setHandoverSuccess] = useState(false);

  // Reverse Logistics (ThermalVault Cold Box Return)
  const [isReturningBox, setIsReturningBox] = useState(true);
  const [scannedBoxId, setScannedBoxId] = useState('BOX-BLR-417');
  const [isScanningBox, setIsScanningBox] = useState(false);
  const [boxInspection, setBoxInspection] = useState({
    lidIntact: true,
    gelPackInside: true,
    cleanGasket: true,
  });

  // Proof of Delivery (POD)
  const [podPhoto, setPodPhoto] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Live GPS Tracking Broadcaster
  const [isGpsStreaming, setIsGpsStreaming] = useState(true);
  const [lastGpsPing, setLastGpsPing] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9716,
    lng: 77.5946
  });

  // Load orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getOrders();
      if (Array.isArray(data)) {
        setOrders(data);
      }
    } catch (err) {
      console.error('Failed to load rider orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  // GPS Location Streamer simulation / HTML5 Geolocation
  useEffect(() => {
    let watchId: number | null = null;
    let intervalId: any = null;

    if (isGpsStreaming) {
      if ('geolocation' in navigator) {
        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            setCurrentCoords(coords);
            setLastGpsPing(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
            if (selectedOrder) {
              api.updateRiderLocation(selectedOrder.id, coords).catch(() => {});
            }
          },
          () => {},
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      }

      intervalId = setInterval(() => {
        setCurrentCoords(prev => {
          const next = {
            lat: prev.lat + (Math.random() - 0.5) * 0.0003,
            lng: prev.lng + (Math.random() - 0.5) * 0.0003
          };
          setLastGpsPing(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
          return next;
        });
      }, 4000);
    }

    return () => {
      if (watchId !== null && 'geolocation' in navigator) {
        navigator.geolocation.clearWatch(watchId);
      }
      if (intervalId) clearInterval(intervalId);
    };
  }, [isGpsStreaming, selectedOrder]);

  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');

  // Handle PIN typing
  const handlePinChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, '').slice(-1);
    const newPin = [...deliveryPin];
    newPin[idx] = digit;
    setDeliveryPin(newPin);
    setPinError(null);

    if (digit && idx < 3) {
      pinInputRefs[idx + 1].current?.focus();
    }
  };

  const handlePinKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !deliveryPin[idx] && idx > 0) {
      pinInputRefs[idx - 1].current?.focus();
    }
  };

  const handleOpenHandover = (order: Order) => {
    setSelectedOrder(order);
    setDeliveryPin(['', '', '', '']);
    setPinError(null);
    setHandoverSuccess(false);
    setPodPhoto(null);
    setIsReturningBox(true);
    setScannedBoxId(order.coolerId || 'BOX-BLR-417');
    setTimeout(() => pinInputRefs[0].current?.focus(), 150);
  };

  const handleFillDemoPin = () => {
    if (!selectedOrder) return;
    const pin = (selectedOrder.deliveryPin || '4821').split('');
    setDeliveryPin(pin);
    pinInputRefs[3].current?.focus();
  };

  const handleUpdateRunStatus = async (order: Order, newStatus: string) => {
    try {
      const updated = await api.updateOrderStatus(order.id, newStatus, `Rider updated status to ${newStatus}`);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(updated);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleSubmitHandover = async () => {
    if (!selectedOrder) return;
    const enteredPin = deliveryPin.join('').trim();
    if (enteredPin.length !== 4) {
      setPinError('Please enter the full 4-digit customer delivery PIN.');
      return;
    }

    try {
      setIsVerifying(true);
      setPinError(null);

      const updated = await api.handoverOrder(selectedOrder.id, {
        deliveryPin: enteredPin,
        pin: enteredPin,
        coolerReturned: isReturningBox,
        podImage: podPhoto || undefined,
        notes: isReturningBox
          ? `Returned Box #${scannedBoxId}. Condition: Lid=${boxInspection.lidIntact ? 'OK' : 'Damaged'}, Gasket=${boxInspection.cleanGasket ? 'OK' : 'Leak'}. ₹250 refunded to customer wallet.`
          : 'Customer retained cold box for next order return pickup.'
      });

      setHandoverSuccess(true);
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      
      setTimeout(() => {
        setSelectedOrder(null);
        setHandoverSuccess(false);
      }, 2200);
    } catch (err: any) {
      setPinError(err.message || 'Invalid delivery PIN. Please ask customer to check their screen.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPodPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
      
      {/* ========================================================= */}
      {/* DEDICATED RIDER PARTNER TOP STATUS BAR                    */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d11243] to-rose-700 flex items-center justify-center font-black text-white shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">GoMeat Rider</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-900 text-[10px] font-mono font-bold">
                  RD-819
                </span>
              </div>
              <p className="text-[10px] text-gray-400">EV Cold Fleet #14 • Hub #2</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online / Offline Toggle */}
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isOnline
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            {/* Return to Storefront */}
            {onBackToStore && (
              <button
                onClick={onBackToStore}
                title="Return to GoMeat Customer Store"
                className="px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-gray-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Store</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================= */}
      {/* MAIN RIDER APP VIEWPORT                                   */}
      {/* ========================================================= */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-28 space-y-4">

        {/* Top Active Shift KPI Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Shift Earnings:</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                ₹{deliveredOrders.length * 90 + 150}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>GPS:</span>
              <span className="text-emerald-400 font-bold font-mono">
                {isGpsStreaming ? 'Broadcasting ✓' : 'Paused'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center text-xs">
            <div className="bg-slate-800/50 p-2 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Active</span>
              <span className="text-base font-black text-rose-400">{activeOrders.length}</span>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Delivered</span>
              <span className="text-base font-black text-emerald-400">{deliveredOrders.length}</span>
            </div>
            <div className="bg-slate-800/50 p-2 rounded-xl">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Boxes Taken</span>
              <span className="text-base font-black text-sky-400">{deliveredOrders.length}</span>
            </div>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* TAB SCREEN 1: ACTIVE RUNS                                */}
        {/* --------------------------------------------------------- */}
        {currentScreen === 'runs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-wider text-gray-300">
                Assigned Delivery Queue ({activeOrders.length})
              </h2>
              <button
                onClick={loadOrders}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-gray-300 transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {loading ? (
              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center">
                <div className="animate-spin w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full mx-auto mb-2" />
                <p className="text-xs text-gray-400">Syncing with hub dispatch...</p>
              </div>
            ) : activeOrders.length === 0 ? (
              <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto text-xl font-black">
                  ✓
                </div>
                <h3 className="font-extrabold text-sm text-white">All deliveries cleared!</h3>
                <p className="text-xs text-gray-400">
                  New orders packed by Master Butcher Station will appear here for pickup.
                </p>
              </div>
            ) : (
              activeOrders.map((ord) => {
                const addressStr = typeof ord.deliveryAddress === 'object' && ord.deliveryAddress !== null
                  ? `${(ord.deliveryAddress as any).flatNo || ''} ${(ord.deliveryAddress as any).building || ''}, ${(ord.deliveryAddress as any).street || ''}, ${(ord.deliveryAddress as any).city || ''}`
                  : String(ord.deliveryAddress || '');

                const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr || ord.city)}`;
                const isOutForDelivery = ord.orderStatus === 'OUT_FOR_DELIVERY';

                return (
                  <div 
                    key={ord.id} 
                    className="bg-slate-900 rounded-3xl p-5 border border-slate-800 shadow-md space-y-4 hover:border-slate-700 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-base text-white">
                            #{ord.orderNumber || ord.id}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isOutForDelivery
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}>
                            {ord.orderStatus?.replace(/_/g, ' ') || 'PREPARING'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ord.items.length} Pack(s) • ₹{ord.total} • {ord.paymentMethod || 'Online'}
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-emerald-400 font-extrabold text-xs">
                          <Thermometer className="w-3.5 h-3.5" />
                          <span>{ord.liveTemp || 1.8}°C</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-mono block">
                          Box: {ord.coolerId}
                        </span>
                      </div>
                    </div>

                    <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white">{ord.customerName}</span>
                        <a
                          href={`tel:${ord.customerPhone || '9876543210'}`}
                          className="px-2.5 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-bold flex items-center gap-1"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>

                      <div className="text-gray-300 flex items-start gap-1.5 leading-relaxed">
                        <MapPin className="w-3.5 h-3.5 text-[#d11243] shrink-0 mt-0.5" />
                        <span>{addressStr}</span>
                      </div>

                      {ord.deliveryNotes && (
                        <div className="text-[11px] text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20">
                          <strong>Note:</strong> {ord.deliveryNotes}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-2.5 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                      >
                        <Navigation className="w-3.5 h-3.5 text-blue-400" />
                        <span>Directions</span>
                      </a>

                      {!isOutForDelivery ? (
                        <button
                          onClick={() => handleUpdateRunStatus(ord, 'OUT_FOR_DELIVERY')}
                          className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-[#d11243] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Bike className="w-3.5 h-3.5" />
                          <span>Start Run</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleOpenHandover(ord)}
                          className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Verify & Deliver</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB SCREEN 2: THERMALVAULT BOX RETURN SCANNER             */}
        {/* --------------------------------------------------------- */}
        {currentScreen === 'returns' && (
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-black text-white">Reverse Logistics Box Scanner</h3>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Scan customer's empty cold box to verify intactness and authorize instant ₹250 wallet refund.
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl border-2 border-dashed border-sky-500/50 flex items-center justify-center mx-auto text-sky-400">
                <QrCode className="w-10 h-10" />
              </div>
              <p className="text-xs text-gray-300 font-mono font-bold">
                {scannedBoxId}
              </p>
              <button
                onClick={() => {
                  setIsScanningBox(true);
                  setTimeout(() => {
                    setIsScanningBox(false);
                    setScannedBoxId(`BOX-BLR-${Math.floor(100 + Math.random() * 900)}`);
                  }, 800);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                {isScanningBox ? 'Scanning Reticle...' : 'Simulate Box QR Scan'}
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <span className="font-bold text-gray-300 block">3-Point Quality Checklist</span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <button
                  onClick={() => setBoxInspection(p => ({ ...p, lidIntact: !p.lidIntact }))}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    boxInspection.lidIntact ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'
                  }`}
                >
                  Lid: {boxInspection.lidIntact ? '✓ OK' : '✗ Damaged'}
                </button>
                <button
                  onClick={() => setBoxInspection(p => ({ ...p, gelPackInside: !p.gelPackInside }))}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    boxInspection.gelPackInside ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'
                  }`}
                >
                  Gel: {boxInspection.gelPackInside ? '✓ Inside' : '✗ Missing'}
                </button>
                <button
                  onClick={() => setBoxInspection(p => ({ ...p, cleanGasket: !p.cleanGasket }))}
                  className={`p-2.5 rounded-xl border text-center font-bold transition ${
                    boxInspection.cleanGasket ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-red-950 border-red-500 text-red-300'
                  }`}
                >
                  Gasket: {boxInspection.cleanGasket ? '✓ Sealed' : '✗ Leak'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB SCREEN 3: LIVE ROUTE MAP & GPS BROADCAST             */}
        {/* --------------------------------------------------------- */}
        {currentScreen === 'map' && (
          <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-white">Live Telemetry & GPS Broadcast</h3>
                <p className="text-xs text-gray-400">Stream rider coordinates to customer's live tracking screen</p>
              </div>
              <button
                onClick={() => setIsGpsStreaming(!isGpsStreaming)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  isGpsStreaming ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-gray-400'
                }`}
              >
                {isGpsStreaming ? 'GPS Active ●' : 'GPS Paused'}
              </button>
            </div>

            {/* Simulated Live Route Canvas */}
            <div className="h-48 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]" />
              <div className="relative z-10 text-center space-y-2">
                <div className="w-10 h-10 rounded-full bg-[#d11243] text-white flex items-center justify-center mx-auto animate-pulse shadow-lg">
                  <Bike className="w-5 h-5" />
                </div>
                <div className="text-xs font-mono text-emerald-400 font-bold">
                  Lat: {currentCoords.lat.toFixed(5)} • Lng: {currentCoords.lng.toFixed(5)}
                </div>
                <p className="text-[10px] text-gray-400">
                  Last telemetry update: {lastGpsPing || 'Broadcasting now'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB SCREEN 4: RIDER EARNINGS & PAYOUTS                    */}
        {/* --------------------------------------------------------- */}
        {currentScreen === 'earnings' && (
          <div className="space-y-4">
            <div className="bg-gradient-to-br from-emerald-950/60 to-slate-900 rounded-3xl p-5 border border-emerald-800/40 space-y-2">
              <span className="text-[10px] text-emerald-400 uppercase font-black">Today's Payout Balance</span>
              <div className="text-3xl font-black font-mono text-emerald-300">
                ₹{deliveredOrders.length * 90 + 150}
              </div>
              <p className="text-xs text-gray-400">
                Direct UPI Settlement to <strong>suresh.patil@okhdfcbank</strong> at 11:30 PM.
              </p>
            </div>

            <div className="bg-slate-900 rounded-3xl p-5 border border-slate-800 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-gray-300">Completed Deliveries</h4>
              {deliveredOrders.length === 0 ? (
                <p className="text-xs text-gray-500">No completed orders yet today.</p>
              ) : (
                deliveredOrders.map((ord) => (
                  <div key={ord.id} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-white">#{ord.orderNumber || ord.id}</span>
                      <p className="text-[11px] text-gray-400">{ord.customerName} • Box {ord.coolerId}</p>
                    </div>
                    <span className="font-mono font-black text-emerald-400">+₹90</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* ========================================================= */}
      {/* DOORSTEP HANDOVER & PIN MODAL                             */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-full bg-rose-950 text-rose-300 text-[10px] font-bold">
                  DOORSTEP VERIFICATION
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  Order #{selectedOrder.orderNumber || selectedOrder.id}
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-gray-300 flex items-center justify-center font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {handoverSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
                  ✓
                </div>
                <h4 className="text-lg font-black text-white">Delivery Confirmed!</h4>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {isReturningBox
                    ? `Cold Box #${scannedBoxId} received and ₹250 instant refund credited to ${selectedOrder.customerName}'s wallet.`
                    : `Order delivered safely to ${selectedOrder.customerName}.`}
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>1. Customer 4-Digit Delivery PIN</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleFillDemoPin}
                      className="text-[10px] text-amber-400 hover:underline font-bold"
                    >
                      (Demo PIN: {selectedOrder.deliveryPin || '4821'})
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-3 py-2">
                    {deliveryPin.map((val, idx) => (
                      <input
                        key={idx}
                        ref={pinInputRefs[idx]}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        className="w-12 h-14 text-center text-2xl font-black font-mono rounded-2xl border-2 border-slate-700 bg-slate-800 text-white focus:border-rose-500 focus:outline-none transition shadow-inner"
                      />
                    ))}
                  </div>

                  {pinError && (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-900 text-xs text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                {/* Box Return & Instant Refund */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-white block">2. Collect Empty Cold Box?</span>
                      <span className="text-[10px] text-sky-400">Instant ₹250 refund credited to customer</span>
                    </div>
                    <button
                      onClick={() => setIsReturningBox(!isReturningBox)}
                      className={`px-3 py-1 rounded-full font-bold text-xs ${
                        isReturningBox ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-gray-400'
                      }`}
                    >
                      {isReturningBox ? 'YES' : 'NO'}
                    </button>
                  </div>

                  {isReturningBox && (
                    <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                      <div className="flex-1 bg-slate-900 px-3 py-2 rounded-xl border border-slate-700 font-mono font-bold text-white">
                        {scannedBoxId}
                      </div>
                      <button
                        onClick={() => setScannedBoxId(`BOX-BLR-${Math.floor(100 + Math.random() * 900)}`)}
                        className="px-3 py-2 bg-sky-700 hover:bg-sky-600 rounded-xl font-bold text-white flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Scan</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Contactless POD */}
                <div className="space-y-2 text-xs">
                  <span className="text-gray-300 font-bold flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-gray-400" />
                    <span>3. Contactless Doorstep Photo (Optional)</span>
                  </span>

                  {podPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-500 max-h-32">
                      <img src={podPhoto} alt="POD" className="w-full h-32 object-cover" />
                      <button
                        onClick={() => setPodPhoto(null)}
                        className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px]"
                      >
                        Retake
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-700 rounded-2xl p-3 text-center cursor-pointer hover:border-rose-500 transition bg-slate-950"
                    >
                      <Camera className="w-5 h-5 text-gray-500 mx-auto mb-1" />
                      <span className="text-[11px] text-gray-400 block font-semibold">
                        Snap photo of parcel at doorstep
                      </span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoCapture}
                        className="hidden"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isVerifying || deliveryPin.join('').length !== 4}
                  onClick={handleSubmitHandover}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Verifying PIN & Refund...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Complete Delivery {isReturningBox ? '& Refund ₹250' : ''}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NATIVE BOTTOM NAVIGATION DOCK (SWIGGY/ZOMATO STYLE)       */}
      {/* ========================================================= */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2 px-4">
        <div className="max-w-2xl mx-auto grid grid-cols-4 gap-2 text-center text-xs">
          <button
            onClick={() => setCurrentScreen('runs')}
            className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
              currentScreen === 'runs'
                ? 'text-rose-400 font-extrabold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span className="text-[10px]">Active Runs</span>
          </button>

          <button
            onClick={() => setCurrentScreen('returns')}
            className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
              currentScreen === 'returns'
                ? 'text-sky-400 font-extrabold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-[10px]">Box Scanner</span>
          </button>

          <button
            onClick={() => setCurrentScreen('map')}
            className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
              currentScreen === 'map'
                ? 'text-emerald-400 font-extrabold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[10px]">Live GPS</span>
          </button>

          <button
            onClick={() => setCurrentScreen('earnings')}
            className={`py-1.5 rounded-xl flex flex-col items-center gap-1 transition ${
              currentScreen === 'earnings'
                ? 'text-amber-400 font-extrabold'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span className="text-[10px]">Earnings</span>
          </button>
        </div>
      </nav>

    </div>
  );
};
