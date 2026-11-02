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
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: (roleHint?: 'customer' | 'admin') => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  selectedCity,
  setSelectedCity,
  searchQuery,
  setSearchQuery
}) => {
  const { user, logout } = useAuth();
  const { totalItems, subtotal, setIsCartOpen } = useCart();
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
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-2xs">
      
      {/* Top announcement */}
      <div className="bg-[#fcf8f9] border-b border-rose-100/70 px-4 py-1 text-[11px] text-gray-600">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#d11243]">FSSAI FSSC-22000 CERTIFIED:</span>
            <span>0°C to 4°C Chilled Fresh • Delivered in Reusable Cold Box (₹250 Refundable Deposit)</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-gray-500">
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
          <div className="flex items-center gap-5">
            <div 
              onClick={() => setCurrentTab('catalog')} 
              className="flex items-center cursor-pointer shrink-0 py-1"
            >
              <img 
                src="/images/logo.png" 
                alt="GoMeat - Freshness we can trust." 
                className="h-10 sm:h-11 w-auto object-contain hover:opacity-95 transition" 
              />
            </div>

            {/* Location Selector */}
            <div className="hidden lg:flex items-center gap-1.5 pl-3 border-l border-gray-200 text-xs">
              <MapPin className="w-4 h-4 text-[#d11243] shrink-0" />
              <div>
                <div className="flex items-center gap-1">
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="font-bold text-gray-900 bg-transparent cursor-pointer focus:outline-none"
                  >
                    {indianCities.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500 font-medium truncate max-w-[140px]">{currentLocality}</span>
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                  <span>Express in 90 Mins Available</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for chicken, seer fish, mutton, prawns..."
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-50 focus:bg-white border border-gray-200 focus:border-[#d11243] text-gray-800 text-xs placeholder-gray-400 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            <button
              onClick={() => setCurrentTab('coolers')}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                currentTab === 'coolers' 
                  ? 'bg-rose-50 text-[#d11243] border border-rose-200' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d11243]" />
              <span>Box Returns</span>
              {user?.depositBalance ? (
                <span className="px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                  ₹{user.depositBalance}
                </span>
              ) : null}
            </button>

            <button
              onClick={() => setCurrentTab('tracking')}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                currentTab === 'tracking' 
                  ? 'bg-rose-50 text-[#d11243] border border-rose-200 shadow-2xs font-bold' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Tracking</span>
            </button>

            <button
              onClick={handleAdminTabClick}
              className={`hidden md:inline-block px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition ${
                currentTab === 'admin' 
                  ? 'bg-amber-50 text-amber-900 border border-amber-300' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              Hub Ops
              {user?.role === 'admin' && (
                <span className="ml-1 px-1 py-0.2 bg-amber-200 text-amber-900 rounded text-[9px] font-bold">
                  ADMIN
                </span>
              )}
            </button>

            {/* User Profile or Explicit Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 text-xs font-semibold text-gray-800 border border-gray-200 cursor-pointer"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-5 h-5 rounded-full object-cover border border-gray-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-[#d11243] text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline truncate max-w-[90px]">{user.name.split(' ')[0]}</span>
                  <span className="text-[10px] px-1 py-0.2 bg-gray-100 text-gray-500 rounded font-normal uppercase">
                    {user.role}
                  </span>
                </button>

                {userDropdownOpen && (
                  <div 
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-1 w-60 rounded-lg bg-white border border-gray-200 shadow-xl py-2 z-50 text-xs text-gray-700"
                  >
                    <div className="px-3 py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 mb-1">
                        {user.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt={user.name} 
                            className="w-7 h-7 rounded-full object-cover border border-gray-200 shadow-2xs" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-[#d11243] text-white flex items-center justify-center font-bold text-xs">
                            {user.name.charAt(0)}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-gray-900 truncate">{user.name}</p>
                          <p className="text-gray-500 text-[10px] truncate">{user.email}</p>
                        </div>
                      </div>
                      {user.authProvider === 'google' && (
                        <div className="mt-1 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
                          <svg className="w-3 h-3 text-emerald-600" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                          </svg>
                          <span>Verified with Google</span>
                        </div>
                      )}
                      <p className="text-gray-600 text-[11px] mt-1">
                        Role: <strong className="text-gray-900 uppercase font-semibold">{user.role}</strong>
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        Box Deposit Held: <strong className="text-emerald-700">₹{user.depositBalance || 0}</strong>
                      </p>
                    </div>

                    <button
                      onClick={() => setCurrentTab('coolers')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 hover:text-[#d11243] cursor-pointer"
                    >
                      Return Boxes (₹250 UPI Refund)
                    </button>

                    <button
                      onClick={() => setCurrentTab('tracking')}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 hover:text-[#d11243] cursor-pointer"
                    >
                      Order & Temperature Status
                    </button>

                    {user.role === 'admin' && (
                      <button
                        onClick={() => setCurrentTab('admin')}
                        className="w-full text-left px-3 py-2 hover:bg-amber-50 text-amber-900 font-semibold cursor-pointer"
                      >
                        Central Hub Operations
                      </button>
                    )}

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={logout}
                      className="w-full text-left px-3 py-1.5 text-red-600 hover:bg-red-50 flex items-center gap-1.5 cursor-pointer"
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
                className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white font-bold text-xs cursor-pointer flex items-center gap-1.5 transition"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="px-3 py-2 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-2xs transition"
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
              className="md:hidden p-1.5 text-gray-600 hover:text-gray-900"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white border-b border-gray-200 space-y-2 text-xs">
          <div className="pb-2 border-b border-gray-100">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chicken, fish, mutton..."
              className="w-full px-3 py-2 rounded-lg bg-gray-100 border border-gray-200 text-xs"
            />
          </div>

          <button
            onClick={() => { setCurrentTab('catalog'); setMobileMenuOpen(false); }}
            className="w-full text-left py-2 px-3 rounded-lg bg-gray-50 text-gray-800 font-semibold"
          >
            Fresh Cuts Catalog
          </button>
          <button
            onClick={() => { 
              setCurrentTab('tracking'); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-gray-50 text-gray-800 font-semibold flex items-center justify-between"
          >
            <span>Live Tracking & Telemetry</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </button>
          <button
            onClick={() => { 
              setCurrentTab('coolers'); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-rose-50 text-[#d11243] font-semibold"
          >
            Box Returns (₹250 Refund)
          </button>
          <button
            onClick={() => { 
              handleAdminTabClick(); 
              setMobileMenuOpen(false); 
            }}
            className="w-full text-left py-2 px-3 rounded-lg bg-amber-50 text-amber-900 font-semibold"
          >
            Operations Hub Admin
          </button>
        </div>
      )}

    </header>
  );
};
