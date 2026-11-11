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
  ExternalLink,
  Upload,
  ArrowRight,
  Sparkles,
  Volume2
} from 'lucide-react';
import { api } from '../api';
import type { Order } from '../types';

export const RiderDeliveryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assigned' | 'completed'>('assigned');
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
  const [isGpsStreaming, setIsGpsStreaming] = useState(false);
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
          (err) => {
            console.warn('HTML5 GPS fallback to simulation:', err);
          },
          { enableHighAccuracy: true, maximumAge: 5000 }
        );
      }

      // Simulated micro-jitter so coordinates move realistically along road
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

  // Orders filtering
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

  // Open Handover Modal for specific order
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

  // Quick PIN autofill for demo test runs
  const handleFillDemoPin = () => {
    if (!selectedOrder) return;
    const pin = (selectedOrder.deliveryPin || '4821').split('');
    setDeliveryPin(pin);
    pinInputRefs[3].current?.focus();
  };

  // Status progression action (Accept -> Out for Delivery)
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

  // Submit Doorstep Handover (PIN + Box Return + POD)
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
      
      // Auto close after 2 seconds
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

  // Handle Photo POD capture
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
    <div className="max-w-2xl mx-auto pb-24 text-gray-900 dark:text-gray-100 font-sans">
      
      {/* Top Rider Header Bar */}
      <div className="bg-gradient-to-r from-gray-950 via-slate-900 to-gray-900 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl mb-5 relative overflow-hidden">
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#d11243] flex items-center justify-center font-black text-xl text-white shadow-md">
              <Bike className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">Suresh Patil</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                  RD-819
                </span>
              </div>
              <p className="text-xs text-gray-400">Bengaluru Central Hub • Cold-Chain EV Fleet #14</p>
            </div>
          </div>

          {/* Shift Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm border ${
              isOnline
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-gray-800 border-gray-700 text-gray-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
            <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* Rider KPI Strip */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800 text-center">
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Assigned</span>
            <span className="text-lg font-black text-white">{activeOrders.length}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Delivered</span>
            <span className="text-lg font-black text-emerald-400">{deliveredOrders.length}</span>
          </div>
          <div className="bg-slate-800/60 p-2.5 rounded-2xl border border-slate-700/50">
            <span className="text-[10px] text-gray-400 uppercase font-bold block">Earned Today</span>
            <span className="text-lg font-black text-amber-300">₹{deliveredOrders.length * 90 + 150}</span>
          </div>
        </div>

        {/* GPS Live Streamer Switch */}
        <div className="mt-3 bg-slate-950/70 p-3 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Navigation className={`w-4 h-4 ${isGpsStreaming ? 'text-emerald-400 animate-spin' : 'text-gray-400'}`} />
            <div>
              <span className="font-bold text-gray-200">Live GPS Stream to Customer</span>
              <span className="block text-[10px] text-gray-400">
                {isGpsStreaming 
                  ? `Active • Last ping: ${lastGpsPing || 'Just now'} (${currentCoords.lat.toFixed(4)}, ${currentCoords.lng.toFixed(4)})` 
                  : 'Turn on to broadcast live bike movement on map'}
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsGpsStreaming(!isGpsStreaming)}
            className={`px-3 py-1 rounded-xl font-bold text-[11px] transition cursor-pointer ${
              isGpsStreaming
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-gray-300 border border-slate-700'
            }`}
          >
            {isGpsStreaming ? 'Streaming ON' : 'Enable GPS'}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center bg-gray-200 dark:bg-slate-900 p-1 rounded-2xl mb-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'assigned'
              ? 'bg-white dark:bg-slate-800 text-[#d11243] dark:text-rose-400 shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <span>Active Runs</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-100 dark:bg-rose-950 text-[#d11243] dark:text-rose-400 text-[10px]">
            {activeOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
          }`}
        >
          <span>Completed ({deliveredOrders.length})</span>
        </button>
      </div>

      {/* Active Orders List */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-[#d11243] border-t-transparent rounded-full mx-auto mb-2" />
          <p className="text-xs text-gray-500 font-semibold">Loading assigned delivery runs...</p>
        </div>
      ) : activeTab === 'assigned' ? (
        activeOrders.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto text-xl">
              ✓
            </div>
            <h3 className="font-extrabold text-sm text-gray-900 dark:text-white">All deliveries completed!</h3>
            <p className="text-xs text-gray-500">Stay online. New fresh chilled meat orders from the butcher station will appear here automatically.</p>
            <button
              onClick={loadOrders}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-200 transition cursor-pointer"
            >
              Refresh Dispatch Queue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((ord) => {
              const addressStr = typeof ord.deliveryAddress === 'object' && ord.deliveryAddress !== null
                ? `${(ord.deliveryAddress as any).flatNo || ''} ${(ord.deliveryAddress as any).building || ''}, ${(ord.deliveryAddress as any).street || ''}, ${(ord.deliveryAddress as any).city || ''}`
                : String(ord.deliveryAddress || '');

              const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(addressStr || ord.city)}`;
              const isOutForDelivery = ord.orderStatus === 'OUT_FOR_DELIVERY';

              return (
                <div 
                  key={ord.id} 
                  className="bg-white dark:bg-slate-900 rounded-3xl p-5 border-2 border-gray-200 dark:border-slate-800 shadow-sm space-y-4 hover:border-rose-300 dark:hover:border-slate-700 transition"
                >
                  {/* Top Bar: Order ID, Status, Cold Box ID */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-gray-950 dark:text-white">
                          #{ord.orderNumber || ord.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                          isOutForDelivery
                            ? 'bg-rose-50 dark:bg-rose-950 text-[#d11243] dark:text-rose-400 border-rose-200 dark:border-rose-900'
                            : 'bg-amber-50 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                        }`}>
                          {ord.orderStatus?.replace(/_/g, ' ') || 'PREPARING'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {ord.items.length} Pack(s) • ₹{ord.total} • {ord.paymentMethod || 'Online'}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-extrabold text-xs">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span>{ord.liveTemp || 1.8}°C</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono block">
                        Box: {ord.coolerId}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information & Doorstep Address */}
                  <div className="bg-gray-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700/60 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-xs text-gray-900 dark:text-white">
                        {ord.customerName}
                      </div>
                      <a
                        href={`tel:${ord.customerPhone || '9876543210'}`}
                        className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-100 transition"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call</span>
                      </a>
                    </div>

                    <div className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-3.5 h-3.5 text-[#d11243] shrink-0 mt-0.5" />
                      <span>{addressStr}</span>
                    </div>

                    {ord.deliveryNotes && (
                      <div className="text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200 dark:border-amber-900/40">
                        <strong>Gate Note:</strong> {ord.deliveryNotes}
                      </div>
                    )}
                  </div>

                  {/* Items summary */}
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">Cuts: </span>
                    {ord.items.map((it, idx) => (
                      <span key={idx}>
                        {it.name} ({it.quantity}x){idx < ord.items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>

                  {/* Action Buttons for Motorbike Rider */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-3 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-800 dark:text-gray-200 font-bold text-xs flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Navigation className="w-3.5 h-3.5 text-blue-500" />
                      <span>Directions</span>
                    </a>

                    {!isOutForDelivery ? (
                      <button
                        onClick={() => handleUpdateRunStatus(ord, 'OUT_FOR_DELIVERY')}
                        className="py-2.5 px-3 rounded-2xl bg-gradient-to-r from-rose-600 to-[#d11243] text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md hover:from-rose-700 hover:to-[#b80f3b] transition cursor-pointer"
                      >
                        <Bike className="w-3.5 h-3.5" />
                        <span>Start Delivery</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenHandover(ord)}
                        className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Verify PIN & Deliver</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* Completed Orders History */
        <div className="space-y-3">
          {deliveredOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-gray-200 dark:border-slate-800 text-center">
              <p className="text-xs text-gray-500 font-semibold">No deliveries completed yet today.</p>
            </div>
          ) : (
            deliveredOrders.map((ord) => (
              <div 
                key={ord.id}
                className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-gray-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-gray-950 dark:text-white">#{ord.orderNumber || ord.id}</span>
                    <span className="px-2 py-0.2 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Delivered
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {ord.customerName} • Box #{ord.coolerId}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-black text-emerald-600 dark:text-emerald-400 block">+₹90</span>
                  <span className="text-[10px] text-gray-400">PIN Verified</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* DOORSTEP HANDOVER & PIN VERIFICATION MODAL / DRAWER       */}
      {/* ========================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-gray-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950 text-[#d11243] dark:text-rose-400 text-[10px] font-extrabold">
                    DOORSTEP HANDOVER
                  </span>
                  <span className="text-xs font-bold text-gray-400 font-mono">
                    Order #{selectedOrder.orderNumber || selectedOrder.id}
                  </span>
                </div>
                <h3 className="text-base font-black text-gray-950 dark:text-white mt-1">
                  Verify Customer & Collect Box
                </h3>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 flex items-center justify-center font-bold text-sm hover:bg-gray-200 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {handoverSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mx-auto shadow-lg animate-bounce">
                  ✓
                </div>
                <h4 className="text-lg font-black text-gray-950 dark:text-white">Delivery Confirmed!</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                  {isReturningBox
                    ? `Cold Box #${scannedBoxId} received and ₹250 instant refund credited to ${selectedOrder.customerName}'s wallet.`
                    : `Order delivered safely to ${selectedOrder.customerName}.`}
                </p>
              </div>
            ) : (
              <>
                {/* STEP 1: 4-Digit Customer Delivery PIN */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#d11243]" />
                      <span>1. Customer 4-Digit Delivery PIN</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleFillDemoPin}
                      className="text-[10px] text-amber-700 dark:text-amber-400 hover:underline font-bold"
                    >
                      (Demo PIN: {selectedOrder.deliveryPin || '4821'})
                    </button>
                  </div>

                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    Ask the customer for the PIN shown on their live tracking screen:
                  </p>

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
                        className="w-12 h-14 text-center text-2xl font-black font-mono rounded-2xl border-2 border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white focus:border-[#d11243] dark:focus:border-[#d11243] focus:outline-none transition shadow-inner"
                      />
                    ))}
                  </div>

                  {pinError && (
                    <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-xs text-[#d11243] dark:text-rose-300 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{pinError}</span>
                    </div>
                  )}
                </div>

                {/* STEP 2: Reverse Logistics (Empty Box Return & ₹250 Refund) */}
                <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                      <div>
                        <span className="font-extrabold text-xs text-sky-950 dark:text-sky-200 block">
                          2. Collect Empty Cold Box?
                        </span>
                        <span className="text-[10px] text-sky-800 dark:text-sky-400">
                          Instant ₹250 refund credited to customer
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsReturningBox(!isReturningBox)}
                      className={`px-3 py-1 rounded-full text-xs font-black transition cursor-pointer ${
                        isReturningBox
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {isReturningBox ? 'YES (Collecting)' : 'NO (Customer Keeping)'}
                    </button>
                  </div>

                  {isReturningBox && (
                    <div className="pt-2 border-t border-sky-200 dark:border-sky-800/60 space-y-2.5">
                      {/* Box ID & Scanner */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-sky-300 dark:border-sky-700 text-xs font-mono font-bold text-gray-900 dark:text-gray-200">
                          {scannedBoxId}
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsScanningBox(true);
                            setTimeout(() => {
                              setIsScanningBox(false);
                              setScannedBoxId(`BOX-BLR-${Math.floor(100 + Math.random() * 900)}`);
                            }, 1000);
                          }}
                          className="px-3 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>{isScanningBox ? 'Scanning...' : 'Scan Box QR'}</span>
                        </button>
                      </div>

                      {/* Condition Checklist (Lid, Gel, Clean) */}
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setBoxInspection(p => ({ ...p, lidIntact: !p.lidIntact }))}
                          className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition ${
                            boxInspection.lidIntact
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          Lid: {boxInspection.lidIntact ? '✓ Intact' : '✗ Damaged'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setBoxInspection(p => ({ ...p, gelPackInside: !p.gelPackInside }))}
                          className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition ${
                            boxInspection.gelPackInside
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          Gel Pack: {boxInspection.gelPackInside ? '✓ Inside' : '✗ Missing'}
                        </button>

                        <button
                          type="button"
                          onClick={() => setBoxInspection(p => ({ ...p, cleanGasket: !p.cleanGasket }))}
                          className={`p-2 rounded-xl border text-center font-bold cursor-pointer transition ${
                            boxInspection.cleanGasket
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                              : 'bg-red-100 text-red-800 border-red-300'
                          }`}
                        >
                          Seal: {boxInspection.cleanGasket ? '✓ Clean' : '✗ Leak'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* STEP 3: Optional Proof of Delivery (POD) Photo */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-gray-500" />
                      <span>3. Contactless Doorstep Photo (Optional)</span>
                    </span>
                    {podPhoto && (
                      <button
                        type="button"
                        onClick={() => setPodPhoto(null)}
                        className="text-[10px] text-red-600 hover:underline font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  {podPhoto ? (
                    <div className="relative rounded-2xl overflow-hidden border border-emerald-300 max-h-32">
                      <img src={podPhoto} alt="POD" className="w-full h-32 object-cover" />
                      <span className="absolute bottom-1 right-2 px-2 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                        POD Attached ✓
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-300 dark:border-slate-700 rounded-2xl p-3 text-center cursor-pointer hover:border-[#d11243] transition bg-gray-50 dark:bg-slate-800/40"
                    >
                      <Camera className="w-5 h-5 text-gray-400 mx-auto mb-1" />
                      <span className="text-[11px] text-gray-600 dark:text-gray-400 block font-semibold">
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

                {/* Final Handover Submit Button */}
                <button
                  type="button"
                  disabled={isVerifying || deliveryPin.join('').length !== 4}
                  onClick={handleSubmitHandover}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:opacity-50 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  {isVerifying ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Verifying PIN & Settle Refund...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Delivery {isReturningBox ? '& Refund ₹250' : ''}</span>
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
