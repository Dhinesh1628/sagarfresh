import React, { useState, useEffect } from 'react';
import { 
  Beef, 
  Scale, 
  QrCode, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Thermometer, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Package, 
  RefreshCw, 
  ChevronRight,
  Sliders,
  Scissors,
  Store,
  ArrowLeft,
  Flame,
  Award,
  LogOut,
  Plus,
  Edit2,
  Check,
  FileText
} from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Order, Product } from '../types';

interface ButcherStationPageProps {
  onBackToStore?: () => void;
}

export const ButcherStationPage: React.FC<ButcherStationPageProps> = ({ onBackToStore }) => {
  const { user, setAuthSession, logout } = useAuth();

  // Auth Form State (when not authenticated as partner)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('partner@gomeat.in');
  const [loginPassword, setLoginPassword] = useState('partner123');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmittingAuth, setIsSubmittingAuth] = useState(false);

  // Registration Form State
  const [regForm, setRegForm] = useState({
    shopName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    address: 'Indiranagar Harbor Station, Bengaluru',
    fssaiNumber: 'FSSAI-112243300',
    operatingHours: '05:30 AM - 09:30 PM',
    description: 'Specialist halal butchering and coastal fish station'
  });
  const [regSuccess, setRegSuccess] = useState<string | null>(null);

  // Active Partner Dashboard Tabs
  const [partnerTab, setPartnerTab] = useState<'orders' | 'inventory'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Active Butcher Prep Terminal State
  const [weighedGrams, setWeighedGrams] = useState<number>(495);
  const [targetGrams, setTargetGrams] = useState<number>(500);
  const [selectedBatch, setSelectedBatch] = useState<string>('LOT-SURMAI-0400AM-MNG');
  const [coldBoxId, setColdBoxId] = useState<string>('BOX-BLR-417');
  const [freshSealTag, setFreshSealTag] = useState<string>('FS-89412');
  const [liveTemp, setLiveTemp] = useState<number>(1.2);
  const [isPacking, setIsPacking] = useState(false);
  const [printSuccess, setPrintSuccess] = useState(false);

  // Product Add Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'Fish & Seafood',
    description: 'Fresh dressed cut scale-scraped and chilled to 0°C - 4°C.',
    price: 499,
    mrp: 549,
    unit: '500g',
    netWeight: '450g',
    pieces: '4-6 Steaks',
    serves: 'Serves 2-3',
    origin: 'Mangalore Old Port Harbor',
    cutStyle: 'Clean Steaks',
    stock: 40
  });

  const showNotification = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3500);
  };

  const rawBatches = [
    {
      id: 'LOT-SURMAI-0400AM-MNG',
      label: 'Surmai / Kingfish — Mangalore Old Port Daily Catch',
      origin: 'Deep Coastal Waters of Karnataka (Vessel #IND-KA-092)',
      catchTime: '04:00 AM Today',
      temp: '0.8°C'
    },
    {
      id: 'LOT-MUTTON-BLR-892',
      label: 'Free-Range Goat — Devanahalli Pasture Raised',
      origin: 'Pasture Raised, 100% Halal Hand-Cut & Chilled',
      catchTime: '05:30 AM Today',
      temp: '1.4°C'
    },
    {
      id: 'LOT-CHICKEN-FARM-201',
      label: 'Free-Range Chicken — Nelamangala Organic Farm',
      origin: 'Hormone-Free Free-Range Broiler Batch #201',
      catchTime: '06:00 AM Today',
      temp: '1.1°C'
    },
    {
      id: 'LOT-PRAWNS-CR-112',
      label: 'Sea Tiger Prawns — Karwar Deep Estuary',
      origin: 'Wild Sea Catch, Deveined at Harbor Cold Deck',
      catchTime: '03:45 AM Today',
      temp: '0.6°C'
    }
  ];

  // Load orders & inventory for this shop
  const loadPartnerData = async () => {
    try {
      setLoading(true);
      const [orderList, prodList] = await Promise.all([
        api.getPartnerOrders().catch(() => api.getOrders()),
        api.getPartnerProducts().catch(() => api.getProducts())
      ]);
      if (Array.isArray(orderList)) setOrders(orderList);
      if (Array.isArray(prodList)) setProducts(prodList);
    } catch (err) {
      console.error('Failed to load partner data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'partner' && user.approvalStatus === 'approved') {
      loadPartnerData();
      const interval = setInterval(loadPartnerData, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Handler: Partner Login
  const handlePartnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingAuth(true);

    try {
      const data = await api.partnerLogin({ email: loginEmail, password: loginPassword });
      setAuthSession(data.user, data.token);
      showNotification(`Welcome, ${data.user.shopName || data.user.name}!`);
    } catch (err: any) {
      setLoginError(err.message || 'Login failed. Please check your shop credentials.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handler: Partner Registration
  const handlePartnerRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmittingAuth(true);

    try {
      const res = await api.partnerRegister(regForm);
      setRegSuccess('Shop application submitted! Your account is Pending Operations Approval.');
      if (res.partner) {
        setAuthSession(res.partner, 'temp_token_pending');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Registration failed.');
    } finally {
      setIsSubmittingAuth(false);
    }
  };

  // Handler: Toggle Product In Stock / Out of Stock
  const handleToggleStock = async (prod: Product) => {
    const nextStock = prod.stock > 0 ? 0 : 30;
    try {
      await api.updatePartnerStock(prod.id, { stock: nextStock, inStock: nextStock > 0 });
      setProducts(prev => prev.map(p => p.id === prod.id ? { ...p, stock: nextStock, inStock: nextStock > 0 } : p));
      showNotification(`${prod.name} marked ${nextStock > 0 ? 'IN STOCK' : 'OUT OF STOCK'}`);
    } catch (err: any) {
      alert(err.message || 'Failed to update stock');
    }
  };

  // Handler: Add New Cut to Partner Catalog
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await api.addPartnerProduct(newProductForm);
      setProducts(prev => [created, ...prev]);
      setShowAddProductModal(false);
      showNotification(`Added "${created.name}" to shop catalog!`);
    } catch (err: any) {
      alert(err.message || 'Failed to add cut');
    }
  };

  // KDS Butchering Actions
  const handleStartButchering = (order: Order) => {
    setSelectedOrder(order);
    const firstItem = order.items[0];
    let target = 500;
    if (firstItem?.netWeight?.includes('1kg') || firstItem?.netWeight?.includes('1000g')) {
      target = 1000;
    } else if (firstItem?.netWeight?.includes('800g')) {
      target = 800;
    } else if (firstItem?.netWeight?.includes('250g')) {
      target = 250;
    }
    setTargetGrams(target);
    setWeighedGrams(target - Math.floor(Math.random() * 8) + 2);
    setColdBoxId(order.coolerId || `BOX-BLR-${Math.floor(100 + Math.random() * 900)}`);
    setFreshSealTag(`FS-${Math.floor(10000 + Math.random() * 90000)}`);
    setLiveTemp(1.2);
    setPrintSuccess(false);

    const nameLower = (firstItem?.name || '').toLowerCase();
    if (nameLower.includes('mutton')) setSelectedBatch('LOT-MUTTON-BLR-892');
    else if (nameLower.includes('prawn')) setSelectedBatch('LOT-PRAWNS-CR-112');
    else if (nameLower.includes('chicken')) setSelectedBatch('LOT-CHICKEN-FARM-201');
    else setSelectedBatch('LOT-SURMAI-0400AM-MNG');
  };

  const handleCompletePrep = async () => {
    if (!selectedOrder) return;
    try {
      setIsPacking(true);
      const updated = await api.updatePartnerOrderStatus(selectedOrder.id, {
        status: 'Cold Box Packed',
        lifecycleStatus: 'READY_FOR_PICKUP',
        weighedWeight: `${weighedGrams}g`,
        sealTag: freshSealTag
      });

      setOrders(prev => prev.map(o => o.id === updated.id ? updated : o));
      showNotification(`✓ Order #${selectedOrder.orderNumber || selectedOrder.id} ready for rider pickup!`);
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err.message || 'Failed to complete butcher preparation');
    } finally {
      setIsPacking(false);
    }
  };

  const weightDiff = weighedGrams - targetGrams;
  const weightPercent = ((weightDiff / targetGrams) * 100).toFixed(1);
  const isWithinTolerance = Math.abs(parseFloat(weightPercent)) <= 5.0;

  // =========================================================================
  // VIEW 1: AUTHENTICATION & ONBOARDING GATE (When not authenticated as Partner)
  // =========================================================================
  if (!user || user.role !== 'partner') {
    return (
      <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
        <header className="bg-slate-950/90 border-b border-slate-800 px-4 py-3">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center font-black text-white shadow-md">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="font-black text-sm tracking-tight text-white">GoMeat Partner Station</span>
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
            <h1 className="text-xl font-black text-white">Butcher & Partner Shop Portal</h1>
            <p className="text-xs text-gray-400">Artisanal Fresh Cuts, Live KDS Terminal & Inventory</p>
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
                  setLoginEmail('partner@gomeat.in');
                  setLoginPassword('partner123');
                }}
                className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] font-bold text-left hover:bg-emerald-900/60 transition cursor-pointer"
              >
                <div className="font-extrabold flex items-center gap-1">
                  <span>Abdul Rahim</span>
                  <span className="text-[9px] px-1 bg-emerald-500 text-black rounded font-black">Approved</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">Central Station #14</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLoginEmail('karthik.poultry@gmail.com');
                  setLoginPassword('partner123');
                }}
                className="p-2 rounded-xl bg-amber-950/60 border border-amber-800 text-amber-300 text-[11px] font-bold text-left hover:bg-amber-900/60 transition cursor-pointer"
              >
                <div className="font-extrabold flex items-center gap-1">
                  <span>Karthik Poultry</span>
                  <span className="text-[9px] px-1 bg-amber-500 text-black rounded font-black">Pending</span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono mt-0.5">Nelamangala Broiler</div>
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
              Partner Shop Sign In
            </button>
            <button
              onClick={() => { setAuthMode('register'); setLoginError(null); }}
              className={`flex-1 py-2 rounded-lg transition cursor-pointer ${
                authMode === 'register' ? 'bg-[#d11243] text-white shadow-xs' : 'text-gray-400 hover:text-white'
              }`}
            >
              Shop Registration
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
            <form onSubmit={handlePartnerLogin} className="space-y-3.5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Business Email or Phone</label>
                <input
                  type="text"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="partner@gomeat.in or +91 98000 00000"
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
                {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Store className="w-4 h-4" />}
                <span>Access Partner Dashboard</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handlePartnerRegister} className="space-y-3 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Shop / Outlet Name</label>
                <input
                  type="text"
                  required
                  value={regForm.shopName}
                  onChange={(e) => setRegForm({ ...regForm, shopName: e.target.value })}
                  placeholder="Coastal Harbor Seafood & Halal Cuts #12"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={regForm.ownerName}
                    onChange={(e) => setRegForm({ ...regForm, ownerName: e.target.value })}
                    placeholder="Abdul Rahim"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={regForm.phone}
                    onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                    placeholder="+91 98800 00000"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Business Email</label>
                  <input
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="shop@gomeat.in"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Password</label>
                  <input
                    type="password"
                    required
                    value={regForm.password}
                    onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-300 font-bold mb-1">Shop Address & Pickup Location</label>
                <input
                  type="text"
                  required
                  value={regForm.address}
                  onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                  placeholder="Shop #4, 100ft Road, Indiranagar, Bengaluru 560038"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">FSSAI License Number</label>
                  <input
                    type="text"
                    required
                    value={regForm.fssaiNumber}
                    onChange={(e) => setRegForm({ ...regForm, fssaiNumber: e.target.value })}
                    placeholder="11224330000491"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:outline-none focus:border-[#d11243]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Operating Hours</label>
                  <input
                    type="text"
                    value={regForm.operatingHours}
                    onChange={(e) => setRegForm({ ...regForm, operatingHours: e.target.value })}
                    placeholder="05:30 AM - 09:30 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmittingAuth}
                className="w-full py-3 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50 shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isSubmittingAuth ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                <span>Submit Shop Application</span>
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
              <Store className="w-5 h-5 text-amber-400" />
              <span className="font-black text-sm text-white">GoMeat Partner Station</span>
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
            <h2 className="text-lg font-black text-white">Shop Verification in Progress</h2>
            <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
              Hello <strong className="text-white">{user.name}</strong>, your partner application for <strong className="text-amber-300">{user.shopName || 'your butcher station'}</strong> is being audited by GoMeat Central Operations.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2 w-full">
            <div className="flex justify-between">
              <span className="text-gray-400">Shop ID:</span>
              <span className="font-mono text-white font-bold">{user.shopId || user.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Application Status:</span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-black text-[10px] border border-amber-500/40">
                PENDING APPROVAL
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">FSSAI Status:</span>
              <span className="text-gray-200">{user.fssaiNumber || 'Document Verified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Operations Turnaround:</span>
              <span className="text-emerald-400 font-bold">Today by 6:00 PM</span>
            </div>
          </div>

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
  // VIEW 3: APPROVED BUTCHER PARTNER DASHBOARD (KDS Terminal & Product Catalog)
  // =========================================================================
  const pendingPrepOrders = orders.filter(
    (o) => o.orderStatus === 'CONFIRMED' || o.orderStatus === 'PREPARING' || o.status === 'Preparing'
  );
  const readyOrders = orders.filter(
    (o) => o.lifecycleStatus === 'READY_FOR_PICKUP' || o.status === 'Cold Box Packed'
  );

  return (
    <div className="min-h-screen bg-[#070b13] text-gray-100 flex flex-col font-sans selection:bg-[#d11243]">
      
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-600 to-amber-700 flex items-center justify-center font-black text-white shadow-md">
              <Scissors className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-white">
                  {user.shopName || user.name}
                </span>
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase">
                  FSSAI Verified
                </span>
              </div>
              <p className="text-[10px] text-gray-400">
                Partner Station #{user.shopId ? user.shopId.slice(-4).toUpperCase() : '14'} • {user.address || 'Bengaluru Central'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddProductModal(true)}
              className="px-3 py-1.5 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Cut</span>
            </button>

            <button
              onClick={logout}
              title="Sign Out of Partner Portal"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 border border-slate-700 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 pt-4 pb-20 space-y-4">
        
        {/* Action Notice Toast */}
        {actionNotice && (
          <div className="p-3 bg-emerald-950/90 border border-emerald-700 text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <button
            onClick={() => setPartnerTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-2 ${
              partnerTab === 'orders' ? 'bg-[#d11243] text-white shadow-xs' : 'bg-slate-900 text-gray-400 hover:text-white'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Order Prep Terminal ({pendingPrepOrders.length})</span>
          </button>

          <button
            onClick={() => setPartnerTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition flex items-center gap-2 ${
              partnerTab === 'inventory' ? 'bg-[#d11243] text-white shadow-xs' : 'bg-slate-900 text-gray-400 hover:text-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Product Catalog & Stock ({products.length})</span>
          </button>
        </div>

        {/* TAB 1: ORDER PREP TERMINAL (KDS) */}
        {partnerTab === 'orders' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Pending Butchering</span>
                <span className="text-2xl font-black text-amber-400">{pendingPrepOrders.length} Orders</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Ready for Rider Pickup</span>
                <span className="text-2xl font-black text-emerald-400">{readyOrders.length} Boxes</span>
              </div>
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Station Temperature</span>
                <span className="text-2xl font-black text-sky-400">1.2°C FreshSeal</span>
              </div>
            </div>

            {pendingPrepOrders.length === 0 ? (
              <div className="p-12 text-center bg-slate-900/60 rounded-3xl border border-slate-800 space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="font-bold text-white text-sm">All Butchering Orders Completed!</h3>
                <p className="text-xs text-gray-400">Ready boxes are stored in 0°C to 4°C chilling vault awaiting rider pickup.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingPrepOrders.map(ord => (
                  <div key={ord.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-mono font-bold text-sm text-white">#{ord.orderNumber || ord.id}</span>
                        <p className="text-xs text-gray-400 mt-0.5">{ord.customerName} • {ord.deliverySlot}</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
                        PREPARATION
                      </span>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between text-gray-200">
                          <div>
                            <span className="font-bold">{it.quantity}x {it.name}</span>
                            <span className="text-gray-400 block text-[11px]">Cut Style: {it.cutStyle || 'Standard'} • Net: {it.netWeight || it.unit}</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">₹{it.price * it.quantity}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleStartButchering(ord)}
                        className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>Open Scale Tare & FreshSeal</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SHOP INVENTORY & PRODUCT MANAGER */}
        {partnerTab === 'inventory' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-400">
                Managing {products.length} Fresh Cuts Catalogued to Your Shop
              </span>
              <button
                onClick={() => setShowAddProductModal(true)}
                className="px-3 py-1.5 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Product</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(prod => {
                const inStock = (prod.stock || 0) > 0;

                return (
                  <div key={prod.id} className="p-4 rounded-3xl bg-slate-900 border border-slate-800 space-y-3 shadow-xl">
                    <div className="flex gap-3">
                      <img
                        src={prod.image || prod.imageUrl || '/images/products/prod_1.jpg'}
                        alt={prod.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-[#d11243] uppercase font-black block">{prod.category}</span>
                        <h4 className="font-extrabold text-white text-xs truncate">{prod.name}</h4>
                        <div className="flex items-center gap-1.5 text-xs font-bold mt-1">
                          <span className="text-emerald-400">₹{prod.price}</span>
                          <span className="text-gray-500 line-through text-[11px]">₹{prod.mrp || prod.price + 50}</span>
                          <span className="text-[10px] text-gray-400">/ {prod.unit}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-800">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Depot Stock:</span>
                        <strong className="text-white font-mono">{prod.stock || 0} Units</strong>
                      </div>

                      <button
                        onClick={() => handleToggleStock(prod)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                          inStock
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800 hover:bg-emerald-900/60'
                            : 'bg-rose-950/60 text-rose-300 border-rose-800 hover:bg-rose-900/60'
                        }`}
                      >
                        {inStock ? '✓ IN STOCK' : '✕ OUT OF STOCK'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* SCALE TARE & FRESHSEAL MODAL                                             */}
      {/* ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 text-gray-100 z-10 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-white text-sm">
                Butcher Prep & FreshSeal • #{selectedOrder.orderNumber || selectedOrder.id}
              </h3>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            {/* Scale Readout */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Digital Scale Readout</span>
                <span className="text-3xl font-black font-mono text-emerald-400">{weighedGrams}g</span>
                <span className="text-[11px] text-gray-400 block">Target: {targetGrams}g (Tolerance: ±5%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setWeighedGrams(targetGrams)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 text-gray-200 font-bold text-[11px] cursor-pointer"
                >
                  Tare Zero
                </button>
              </div>
            </div>

            {/* FreshSeal Tag & Barcode */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">FreshSeal™ Tamper Tag:</span>
                <span className="font-mono font-bold text-emerald-400">{freshSealTag}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-bold text-white">Chamber Temp:</span>
                <span className="font-mono font-bold text-sky-400">1.2°C (Bio-Safe 0-4°C)</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                disabled={isPacking}
                onClick={handleCompletePrep}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-md flex items-center justify-center gap-2"
              >
                {isPacking ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Mark Ready for Rider Pickup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD PRODUCT MODAL                                                        */}
      {/* ========================================================================= */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div onClick={() => setShowAddProductModal(false)} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-gray-100 z-10 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-black text-white text-sm">Add New Fresh Cut to Shop</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-gray-300 font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm({ ...newProductForm, name: e.target.value })}
                  placeholder="e.g. Rechado White Pomfret Steaks"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Category</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  >
                    <option value="Fish & Seafood">Fish & Seafood</option>
                    <option value="Tender Mutton">Tender Mutton</option>
                    <option value="Fresh Chicken">Fresh Chicken</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Cut Style</label>
                  <input
                    type="text"
                    value={newProductForm.cutStyle}
                    onChange={(e) => setNewProductForm({ ...newProductForm, cutStyle: e.target.value })}
                    placeholder="Curry Cut / Fillet"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
                <div>
                  <label className="block text-gray-300 font-bold mb-1">Initial Stock</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm({ ...newProductForm, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-[#d11243]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold rounded-xl transition cursor-pointer shadow-md mt-2"
              >
                Add Cut to Shop Catalog
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
