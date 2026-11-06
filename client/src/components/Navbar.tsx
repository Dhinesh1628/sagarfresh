import React, { useState } from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  LogOut, 
  Menu, 
  X,
  Search,
  Zap,
  RotateCcw,
  User as UserIcon,
  ShieldAlert,
  Sun,
  Moon,
  ChevronDown,
  Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import type { DeliveryAddress } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (roleHint?: 'customer' | 'admin') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  currentAddress?: DeliveryAddress;
  onOpenLocationModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery,
  currentAddress,
  onOpenLocationModal
}) => {
  const { user, logout } = useAuth();
  const { totalItems, subtotal, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const indianCities = [
    { name: 'Bengaluru', locality: 'Indiranagar, 560038' },
    { name: 'Mumbai', locality: 'Bandra West, 400050' },
    { name: 'Hyderabad', locality: 'Jubilee Hills, 500033' },
    { name: 'Delhi NCR', locality: 'Gurugram CyberCity, 122002' },
    { name: 'Pune', locality: 'Koregaon Park, 411001' },
    { name: 'Chennai', locality: 'Adyar, 600020' }
  ];

  const currentLocality = indianCities.find(c => c.name === selectedCity)?.locality || 'Indiranagar, 560038';

  const handleAdminTabClick = () => {
    if (!user) {
      onOpenAuth('admin');
      return;
    }
    if (user.role !== 'admin') {
      alert('Access Restricted: Admin credentials required to access the Central Operations Hub. Please sign in with an admin account (ops@gomeat.in / admin123).');
      onOpenAuth('admin');
      return;
    }
    setCurrentTab('admin');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-2xs transition-colors duration-300">
      
      {/* Top announcement */}
      <div className="bg-[#fcf8f9] dark:bg-slate-950 border-b border-rose-100/70 dark:border-slate-800/80 px-4 py-1 text-[11px] text-gray-600 dark:text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#d11243]">FSSAI FSSC-22000 CERTIFIED:</span>
            <span>0°C to 4°C Chilled Fresh • Delivered in Reusable Cold Box (₹250 Refundable Deposit)</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-gray-500 dark:text-gray-400">
            <button 
              onClick={() => {
                if (!user) {
                  onOpenAuth('customer');
                } else {
                  setCurrentTab('coolers');
                }
              }}
              className="text-[#d11243] hover:underline font-semibold cursor-pointer"
            >
              Return Empty Box for ₹250 Refund &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-3 lg:gap-4 shrink-0">
            <div 
              onClick={() => setCurrentTab('catalog')} 
              className="flex items-center cursor-pointer shrink-0 py-1"
            >
              <img 
                src="/images/logo.png" 
                alt="GoMeat - Freshness we can trust." 
                className="h-9 sm:h-10 w-auto object-contain hover:opacity-95 transition" 
              />
            </div>

            {/* Location Selector */}
            <button
              onClick={onOpenLocationModal}
              className="hidden lg:flex items-center gap-2 pl-3 py-1 px-2 rounded-xl border-l border-gray-200 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs transition cursor-pointer text-left group shrink-0 max-w-[200px] xl:max-w-[240px]"
              title="Click to enter custom delivery address or detect location"
              type="button"
            >
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#d11243] group-hover:scale-110 transition-transform shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="leading-tight overflow-hidden">
                <div className="flex items-center gap-1">
                  <span className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#d11243] transition-colors truncate">
                    {currentAddress ? (
                      currentAddress.tag === 'Home' || currentAddress.tag === 'Work' 
                        ? `${currentAddress.tag} • ${currentAddress.city}`
                        : (currentAddress.area || currentAddress.city)
                    ) : selectedCity}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#d11243] transition-transform group-hover:translate-y-0.5 shrink-0" />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-gray-600 dark:text-gray-300 font-medium truncate max-w-[100px] xl:max-w-[140px] text-[11px]">
                    {currentAddress ? (
                      currentAddress.formattedAddress || `${currentAddress.flatNo ? currentAddress.flatNo + ', ' : ''}${currentAddress.area || currentAddress.street}`
                    ) : currentLocality}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap shrink-0">
                    90 Mins
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 min-w-[160px] max-w-xs xl:max-w-md mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chicken, fish, mutton..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-[#d11243] text-gray-800 dark:text-gray-100 text-xs placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            <button
              onClick={() => {
                if (!user) onOpenAuth('customer');
                else setCurrentTab('dashboard');
              }}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard' 
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-2xs' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>My Orders</span>
            </button>

            <button
              onClick={() => setCurrentTab('coolers')}
              className={`hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap shrink-0 ${
                currentTab === 'coolers' 
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 border border-rose-200 dark:border-rose-900' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d11243]" />
              <span>Box Returns</span>
              {user?.depositBalance ? (
                <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded text-[10px] font-bold">
                  ₹{user.depositBalance}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setCurrentTab('tracking')}
              className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap shrink-0 ${
                currentTab === 'tracking' 
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-2xs font-bold' 
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Tracking</span>
            </button>

            {user?.role === 'admin' && (
              <button
                onClick={handleAdminTabClick}
                className={`hidden 2xl:inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition whitespace-nowrap shrink-0 ${
                  currentTab === 'admin' 
                    ? 'bg-amber-50 text-amber-900 border border-amber-300' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Hub Ops</span>
                <span className="ml-1 px-1 py-0.2 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 rounded text-[9px] font-bold">
                  ADMIN
                </span>
              </button>
            )}

            {/* Dark / Light Theme Toggle with Glowing Light Effect */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-amber-400 hover:border-[#d11243] hover:shadow-[0_0_15px_rgba(225,29,67,0.25)] transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-4 h-4 text-gray-700 hover:text-[#d11243] transition-colors" />
              )}
            </button>

            {/* User Profile or Explicit Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 cursor-pointer"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-5 h-5 rounded-full object-cover border border-gray-300 dark:border-slate-600"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#d11243] text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] px-1 py-0.2 bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded font-normal uppercase">
                    {user.role}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div 
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-1 w-60 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs text-gray-700 dark:text-gray-200"
                  >
                    <div className="px-3 py-2 border-b border-gray-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 mb-1">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-slate-700 shadow-2xs" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#d11243] text-white flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-[10px] truncate">{user.email}</p>
                        </div>
                      </div>
                      {user.authProvider === 'google' && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-[10px] font-semibold">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          <span>Verified with Google</span>
                        </div>
                      )}
                      <p className="text-gray-600 dark:text-gray-400 text-[11px] mt-1">
                        Role: <strong className="text-gray-900 dark:text-white uppercase font-semibold">{user.role}</strong>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                        GoMeat Wallet: <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">₹{user.walletBalance || 0}</strong>
                        <span className="ml-1 text-[9px] bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 px-1 py-0.5 rounded font-semibold">Store Credit</span>
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-[11px]">
                        Box Deposit Held: <strong className="text-slate-700 dark:text-slate-300">₹{user.depositBalance || 0}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentTab('dashboard')}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 font-semibold flex items-center justify-between cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                        GoMeat Wallet Passbook
                      </span>
                      <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded text-[10px] font-bold">₹{user.walletBalance || 0}</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('dashboard')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#d11243] dark:hover:text-rose-400 font-bold flex items-center justify-between cursor-pointer"
                    >
                      <span>My Account & Orders</span>
                      <span className="px-1.5 py-0.2 bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 rounded text-[10px] font-semibold">Dashboard</span>
                    </button>

                    <button
                      onClick={() => setCurrentTab('coolers')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#d11243] dark:hover:text-rose-400 cursor-pointer"
                    >
                      Return Boxes (₹250 UPI Refund)
                    </button>

                    <button
                      onClick={() => setCurrentTab('tracking')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#d11243] dark:hover:text-rose-400 cursor-pointer"
                    >
                      Order & Temperature Status
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => setCurrentTab('admin')}
                        className="w-full text-left px-3 py-2 hover:bg-amber-50 dark:hover:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold cursor-pointer"
                      >
                        Central Hub Operations
                      </button>
                    )}

                    <div className="border-t border-gray-100 dark:border-slate-800 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 flex items-center gap-1.5 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuth('customer')}
                className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition shadow-xs"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* GoMeat Wallet Live Pill */}
            {user && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                title="GoMeat Wallet Balance - Click to view passbook"
                className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-2xs"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Wallet:</span>
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200">₹{user.walletBalance ?? 0}</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-2 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md hover:shadow-lg transition card-light-hover"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="px-1.5 py-0.2 bg-white text-[#d11243] rounded-full text-[11px] font-extrabold">
                  {totalItems}
                </span>
              )}
              {subtotal > 0 && (
                <span className="hidden md:inline font-bold pl-1 border-l border-rose-400/50">
                  ₹{subtotal}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="pb-2 border-b border-gray-100 dark:border-slate-800 space-y-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chicken, fish, mutton..."
              className="w-full px-3 py-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-100 text-xs"
            />
            {/* Mobile Location Selector */}
            <button
              onClick={() => {
                onOpenLocationModal?.();
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-left text-xs"
              type="button"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#d11243] shrink-0" />
                <div>
                  <div className="font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <span>Deliver to: {currentAddress?.tag || currentAddress?.city || selectedCity}</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">• 90 Mins</span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 truncate max-w-[240px]">
                    {currentAddress ? (currentAddress.formattedAddress || `${currentAddress.flatNo ? currentAddress.flatNo + ', ' : ''}${currentAddress.area || currentAddress.street}`) : currentLocality}
                  </div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-[#d11243] underline shrink-0">Change</span>
            </button>
          </div>

          {/* Mobile GoMeat Wallet Card */}
          {user && (
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-400 tracking-wide">GoMeat Wallet</div>
                  <div className="font-extrabold text-sm text-emerald-900 dark:text-emerald-100">₹{user.walletBalance ?? 0}</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setCurrentTab('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 rounded-lg shadow-2xs"
              >
                Passbook →
              </button>
            </div>
          )}

          {/* Theme Toggle in Mobile */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
            <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">
              Theme: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </span>
            <button
              onClick={toggleTheme}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-xs font-bold flex items-center gap-1.5 shadow-2xs"
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-gray-700" />}
              <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
            </button>
          </div>

          <button
            onClick={() => { setCurrentTab('catalog'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-semibold"
          >
            Fresh Cuts Catalog
          </button>
          <button
            onClick={() => { 
              if (!user) onOpenAuth('customer');
              else setCurrentTab('dashboard'); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-semibold flex items-center justify-between"
          >
            <span>My Orders & Account</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-[#d11243] font-bold">Dashboard</span>
          </button>
          <button
            onClick={() => { 
              setCurrentTab('tracking'); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-gray-50 dark:bg-slate-800 text-gray-800 dark:text-gray-200 font-semibold flex items-center justify-between"
          >
            <span>Live Tracking & Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => { 
              setCurrentTab('coolers'); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 font-semibold"
          >
            Box Returns (₹250 Refund)
          </button>
          <button
            onClick={() => { 
              handleAdminTabClick(); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-semibold"
          >
            Operations Hub Admin
          </button>
        </div>
      )}

    </header>
  );
};
