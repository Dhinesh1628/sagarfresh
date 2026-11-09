import React, { useState, useEffect, useRef } from 'react';
import { Eye, Plus, Minus, Zap, ShieldCheck, Heart, ArrowUpDown, Filter, CheckCircle2, Star, TrendingDown, Search, X, Sparkles, RotateCcw, Flame } from 'lucide-react';
import type { Product } from '../types';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { HeroSection } from '../components/HeroSection';
import { CategorySection } from '../components/CategorySection';
import { getProductWeightOptions } from '../utils/weightUtils';
import { getProductVisual } from '../data/productVisuals';

const POPULAR_SEARCH_CHIPS = [
  { label: '🍗 Curry Cut', term: 'Curry Cut' },
  { label: '🥩 Biryani Cut', term: 'Biryani' },
  { label: '🐟 Surmai Fish', term: 'Surmai' },
  { label: '🍗 Boneless Fillets', term: 'Boneless' },
  { label: '🦐 Jumbo Prawns', term: 'Prawns' },
  { label: '🐟 Pomfret', term: 'Pomfret' },
  { label: '🍢 Fish Tikka', term: 'Tikka' },
  { label: '🎁 Feast Combo', term: 'Feast' },
];

interface CatalogPageProps {
  onNavigateToReturns: () => void;
  selectedCity: string;
  searchQuery: string;
  onSetSearchQuery?: (query: string) => void;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  onNavigateToReturns, 
  selectedCity,
  searchQuery,
  onSetSearchQuery 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [inspectingWeight, setInspectingWeight] = useState<string>('500g');
  const [selectedWeights, setSelectedWeights] = useState<Record<string, string>>({});
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [priceBudget, setPriceBudget] = useState<'all' | 'under300' | 'under500' | 'above500'>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [mobileCookedView, setMobileCookedView] = useState<Record<string, boolean>>({});
  const catalogGridRef = useRef<HTMLDivElement>(null);

