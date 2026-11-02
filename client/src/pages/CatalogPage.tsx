import React, { useState, useEffect, useRef } from 'react';
import { Eye, Plus, Minus, Zap, ShieldCheck } from 'lucide-react';
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
  const catalogGridRef = useRef<HTMLDivElement>(null);

  const { items, addItem, updateQuantity } = useCart();

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

  const categories = [
    { label: 'All Cuts', value: 'All' },
    { label: 'Fish & Seafood', value: 'Fish & Seafood' },
    { label: 'Tender Mutton', value: 'Tender Mutton' },
    { label: 'Fresh Chicken', value: 'Fresh Chicken' },
    { label: 'Ready to Cook', value: 'Ready to Cook' },
    { label: 'Combo Box', value: 'Combo Box' }
  ];

  const getItemQuantity = (productId: string) => {
    const item = items.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="space-y-6 pb-16">
      
      {/* Figma-Inspired Dual Desktop & Mobile Hero Section */}
      <HeroSection 
        onExploreCuts={handleScrollToCatalog}
        onNavigateToReturns={onNavigateToReturns}
      />

      {/* Explore Categories Section (Matching Figma layout) */}
      <div ref={catalogGridRef} className="scroll-mt-24 space-y-4">
        <CategorySection
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          onViewAllSpecs={handleScrollToCatalog}
        />

        {/* FreshSeal 0°C to 4°C Assurance Strip (from Figma layout) */}
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
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 text-xs text-gray-500 dark:text-gray-400">
          No cuts match your current filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((product) => {
            const qty = getItemQuantity(product.id);
            const discountPct = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

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
                            className="p-1 text-[#d11243] hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-l"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#d11243]">{qty}</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, qty + 1);
                            }}
                            className="p-1 text-[#d11243] hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-r"
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
