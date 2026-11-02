import React, { useState } from 'react';
import { X, Plus, Minus, Zap, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, HelpCircle } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose
}) => {
  const { items, addItem, updateQuantity } = useCart();
  
  if (!product) return null;

  const cutOptions = [
    {
      id: 'Curry Cut (Medium Bone-in)',
      name: 'Curry Cut - Medium',
      badge: 'Popular',
      description: 'Evenly sized pieces with bone. Ideal for rich curries, gravies, and slow stews.'
    },
    {
      id: 'Biryani Cut (Large Juicy Pieces)',
      name: 'Biryani Cut - Large',
      badge: 'Chef Favorite',
      description: 'Generous succulent cuts that absorb fragrant marinades for slow dum biryani.'
    },
    {
      id: 'Boneless Cubes & Fillets',
      name: 'Boneless Strips / Cubes',
      badge: '100% Lean',
      description: 'Zero bone, fat-trimmed fillets. Perfect for tawa fry, grills, and stir fries.'
    },
    {
      id: 'Keema / Fresh Minced',
      name: 'Keema / Mince Fine Cut',
      badge: 'Hand-Minced',
      description: 'Double-ground texture suited for succulent seekh kebabs, keema pav, and patties.'
    }
  ];

  const [selectedStyle, setSelectedStyle] = useState<string>(
    product.cutStyle || cutOptions[0].id
  );
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [showWeightExplanation, setShowWeightExplanation] = useState<boolean>(false);

  const existingItem = items.find(i => i.product.id === product.id);
  const discountPct = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;

  // Alternate gallery images for rich visual fidelity
  const fallbackGallery = [
    product.image || product.imageUrl || `/images/products/${product.id}.jpg`,
    'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  ];

  const handleAddToCart = () => {
    addItem(product, quantity, selectedStyle);
    onClose();
  };

  const sampleReviews = [
    {
      author: 'Ananya R.',
      location: 'Indiranagar, Bengaluru',
      rating: 5,
      date: 'Yesterday',
      comment: 'Super fresh and completely odorless! Delivered ice-cold inside the blue ThermalVault cooler box. The curry cut pieces were uniform and cooked evenly.'
    },
    {
      author: 'Vikramaditya S.',
      location: 'Koramangala, Bengaluru',
      rating: 5,
      date: '3 days ago',
      comment: 'Biryani cuts were juicy and had great bone-to-meat ratio. No ice crystal damage because it was chilled, not rock frozen. Highly recommended!'
    },
    {
      author: 'Deepika M.',
      location: 'HSR Layout, Bengaluru',
      rating: 4.8,
      date: '1 week ago',
      comment: 'Loved the gross vs net weight transparency. What was weighed was trimmed cleanly without fat waste. Returned the box on my next delivery for ₹250 refund.'
    }
  ];

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden text-gray-900 z-10 max-h-[92vh] flex flex-col">
        
        {/* Sticky Top Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between bg-white/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-rose-50 text-[#d11243] border border-rose-100">
              {product.category}
            </span>
            <span className="text-gray-300">•</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
              <span>{product.eta || '⚡ 90 Mins Express'}</span>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: Image Gallery & Freshness Badges */}
            <div className="lg:col-span-5 space-y-3.5">
              <div className="relative rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 aspect-4/3 shadow-xs">
                <img 
                  src={fallbackGallery[selectedImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `/images/products/${product.id}.jpg`;
                  }}
                />

                {/* FreshSeal Chilled Badge */}
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-gray-900 shadow-sm flex items-center gap-1.5 border border-gray-200">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>0°C - 4°C FreshChilled™</span>
                </div>

                {/* Discount Tag */}
                {discountPct > 0 && (
                  <div className="absolute top-3 right-3 bg-[#d11243] text-white px-2 py-0.5 rounded-md text-[10px] font-black tracking-wide shadow-sm">
                    {discountPct}% OFF
                  </div>
                )}

                {/* Net weight tag */}
                {product.netWeight && (
                  <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-2">
                    <span>Net: {product.netWeight}</span>
                    {product.grossWeight && (
                      <span className="text-gray-400">| Gross: {product.grossWeight}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              <div className="flex gap-2.5">
                {fallbackGallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-16 rounded-xl overflow-hidden border-2 transition ${
                      selectedImageIndex === idx 
                        ? 'border-[#d11243] ring-2 ring-rose-200' 
                        : 'border-gray-200 hover:border-gray-400 opacity-75'
                    }`}
                  >
                    <img 
                      src={imgUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `/images/products/${product.id}.jpg`;
                      }}
                    />
                  </button>
                ))}
              </div>

              {/* Quality Guarantee Mini Card */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  <span>FreshSeal 100% Quality & Cold-Chain Promise</span>
                </div>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Every order is dispatched in our temperature-logged reusable cooler box with food-grade gel bricks. Never frozen, no chemical water-bath washes.
                </p>
              </div>
            </div>

            {/* Right Column: Information, Cut Selector & Net Weight Transparency */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Title & Price Header */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-950 leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-2xl font-black text-gray-950">₹{product.price}</span>
                  {product.mrp && (
                    <span className="text-sm text-gray-400 line-through">₹{product.mrp}</span>
                  )}
                  <span className="text-xs font-semibold text-gray-500">/ {product.unit}</span>
                  <span className="px-2 py-0.5 rounded bg-rose-50 text-[#d11243] text-xs font-bold">
                    Taxes Included
                  </span>
                </div>
              </div>

              {/* Portion, Origin & Chilling Specs Strip */}
              <div className="grid grid-cols-3 gap-2.5 bg-gray-50 p-3 rounded-xl border border-gray-100 text-center">
                <div className="p-1">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">Portion</span>
                  <span className="text-xs font-extrabold text-gray-900 mt-0.5 block">{product.pieces || '10-14 Pcs'}</span>
                  <span className="text-[10px] text-gray-500">{product.serves || 'Serves 3-4'}</span>
                </div>
                <div className="p-1 border-x border-gray-200">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">Origin</span>
                  <span className="text-xs font-extrabold text-gray-900 mt-0.5 block truncate">{product.origin || 'Bio-Secure Farm'}</span>
                  <span className="text-[10px] text-emerald-700 font-semibold">100% Traceable</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-gray-500 uppercase tracking-wider font-bold">Storage</span>
                  <span className="text-xs font-extrabold text-gray-900 mt-0.5 block">0°C to 4°C</span>
                  <span className="text-[10px] text-gray-500">Never Frozen</span>
                </div>
              </div>

              {/* Gross Weight vs Net Weight Transparency Pill */}
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                    <Award className="w-4 h-4 text-amber-700" />
                    <span>Weight Transparency Guarantee</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowWeightExplanation(!showWeightExplanation)}
                    className="text-[11px] font-bold text-[#d11243] hover:underline flex items-center gap-0.5"
                  >
                    <span>{showWeightExplanation ? 'Hide info' : 'Gross vs Net?'}</span>
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-1 text-xs text-amber-900 flex items-center gap-3">
                  <span>Gross Wt: <strong>{product.grossWeight || '550g'}</strong></span>
                  <span className="text-amber-400">➔</span>
                  <span>Net Edible Wt: <strong>{product.netWeight || '450g'}</strong></span>
                </div>
                {showWeightExplanation && (
                  <p className="mt-2 text-[11px] text-amber-800 leading-relaxed border-t border-amber-200 pt-2">
                    In traditional meat shops, you pay for raw weight including heavy bone end-caps, feathers/scales, and excess fat. At GoMeat, we weigh before precision cutting and clean away all offal, skin, and unwanted trim. You receive pure, clean, ready-to-cook meat.
                  </p>
                )}
              </div>

              {/* Interactive Cut Selector (Figma Step 2) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-gray-900 tracking-wide uppercase">
                    Select Your Cut Specification:
                  </label>
                  <span className="text-[11px] font-semibold text-gray-500">
                    Customized free of charge
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {cutOptions.map((opt) => {
                    const isSelected = selectedStyle === opt.id;
                    return (
                      <div
                        key={opt.id}
                        onClick={() => setSelectedStyle(opt.id)}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition relative ${
                          isSelected
                            ? 'bg-rose-50/70 border-[#d11243] ring-1 ring-[#d11243]'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900">{opt.name}</span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#d11243] text-white' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Ratings & Reviews (Figma Detail Section) */}
              <div className="border-t border-gray-100 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 bg-amber-400 px-2 py-0.5 rounded text-xs font-black text-gray-950">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>4.9</span>
                    </div>
                    <span className="text-xs font-bold text-gray-900">1,420+ Verified Customer Reviews</span>
                  </div>
                  <span className="text-[11px] text-emerald-700 font-bold">100% Authentic</span>
                </div>

                <div className="space-y-2.5">
                  {sampleReviews.map((rev, i) => (
                    <div key={i} className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-bold text-gray-900">
                          <span>{rev.author}</span>
                          <span className="text-[10px] text-gray-400 font-normal">({rev.location})</span>
                        </div>
                        <span className="text-[10px] text-gray-400">{rev.date}</span>
                      </div>
                      <p className="text-[11px] text-gray-600 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Sticky Action Footer */}
        <div className="px-5 py-4 border-t border-gray-200 bg-white sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-[11px] text-gray-500 font-semibold block">Total Item Amount</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-950">₹{product.price * quantity}</span>
              <span className="text-xs text-gray-500">for {quantity} {product.unit} pack</span>
            </div>
            <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">
              Cut: {selectedStyle}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 rounded-xl bg-gray-50 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-black text-sm text-gray-950">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cold Box Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md hover:shadow-lg transition flex items-center justify-center gap-2"
            >
              <span>Add to Cold Box</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
