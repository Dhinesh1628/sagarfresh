import React, { useState, useEffect } from 'react';
import { Eye, Plus, Minus, Zap, ShieldCheck } from 'lucide-react';
import type { Product } from '../types';
import { api } from '../api';
import { useCart } from '../context/CartContext';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { CustomerReviewsSection } from '../components/CustomerReviewsSection';

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

  const { items, addItem, updateQuantity } = useCart();

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
      
      {/* Category Pills Bar (Licious style) */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-4 py-2 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
                  isSelected
                    ? 'bg-[#d11243] text-white shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* FreshSeal Assurance Banner */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-[#d11243] font-bold text-base shrink-0">
            0°C
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900">
                FreshSeal™ 0°C to 4°C Temperature Controlled
              </span>
              <span className="px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                Never Frozen
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Delivered across {selectedCity} in reusable insulated EPP cold boxes with ice gel bricks. ₹250 refundable box deposit.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToReturns}
          className="px-3.5 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-semibold cursor-pointer shrink-0"
        >
          Return Empty Box for ₹250 Refund
        </button>
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="bg-white rounded-xl border border-gray-200 p-3 space-y-3 animate-pulse">
              <div className="h-44 bg-gray-100 rounded-lg"></div>
              <div className="h-4 bg-gray-100 rounded w-3/4"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
              <div className="h-8 bg-gray-100 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-gray-200 text-xs text-gray-500">
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
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-2xs hover:shadow-xs transition flex flex-col justify-between overflow-hidden"
              >
                {/* Image & Badges */}
                <div className="relative h-48 bg-gray-100 overflow-hidden">
                  <img
                    src={product.image || product.imageUrl || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80';
                    }}
                  />
                  
                  {/* ETA tag */}
                  <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 shadow-2xs flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                    <span>{product.eta || '⚡ Today in 90 mins'}</span>
                  </div>

                  {/* Net weight tag */}
                  {product.netWeight && (
                    <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white font-medium">
                      Net wt: {product.netWeight} {product.grossWeight ? `| Gross: ${product.grossWeight}` : ''}
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-sm text-gray-900 leading-snug line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>

                    {/* Pieces & Serves (Licious specific) */}
                    <div className="mt-2.5 flex items-center gap-2 text-[10px] text-gray-600 bg-gray-50 px-2 py-1 rounded">
                      <span>{product.pieces || '4-6 Pieces'}</span>
                      <span>•</span>
                      <span>{product.serves || 'Serves 2-3'}</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart */}
                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-extrabold text-base text-gray-950">₹{product.price}</span>
                        {product.mrp && (
                          <span className="text-[11px] text-gray-400 line-through">₹{product.mrp}</span>
                        )}
                      </div>
                      {discountPct > 0 && (
                        <span className="text-[10px] font-bold text-emerald-700">
                          {discountPct}% OFF
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setInspectingProduct(product)}
                        className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-600 cursor-pointer"
                        title="View details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {qty === 0 ? (
                        <button
                          onClick={() => addItem(product, 1)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs uppercase cursor-pointer shadow-2xs transition"
                        >
                          Add
                        </button>
                      ) : (
                        <div className="flex items-center border border-[#d11243] rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(product.id, qty - 1)}
                            className="p-1 text-[#d11243] hover:bg-rose-50 rounded-l"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2 text-xs font-bold text-[#d11243]">{qty}</span>
                          <button
                            onClick={() => updateQuantity(product.id, qty + 1)}
                            className="p-1 text-[#d11243] hover:bg-rose-50 rounded-r"
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
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
        <h3 className="font-extrabold text-sm text-gray-900 mb-4 text-center">
          The Sagar Fresh Promise (Farm to Fork Integrity)
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className="block font-bold text-gray-900 text-xs">150+ Quality Checks</span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Scientific bio-security protocols</span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className="block font-bold text-gray-900 text-xs">0°C - 4°C Chilled</span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Never frozen, locks natural juices</span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className="block font-bold text-gray-900 text-xs">Zero Antibiotics</span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">No chemical water retention agents</span>
          </div>
          <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
            <span className="block font-bold text-gray-900 text-xs">Reusable Cold Box</span>
            <span className="text-[11px] text-gray-500 mt-0.5 block">Zero thermocol with ₹250 refund</span>
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
