import React, { useState, useEffect, useRef } from 'react';
import { Eye, Plus, Minus, Zap, ShieldCheck, Heart, ArrowUpDown, Filter, CheckCircle2 } from 'lucide-react';
import type { Product } from '../types';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CustomerReviewsSection } from '../components/CustomerReviewsSection';
import { HeroSection } from '../components/HeroSection';
import { CategorySection } from '../components/CategorySection';

interface CatalogPageProps {
  onNavigateToReturns: () => void;
  selectedCity: string;
  searchQuery: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ 
  onNavigateToReturns, 
  selectedCity,
  searchQuery 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectingProduct, setInspectingProduct] = useState<Product | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'discount'>('featured');
  const [priceBudget, setPriceBudget] = useState<'all' | 'under300' | 'under500' | 'above500'>('all');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const catalogGridRef = useRef<HTMLDivElement>(null);

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
      showToast(`Removed "${productName}" from wishlist`);
    } else {
      updated = [...wishlist, productId];
      showToast(`Added "${productName}" to wishlist ❤️`);
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

  const handleOpenProductDetail = (product: Product) => {
    window.history.pushState({ modal: 'product-detail' }, '');
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

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts({
        category: selectedCategory,
        search: searchQuery
      });
      setProducts(data);
    } catch (err) {
      console.error('Failed to load cuts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
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

        {/* FreshSeal 0°C to 4°C Assurance Strip */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-100 dark:border-rose-900 flex items-center justify-center text-[#d11243] dark:text-rose-400 font-black text-sm shrink-0 shadow-[0_0_12px_rgba(225,29,67,0.15)]">
              0°C
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs sm:text-sm text-gray-950 dark:text-white">
                  FreshSeal™ 0°C to 4°C Temperature Controlled
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-black border border-emerald-200 dark:border-emerald-800">
                  Never Frozen
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                Delivered across {selectedCity} in reusable insulated EPP cold boxes with ice gel bricks. ₹250 refundable box deposit.
              </p>
            </div>
          </div>

          <button
            onClick={onNavigateToReturns}
            className="w-full md:w-auto px-4 py-2 rounded-xl bg-gray-950 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-950 text-xs font-bold cursor-pointer shrink-0 transition shadow-xs"
          >
            Return Empty Box for ₹250 Refund
          </button>
        </div>

        {/* Sorting, Price Budget Filters & Results Count Bar (Module 8) */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Price Budget Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-gray-400 font-bold text-[11px] mr-1 hidden sm:inline">Budget:</span>
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
            <span className="text-gray-500 dark:text-gray-400 font-semibold text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs focus:outline-none focus:border-[#d11243] cursor-pointer"
            >
              <option value="featured">Featured Fresh Cuts</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="discount">Highest Discount</option>
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
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
          No cuts match your selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {sortedProducts.map((product) => {
            const qty = getItemQuantity(product.id);
            const discountPct = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
            const isWishlisted = wishlist.includes(product.id);

            return (
              <div
                key={product.id}
                onClick={() => handleOpenProductDetail(product)}
                className="group bg-white dark:bg-slate-900/90 rounded-2xl border border-gray-200 dark:border-slate-800/80 hover:border-[#d11243]/50 dark:hover:border-rose-500/50 shadow-2xs hover:shadow-lg dark:hover:shadow-[0_8px_30px_rgba(225,29,67,0.2)] transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer card-light-hover"
              >
                {/* Image & Badges */}
                <div className="relative h-48 bg-gray-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={product.image || product.imageUrl || `/images/products/${product.id}.jpg`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `/images/products/${product.id}.jpg`;
                    }}
                  />
                  
                  {/* ETA tag */}
                  <div className="absolute top-2 left-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 dark:text-gray-200 shadow-2xs flex items-center gap-1 border border-gray-100 dark:border-slate-700">
                    <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>{product.eta || '⚡ Today in 90 mins'}</span>
                  </div>

                  {/* Wishlist Heart Button */}
                  <button
                    onClick={(e) => toggleWishlist(product.id, product.name, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-center text-gray-600 dark:text-gray-300 hover:text-[#d11243] dark:hover:text-rose-400 shadow-2xs transition z-10 cursor-pointer"
                    title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#d11243] text-[#d11243]' : ''}`} />
                  </button>

                  {/* Net weight tag */}
                  {product.netWeight && (
                    <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      Net wt: {product.netWeight} {product.grossWeight ? `| Gross: ${product.grossWeight}` : ''}
                    </div>
                  )}

                  {/* Click to Customize Pill on Hover */}
                  <div className="absolute inset-0 bg-black/35 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 rounded-full bg-white/95 dark:bg-slate-900/95 text-gray-900 dark:text-white font-extrabold text-[11px] shadow-md flex items-center gap-1.5 border border-white/20">
                      <Eye className="w-3.5 h-3.5 text-[#d11243]" />
                      <span>View Cuts & Details</span>
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug line-clamp-1 group-hover:text-[#d11243] dark:group-hover:text-rose-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Pieces & Serves */}
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-slate-800/80 px-2 py-1 rounded-lg">
                      <span>{product.pieces || '4-6 Pieces'}</span>
                      <span>•</span>
                      <span>{product.serves || 'Serves 2-3'}</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-base text-gray-950 dark:text-white">₹{product.price}</span>
                        {product.mrp && (
                          <span className="text-[11px] text-gray-400 line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      {discountPct > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenProductDetail(product);
                        }}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 cursor-pointer transition"
                        title="View details & custom cuts"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {qty === 0 ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(product, 1);
                            showToast(`Added 1x ${product.name} to Cart`);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs uppercase cursor-pointer shadow-2xs transition"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center border border-[#d11243] rounded-lg bg-white dark:bg-slate-800">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, qty - 1);
                            }}
                            className="p-1 text-[#d11243] hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-l cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#d11243]">{qty}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, qty + 1);
                            }}
                            className="p-1 text-[#d11243] hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-r cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
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

      {/* Licious-Style 4 Pillar Quality Badges */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-2xs transition-colors">
        <h3 className="font-extrabold text-sm text-gray-900 dark:text-white mb-4 text-center">
          The GoMeat Promise (Farm to Fork Integrity)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">150+ Quality Checks</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">Scientific bio-security protocols</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">0°C - 4°C Chilled</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">Never frozen, locks natural juices</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">Zero Antibiotics</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">No chemical water retention agents</span>
          </div>
          <div className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-100 dark:border-slate-700">
            <span className="block font-bold text-gray-900 dark:text-white text-xs">Reusable Cold Box</span>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 block">Zero thermocol with ₹250 refund</span>
          </div>
        </div>
      </div>

      {/* Verified Customer Reviews & Google Rating Section */}
      <CustomerReviewsSection />

      <ProductDetailModal
        product={inspectingProduct}
        onClose={() => setInspectingProduct(null)}
      />

    </div>
  );
};
