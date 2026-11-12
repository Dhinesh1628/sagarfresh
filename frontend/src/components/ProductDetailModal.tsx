import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Zap, ShieldCheck, Star, Award, CheckCircle2, ChevronRight, HelpCircle, Heart, MessageSquare, ThumbsUp, Send, Flame } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSound } from '../context/SoundContext';
import { getProductWeightOptions } from '../utils/weightUtils';
import { getProductVisual } from '../data/productVisuals';

interface ProductDetailModalProps {
  product: Product | null;
  initialWeight?: string;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  initialWeight,
  onClose
}) => {
  const { items, addItem, updateQuantity } = useCart();
  const { user } = useAuth();
  const { playPopSound } = useSound();
  
  if (!product) return null;

  const weightOptions = getProductWeightOptions(product);
  const [selectedWeight, setSelectedWeight] = useState<string>(
    initialWeight || weightOptions[0]?.weight || '500g'
  );

  useEffect(() => {
    if (initialWeight) {
      setSelectedWeight(initialWeight);
    } else if (weightOptions.length > 0) {
      setSelectedWeight(weightOptions[0].weight);
    }
  }, [initialWeight, product?.id]);

  const activeWeightOption = weightOptions.find(o => o.weight === selectedWeight) || weightOptions[0];

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
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);

  // Review & Rating State
  interface ReviewItem {
    id: string;
    author: string;
    location?: string;
    rating: number;
    date: string;
    comment: string;
    cut?: string;
    verified?: boolean;
  }

  const defaultReviews: ReviewItem[] = [
    {
      id: 'rev_1',
      author: 'Ananya R.',
      location: 'Bengaluru',
      rating: 5,
      date: 'Yesterday',
      comment: 'Super fresh and completely odorless! Delivered ice-cold inside the reusable cold box. Pieces were trimmed cleanly and cooked evenly.',
      cut: 'Curry Cut',
      verified: true
    },
    {
      id: 'rev_2',
      author: 'Vikramaditya S.',
      location: 'Bengaluru',
      rating: 5,
      date: '3 days ago',
      comment: 'Really fresh and tender! No ice crystals because it was chilled, not rock frozen. Family loved the taste.',
      cut: 'Biryani Cut',
      verified: true
    },
    {
      id: 'rev_3',
      author: 'Deepika M.',
      location: 'Bengaluru',
      rating: 5,
      date: '1 week ago',
      comment: 'Clean cut without unwanted bones or fat. Handed back the cold box on delivery and got ₹250 back immediately.',
      cut: 'Boneless Cubes',
      verified: true
    }
  ];

  const [reviews, setReviews] = useState<ReviewItem[]>(() => {
    try {
      const saved = localStorage.getItem(`gomeat_reviews_${product.id}`);
      return saved ? JSON.parse(saved) : defaultReviews;
    } catch {
      return defaultReviews;
    }
  });

  const [userRating, setUserRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [authorName, setAuthorName] = useState<string>(user?.name || '');
  const [reviewComment, setReviewComment] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);

  useEffect(() => {
    if (user?.name && !authorName) {
      setAuthorName(user.name);
    }
  }, [user]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    const newRev: ReviewItem = {
      id: `rev_${Date.now()}`,
      author: authorName.trim() || user?.name || 'Verified Customer',
      location: user?.city || 'Bengaluru',
      rating: userRating,
      date: 'Just now',
      comment: reviewComment.trim(),
      cut: selectedStyle,
      verified: true
    };

    const updated = [newRev, ...reviews];
    setReviews(updated);
    try {
      localStorage.setItem(`gomeat_reviews_${product.id}`, JSON.stringify(updated));
    } catch (e) {}

    setReviewComment('');
    setIsSubmittingReview(false);
    setReviewSuccessMessage('Thank you! Your rating and review have been added.');
    setTimeout(() => {
      setReviewSuccessMessage(null);
      setShowReviewForm(false);
    }, 3000);
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem('gomeat_wishlist');
      if (saved && product) {
        const arr = JSON.parse(saved);
        setIsWishlisted(arr.includes(product.id));
      }
    } catch (e) {}
  }, [product]);

  const toggleWishlist = () => {
    try {
      const saved = localStorage.getItem('gomeat_wishlist');
      const arr: string[] = saved ? JSON.parse(saved) : [];
      let updated: string[];
      if (arr.includes(product.id)) {
        updated = arr.filter(id => id !== product.id);
        setIsWishlisted(false);
      } else {
        updated = [...arr, product.id];
        setIsWishlisted(true);
      }
      localStorage.setItem('gomeat_wishlist', JSON.stringify(updated));
    } catch (e) {}
  };

  const existingItem = items.find(i => i.product.id === product.id);
  const discountPct = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0;
  const visual = getProductVisual(product.id, product.image || product.imageUrl);

  // Alternate gallery images for rich visual fidelity: Raw Cut -> Chef Cooked Dish -> Packaging
  const fallbackGallery = [
    product.image || visual.rawImage,
    visual.cookedImage,
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'
  ];

  const handleAddToCart = () => {
    addItem(
      product, 
      quantity, 
      selectedStyle, 
      activeWeightOption.weight, 
      activeWeightOption.price, 
      activeWeightOption.mrp
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 overflow-y-auto flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity" 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-gray-900 dark:text-gray-100 z-10 max-h-[92vh] flex flex-col transition-colors">
        
        {/* Sticky Top Header */}
        <div className="px-5 py-3.5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-rose-50 dark:bg-rose-950/70 text-[#d11243] dark:text-rose-400 border border-rose-100 dark:border-rose-900">
              {product.category}
            </span>
            <span className="text-gray-300 dark:text-gray-600">•</span>
            <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
              <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600 dark:fill-emerald-400 dark:text-emerald-400" />
              <span>{product.eta || '⚡ 90 Mins Express'}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleWishlist}
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-[#d11243] dark:hover:text-rose-400 transition cursor-pointer"
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-[#d11243] text-[#d11243]' : ''}`} />
            </button>
            <button 
              onClick={onClose} 
              className="w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-5 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            
            {/* Left Column: Image Gallery & Freshness Badges */}
            <div className="lg:col-span-5 space-y-3.5">
              {/* Interactive Raw vs Cooked Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(0)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedImageIndex === 0
                      ? 'bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-400 shadow-sm border border-gray-200/80 dark:border-slate-700'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span>❄️</span>
                  <span>0°C Raw Cut</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedImageIndex(1)}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                    selectedImageIndex === 1
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <Flame className="w-3.5 h-3.5 text-white" />
                  <span>Cooked Sizzle</span>
                </button>
              </div>

              <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-gray-200 dark:border-slate-700 aspect-4/3 shadow-xs">
                <img 
                  src={fallbackGallery[selectedImageIndex]} 
                  alt={product.name}
                  className="w-full h-full object-cover transition duration-300" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `/images/products/${product.id}.jpg`;
                  }}
                />

                {/* State Tag */}
                <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs px-2.5 py-1 rounded-lg text-[11px] font-extrabold text-gray-900 dark:text-gray-100 shadow-sm flex items-center gap-1.5 border border-gray-200 dark:border-slate-700">
                  {selectedImageIndex === 1 ? (
                    <>
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-amber-600 dark:text-amber-400 font-bold">{visual.cookedDishName}</span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>0°C - 4°C FreshChilled™</span>
                    </>
                  )}
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
                    className={`relative flex-1 h-16 rounded-xl overflow-hidden border-2 transition ${
                      selectedImageIndex === idx 
                        ? 'border-[#d11243] ring-2 ring-rose-200 dark:ring-rose-950' 
                        : 'border-gray-200 dark:border-slate-700 hover:border-gray-400 opacity-75'
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
                    <div className="absolute inset-x-0 bottom-0 bg-black/70 text-[9px] text-white text-center py-0.5 font-bold">
                      {idx === 0 ? '❄️ Raw' : idx === 1 ? '🔥 Cooked' : '📦 Cold Pack'}
                    </div>
                  </button>
                ))}
              </div>

              {/* Cooked Dish Recipe Preview Card if Cooked View Active */}
              {selectedImageIndex === 1 && (
                <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs space-y-1.5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-300">
                    <div className="flex items-center gap-1.5">
                      <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>{visual.cookedDishName}</span>
                    </div>
                    <span className="text-[10px] bg-amber-200/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                      ⏱️ {visual.cookingTime}
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-900/80 dark:text-amber-200/80 leading-relaxed">
                    {visual.cookedDescription}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {visual.flavorProfile.map(flavor => (
                      <span key={flavor} className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                        #{flavor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Quality Guarantee Mini Card */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950 dark:text-emerald-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                  <span>Our Freshness Promise</span>
                </div>
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 leading-relaxed">
                  Delivered fresh in our reusable cold box. Kept chilled at 0°C to 4°C so it stays tender and juicy. Never frozen, 100% clean.
                </p>
              </div>
            </div>

            {/* Right Column: Information, Cut Selector & Net Weight Transparency */}
            <div className="lg:col-span-7 space-y-5">
              
              {/* Title & Price Header */}
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-955 dark:text-white leading-tight">
                  {product.name}
                </h1>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-3 flex flex-wrap items-baseline gap-2.5 sm:gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-gray-950 dark:text-white">₹{activeWeightOption.price}</span>
                  <span className="text-sm text-gray-400 line-through">₹{activeWeightOption.mrp}</span>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">/ {activeWeightOption.weight}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800">
                    Save ₹{activeWeightOption.savings} ({activeWeightOption.discountPercent}% OFF)
                  </span>
                </div>

                {/* Daily Market Rate Notice Banner */}
                <div className="mt-2.5 flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 text-[11px] text-gray-600 dark:text-gray-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
                  <span className="font-bold text-gray-900 dark:text-white">Daily Harbor & Farm Rate:</span>
                  <span>Direct sourcing ensures today's price is lower than your local butcher shop.</span>
                </div>
              </div>

              {/* Portion, Origin & Chilling Specs Strip */}
              <div className="grid grid-cols-3 gap-2.5 bg-gray-50 dark:bg-slate-800/80 p-3 rounded-xl border border-gray-100 dark:border-slate-700 text-center">
                <div className="p-1">
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Portion</span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5 block">{activeWeightOption.pieces || product.pieces || '4-6 Pieces'}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{activeWeightOption.serves || product.serves || 'Serves 2-3'}</span>
                </div>
                <div className="p-1 border-x border-gray-200 dark:border-slate-700">
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Quality</span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5 block truncate">Daily Fresh</span>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">100% Clean</span>
                </div>
                <div className="p-1">
                  <span className="block text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider font-bold">Storage</span>
                  <span className="text-xs font-extrabold text-gray-900 dark:text-white mt-0.5 block">0°C to 4°C</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Never Frozen</span>
                </div>
              </div>

              {/* Gross Weight vs Net Weight Transparency Pill */}
              <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 dark:text-amber-300">
                    <Award className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                    <span>Weight Transparency</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setShowWeightExplanation(!showWeightExplanation)}
                    className="text-[11px] font-bold text-[#d11243] dark:text-rose-400 hover:underline flex items-center gap-0.5"
                  >
                    <span>{showWeightExplanation ? 'Hide info' : 'Gross vs Net?'}</span>
                    <HelpCircle className="w-3 h-3" />
                  </button>
                </div>
                <div className="mt-1 text-xs text-amber-900 dark:text-amber-200 flex items-center gap-3">
                  <span>Gross Weight: <strong>{activeWeightOption.grossWeight}</strong></span>
                  <span className="text-amber-400">➔</span>
                  <span>Net Meat Weight: <strong>{activeWeightOption.netWeight}</strong></span>
                </div>
                {showWeightExplanation && (
                  <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300/90 leading-relaxed border-t border-amber-200 dark:border-amber-800/60 pt-2">
                    In local markets, you pay for raw weight before cleaning. At GoMeat, we clean and trim off unwanted fat, skin, and waste before packing, so you only pay for meat you can actually cook and enjoy.
                  </p>
                )}
              </div>

              {/* Step 1: Pack Size Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-gray-900 dark:text-white tracking-wide uppercase flex items-center gap-1.5">
                    <span>1. Choose Pack Size:</span>
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                    Below Local Market Price
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {weightOptions.map((opt) => {
                    const isSelected = selectedWeight === opt.weight;
                    return (
                      <div
                        key={opt.weight}
                        onClick={() => {
                          setSelectedWeight(opt.weight);
                          playPopSound();
                        }}
                        className={`p-3 rounded-xl border text-left cursor-pointer transition relative ${
                          isSelected
                            ? 'bg-rose-50/70 dark:bg-rose-950/60 border-[#d11243] dark:border-rose-500 ring-1 ring-[#d11243] dark:ring-rose-500'
                            : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-sm text-gray-950 dark:text-white">{opt.weight}</span>
                          {opt.badge && (
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                              isSelected ? 'bg-[#d11243] text-white' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                            }`}>
                              {opt.badge}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex items-baseline gap-1.5">
                          <span className="font-extrabold text-sm text-gray-900 dark:text-white">₹{opt.price}</span>
                          <span className="text-[10px] text-gray-400 line-through">₹{opt.mrp}</span>
                        </div>

                        <div className="mt-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                          Save ₹{opt.savings} ({opt.discountPercent}% OFF)
                        </div>

                        <div className="mt-1.5 pt-1.5 border-t border-gray-100 dark:border-slate-700/60 text-[10px] text-gray-500 dark:text-gray-400">
                          Net: {opt.netWeight} • {opt.serves}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Interactive Cut Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-gray-900 dark:text-white tracking-wide uppercase">
                    2. Choose How You Want It Cut:
                  </label>
                  <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                    Free customization
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
                            ? 'bg-rose-50/70 dark:bg-rose-950/60 border-[#d11243] dark:border-rose-500 ring-1 ring-[#d11243] dark:ring-rose-500'
                            : 'bg-white dark:bg-slate-800/80 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-gray-900 dark:text-white">{opt.name}</span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-[#d11243] text-white' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300'
                          }`}>
                            {opt.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-snug">
                          {opt.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Customer Ratings & Reviews */}
              <div className="border-t border-gray-100 dark:border-slate-800 pt-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1 bg-amber-400 px-2.5 py-1 rounded-lg text-xs font-black text-gray-950">
                      <Star className="w-4 h-4 fill-current" />
                      <span>4.9</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white">Customer Reviews & Ratings</h4>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400">{reviews.length + 1420} verified customer ratings</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-3.5 py-1.5 rounded-lg bg-gray-900 dark:bg-rose-600 hover:bg-black dark:hover:bg-rose-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-auto shadow-xs"
                  >
                    <Star className="w-3.5 h-3.5" />
                    <span>{showReviewForm ? 'Close Rating Form' : 'Rate This Product'}</span>
                  </button>
                </div>

                {reviewSuccessMessage && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold">{reviewSuccessMessage}</span>
                  </div>
                )}

                {/* Interactive Rating Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="p-4 bg-gray-50 dark:bg-slate-800/90 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-3">
                    <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-700 pb-2">
                      <span className="font-bold text-xs text-gray-900 dark:text-white">Rate & Review Your Experience</span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">{product.name}</span>
                    </div>

                    {/* Star selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        How would you rate this fresh cut? *
                      </label>
                      <div className="flex flex-wrap items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => {
                          const isFilled = (hoverRating || userRating) >= star;
                          return (
                            <button
                              key={star}
                              type="button"
                              onMouseEnter={() => setHoverRating(star)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => setUserRating(star)}
                              className="p-1 cursor-pointer transition hover:scale-110"
                            >
                              <Star className={`w-6 h-6 ${isFilled ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} />
                            </button>
                          );
                        })}
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-2">
                          {userRating === 5 && '5★ Excellent (Fresh & Juicy)'}
                          {userRating === 4 && '4★ Good & Clean Cut'}
                          {userRating === 3 && '3★ Average'}
                          {userRating === 2 && '2★ Needs Improvement'}
                          {userRating === 1 && '1★ Poor'}
                        </span>
                      </div>
                    </div>

                    {/* Name input */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="e.g. Ramesh K. or Pooja"
                        className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                      />
                    </div>

                    {/* Review text */}
                    <div>
                      <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                        Write Your Review *
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Share your experience (freshness, tenderness, clean cut, taste)..."
                        className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:outline-none focus:border-[#d11243]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmittingReview || !reviewComment.trim()}
                      className="w-full py-2 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Review</span>
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3 bg-gray-50 dark:bg-slate-800/80 rounded-xl border border-gray-100 dark:border-slate-700 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 dark:text-white">{rev.author}</span>
                          {rev.verified && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 text-[10px] font-extrabold flex items-center gap-1 border border-emerald-200 dark:border-emerald-800">
                              <CheckCircle2 className="w-2.5 h-2.5" />
                              <span>Verified Buyer</span>
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400">{rev.date}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${s <= Math.round(rev.rating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
                          />
                        ))}
                        {rev.cut && (
                          <span className="text-[10px] text-gray-400 ml-1.5 font-medium">
                            • Cut: {rev.cut}
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-gray-600 dark:text-gray-300 leading-relaxed">
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
        <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0 z-20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
          <div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400 font-semibold block">Total Amount</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-950 dark:text-white">₹{activeWeightOption.price * quantity}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">for {quantity} × {activeWeightOption.weight} pack</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[10px]">
              <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                Cut: {selectedStyle}
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-500 dark:text-gray-400 font-medium">
                Save ₹{activeWeightOption.savings * quantity} vs market
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Quantity Selector */}
            <div className="flex items-center border border-gray-300 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-black text-sm text-gray-950 dark:text-white">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 sm:flex-none px-6 py-3 bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-sm rounded-xl cursor-pointer shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 card-light-hover"
            >
              <span>Add to Cart</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
