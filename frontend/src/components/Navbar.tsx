import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  Wallet,
  Clock,
  Sparkles,
  Percent,
  Plus,
  Minus,
  ArrowRight,
  Check,
  TrendingUp,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../api';
import type { DeliveryAddress, Product } from '../types';

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

const TRENDING_SEARCH_CHIPS = [
  { label: '🍗 Curry Cut', term: 'Curry Cut' },
  { label: '🥩 Biryani Cut', term: 'Biryani' },
  { label: '🐟 Surmai Steaks', term: 'Surmai' },
  { label: '🍗 Boneless Fillets', term: 'Boneless' },
  { label: '🦐 Jumbo Prawns', term: 'Prawns' },
  { label: '🐟 White Pomfret', term: 'Pomfret' },
  { label: '🍢 Amritsari Tikka', term: 'Tikka' },
  { label: '🎁 Feast Combo Box', term: 'Feast' },
];

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
  const { totalItems, subtotal, setIsCartOpen, items, addItem, updateQuantity, applyCoupon } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [offersToast, setOffersToast] = useState<string | null>(null);

  // Swiggy-Grade Search & Autocomplete Engine
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('gomeat_recent_searches');
      return saved ? JSON.parse(saved) : ['Surmai', 'Biryani Cut', 'Boneless', 'Prawns'];
    } catch {
      return ['Surmai', 'Biryani Cut', 'Boneless', 'Prawns'];
    }
  });

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const searchPlaceholders = useMemo(() => [
    'Search for "fresh chicken curry cut"...',
    'Search for "mutton biryani cut"...',
    'Search for "surmai fish steaks"...',
    'Search for "jumbo sea tiger prawns"...',
    'Search for "boneless chicken breast fillets"...',
    'Search for "white pomfret tawa fry"...',
    'Search for "ready to cook fish tikka"...',
    'Search for "weekend coastal feast box"...'
  ], []);

  // Cycling placeholder text every 2.8 seconds when inactive (Swiggy pattern)
  useEffect(() => {
    if (isSearchFocused || searchQuery.trim()) return;
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % searchPlaceholders.length);
    }, 2800);
    return () => clearInterval(interval);
  }, [isSearchFocused, searchQuery, searchPlaceholders.length]);

  // Pre-load products into memory for instantaneous 0ms search autocomplete
  useEffect(() => {
    let isMounted = true;
    api.getProducts().then((data) => {
      if (isMounted && data && Array.isArray(data)) {
        setAllProducts(data);
      }
    }).catch((err) => {
      console.warn('Could not prefetch products for search:', err);
    });
    return () => { isMounted = false; };
  }, []);

  // Close dropdown upon outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(target) &&
        (!mobileSearchRef.current || !mobileSearchRef.current.contains(target))
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Live matching cuts
  const matchingProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allProducts.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.cutStyle && p.cutStyle.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.origin && p.origin.toLowerCase().includes(q)) ||
      (p.chillingMethod && p.chillingMethod.toLowerCase().includes(q))
    ).slice(0, 5);
  }, [allProducts, searchQuery]);

  const handleSelectSearchTerm = (term: string) => {
    const cleanTerm = term.replace(/^[^\w]+/, '').trim();
    setSearchQuery(cleanTerm);
    setIsSearchFocused(false);
    if (currentTab !== 'catalog') {
      setCurrentTab('catalog');
    }
    // Record to recent searches
    const updated = [cleanTerm, ...recentSearches.filter(s => s.toLowerCase() !== cleanTerm.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem('gomeat_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('gomeat_recent_searches');
    } catch {}
  };

  const handleRemoveRecentItem = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter(s => s !== termToRemove);
    setRecentSearches(updated);
    try {
      localStorage.setItem('gomeat_recent_searches', JSON.stringify(updated));
    } catch {}
  };

  const getItemQuantityInCart = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  const handleQuickAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product, 1, product.cutStyle || 'Standard Cut', product.unit || '500g', product.price, product.mrp);
  };

  const handleQuickUpdateQuantity = (productId: string, newQty: number, e: React.MouseEvent) => {
    e.stopPropagation();
    updateQuantity(productId, newQty);
  };

  const handleViewAllResults = () => {
    setIsSearchFocused(false);
    if (currentTab !== 'catalog') {
      setCurrentTab('catalog');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsSearchFocused(false);
    } else if (e.key === 'Enter') {
      if (searchQuery.trim()) {
        handleSelectSearchTerm(searchQuery.trim());
      }
    }
  };

  const handleOffersClick = () => {
    applyCoupon('FRESH20');
    setOffersToast('🎉 GoMeat Exclusive Deal Applied: 20% OFF coupon (FRESH20) added to your cart!');
    setTimeout(() => setOffersToast(null), 4000);
  };

  const renderSearchDropdown = () => {
    if (!isSearchFocused) return null;

    const isSearching = Boolean(searchQuery.trim());

    return (
      <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xl overflow-hidden z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
        {!isSearching ? (
          <div className="p-4 space-y-4">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-bold text-[11px] uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    <span>Recent Searches</span>
                  </div>
                  <button
                    onClick={handleClearRecent}
                    className="text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => handleSelectSearchTerm(term)}
                      className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 cursor-pointer transition text-xs font-medium"
                    >
                      <span>{term}</span>
                      <button
                        onClick={(e) => handleRemoveRecentItem(term, e)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        title="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div>
              <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400 font-bold text-[11px] uppercase tracking-wider mb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCH_CHIPS.map((chip) => (
                  <button
                    key={chip.term}
                    onClick={() => handleSelectSearchTerm(chip.term)}
                    className="px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-900/60 border border-rose-200/80 dark:border-rose-900/60 text-gray-800 dark:text-gray-200 text-xs font-semibold cursor-pointer transition flex items-center gap-1"
                  >
                    <span>{chip.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trust badge */}
            <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                <Zap className="w-3.5 h-3.5" /> Express 90-Min Delivery
              </span>
              <span>0°C to 4°C ThermalVault Cold Box</span>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <div className="px-4 py-1.5 flex items-center justify-between border-b border-gray-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Matching Cuts ({matchingProducts.length})
              </span>
              <button
                onClick={handleViewAllResults}
                className="text-[11px] font-bold text-[#d11243] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>View all in catalog</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {matchingProducts.length === 0 ? (
              <div className="p-6 text-center space-y-2">
                <Search className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="font-bold text-gray-800 dark:text-gray-200 text-xs">
                  No fresh cuts matching "{searchQuery}"
                </p>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Try searching for general terms like Chicken, Mutton, Fish, Prawns, or Biryani.
                </p>
                <div className="pt-2 flex flex-wrap gap-1.5 justify-center">
                  {['Chicken', 'Mutton', 'Fish', 'Prawns'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSelectSearchTerm(term)}
                      className="px-2.5 py-1 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 text-xs hover:bg-gray-200 dark:hover:bg-slate-700 cursor-pointer font-medium"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-slate-800/60 max-h-96 overflow-y-auto">
                {matchingProducts.map((product) => {
                  const qty = getItemQuantityInCart(product.id);
                  return (
                    <div
                      key={product.id}
                      onClick={() => {
                        handleSelectSearchTerm(product.name);
                      }}
                      className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={product.imageUrl || product.image || '/images/products/prod_1.jpg'}
                          alt={product.name}
                          className="w-12 h-12 rounded-xl object-cover border border-gray-200 dark:border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/images/products/prod_1.jpg';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 dark:text-white truncate group-hover:text-[#d11243] transition-colors text-xs">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {product.cutStyle && (
                              <span className="px-1.5 py-0.2 rounded bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 text-[10px] font-medium truncate max-w-[140px]">
                                {product.cutStyle}
                              </span>
                            )}
                            <span className="text-gray-400 text-[10px]">
                              {product.unit || '500g'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="font-extrabold text-gray-950 dark:text-white text-xs">
                              ₹{product.price}
                            </span>
                            {product.mrp && product.mrp > product.price && (
                              <span className="line-through text-gray-400 text-[10px]">
                                ₹{product.mrp}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Swiggy-Style "+ ADD" / Quantity Stepper Button */}
                      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                        {qty === 0 ? (
                          <button
                            onClick={(e) => handleQuickAdd(product, e)}
                            className="px-4 py-1.5 rounded-lg border border-emerald-600 bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-extrabold text-xs shadow-2xs hover:shadow-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-emerald-600" />
                            <span>ADD</span>
                          </button>
                        ) : (
                          <div className="flex items-center rounded-lg border border-emerald-600 bg-emerald-600 text-white font-extrabold text-xs shadow-2xs overflow-hidden">
                            <button
                              onClick={(e) => handleQuickUpdateQuantity(product.id, qty - 1, e)}
                              className="px-2.5 py-1.5 hover:bg-emerald-700 transition cursor-pointer"
                            >
                              <Minus className="w-3 h-3 text-white" />
                            </button>
                            <span className="px-2 font-bold text-white text-xs">
                              {qty}
                            </span>
                            <button
                              onClick={(e) => handleQuickUpdateQuantity(product.id, qty + 1, e)}
                              className="px-2.5 py-1.5 hover:bg-emerald-700 transition cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                <div 
                  onClick={handleViewAllResults}
                  className="px-4 py-2.5 bg-gray-50 dark:bg-slate-800/40 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-center font-bold text-[#d11243] text-xs cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <span>View all results for "{searchQuery}" in catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const indianCities = [
    { name: 'Bengaluru', locality: 'Indiranagar, 560038' },
    { name: 'Mumbai', locality: 'Bandra West, 400050' },
    { name: 'Hyderabad', locality: 'Jubilee Hills, 500033' },
    { name: 'Delhi NCR', locality: 'Gurugram CyberCity, 122002' },
    { name: 'Pune', locality: 'Koregaon Park, 411001' },
    { name: 'Chennai', locality: 'Adyar, 600020' }
  ];

  const currentLocality = indianCities.find(c => c.name === selectedCity)?.locality || 'Indiranagar, 560038';

  // Smart, clean location display logic (Swiggy / Zepto standard)
  const getLocationHeading = () => {
    if (!currentAddress) return selectedCity || 'Hyderabad';
    
    if (currentAddress.tag === 'Home' || currentAddress.tag === 'Work') {
      return `${currentAddress.tag} • ${currentAddress.city || selectedCity}`;
    }
    
    // For GPS or other locations: show area or city
    if (currentAddress.area && currentAddress.city && currentAddress.area.toLowerCase() !== currentAddress.city.toLowerCase()) {
      return `${currentAddress.area}, ${currentAddress.city}`;
    }
    
    return currentAddress.area || currentAddress.city || selectedCity || 'Hyderabad';
  };

  const getLocationSubtitle = () => {
    if (!currentAddress) return currentLocality || 'Select Location';
    
    if (currentAddress.formattedAddress) {
      // Clean up and prevent duplicate repeating names in the subtitle
      const parts = currentAddress.formattedAddress.split(',').map(s => s.trim()).filter(Boolean);
      const uniqueParts: string[] = [];
      const seen = new Set<string>();
      for (const p of parts) {
        const lower = p.toLowerCase();
        if (!seen.has(lower)) {
          seen.add(lower);
          uniqueParts.push(p);
        }
      }
      return uniqueParts.slice(0, 2).join(', ');
    }
    
    return currentAddress.street || currentAddress.area || currentAddress.city || 'Express Delivery';
  };

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
      <div className="bg-[#fcf8f9] dark:bg-slate-950 border-b border-rose-100/70 dark:border-slate-800/80 px-3 sm:px-4 py-1 text-[10px] sm:text-[11px] text-gray-600 dark:text-gray-400 overflow-hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <span className="font-extrabold text-[#d11243] shrink-0 text-[10px] sm:text-[11px]">0°C CHILLED FRESH:</span>
            <span className="truncate">Reusable Cold Box (₹250 Deposit Refund) • Never Frozen</span>
          </div>

          <div className="hidden sm:flex items-center gap-4 text-gray-500 dark:text-gray-400 shrink-0">
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
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3 lg:gap-4">
          
          {/* Brand Logo & Location */}
          <div className="flex items-center gap-1.5 sm:gap-3 lg:gap-4 min-w-0 shrink">
            <div 
              onClick={() => setCurrentTab('catalog')} 
              className="flex items-center cursor-pointer shrink-0 py-1"
            >
              <img 
                src="/images/logo.png" 
                alt="GoMeat - Freshness we can trust." 
                className="h-7 sm:h-10 w-auto object-contain hover:opacity-95 transition dark:hidden" 
              />
              <img 
                src="/images/logo-dark.png" 
                alt="GoMeat - Freshness we can trust." 
                className="h-7 sm:h-10 w-auto object-contain hover:opacity-95 transition hidden dark:block" 
              />
            </div>

            {/* Location Selector Button */}
            <button
              onClick={onOpenLocationModal}
              className="flex items-center gap-1 sm:gap-2 px-1.5 sm:px-2.5 h-8 sm:h-10 rounded-xl border border-gray-200/90 dark:border-slate-800 hover:bg-gray-100/80 dark:hover:bg-slate-800/80 text-xs transition cursor-pointer text-left group shrink min-w-0 max-w-[110px] sm:max-w-[210px] xl:max-w-[240px]"
              title="Click to enter custom delivery address or detect location"
              type="button"
            >
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-[#d11243] flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                <MapPin className="w-2.5 sm:w-3.5 h-2.5 sm:h-3.5" />
              </div>
              <div className="leading-tight overflow-hidden min-w-0">
                <div className="flex items-center gap-0.5 sm:gap-1 min-w-0">
                  <span className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#d11243] transition-colors truncate text-[10px] sm:text-xs">
                    {getLocationHeading()}
                  </span>
                  <ChevronDown className="w-3 h-3 text-gray-400 group-hover:text-[#d11243] transition-transform group-hover:translate-y-0.5 shrink-0" />
                </div>
                <div className="hidden sm:flex items-center gap-1 mt-0.5">
                  <span className="text-gray-500 dark:text-gray-400 font-medium truncate max-w-[70px] sm:max-w-[100px] xl:max-w-[130px] text-[10px]">
                    {getLocationSubtitle()}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-500 shrink-0" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap shrink-0">
                    90 Mins
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Swiggy-Grade Search Bar - Center Zone */}
          <div ref={searchContainerRef} className="hidden sm:flex flex-1 min-w-[200px] max-w-xl mx-2 lg:mx-4 relative">
            <div className="relative w-full">
              <Search className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
                isSearchFocused ? 'text-[#d11243]' : 'text-gray-400'
              }`} />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                  if (currentTab !== 'catalog') {
                    setCurrentTab('catalog');
                  }
                }}
                placeholder={isSearchFocused ? 'Search chicken, mutton, surmai, prawns, cuts...' : searchPlaceholders[placeholderIndex]}
                className="w-full h-10 pl-10 pr-9 rounded-xl bg-gray-100/90 dark:bg-slate-800/90 hover:bg-gray-100 dark:hover:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 border border-gray-200 dark:border-slate-700/80 focus:border-[#d11243] text-gray-900 dark:text-gray-100 text-xs placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#d11243]/20 shadow-xs transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Desktop Autocomplete Dropdown Popover */}
            {renderSearchDropdown()}
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* GoMeat Offers Button */}
            <button
              onClick={handleOffersClick}
              title="Click to apply instant 20% OFF deals"
              className="hidden md:flex h-10 px-2.5 rounded-xl text-xs font-bold transition items-center gap-1.5 whitespace-nowrap shrink-0 text-amber-700 dark:text-amber-400 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800/70 shadow-2xs cursor-pointer"
            >
              <Percent className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden xl:inline">Offers</span>
              <span className="text-[10px] bg-amber-600 text-white font-extrabold px-1.5 py-0.2 rounded-full">20%</span>
            </button>
            
            {/* My Orders / Dashboard Button */}
            <button
              onClick={() => {
                if (!user) onOpenAuth('customer');
                else setCurrentTab('dashboard');
              }}
              className={`hidden lg:flex h-10 px-3 rounded-xl text-xs font-bold cursor-pointer transition items-center gap-1.5 whitespace-nowrap shrink-0 ${
                currentTab === 'dashboard' 
                  ? 'bg-rose-50 dark:bg-rose-950/60 text-[#d11243] dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-2xs' 
                  : 'text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent'
              }`}
            >
              <span>My Orders</span>
            </button>

            {/* GoMeat Vault Wallet Live Pill */}
            {user && (
              <button
                onClick={() => setCurrentTab('dashboard')}
                title="GoMeat Vault Wallet - Click to view passbook"
                className="hidden xl:flex h-10 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 border border-emerald-300 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold items-center gap-1.5 cursor-pointer transition shadow-2xs shrink-0 whitespace-nowrap"
              >
                <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden xl:inline text-[11px] font-medium text-emerald-700 dark:text-emerald-400">Wallet:</span>
                <span className="font-extrabold text-emerald-900 dark:text-emerald-200">₹{user.walletBalance ?? 0}</span>
              </button>
            )}

            {/* Dark / Light Theme Toggle: ALWAYS VISIBLE & PROMINENT ON BOTH MOBILE & DESKTOP */}
            <button
              onClick={toggleTheme}
              className="h-8 sm:h-10 w-8 sm:w-10 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-amber-400 hover:border-[#d11243] hover:shadow-[0_0_15px_rgba(225,29,67,0.25)] transition-all duration-300 cursor-pointer flex items-center justify-center shrink-0 active:scale-95"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-gray-700 hover:text-[#d11243] transition-colors" />
              )}
            </button>

            {/* User Profile or Explicit Login Button */}
            {user ? (
              <div className="hidden sm:block relative shrink-0">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="h-10 px-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 text-xs font-semibold text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  {user.avatar ? (
                    <img 
                      src={user.avatar} 
                      alt={user.name} 
                      className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-slate-600"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-[#d11243] text-white flex items-center justify-center font-bold text-[10px]">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden sm:inline truncate max-w-[80px]">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div 
                    onClick={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-1 w-64 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 shadow-xl py-2 z-50 text-xs text-gray-700 dark:text-gray-200"
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
                        GoMeat Vault Wallet
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
                      Return Boxes (₹250 Refund)
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
                className="hidden sm:flex h-10 px-3.5 rounded-xl bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 dark:text-gray-950 text-white font-bold text-xs cursor-pointer items-center gap-1.5 transition shadow-xs shrink-0 whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Cart Button: ALWAYS ACCESSIBLE */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="h-8 sm:h-10 px-2 sm:px-3.5 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs flex items-center gap-1 sm:gap-2 cursor-pointer shadow-sm hover:shadow-md transition shrink-0 whitespace-nowrap active:scale-95"
            >
              <ShoppingBag className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-white" />
              <span className="hidden sm:inline">Cart</span>
              {totalItems > 0 && (
                <span className="px-1.5 py-0.5 bg-white text-[#d11243] rounded-full text-[10px] sm:text-[11px] font-extrabold leading-none">
                  {totalItems}
                </span>
              )}
              {subtotal > 0 && (
                <span className="hidden md:inline font-bold pl-1 border-l border-rose-400/50">
                  ₹{subtotal}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle (screens < sm) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden h-8 w-8 flex items-center justify-center rounded-xl border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shrink-0"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Inline Search Bar (visible only on < sm screens) */}
      <div ref={mobileSearchRef} className="sm:hidden px-3 pb-2 pt-0.5 relative w-full">
        <div className="relative w-full">
          <Search className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors ${
            isSearchFocused ? 'text-[#d11243]' : 'text-gray-400'
          }`} />
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleKeyDown}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
              if (currentTab !== 'catalog') {
                setCurrentTab('catalog');
              }
            }}
            placeholder={isSearchFocused ? 'Search chicken, fish, mutton, cuts...' : searchPlaceholders[placeholderIndex]}
            className="w-full h-9 pl-9 pr-8 rounded-xl bg-gray-100/90 dark:bg-slate-800/90 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-gray-100 text-xs placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-[#d11243]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Autocomplete Dropdown Popover */}
        {renderSearchDropdown()}
      </div>



      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="pb-2 border-b border-gray-100 dark:border-slate-800">
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
                    <span>Deliver to: {getLocationHeading()}</span>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">• 90 Mins</span>
                  </div>
                  <div className="text-[11px] text-gray-600 dark:text-gray-300 truncate max-w-[240px]">
                    {getLocationSubtitle()}
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

      {/* Swiggy Offers Toast */}
      {offersToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-500/30 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{offersToast}</span>
        </div>
      )}

    </header>
  );
};
