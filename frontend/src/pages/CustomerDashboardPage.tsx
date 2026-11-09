import React, { useState, useEffect } from 'react';
import { 
  User, 
  Package, 
  CreditCard, 
  Heart, 
  MapPin, 
  RotateCcw, 
  FileText, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight, 
  ShoppingBag, 
  X, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Phone, 
  Mail, 
  ExternalLink,
  Zap,
  Banknote,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../api';
import type { Order, Cooler, CoolerReturn, Product, WalletTransaction } from '../types';
import { generateAndPrintInvoice } from '../utils/invoiceGenerator';

interface CustomerDashboardPageProps {
  onNavigateToTracking: (orderId?: string) => void;
  onNavigateToCatalog: () => void;
}

type TabType = 'orders' | 'profile' | 'payments' | 'wishlist' | 'addresses' | 'coolers' | 'wallet';

export const CustomerDashboardPage: React.FC<CustomerDashboardPageProps> = ({
  onNavigateToTracking,
  onNavigateToCatalog
}) => {
  const { user, refreshUser } = useAuth();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<TabType>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Coolers State
  const [coolers, setCoolers] = useState<Cooler[]>([]);
  const [returns, setReturns] = useState<CoolerReturn[]>([]);
  const [loadingCoolers, setLoadingCoolers] = useState(false);

  // GoMeat In-App Vault Wallet State
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  const [walletBalance, setWalletBalance] = useState<number>(user?.walletBalance || 0);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Wishlist State (persisted in localStorage)
  const [wishlist, setWishlist] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('gomeat_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileCity, setProfileCity] = useState(user?.city || 'Bengaluru');
  const [profileUpiId, setProfileUpiId] = useState(user?.upiId || '');
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);

  // Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<Array<{ id: string; type: 'home' | 'work' | 'other'; text: string; isDefault?: boolean }>>(() => {
    try {
      const saved = localStorage.getItem('gomeat_saved_addresses');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      { id: 'addr_1', type: 'home', text: user?.address || 'Flat 402, Alpine Eco Apartments, Outer Ring Road, Doddanekkundi, Bengaluru - 560037', isDefault: true },
      { id: 'addr_2', type: 'work', text: 'Prestige Tech Park, Marathahalli - Sarjapur Outer Ring Road, Kadubeesanahalli, Bengaluru - 560103', isDefault: false }
    ];
  });
  const [newAddressType, setNewAddressType] = useState<'home' | 'work' | 'other'>('home');
  const [newAddressText, setNewAddressText] = useState('');
  const [isAddingAddress, setIsAddingAddress] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Coolers
  // Fetch Wallet Passbook
  const fetchWallet = async () => {
    try {
      setLoadingWallet(true);
      const data = await api.getWallet();
      setWalletBalance(data.balance ?? 0);
      setWalletTransactions(data.transactions || []);
    } catch (err) {
      console.error('Failed to load wallet passbook:', err);
    } finally {
      setLoadingWallet(false);
    }
  };

  const fetchCoolers = async () => {
    try {
      setLoadingCoolers(true);
      const data = await api.getMyCoolers();
      setCoolers(data.coolers || []);
      setReturns(data.returns || []);
    } catch (err) {
      console.error('Failed to load cooler inventory:', err);
    } finally {
      setLoadingCoolers(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchCoolers();
    fetchWallet();
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfilePhone(user.phone || '');
      setProfileAddress(user.address || '');
      setProfileCity(user.city || 'Bengaluru');
      setProfileUpiId(user.upiId || '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileNotice(null);
    try {
      await api.updateProfile({
        name: profileName,
        phone: profilePhone,
        address: profileAddress,
        city: profileCity,
        upiId: profileUpiId
      });
      await refreshUser();
      setProfileNotice('Profile updated successfully!');
      setTimeout(() => setProfileNotice(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order? It will restore your items and initiate refund if paid online.')) {
      return;
    }
    try {
      const res = await api.cancelOrder(orderId);
      alert(res.message);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order');
    }
  };

  const handleReorder = (order: Order) => {
    for (const item of order.items) {
      addItem({
        id: item.productId,
        name: item.name,
        price: item.price,
        unit: item.unit,
        chillingMethod: item.chillingMethod || '0°C to 4°C FreshSeal',
        origin: 'Certified Supply',
        catchDate: 'Today',
        cutStyle: item.cutStyle || 'Standard',
        category: 'Fresh Cuts',
        description: 'Repeat order',
        stock: 30
      }, item.quantity, item.cutStyle);
    }
  };

  const handleRemoveFromWishlist = (productId: string) => {
    const updated = wishlist.filter(p => p.id !== productId);
    setWishlist(updated);
    localStorage.setItem('gomeat_wishlist', JSON.stringify(updated));
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressText.trim()) return;
    const newAddr = {
      id: `addr_${Date.now()}`,
      type: newAddressType,
      text: newAddressText.trim(),
      isDefault: savedAddresses.length === 0
    };
    const updated = [...savedAddresses, newAddr];
    setSavedAddresses(updated);
    localStorage.setItem('gomeat_saved_addresses', JSON.stringify(updated));
    setNewAddressText('');
    setIsAddingAddress(false);
  };

  const handleDeleteAddress = (id: string) => {
    const updated = savedAddresses.filter(a => a.id !== id);
    setSavedAddresses(updated);
    localStorage.setItem('gomeat_saved_addresses', JSON.stringify(updated));
  };

  const totalHeldDeposit = coolers.length * 250;

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      
      {/* Top Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#d11243] shadow-sm"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d11243] to-[#7a0624] text-white flex items-center justify-center font-black text-2xl shadow-md">
                {user?.name?.charAt(0) || 'G'}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-gray-950 dark:text-white">
                  {user?.name || 'Customer Account'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 text-[10px] font-black border border-rose-200 dark:border-rose-900">
                  {user?.role?.toUpperCase() || 'MEMBER'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {user?.email} • {user?.phone || '+91 98765 43210'}
              </p>
              <div className="flex items-center gap-2 mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cold-Chain Verified Member • {orders.length} Orders Completed</span>
              </div>
            </div>
          </div>

          {/* Quick Metrics Badges */}
          <div className="flex items-center gap-3">
            <div 
              onClick={() => setActiveTab('wallet')}
              className="px-4 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700/80 text-center cursor-pointer transition shadow-2xs"
              title="GoMeat Vault Wallet - Click to view passbook"
            >
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block flex items-center justify-center gap-1">
                <Wallet className="w-3 h-3 text-emerald-600" />
                <span>GoMeat Wallet</span>
              </span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-300">₹{user?.walletBalance ?? walletBalance}</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-center">
              <span className="text-[10px] font-bold text-gray-400 uppercase block">Active Boxes</span>
              <span className="text-base font-black text-gray-900 dark:text-white">{coolers.length} Held</span>
            </div>
            <div className="px-4 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase block">Refundable Deposit</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400">₹{totalHeldDeposit}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-6 pt-5 border-t border-gray-100 dark:border-slate-800 overflow-x-auto pb-1">
          {[
            { id: 'wallet', label: 'GoMeat Wallet', icon: Wallet, count: (user?.walletBalance || walletBalance) ? (user?.walletBalance || walletBalance) : undefined },
            { id: 'orders', label: 'My Orders', icon: Package, count: orders.length },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'payments', label: 'Payments', icon: CreditCard },
            { id: 'wishlist', label: 'Saved for Later', icon: Heart, count: wishlist.length },
            { id: 'addresses', label: 'Saved Addresses', icon: MapPin, count: savedAddresses.length },
            { id: 'coolers', label: 'Cold Boxes', icon: RotateCcw, count: coolers.length }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition shrink-0 ${
                  isActive
                    ? 'bg-[#d11243] text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: MY ORDERS                                         */}
      {/* ======================================================== */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
              My Orders ({orders.length})
            </h3>
            <button
              onClick={fetchOrders}
              className="text-xs font-bold text-[#d11243] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
          </div>

          {loadingOrders ? (
            <div className="p-12 text-center text-xs text-gray-400">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl space-y-3">
              <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-900 dark:text-white text-sm">No orders placed yet</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Explore our daily harbor catch, farm-fresh chicken, and young mutton cuts packed in cold boxes.
              </p>
              <button
                onClick={onNavigateToCatalog}
                className="mt-2 px-5 py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs rounded-xl shadow-xs transition"
              >
                Browse Fresh Cuts
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {orders.map((ord) => {
                const isDelivered = ord.orderStatus === 'DELIVERED' || ord.status === 'Delivered';
                const isCancelled = ord.orderStatus === 'CANCELLED' || ord.status === 'Cancelled';
                const canCancel = !isDelivered && !isCancelled && ord.orderStatus !== 'PACKED' && ord.orderStatus !== 'OUT_FOR_DELIVERY';

                return (
                  <div 
                    key={ord.id}
                    className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-4 hover:border-gray-300 dark:hover:border-slate-700 transition"
                  >
                    {/* Header line */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-gray-950 dark:text-white">
                          #{ord.orderNumber || ord.id}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                          isDelivered ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' :
                          isCancelled ? 'bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800' :
                          'bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {ord.orderStatus || ord.status}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          ord.paymentStatus === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300' :
                          ord.paymentStatus === 'FAILED' ? 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300' :
                          'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                        }`}>
                          Payment: {ord.paymentStatus || (ord.paymentMethod?.includes('COD') ? 'Cash on Delivery' : 'PAID')}
                        </span>
                      </div>

                      <div className="text-[11px] text-gray-400">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                      </div>
                    </div>

                    {/* Items row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {ord.items.map((it, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-100 dark:border-slate-800">
                          <img 
                            src={it.image || it.imageUrl || `/images/products/${it.productId}.jpg`} 
                            alt={it.name}
                            className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-200 dark:border-slate-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `/images/products/${it.productId}.jpg`;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <h5 className="font-extrabold text-xs text-gray-950 dark:text-white truncate">{it.name}</h5>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400">
                              {it.quantity} x ₹{it.price} {it.cutStyle ? `(${it.cutStyle})` : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Summary & Action Buttons */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-t border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 dark:text-gray-400">
                          Total: <strong className="text-sm font-black text-gray-950 dark:text-white">₹{ord.total || ord.totalAmount}</strong>
                        </span>
                        <span className="text-gray-300 dark:text-gray-700">|</span>
                        <span className="text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          Includes ₹{ord.coolerDeposit || 250} Refundable Deposit
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* Track Order */}
                        <button
                          onClick={() => onNavigateToTracking(ord.id)}
                          className="px-3 py-1.5 rounded-lg bg-gray-900 dark:bg-slate-800 hover:bg-black text-white text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-400" />
                          <span>Track Order</span>
                        </button>

                        {/* Download Invoice */}
                        <button
                          onClick={() => generateAndPrintInvoice(ord)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-[11px] font-bold flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-rose-600" />
                          <span>Invoice</span>
                        </button>

                        {/* View Details Modal */}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 text-[11px] font-bold transition cursor-pointer"
                        >
                          Details
                        </button>

                        {/* Reorder */}
                        <button
                          onClick={() => handleReorder(ord)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 hover:bg-rose-100 text-[11px] font-bold transition cursor-pointer border border-rose-200 dark:border-rose-900"
                        >
                          Reorder
                        </button>

                        {/* Cancel Button (if eligible) */}
                        {canCancel && (
                          <button
                            onClick={() => handleCancelOrder(ord.id)}
                            className="px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 hover:bg-red-100 text-[11px] font-bold transition cursor-pointer border border-red-200 dark:border-red-900"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PROFILE SETTINGS                                  */}
      {/* ======================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm text-gray-950 dark:text-white uppercase tracking-wider">
              Profile & Contact Settings
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Keep your contact and UPI details up-to-date for instant ₹250 cooler box returns.
            </p>
          </div>

          {profileNotice && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{profileNotice}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Full Name</label>
                <input 
                  type="text" 
                  value={profileName} 
                  onChange={e => setProfileName(e.target.value)} 
                  required
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Email Address</label>
                <input 
                  type="email" 
                  value={user?.email || ''} 
                  disabled 
                  className="w-full px-3 py-2 rounded-xl bg-gray-100 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 text-gray-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Primary Mobile Number</label>
                <input 
                  type="tel" 
                  value={profilePhone} 
                  onChange={e => setProfilePhone(e.target.value)} 
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">
                  UPI ID (For Instant ₹250 Cooler Box Refunds)
                </label>
                <input 
                  type="text" 
                  value={profileUpiId} 
                  onChange={e => setProfileUpiId(e.target.value)} 
                  placeholder="e.g. pooja@okhdfcbank"
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-600 dark:text-gray-300 font-bold mb-1">Default Delivery Address</label>
              <textarea 
                value={profileAddress} 
                onChange={e => setProfileAddress(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={savingProfile}
              className="px-6 py-2.5 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-black text-xs cursor-pointer shadow-sm transition"
            >
              {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
            </button>
          </form>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: PAYMENT HISTORY                                   */}
      {/* ======================================================== */}
      {activeTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="border-b border-gray-100 dark:border-slate-800 pb-3">
            <h3 className="font-black text-sm text-gray-950 dark:text-white uppercase tracking-wider">
              Payment & Transaction Ledger
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Verified Razorpay transactions, Cash on Delivery receipts, and cold-box deposit refunds.
            </p>
          </div>

          {orders.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No transactions recorded yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 border-b border-gray-200 dark:border-slate-700 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Order #</th>
                    <th className="py-2.5 px-3">Method</th>
                    <th className="py-2.5 px-3">Transaction / Razorpay ID</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-[11px]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-3 text-gray-500">
                        {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'Recent'}
                      </td>
                      <td className="py-3 px-3 font-bold text-gray-900 dark:text-white">
                        #{ord.orderNumber || ord.id}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-700 dark:text-gray-300">
                        {ord.paymentMethod || 'Razorpay Online'}
                      </td>
                      <td className="py-3 px-3 font-mono text-gray-500">
                        {ord.razorpayPaymentId || ord.razorpayOrderId || 'COD_VERIFIED'}
                      </td>
                      <td className="py-3 px-3 font-black text-gray-950 dark:text-white">
                        ₹{ord.total || ord.totalAmount}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          ord.paymentStatus === 'PAID' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                          ord.paymentStatus === 'REFUNDED' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
                          'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}>
                          {ord.paymentStatus || 'PAID'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: WISHLIST                                          */}
      {/* ======================================================== */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-gray-950 dark:text-white uppercase tracking-wider">
              Saved Fresh Cuts ({wishlist.length})
            </h3>
          </div>

          {wishlist.length === 0 ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl space-y-3">
              <Heart className="w-12 h-12 text-gray-300 mx-auto" />
              <p className="font-bold text-gray-900 dark:text-white text-sm">Your Wishlist is Empty</p>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Save your favorite harbor catch or tender cuts here for 1-click reordering.
              </p>
              <button
                onClick={onNavigateToCatalog}
                className="mt-2 px-5 py-2.5 bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs rounded-xl shadow-xs transition"
              >
                Explore Meat & Seafood
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishlist.map((prod) => (
                <div key={prod.id} className="p-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl flex flex-col justify-between space-y-3 shadow-xs">
                  <div className="flex gap-3">
                    <img 
                      src={prod.image || prod.imageUrl || `/images/products/${prod.id}.jpg`} 
                      alt={prod.name}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-200"
                    />
                    <div>
                      <h4 className="font-extrabold text-xs text-gray-950 dark:text-white">{prod.name}</h4>
                      <p className="text-[11px] text-gray-500">{prod.unit} • {prod.cutStyle}</p>
                      <span className="font-black text-sm text-[#d11243] mt-1 block">₹{prod.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                    <button
                      onClick={() => addItem(prod)}
                      className="flex-1 py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                    <button
                      onClick={() => handleRemoveFromWishlist(prod.id)}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-slate-800 hover:text-red-600 transition"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: SAVED ADDRESSES                                   */}
      {/* ======================================================== */}
      {activeTab === 'addresses' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white uppercase tracking-wider">
                Saved Delivery Addresses
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Quickly select your home, work, or weekend retreat address during express checkout.
              </p>
            </div>
            <button
              onClick={() => setIsAddingAddress(!isAddingAddress)}
              className="px-3.5 py-1.5 bg-[#d11243] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {isAddingAddress && (
            <form onSubmit={handleAddAddress} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-3 text-xs">
              <div className="flex gap-2">
                {(['home', 'work', 'other'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setNewAddressType(type)}
                    className={`px-3 py-1 rounded-lg font-bold capitalize transition ${
                      newAddressType === type ? 'bg-[#d11243] text-white' : 'bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
              <textarea
                value={newAddressText}
                onChange={e => setNewAddressText(e.target.value)}
                required
                placeholder="Flat / Building Name, Street, Landmark, City & Pincode"
                rows={2}
                className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-lg cursor-pointer"
                >
                  Save Address
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAddress(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {savedAddresses.map((addr) => (
              <div key={addr.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 flex flex-col justify-between text-xs space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-gray-950 dark:text-white uppercase flex items-center gap-1 text-[11px]">
                      <MapPin className="w-3.5 h-3.5 text-[#d11243]" />
                      <span>{addr.type}</span>
                    </span>
                    {addr.isDefault && (
                      <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[9px] font-bold">
                        DEFAULT
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mt-2 leading-relaxed">{addr.text}</p>
                </div>
                <div className="pt-2 border-t border-gray-200 dark:border-slate-700 flex justify-end">
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-gray-400 hover:text-red-600 text-[11px] font-bold cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: COLD-BOX RETURNS                                  */}
      {/* ======================================================== */}
      {activeTab === 'coolers' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-5">
          <div className="border-b border-gray-100 dark:border-slate-800 pb-3 flex items-center justify-between">
            <div>
              <h3 className="font-black text-sm text-gray-950 dark:text-white uppercase tracking-wider">
                ThermalVault™ Cold Box & Deposit Status
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Every box carries a ₹250 refundable deposit. Unpack your meat and schedule a free doorstep pickup anytime.
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block">Protected Deposit</span>
              <span className="text-base font-black text-emerald-700 dark:text-emerald-400">₹{totalHeldDeposit}</span>
            </div>
          </div>

          {coolers.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              You currently have no cold boxes in your possession. Boxes are tagged automatically with each meat delivery.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {coolers.map(c => (
                <div key={c.id} className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 text-xs space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-black text-gray-900 dark:text-white text-sm">
                        {c.id}
                      </span>
                      <p className="text-[11px] text-gray-500">{c.model}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-extrabold text-[10px]">
                      ₹250 Protected
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-600 dark:text-gray-300">
                    <div>QR Code: <strong className="font-mono">{c.qrCode}</strong></div>
                    <div>Status: <span className="font-bold text-emerald-700 capitalize">{c.status.replace('_', ' ')}</span></div>
                  </div>

                  <button
                    onClick={() => {
                      alert(`Doorstep pickup scheduled for box ${c.id}. ₹250 will be refunded to your registered UPI ID (${user?.upiId || 'UPI'}) upon scan.`);
                    }}
                    className="w-full py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs transition"
                  >
                    Request 1-Click Pickup (₹250 UPI Refund)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* TAB 7: GOMEAT VAULT WALLET & REFUNDS PASSBOOK             */}
      {/* ======================================================== */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <Wallet className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-gray-950 dark:text-white">
                  GoMeat In-App Vault Wallet™
                </h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Your direct store credit from returned cooler boxes and refunds. Use anytime for 1-click checkout.
              </p>
            </div>
            <button
              onClick={() => {
                fetchWallet();
                refreshUser();
              }}
              className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingWallet ? 'animate-spin' : ''}`} />
              <span>Refresh Balance</span>
            </button>
          </div>

          {/* Wallet Balance Hero Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 text-white p-6 sm:p-8 shadow-xl">
            <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wide backdrop-blur-xs flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Active Store Credit</span>
                  </span>
                  <span className="text-[11px] text-emerald-100 font-medium">• Never Expires</span>
                </div>
                <p className="text-xs text-emerald-100 font-medium">Available Balance</p>
                <div className="text-4xl sm:text-5xl font-black tracking-tight flex items-baseline gap-1">
                  <span>₹{user?.walletBalance ?? walletBalance}</span>
                  <span className="text-sm font-semibold text-emerald-200">INR</span>
                </div>
                <p className="text-xs text-emerald-100/90 max-w-md pt-1">
                  Ready to redeem on your next fresh meat order. At checkout, check <strong>"Use GoMeat Wallet"</strong> to deduct this amount directly.
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
                <button
                  onClick={onNavigateToCatalog}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-emerald-50 text-emerald-900 font-black text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <span>Shop Cuts (Use Wallet)</span>
                </button>
                <button
                  onClick={() => setActiveTab('coolers')}
                  className="px-5 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white border border-emerald-400/30 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Return a Box (+₹250)</span>
                </button>
              </div>
            </div>
          </div>

          {/* 3-Step Simple Explainer */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="font-extrabold text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
              How the GoMeat Wallet Works (Simple & Transparent)
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center">
                  1
                </div>
                <h5 className="font-bold text-xs text-gray-950 dark:text-white">Return Cooler Box</h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Hand your empty ThermalVault™ box back to the delivery rider on your next order, or request a free pickup from this dashboard.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center">
                  2
                </div>
                <h5 className="font-bold text-xs text-gray-950 dark:text-white">Instant ₹250 Refund</h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  The moment your returned box is inspected at our local hub, ₹250 is instantly credited to your GoMeat Wallet (or directly to your UPI / Bank account).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 space-y-1.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-xs flex items-center justify-center">
                  3
                </div>
                <h5 className="font-bold text-xs text-gray-950 dark:text-white">1-Click Checkout</h5>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  Use your wallet balance to pay for your fresh meat cuts. If your wallet covers 100% of the total, you pay ₹0 out of pocket in 1 second!
                </p>
              </div>
            </div>
          </div>

          {/* Passbook / Transaction History */}
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h4 className="font-black text-sm text-gray-950 dark:text-white">
                  Wallet Passbook & Transaction Ledger
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Complete history of cooler deposits refunded and wallet amounts redeemed.
                </p>
              </div>
              <span className="text-xs font-bold text-gray-500">
                {(walletTransactions.length || (user?.walletTransactions?.length ?? 0))} Transactions
              </span>
            </div>

            {loadingWallet ? (
              <div className="p-10 text-center text-xs text-gray-400">Loading wallet passbook...</div>
            ) : (walletTransactions.length === 0 && (!user?.walletTransactions || user.walletTransactions.length === 0)) ? (
              <div className="p-10 text-center space-y-2">
                <Wallet className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">No transactions in your wallet yet</p>
                <p className="text-[11px] text-gray-500 max-w-sm mx-auto">
                  When you return an empty ThermalVault™ cooler box, your ₹250 refund credit will show up right here!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800">
                {(walletTransactions.length > 0 ? walletTransactions : (user?.walletTransactions || [])).map((tx) => {
                  const isCredit = tx.type === 'credit';
                  return (
                    <div key={tx.id} className="py-3.5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                          isCredit 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' 
                            : 'bg-rose-100 text-[#d11243] dark:bg-rose-950/60 dark:text-rose-400'
                        }`}>
                          {isCredit ? '+' : '−'}
                        </div>
                        <div>
                          <div className="font-bold text-xs text-gray-900 dark:text-white flex items-center gap-2">
                            <span>{tx.title}</span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                              isCredit 
                                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' 
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {isCredit ? 'CREDIT' : 'DEBIT'}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {tx.description}
                          </p>
                          <span className="text-[10px] text-gray-400">
                            {new Date(tx.date).toLocaleString('en-IN', {
                              dateStyle: 'medium',
                              timeStyle: 'short'
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className={`font-black text-sm ${
                          isCredit 
                            ? 'text-emerald-600 dark:text-emerald-400' 
                            : 'text-gray-900 dark:text-white'
                        }`}>
                          {isCredit ? `+₹${tx.amount}` : `−₹${tx.amount}`}
                        </div>
                        <div className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold mt-0.5">
                          Balance: ₹{tx.balanceAfter}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ORDER DETAILS MODAL                                      */}
      {/* ======================================================== */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 p-6 text-xs text-gray-900 dark:text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-slate-800">
              <div>
                <h4 className="font-black text-sm">Order Details #{selectedOrder.orderNumber || selectedOrder.id}</h4>
                <p className="text-[11px] text-gray-500">{selectedOrder.deliverySlot}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cuts breakdown */}
            <div className="space-y-2">
              <span className="font-bold uppercase text-gray-400 text-[10px]">Cuts in this Cold Box:</span>
              {selectedOrder.items.map((it, idx) => (
                <div key={idx} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-slate-800/60">
                  <div>
                    <span className="font-bold block">{it.name}</span>
                    <span className="text-[10px] text-gray-500">{it.quantity} x {it.unit} ({it.cutStyle})</span>
                  </div>
                  <span className="font-black">₹{it.price * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Bill breakdown */}
            <div className="p-3 bg-gray-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span className="font-bold">₹{selectedOrder.subtotal}</span>
              </div>
              <div className="flex justify-between text-emerald-700">
                <span>ThermalVault Cooler Deposit:</span>
                <span className="font-bold">+₹{selectedOrder.coolerDeposit || 250} (Refundable)</span>
              </div>
              {selectedOrder.discountAmount ? (
                <div className="flex justify-between text-emerald-700">
                  <span>Discount:</span>
                  <span>-₹{selectedOrder.discountAmount}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Delivery:</span>
                <span>{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-slate-700 pt-1.5 flex justify-between text-sm font-black text-[#d11243]">
                <span>Total Amount:</span>
                <span>₹{selectedOrder.total || selectedOrder.totalAmount}</span>
              </div>
            </div>

            {/* Payment & Delivery Data */}
            <div className="space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
              <div><strong>Payment Method:</strong> {selectedOrder.paymentMethod}</div>
              {selectedOrder.razorpayPaymentId && (
                <div><strong>Razorpay Payment ID:</strong> <span className="font-mono">{selectedOrder.razorpayPaymentId}</span></div>
              )}
              <div><strong>Delivery Address:</strong> {typeof selectedOrder.deliveryAddress === 'object' && selectedOrder.deliveryAddress !== null ? `${(selectedOrder.deliveryAddress as any).flatNo || (selectedOrder.deliveryAddress as any).line1 || ''} ${(selectedOrder.deliveryAddress as any).street || ''}, ${(selectedOrder.deliveryAddress as any).city || ''}` : String(selectedOrder.deliveryAddress || '')}</div>
              <div><strong>ThermalVault Box ID:</strong> <span className="font-mono">{selectedOrder.coolerId}</span></div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => generateAndPrintInvoice(selectedOrder)}
                className="flex-1 py-2 rounded-xl bg-gray-900 text-white font-bold text-xs"
              >
                Download Invoice
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
