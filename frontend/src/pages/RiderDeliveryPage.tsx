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
  Zap,
  LogOut,
  UserCheck,
  Clock,
  FileText
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Order } from '../types';

interface RiderDeliveryPageProps {
  onBackToStore?: () => void;
}

export const RiderDeliveryPage: React.FC<RiderDeliveryPageProps> = ({ onBackToStore }) => {
  const { user, setAuthSession, logout } = useAuth();
  
  // Auth Form State (when not authenticated as rider)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('rider@gomeat.in');
  const [loginPassword, setLoginPassword] = useState('rider123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: 'Bengaluru, Karnataka',
    vehicleType: 'Electric 2-Wheeler (EV)',
    vehicleNumber: 'KA-04-EV-',
    licenseNumber: 'DL-042026'
  });
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Rider Dashboard State
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'runs' | 'returns' | 'map' | 'earnings'>('runs');
  const [isOnline, setIsOnline] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

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

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  // Load orders assigned to rider or ready for dispatch
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await api.getRiderOrders().catch(() => api.getOrders());
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
    if (user?.role === 'rider' && user.approvalStatus === 'approved') {
      loadOrders();
      const interval = setInterval(loadOrders, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // GPS Location Streamer simulation
  useEffect(() => {
    let watchId: number | null = null;
    let intervalId: any = null;

    if (isGpsStreaming && user?.role === 'rider') {
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
  }, [isGpsStreaming, selectedOrder, user]);

  // Handler: Rider Login
  const handleRiderLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingAuth(true);

    try {
      const data = await api.riderLogin({ email: loginEmail, password: loginPassword });
      setAuthSession(data.user, data.token);
      showNotification(`Welcome back, ${data.user.name}!`);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handler: Rider Registration
  const handleRiderRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingAuth(true);

    try {
      const res = await api.riderRegister(regForm);
      setRegSuccess('Application submitted! Your account is Pending Operations Approval.');
      // Update session with pending rider
      if (res.rider) {
        setAuthSession(res.rider, 'temp_token_pending');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Registration failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handler: Toggle Online
  const handleToggleOnline = async () => {
    const next = !isOnline;
    setIsOnline(next);
    try {
      await api.setRiderOnline(next);
      showNotification(next ? 'Status: ONLINE (Receiving orders)' : 'Status: OFFLINE');
    } catch (err) {
      console.warn('Online status sync notice:', err);
    }
  };

  // 8-Stage Lifecycle Transitions
  const handleAdvanceLifecycle = async (order: Order, nextStage: string) => {
    try {
      const updated = await api.updateRiderLifecycle(order.id, { lifecycleStatus: nextStage });
      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(updated);
      }
      showNotification(`Status updated: ${nextStage.replace(/_/g, ' ')}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

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
      showNotification('✓ Verified Delivery! ₹50 credited to your shift earnings.');
      
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

  // =========================================================================
  // VIEW 1: AUTHENTICATION & ONBOARDING GATE (When not logged in as Rider)
  // =========================================================================
  if (!user || user.role !== 'rider') {
    return (
      <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
        <header className="bg-slate-950/90 border-b border-slate-800 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#d11243] to-rose-700 flex items-center justify-center font-black text-white shadow-md">
                <Bike className="w-4 h-4" />
              </div>
              <span className="font-black text-sm tracking-tight text-white">GoMeat Fleet Partner</span>
            </div>
            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="text-xs font-bold text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Store className="w-3.5 h-3.5 text-rose-400" />
                <span>Store</span>
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 max-w-md w-full mx-auto px-4 py-8 space-y-6">
          <div className="text-center space-y-1.5">
            <h1 className="text-xl font-black text-white">Delivery Partner Portal</h1>
            <p className="text-xs text-gray-400">0°C to 4°C ThermalVault Cold-Chain Express Logistics</p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
              Quick 1-Click Demo Profiles:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('rider@gomeat.in');
                  setLoginPassword('rider123');
                }}
                className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] font-bold text-left hover:bg-emerald-900/60 transition cursor-pointer"
              >
                <div className="font-extrabold flex items-center gap-1">
                  <span>Suresh Patil</span>
                  <span className="text-[9px] px-1 bg-emerald-500 text-black rounded font-black">Approved</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">rider@gomeat.in</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginEmail('mahesh.rider@gmail.com');
                  setLoginPassword('rider123');
                }}
                className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-bold text-left hover:bg-amber-900/60 transition cursor-pointer"
              >
                <div className="font-extrabold flex items-center gap-1">
                  <span>Mahesh Kumar</span>
                  <span className="text-[9px] px-1 bg-amber-500 text-black rounded font-black">Pending</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">mahesh.rider@gmail.com</div>
              </button>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
            <button
              onClick={() => { setAuthMode('login'); setLoginError(null); }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authMode === 'login' ? 'bg-[#d11243] text-white shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              Rider Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setLoginError(null); }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authMode === 'register' ? 'bg-[#d11243] text-white shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              Partner Registration
            </button>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {regSuccess && (
            <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-800 text-amber-200 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{regSuccess}</span>
            </div>
          )}

          {authMode === 'login' ? (
            <form onSubmit={handleRiderLogin} className="space-y-3.5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Rider Email or Phone</label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="rider@gomeat.in or +91 97412 88301"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
              >
                {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bike className="w-4 h-4" />}
                <span>Access Rider Dashboard</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleRiderRegister} className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Full Legal Name</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  placeholder="Ramesh Gowda"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="ramesh@gmail.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Mobile Phone</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+91 98801 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Set Password</label>
                <input
                  type="password"
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Vehicle Type</label>
                  <select
                    value={regForm.vehicleType}
                    onChange={(e) => setRegForm({ ...regForm, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  >
                    <option value="Electric 2-Wheeler (EV)">Electric 2-Wheeler (EV)</option>
                    <option value="Motorcycle (Petrol)">Motorcycle (Petrol)</option>
                    <option value="Scooter">Scooter</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Vehicle Reg Number</label>
                  <input
                    type="text"
                    required
                    value={regForm.vehicleNumber}
                    onChange={(e) => setRegForm({ ...regForm, vehicleNumber: e.target.value })}
                    placeholder="KA-04-EV-9999"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Driving License Number</label>
                <input
                  type="text"
                  required
                  value={regForm.licenseNumber}
                  onChange={(e) => setRegForm({ ...regForm, licenseNumber: e.target.value })}
                  placeholder="DL-0420240091823"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Submit Rider Application</span>
              </button>
            </form>
          )}
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 2: PENDING APPROVAL NOTICE (When registered but not approved yet)
  // =========================================================================
  if (user?.approvalStatus === 'pending_approval') {
    return (
      <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
        <header className="bg-slate-950/90 border-b border-slate-800 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400" />
              <span className="font-black text-sm text-white">GoMeat Fleet Partner</span>
            </div>
            <button
              onClick={logout}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 cursor-pointer flex items-center gap-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-950/80 border border-amber-600/60 flex items-center justify-center text-amber-400 shadow-xl">
            <Clock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg font-black text-white">Application Under Review</h2>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Hello <strong className="text-white">{user.name}</strong>, your delivery rider application has been submitted to GoMeat Central Operations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2 w-full">
            <div className="flex justify-between">
              <span className="text-gray-400">Account ID:</span>
              <span className="font-mono text-white font-bold">{user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Application Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] border border-amber-500/40">
                PENDING APPROVAL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Registered Vehicle:</span>
              <span className="text-gray-200">{user.vehicleType || 'Electric 2-Wheeler'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Estimated Review:</span>
              <span className="text-emerald-400 font-bold">Within 2–4 Hours</span>
            </div>
          </div>

          <p className="text-[11px] text-gray-500">
            For urgent dispatch inquiries, contact Central Hub Ops at <strong className="text-gray-300">+91 97412 88301</strong>.
          </p>

          <div className="flex gap-2 w-full pt-2">
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={logout}
              className="px-4 py-2.5 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold cursor-pointer hover:bg-rose-900/60 transition"
            >
              Sign Out
            </button>
          </div>
        </main>
      </div>
    );
  }

  // =========================================================================
  // VIEW 3: APPROVED RIDER PARTNER DASHBOARD (Full 8-Stage Operations Terminal)
  // =========================================================================
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== 'DELIVERED' && o.orderStatus !== 'CANCELLED'
  );
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'DELIVERED');

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
      
      {/* Top Rider Partner Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#d11243] to-rose-700 flex items-center justify-center font-black text-white shadow-md">
              <Bike className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm tracking-tight text-white">{user.name}</span>
                <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-900 text-[10px] font-mono font-bold">
                  {user.id ? `RD-${user.id.slice(-4).toUpperCase()}` : 'RD-819'}
                </span>
              </div>
              <p className="text-[10px] text-gray-400">{user.vehicleType || 'EV Cold Fleet'} • Hub Depot</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Live Online Toggle */}
            <button
              onClick={handleToggleOnline}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                isOnline
                  ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                  : 'bg-gray-800 border-gray-700 text-gray-400'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-gray-500'}`} />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            <button
              onClick={logout}
              title="Sign Out of Rider App"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Rider App Viewport */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 pt-4 pb-28 space-y-4">

        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Top Active Shift KPI Card */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400">Shift Earnings:</span>
              <span className="text-xl font-black font-mono text-emerald-400">
                ₹{user.earningsToday || (deliveredOrders.length * 50 + 150)}
              </span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-emerald-300 text-[10px] font-bold border border-slate-700 flex items-center gap-1">
              <Award className="w-3 h-3 text-amber-400" />
              <span>4.9 ★ Rating</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-slate-800/80">
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Assigned</span>
              <span className="text-base font-black text-white">{activeOrders.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Completed</span>
              <span className="text-base font-black text-emerald-400">{deliveredOrders.length}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/60">
              <span className="text-[10px] text-gray-500 block uppercase font-bold">Box Returns</span>
              <span className="text-base font-black text-sky-400">
                {deliveredOrders.filter(o => o.coolerReturned).length}
              </span>
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setCurrentScreen('runs')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              currentScreen === 'runs' ? 'bg-[#d11243] text-white shadow-xs' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Active Deliveries ({activeOrders.length})</span>
          </button>
          <button
            onClick={() => setCurrentScreen('earnings')}
            className={`flex-1 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              currentScreen === 'earnings' ? 'bg-[#d11243] text-white shadow-xs' : 'text-gray-400 hover:text-white'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>History ({deliveredOrders.length})</span>
          </button>
        </div>

        {/* SCREEN 1: ACTIVE RUNS WITH 8-STAGE LIFECYCLE */}
        {currentScreen === 'runs' && (
          <div className="space-y-4">
            {activeOrders.length === 0 ? (
              <div className="p-8 text-center bg-slate-900/60 rounded-3xl border border-slate-800/80 space-y-3">
                <Bike className="w-10 h-10 text-gray-600 mx-auto" />
                <h3 className="font-bold text-white text-sm">No Active Delivery Runs</h3>
                <p className="text-xs text-gray-500 max-w-xs mx-auto">
                  Stay Online. Newly prepared meat orders from partner butcher stations will appear here.
                </p>
                <button
                  onClick={loadOrders}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-200 rounded-xl text-xs font-bold cursor-pointer transition inline-flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Queue</span>
                </button>
              </div>
            ) : (
              activeOrders.map((ord) => {
                const stage = ord.lifecycleStatus || 'OUT_FOR_DELIVERY';

                return (
                  <div 
                    key={ord.id} 
                    className="p-4 sm:p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-white font-mono">
                            #{ord.orderNumber || ord.id}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-black uppercase">
                            {stage.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {ord.items.length} Pack(s) • ₹{ord.total} • {ord.paymentMethod || 'Prepaid'}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-gray-500 block">Cold Box</span>
                        <span className="font-mono text-emerald-400 font-bold text-xs">{ord.coolerId}</span>
                      </div>
                    </div>

                    {/* Customer & Address Card */}
                    <div className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-white">{ord.customerName}</span>
                        <a
                          href={`tel:${ord.customerPhone}`}
                          className="px-2.5 py-1 rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800 flex items-center gap-1 font-bold text-[11px]"
                        >
                          <Phone className="w-3 h-3" />
                          <span>Call</span>
                        </a>
                      </div>
                      <div className="flex items-start gap-1.5 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-[#d11243] shrink-0 mt-0.5" />
                        <span className="leading-snug">{ord.deliveryAddress}</span>
                      </div>
                      {ord.deliveryNotes && (
                        <p className="text-[11px] text-amber-300/90 bg-amber-950/30 p-1.5 rounded-lg border border-amber-900/40">
                          Note: "{ord.deliveryNotes}"
                        </p>
                      )}
                    </div>

                    {/* 8-Stage Dynamic Action Buttons */}
                    <div className="pt-1 flex flex-wrap gap-2">
                      {stage === 'ORDER_ASSIGNED' && (
                        <button
                          onClick={() => handleAdvanceLifecycle(ord, 'RIDER_ACCEPTED')}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md"
                        >
                          ✓ Accept Delivery Run
                        </button>
                      )}

                      {stage === 'RIDER_ACCEPTED' && (
                        <button
                          onClick={() => handleAdvanceLifecycle(ord, 'PREPARING_PICKUP')}
                          className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Head to Partner Shop
                        </button>
                      )}

                      {stage === 'PREPARING_PICKUP' && (
                        <button
                          onClick={() => handleAdvanceLifecycle(ord, 'ARRIVED_AT_SHOP')}
                          className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Arrived at Partner Shop
                        </button>
                      )}

                      {stage === 'ARRIVED_AT_SHOP' && (
                        <button
                          onClick={() => handleAdvanceLifecycle(ord, 'PICKED_UP')}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          ✓ Verify & Pick Up Cold Box
                        </button>
                      )}

                      {stage === 'PICKED_UP' && (
                        <button
                          onClick={() => handleAdvanceLifecycle(ord, 'OUT_FOR_DELIVERY')}
                          className="flex-1 py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Start Run to Customer</span>
                        </button>
                      )}

                      {stage === 'OUT_FOR_DELIVERY' && (
                        <button
                          onClick={() => handleAdvanceLifecycle(ord, 'ARRIVED_AT_CUSTOMER')}
                          className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          <span>Arrived at Customer Doorstep</span>
                        </button>
                      )}

                      {stage === 'ARRIVED_AT_CUSTOMER' && (
                        <button
                          onClick={() => handleOpenHandover(ord)}
                          className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Verify Customer PIN & Complete Handover</span>
                        </button>
                      )}

                      {/* Fallback button if status was direct out for delivery */}
                      {stage !== 'ARRIVED_AT_CUSTOMER' && stage !== 'ORDER_ASSIGNED' && (
                        <button
                          onClick={() => handleOpenHandover(ord)}
                          className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-bold rounded-xl text-xs transition cursor-pointer"
                        >
                          Doorstep Handover
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* SCREEN 2: EARNINGS & HISTORY */}
        {currentScreen === 'earnings' && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-900 rounded-3xl border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-gray-400">Completed Shift Deliveries</span>
              <div className="divide-y divide-slate-800 text-xs">
                {deliveredOrders.length === 0 ? (
                  <p className="text-gray-500 py-4 text-center">No delivered orders completed in this shift yet.</p>
                ) : (
                  deliveredOrders.map(ord => (
                    <div key={ord.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-mono font-bold text-white">#{ord.orderNumber || ord.id}</div>
                        <div className="text-[11px] text-gray-400">{ord.customerName} • {ord.deliveryAddress.slice(0, 30)}...</div>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-emerald-400 block">+₹50</span>
                        <span className="text-[10px] text-gray-500">Delivered</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* DOORSTEP HANDOVER MODAL (Customer PIN & Cold Box Inspection)              */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-5 text-gray-100 z-10 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <h3 className="font-extrabold text-white text-sm">
                  Verify Handover • #{selectedOrder.orderNumber || selectedOrder.id}
                </h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            {handoverSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-base font-black text-white">Delivery Verified & Complete!</h4>
                <p className="text-xs text-gray-400">Cold box recorded. ₹50 added to your rider payout.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* 4-Digit PIN Input Box */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                  <label className="text-xs font-bold text-gray-300 block">
                    Ask Customer for 4-Digit Handover PIN:
                  </label>
                  <div className="flex justify-center gap-2">
                    {deliveryPin.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={pinInputRefs[idx]}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        className="w-11 h-12 text-center text-xl font-mono font-black rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                      />
                    ))}
                  </div>

                  {pinError && (
                    <p className="text-[11px] text-rose-400 font-semibold">{pinError}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleFillDemoPin}
                    className="text-[10px] text-emerald-400 hover:underline pt-1 cursor-pointer"
                  >
                    Auto-Fill Demo PIN ({selectedOrder.deliveryPin || '4821'})
                  </button>
                </div>

                {/* ThermalVault Box Collection */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <RotateCcw className="w-3.5 h-3.5 text-sky-400" />
                      <span>Cold Box Returned?</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsReturningBox(!isReturningBox)}
                      className={`px-3 py-1 rounded-full text-[10px] font-black cursor-pointer border ${
                        isReturningBox
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-gray-800 text-gray-400 border-gray-700'
                      }`}
                    >
                      {isReturningBox ? 'YES (₹250 Refund)' : 'NO (Retained)'}
                    </button>
                  </div>

                  {isReturningBox && (
                    <div className="text-[11px] text-gray-400 space-y-1 pt-1 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <span>Tag:</span>
                        <strong className="text-white font-mono">{scannedBoxId}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Condition:</span>
                        <span className="text-emerald-400">EPP Intact + Gel Packs Sanitized</span>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  disabled={isVerifying}
                  onClick={handleSubmitHandover}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2"
                >
                  {isVerifying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Verify PIN & Complete Delivery</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