  const toggleMobileCooked = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMobileCookedView(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const { items, addItem, updateQuantity } = useCart();

  // Load wishlist from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('gomeat_wishlist');
      if (saved) setWishlist(JSON.parse(saved));
    } catch (e) {}
  }, []);

  const toggleWishlist = (productId: string, productName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated: string[];
    const exists = wishlist.includes(productId);
    if (exists) {
      updated = wishlist.filter(id => id !== productId);
      showToast(`Removed "${productName}" from saved items`);
    } else {
      updated = [...wishlist, productId];
      showToast(`Saved "${productName}" for later ❤️`);
    }
    setWishlist(updated);
    try {
      localStorage.setItem('gomeat_wishlist', JSON.stringify(updated));
    } catch (e) {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenProductDetail = (product: Product, weight?: string) => {
    window.history.pushState({ modal: 'product-detail' }, '');
    setInspectingWeight(weight || selectedWeights[product.id] || '500g');
    setInspectingProduct(product);
  };

  useEffect(() => {
    const handlePopState = () => {
      if (inspectingProduct) {
        setInspectingProduct(null);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [inspectingProduct]);

  const handleScrollToCatalog = () => {
    catalogGridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    let isCurrent = true;
    const isSearching = Boolean(searchQuery && searchQuery.trim());

    // Debounce search input (250ms) to prevent network storms & race conditions
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const categoryToFilter = isSearching ? 'All' : selectedCategory;
        const data = await api.getProducts({
          category: categoryToFilter,
          search: isSearching ? searchQuery.trim() : undefined
        });
        if (isCurrent) {
          setProducts(data);
        }
      } catch (err) {
        if (isCurrent) console.error('Failed to load cuts:', err);
      } finally {
        if (isCurrent) setLoading(false);
      }
    }, isSearching ? 250 : 0);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [selectedCategory, searchQuery]);

  const getItemQuantity = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  // Filter products by price budget
  const filteredProducts = products.filter(p => {
    if (priceBudget === 'under300') return p.price < 300;
    if (priceBudget === 'under500') return p.price <= 500;
    if (priceBudget === 'above500') return p.price > 500;
    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'discount') {
      const discA = a.mrp ? (a.mrp - a.price) / a.mrp : 0;
      const discB = b.mrp ? (b.mrp - b.price) / b.mrp : 0;
      return discB - discA;
    }
    return 0; // featured
  });

  return (
    <div className="space-y-6 pb-16 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900/95 dark:bg-white/95 text-white dark:text-gray-900 px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-white/20 dark:border-gray-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Section */}
      <HeroSection 
        onExploreCuts={handleScrollToCatalog}
        onNavigateToReturns={onNavigateToReturns}
      />

      {/* Explore Categories Section */}
      <div ref={catalogGridRef} className="scroll-mt-24 space-y-4">
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onViewAllSpecs={handleScrollToCatalog}
        />

        {/* Always Chilled 0°C to 4°C Assurance Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-[#d11243] dark:text-rose-400 font-black text-sm shrink-0 shadow-[0_0_12px_rgba(225,29,67,0.15)]">
              0°C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-gray-950 dark:text-white">
                  Always Chilled at 0°C to 4°C
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                  Never Frozen
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Delivered fresh in reusable cold boxes across {selectedCity}. Get ₹250 back when you return the box.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToReturns}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-gray-950 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 text-xs font-bold cursor-pointer shrink-0 transition shadow-xs"
          >
            Return Box for ₹250 Refund
          </button>
        </div>

        {/* Quick Search Trending Chips */}
        <div className="flex items-center gap-2 overflow-x-auto py-1">
          <div className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-bold text-xs shrink-0 mr-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trending:</span>
          </div>
          {POPULAR_SEARCH_CHIPS.map((chip) => (
            <button
              key={chip.term}
              onClick={() => onSetSearchQuery?.(chip.term)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition border ${
                searchQuery.toLowerCase() === chip.term.toLowerCase()
                  ? 'bg-rose-50 dark:bg-rose-950/80 text-[#d11243] dark:text-rose-400 border-[#d11243]'
                  : 'bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-slate-800 hover:border-gray-400'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Active Search Filter Banner */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl px-4 py-2 text-xs">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-[#d11243]" />
              <span className="text-gray-900 dark:text-gray-100">
                Search results for <span className="font-bold text-[#d11243]">"{searchQuery}"</span>
              </span>
              <span className="text-gray-400 font-medium">({sortedProducts.length} items found)</span>
            </div>
            <button
              onClick={() => onSetSearchQuery?.('')}
              className="flex items-center gap-1 text-[#d11243] hover:text-[#b80f3b] font-bold cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          </div>
        )}

        {/* Sorting, Price Budget Filters & Results Count Bar */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Price Budget Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-gray-400 font-bold text-[11px] mr-1 hidden sm:inline">Price:</span>
            {[
              { id: 'all', label: 'All Prices' },
              { id: 'under300', label: 'Under ₹300' },
              { id: 'under500', label: 'Under ₹500' },
              { id: 'above500', label: '₹500+' }
            ].map(b => (
              <button
                key={b.id}
                onClick={() => setPriceBudget(b.id as any)}
                className={`px-3 py-1 rounded-xl font-bold text-xs cursor-pointer transition whitespace-nowrap ${
                  priceBudget === b.id
                    ? 'bg-[#d11243] text-white shadow-2xs'
                    : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700'
                }`}
              >
                {b.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 ml-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-500 dark:text-gray-400 font-semibold text-[11px]">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs focus:outline-none focus:border-[#d11243] cursor-pointer"
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Special Offers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-3 space-y-3 animate-pulse">
              <div className="h-44 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
              <div className="h-4 bg-gray-100 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-8 bg-gray-100 dark:bg-slate-800 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : sortedProducts.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center space-y-3 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-base">
            {searchQuery ? `No cuts matching "${searchQuery}"` : 'No products found'}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm">
            {searchQuery 
              ? 'Try searching with generic terms like "chicken", "biryani", "prawns", "fish", or explore our freshly inwarded cuts below.' 
              : 'Try selecting another category above or reset your filters.'}
          </p>
          <div className="pt-2 flex flex-wrap gap-2 justify-center">
            {searchQuery && (
              <button
                onClick={() => onSetSearchQuery?.('')}
                className="px-4 py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Show All Fresh Cuts</span>
              </button>
            )}
            <button
              onClick={() => setSelectedCategory('All')}
              className="px-4 py-2 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Reset Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedProducts.map((product) => {
            const weightOptions = getProductWeightOptions(product);
            const currentWeight = selectedWeights[product.id] || weightOptions[0]?.weight || '500g';
            const currentOption = weightOptions.find(o => o.weight === currentWeight) || weightOptions[0];

            // Match specific product + weight in cart
            const cartItem = items.find(i => 
              (i.product.id === product.id && (i.selectedWeight || '500g') === currentOption.weight) ||
              (!i.selectedWeight && i.product.id === product.id && currentOption.weight === '500g')
            );
            const qty = cartItem ? cartItem.quantity : 0;
            const isWishlisted = wishlist.includes(product.id);

            const visual = getProductVisual(product.id, product.image || product.imageUrl);
            const isCookedActive = Boolean(mobileCookedView[product.id]);

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProductDetail(product, currentOption.weight)}
                className="group bg-white dark:bg-slate-900/90 rounded-2xl border border-gray-200 dark:border-slate-800/80 hover:border-[#d11243]/50 dark:hover:border-rose-500/50 shadow-2xs hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(225,29,67,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer card-light-hover"
              >
                {/* Image & Badges: Dual-Layer Raw-to-Cooked Cross-Fade */}
                <div className="relative h-52 bg-slate-950 overflow-hidden select-none">
                  {/* Layer 1 (Underneath): Real Authentic Indian Cooked Dish */}
                  <img
                    src={visual.cookedImage}
                    alt={`${visual.cookedDishName} cooked`}
                    className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-700 ease-out"
                    loading="lazy"
                  />

                  {/* Cooked Dish Warm Sizzle Vignette */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

                  {/* Layer 2 (Top Layer): Fresh 0°C Raw Cut with Smooth Cross-Fade */}
                  <img
                    src={product.image || visual.rawImage}
                    alt={product.name}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-in-out ${
                      isCookedActive 
                        ? 'opacity-0 scale-105 pointer-events-none' 
                        : 'opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-105'
                    }`}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = visual.rawImage;
                    }}
                  />

                  {/* Raw Cold Vapor Vignette (fades out as cooked reveals) */}
                  <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent pointer-events-none transition-opacity duration-700 ${
                    isCookedActive ? 'opacity-0' : 'group-hover:opacity-0'
                  }`} />

                  {/* Interactive Raw vs Cooked Toggle Pill */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center">
                    <button
                      type="button"
                      onClick={(e) => toggleMobileCooked(product.id, e)}
                      title="Tap to toggle Raw vs Cooked view"
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold backdrop-blur-md shadow-lg transition-all duration-300 border border-white/20 active:scale-95 cursor-pointer bg-black/65 hover:bg-black/85 text-white"
                    >
                      <span className={`inline-block w-2 h-2 rounded-full transition-colors duration-300 ${
                        isCookedActive ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 group-hover:bg-amber-400'
                      }`} />
                      <span className="hidden group-hover:inline text-amber-300 font-black">
                        🔥 {visual.cookedDishName}
                      </span>
                      <span className={`group-hover:hidden ${isCookedActive ? 'text-amber-300 font-black' : 'text-cyan-200'}`}>
                        {isCookedActive ? `🔥 ${visual.cookedDishName}` : '❄️ 0°C Raw Cut'}
                      </span>
                    </button>
                  </div>

                  {/* Delivery time tag (top right next to wishlist) */}
                  <div className="absolute top-2.5 right-11 z-20 bg-black/60 dark:bg-slate-900/80 backdrop-blur-md px-2 py-1 rounded-full text-[10px] font-bold text-amber-300 shadow-sm flex items-center gap-1 border border-white/10">
                    <Zap className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span>90 mins</span>
                  </div>

                  {/* Save for Later Heart Button */}
                  <button
                    type="button"
                    onClick={(e) => toggleWishlist(product.id, product.name, e)}
                    className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#d11243] dark:hover:text-rose-400 shadow-md transition z-20 cursor-pointer"
                    title={isWishlisted ? 'Remove from Saved' : 'Save for Later'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#d11243] text-[#d11243]' : ''}`} />
                  </button>

                  {/* Net weight tag based on current selected option (bottom left) */}
                  <div className="absolute bottom-2.5 left-2.5 z-20 bg-black/80 backdrop-blur-md px-2.5 py-0.5 rounded-md text-[10px] text-white font-medium flex items-center gap-1.5 border border-white/10">
                    <span className="font-bold text-white">{currentOption.netWeight}</span>
                    <span className="text-gray-300">• Gross {currentOption.grossWeight}</span>
                  </div>

                  {/* Sizzle Prompt Pill (bottom right) */}
                  <div className="absolute bottom-2.5 right-2.5 z-20 pointer-events-none">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md transition-all duration-300 border ${
                      isCookedActive 
                        ? 'bg-amber-500/95 text-white border-amber-300/60 shadow-amber-500/40 shadow-sm' 
                        : 'bg-black/65 text-amber-200 border-white/15 group-hover:bg-amber-500/95 group-hover:text-white group-hover:border-amber-300/60'
                    }`}>
                      {isCookedActive ? '🔥 Sizzling Ready' : 'Tap / Hover to Cook 🔥'}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#d11243] dark:group-hover:text-rose-400 transition-colors">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex items-center gap-0.5 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                        <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                        <span>4.8</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-medium">120+ ratings</span>
                    </div>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Pieces & Serves dynamic for selected weight */}
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/80 px-2 py-1 rounded-lg">
                      <span>{currentOption.pieces || product.pieces || '4-6 Pieces'}</span>
                      <span>•</span>
                      <span>{currentOption.serves || product.serves || 'Serves 2-3'}</span>
                    </div>

                    {/* Quantity / Weight Selector Buttons */}
                    <div className="mt-3 pt-2.5 border-t border-gray-100 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-between text-[10px] font-bold text-gray-500 dark:text-gray-400 mb-1.5">
                        <span className="uppercase tracking-wider">Choose Pack Size:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          Daily Rate
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {weightOptions.map((opt) => {
                          const isSelected = opt.weight === currentOption.weight;
                          return (
                            <button
                              key={opt.weight}
                              type="button"
                              onClick={() => setSelectedWeights(prev => ({ ...prev, [product.id]: opt.weight }))}
                              className={`py-1.5 px-1 rounded-xl text-center font-extrabold text-[11px] transition cursor-pointer border ${
                                isSelected
                                  ? 'bg-rose-50 dark:bg-rose-950/70 border-[#d11243] dark:border-rose-500 text-[#d11243] dark:text-rose-400 shadow-2xs ring-1 ring-[#d11243]'
                                  : 'bg-gray-50 dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                              }`}
                            >
                              <div className="truncate">{opt.weight}</div>
                              {opt.badge && (
                                <div className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 truncate mt-0.5">
                                  {opt.badge.replace('🔥', '')}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Price, Market Comparison & Add to Cart */}
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-base text-gray-950 dark:text-white">₹{currentOption.price}</span>
                        <span className="text-[11px] text-gray-400 line-through">₹{currentOption.mrp}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400">
                          {currentOption.discountPercent}% OFF
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                          • Save ₹{currentOption.savings}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProductDetail(product, currentOption.weight);
                        }}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 cursor-pointer transition"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {qty === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(product, 1, undefined, currentOption.weight, currentOption.price, currentOption.mrp);
                            showToast(`Added ${product.name} (${currentOption.weight}) to Your Cart`);
                          }}
                          className="h-8 min-w-[78px] px-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[#d11243] dark:text-rose-400 font-black text-xs uppercase cursor-pointer border-2 border-[#d11243]/80 hover:border-[#d11243] shadow-xs active:scale-95 transition-all flex items-center justify-center gap-1 select-none"
                        >
                          <span>ADD</span>
                          <span className="text-sm font-black leading-none">+</span>
                        </button>
                      ) : (
                        <div className="h-8 min-w-[78px] flex items-center justify-between border-2 border-[#d11243] rounded-xl bg-white dark:bg-slate-900 shadow-xs overflow-hidden select-none">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(cartItem?.id || product.id, qty - 1);
                            }}
                            className="w-7 h-full flex items-center justify-center text-[#d11243] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-black transition cursor-pointer active:scale-90"
                            title="Decrease quantity"
                          >
                            <Minus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                          <span className="text-xs font-black text-[#d11243] dark:text-rose-400 px-1">
                            {qty}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(cartItem?.id || product.id, qty + 1);
                            }}
                            className="w-7 h-full flex items-center justify-center text-[#d11243] dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 font-black transition cursor-pointer active:scale-90"
                            title="Increase quantity"
                          >
                            <Plus className="w-3.5 h-3.5 stroke-[3]" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Why Shop with Gomeat Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-2xs transition-colors">
        <h3 className="font-extrabold text-base text-gray-900 dark:text-white mb-1 text-center">
          Why Shop with Gomeat?
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-5">
          Everything we do is focused on bringing you the freshest meat with zero hassle.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">Always Fresh</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Carefully cleaned & cut daily</span>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">Chilled 0°C - 4°C</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Never frozen, keeps natural taste</span>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">Zero Chemicals</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">100% natural, no preservatives</span>
          </div>
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">Reusable Cold Box</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 block">Keeps meat cool, get ₹250 back</span>
          </div>
        </div>
      </div>

      <ProductDetailModal
        product={inspectingProduct}
        initialWeight={inspectingWeight}
        onClose={() => setInspectingProduct(null)}
      />

    </div>
  );
};
