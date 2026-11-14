import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowRight, 
  RotateCcw, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../types';

interface HeroSectionProps {
  onExploreCuts: () => void;
  onNavigateToReturns: () => void;
}

interface SlideData {
  id: string;
  giantText: string;
  title: string;
  category: string;
  cutStyle: string;
  origin: string;
  description: string;
  price: string;
  priceNum: number;
  mrp: string;
  mrpNum: number;
  image: string;
  bgGradient: string;
  glowColor: string;
  garnishes: [React.ReactNode, React.ReactNode, React.ReactNode, React.ReactNode];
  productData: Product;
}

// 100% reliable inline vector garnishes
const Garnishes = {
  iceCube: (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <defs>
        <linearGradient id="iceGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#cbd5e1" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#64748b" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <polygon points="60,10 105,35 105,85 60,110 15,85 15,35" fill="url(#iceGrad)" stroke="#ffffff" strokeWidth="2.5" />
      <line x1="60" y1="10" x2="60" y2="110" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
      <line x1="60" y1="60" x2="105" y2="35" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
      <line x1="60" y1="60" x2="15" y2="35" stroke="#ffffff" strokeWidth="2" strokeOpacity="0.8" />
      <circle cx="45" cy="45" r="4" fill="#ffffff" opacity="0.85" />
      <circle cx="75" cy="75" r="3" fill="#ffffff" opacity="0.75" />
    </svg>
  ),

  lemonSlice: (
    <svg viewBox="0 0 140 140" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <circle cx="70" cy="70" r="65" fill="#facc15" stroke="#eab308" strokeWidth="5" />
      <circle cx="70" cy="70" r="54" fill="#fef08a" />
      <circle cx="70" cy="70" r="50" fill="#facc15" />
      <g stroke="#fef08a" strokeWidth="3" fill="#fef9c3">
        <path d="M70,70 L70,22 A48,48 0 0,1 104,36 Z" />
        <path d="M70,70 L104,36 A48,48 0 0,1 118,70 Z" />
        <path d="M70,70 L118,70 A48,48 0 0,1 104,104 Z" />
        <path d="M70,70 L104,104 A48,48 0 0,1 70,118 Z" />
        <path d="M70,70 L70,118 A48,48 0 0,1 36,104 Z" />
        <path d="M70,70 L36,104 A48,48 0 0,1 22,70 Z" />
        <path d="M70,70 L22,70 A48,48 0 0,1 36,36 Z" />
        <path d="M70,70 L36,36 A48,48 0 0,1 70,22 Z" />
      </g>
      <circle cx="70" cy="70" r="8" fill="#fef08a" />
    </svg>
  ),

  dillSprig: (
    <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <path d="M50,110 Q52,60 48,15" stroke="#15803d" strokeWidth="4" fill="none" strokeLinecap="round" />
      <g stroke="#22c55e" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M49,85 Q30,75 18,80" />
        <path d="M51,75 Q70,65 82,70" />
        <path d="M49,60 Q32,50 20,54" />
        <path d="M51,50 Q68,40 80,44" />
        <path d="M49,35 Q35,28 25,30" />
        <path d="M50,25 Q65,18 75,20" />
      </g>
    </svg>
  ),

  starAnise: (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <g fill="#78350f" stroke="#290e03" strokeWidth="2.5">
        <path d="M60,60 C55,40 50,20 60,8 C70,20 65,40 60,60 Z" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(45 60 60)" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(90 60 60)" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(135 60 60)" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(180 60 60)" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(225 60 60)" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(270 60 60)" />
        <path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(315 60 60)" />
      </g>
      <circle cx="60" cy="60" r="10" fill="#92400e" stroke="#451a03" strokeWidth="2.5" />
    </svg>
  ),

  cinnamon: (
    <svg viewBox="0 0 140 60" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <rect x="15" y="15" width="110" height="30" rx="15" fill="#7c2d12" stroke="#1c0a00" strokeWidth="2.5" />
      <ellipse cx="25" cy="30" rx="8" ry="14" fill="#451a03" stroke="#9a3412" strokeWidth="2" />
      <ellipse cx="115" cy="30" rx="8" ry="14" fill="#290e03" />
    </svg>
  ),

  bayLeaf: (
    <svg viewBox="0 0 100 140" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <path d="M50,130 Q10,75 50,10 Q90,75 50,130 Z" fill="#4d7c0f" stroke="#1a3d04" strokeWidth="3" />
      <path d="M50,130 Q50,70 50,10" stroke="#bef264" strokeWidth="2" fill="none" />
    </svg>
  ),

  redChili: (
    <svg viewBox="0 0 140 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <path d="M25,25 Q60,15 110,40 Q130,55 125,75 Q85,85 25,25 Z" fill="#dc2626" stroke="#5f0d0d" strokeWidth="3" />
      <path d="M25,25 Q18,20 15,10 Q20,12 25,25" fill="#15803d" stroke="#14532d" strokeWidth="2" />
    </svg>
  ),

  garlic: (
    <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <path d="M50,15 Q20,50 35,80 Q50,92 65,80 Q80,50 50,15 Z" fill="#fef3c7" stroke="#b45309" strokeWidth="3" />
      <path d="M50,15 Q46,55 48,85" stroke="#d97706" strokeWidth="2" fill="none" />
    </svg>
  ),

  lime: (
    <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <path d="M15,95 A80,80 0 0,1 95,15 L15,95 Z" fill="#65a30d" stroke="#365314" strokeWidth="4" />
      <path d="M22,88 A68,68 0 0,1 88,22 L22,88 Z" fill="#bef264" />
      <g stroke="#f7fee7" strokeWidth="2.5">
        <line x1="22" y1="88" x2="60" y2="40" />
        <line x1="22" y1="88" x2="40" y2="60" />
        <line x1="22" y1="88" x2="75" y2="55" />
        <line x1="22" y1="88" x2="55" y2="75" />
      </g>
    </svg>
  ),

  saltCrystal: (
    <svg viewBox="0 0 90 90" className="w-full h-full drop-shadow-[0_4px_8px_rgba(0,0,0,0.35)]">
      <polygon points="45,10 75,30 80,65 50,85 15,65 20,30" fill="#ffffff" stroke="#94a3b8" strokeWidth="3" opacity="0.95" />
      <line x1="45" y1="10" x2="50" y2="85" stroke="#cbd5e1" strokeWidth="2" />
      <line x1="75" y1="30" x2="15" y2="65" stroke="#cbd5e1" strokeWidth="2" />
    </svg>
  )
};

const SLIDES: SlideData[] = [
  {
    id: 'surmai',
    giantText: 'SURMAI',
    title: 'Crispy Surmai Tawa Fry',
    category: 'Mangalore Coastal Catch • Tawa Fry Ready',
    cutStyle: 'Center-Cut Surmai Steaks',
    origin: 'Daily 4:00 AM Harbor Catch • 0°C Cold Chain',
    description: 'Center-cut fresh Seer Fish steaks with aromatic coastal spices, ready for a golden crisp tawa fry. Shucked, cleaned in RO water, and delivered 0°C fresh.',
    price: '₹799',
    priceNum: 799,
    mrp: '₹899',
    mrpNum: 899,
    image: '/images/products/prod_1.jpg',
    bgGradient: 'radial-gradient(ellipse at 50% 45%, #232a31 0%, #14181c 45%, #080a0c 80%, #030405 100%)',
    glowColor: 'rgba(255, 255, 255, 0.12)',
    garnishes: [Garnishes.iceCube, Garnishes.lemonSlice, Garnishes.dillSprig, Garnishes.iceCube],
    productData: {
      id: 'prod_1',
      name: 'Crispy Surmai Tawa Fry (Large Steaks)',
      category: 'fish',
      description: 'Center-cut neat steaks from daily fresh catches off the Mangalore-Malabar coast.',
      price: 799,
      mrp: 899,
      unit: '500g',
      chillingMethod: '0°C to 4°C Constant Cold Chain',
      catchDate: 'Today 4:00 AM',
      origin: 'Mangalore Harbor Catch',
      cutStyle: 'Curry Cut & Tawa Fry Steaks',
      stock: 24,
      image: '/images/products/prod_1.jpg'
    }
  },
  {
    id: 'mutton',
    giantText: 'MUTTON',
    title: 'Kashmiri Mutton Rogan Josh',
    category: 'Grass-Fed Young Goat • Slow Dum Simmer',
    cutStyle: 'Prime Bone-In Rogan Josh Cut',
    origin: 'Pasture-Raised Herds • 0°C Vacuum Cold Box',
    description: 'Succulent tender young goat cuts with marrow bones, slow-simmered for rich Kashmiri Rogan Josh or aromatic dum biryani. 100% pasture-raised and blast-chilled.',
    price: '₹549',
    priceNum: 549,
    mrp: '₹599',
    mrpNum: 599,
    image: '/images/products/prod_4.jpg',
    bgGradient: 'radial-gradient(ellipse at 50% 45%, #261f22 0%, #151113 45%, #090708 80%, #030203 100%)',
    glowColor: 'rgba(244, 63, 94, 0.15)',
    garnishes: [Garnishes.starAnise, Garnishes.cinnamon, Garnishes.bayLeaf, Garnishes.starAnise],
    productData: {
      id: 'prod_4',
      name: 'Kashmiri Mutton Rogan Josh (Curry Cut)',
      category: 'mutton',
      description: 'Lean, tender young goat cuts with prime rib and shoulder pieces. Naturally grazed on open pastures.',
      price: 549,
      mrp: 599,
      unit: '500g',
      chillingMethod: '0°C to 4°C Constant Cold Chain',
      catchDate: 'Fresh Today',
      origin: 'Dindigul Pasture Farms',
      cutStyle: 'Prime Bone-In Curry Cut',
      stock: 18,
      image: '/images/products/prod_4.jpg'
    }
  },
  {
    id: 'chicken',
    giantText: 'CHICKEN',
    title: 'Andhra Nati Koli Pepper Roast',
    category: 'Free-Range Country Fowl • Village Roast',
    cutStyle: 'Country Chicken Curry Cut',
    origin: 'Naturally Foraged Organic Birds • Sealed in 90 Mins',
    description: 'Naturally foraged country fowl with rich muscle density and authentic spicy Andhra pepper roast flavor. Cleaned and vacuum-sealed within 90 minutes.',
    price: '₹389',
    priceNum: 389,
    mrp: '₹429',
    mrpNum: 429,
    image: '/images/products/prod_6.jpg',
    bgGradient: 'radial-gradient(ellipse at 50% 45%, #25211d 0%, #151310 45%, #0a0807 80%, #030302 100%)',
    glowColor: 'rgba(245, 158, 11, 0.14)',
    garnishes: [Garnishes.redChili, Garnishes.garlic, Garnishes.redChili, Garnishes.garlic],
    productData: {
      id: 'prod_6',
      name: 'Andhra Nati Koli Pepper Roast (Curry Cut)',
      category: 'chicken',
      description: 'Naturally foraged country fowl with rich muscle density and authentic rustic flavor.',
      price: 389,
      mrp: 429,
      unit: '500g',
      chillingMethod: '0°C to 4°C Constant Cold Chain',
      catchDate: 'Processed Today',
      origin: 'Organic Poultry Farms',
      cutStyle: 'Medium Bone-In Curry Cut',
      stock: 35,
      image: '/images/products/prod_6.jpg'
    }
  },
  {
    id: 'prawns',
    giantText: 'PRAWNS',
    title: 'Butter Garlic Jumbo Prawns',
    category: 'Wild Coastal Catch • Sizzling Butter Garlic',
    cutStyle: 'Tail-On Deveined Jumbo Prawns',
    origin: 'Deep Coastal Waters of Karnataka • Pristine Catch',
    description: 'Jumbo sea tiger prawns, peeled and deveined with tails intact. Bursting with sweet oceanic flavor, ready for a sizzling 5-minute butter garlic and green chili toss.',
    price: '₹449',
    priceNum: 449,
    mrp: '₹499',
    mrpNum: 499,
    image: '/images/products/prod_3.jpg',
    bgGradient: 'radial-gradient(ellipse at 50% 45%, #1e2525 0%, #111616 45%, #070909 80%, #020303 100%)',
    glowColor: 'rgba(20, 184, 166, 0.15)',
    garnishes: [Garnishes.lime, Garnishes.saltCrystal, Garnishes.lime, Garnishes.saltCrystal],
    productData: {
      id: 'prod_3',
      name: 'Butter Garlic Jumbo Tiger Prawns',
      category: 'prawns',
      description: 'Wild-caught sea tiger prawns, tail-on, cleaned in RO water and thoroughly deveined.',
      price: 449,
      mrp: 499,
      unit: '500g',
      chillingMethod: '0°C to 4°C Constant Cold Chain',
      catchDate: 'Today 4:00 AM',
      origin: 'Karnataka Coast',
      cutStyle: 'Tail-On Deveined Jumbo',
      stock: 22,
      image: '/images/products/prod_3.jpg'
    }
  }
];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCuts,
  onNavigateToReturns
}) => {
  const { addItem } = useCart();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [addedCutId, setAddedCutId] = useState<string | null>(null);

  // 3D Parallax Tilt state
  const stageRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const currentSlide = SLIDES[currentIndex];

  // Mousemove Parallax listener (Desktop)
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!stageRef.current || isAnimating) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  // Touch Swipe & Parallax listeners (Mobile Phones & Tablets)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!stageRef.current || !touchStartRef.current || isAnimating) return;
    const touch = e.touches[0];
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((touch.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ 
      x: Math.max(-1, Math.min(1, x)), 
      y: Math.max(-1, Math.min(1, y)) 
    });
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;

    if (Math.abs(deltaX) > 45 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }

    touchStartRef.current = null;
    setTilt({ x: 0, y: 0 });
  };

  // Mobile Gyroscope Parallax
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isAnimating) return;
      if (e.gamma !== null && e.beta !== null) {
        const clampedGamma = Math.max(-30, Math.min(30, e.gamma)) / 30;
        const clampedBeta = Math.max(-30, Math.min(30, e.beta - 45)) / 30;
        setTilt({ x: clampedGamma, y: clampedBeta });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation);
    }
    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [isAnimating]);

  const changeSlide = (newIndex: number) => {
    if (isAnimating || newIndex === currentIndex) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(newIndex);
      setIsAnimating(false);
    }, 400);
  };

  const handleNext = () => {
    changeSlide((currentIndex + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    changeSlide((currentIndex - 1 + SLIDES.length) % SLIDES.length);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isAnimating]);

  // Handle Add to Cart action
  const handleAddToCart = () => {
    addItem(
      currentSlide.productData,
      1,
      currentSlide.cutStyle,
      '500g',
      currentSlide.priceNum,
      currentSlide.mrpNum
    );

    setAddedCutId(currentSlide.id);
    setTimeout(() => {
      setAddedCutId(null);
    }, 1800);
  };

  // Calculated Volumetric Spotlight coordinate
  const spotX = 50 + tilt.x * 22;
  const spotY = 45 + tilt.y * 18;

  return (
    <div 
      ref={stageRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative w-full rounded-3xl overflow-hidden shadow-lg shadow-black/15 ring-1 ring-black/5 dark:ring-white/10 select-none transition-colors duration-700 group/hero"
      style={{
        background: currentSlide.bgGradient,
        perspective: '1600px'
      }}
    >
      {/* ======================================================== */}
      {/* 1. ATMOSPHERIC SPOTLIGHT & CINEMATIC VIGNETTE (No Strips)*/}
      {/* ======================================================== */}
      {/* Smooth Volumetric Overhead Spotlight following cursor/tilt */}
      <div 
        className="absolute inset-0 pointer-events-none z-5 transition-opacity duration-700"
        style={{
          background: `radial-gradient(750px circle at ${spotX}% ${spotY}%, ${currentSlide.glowColor} 0%, rgba(255, 255, 255, 0.02) 45%, transparent 75%)`
        }}
      />

      {/* Edge Vignette: Dissolves side edges into deep obsidian without harsh borders */}
      <div className="absolute inset-0 pointer-events-none z-5 bg-gradient-to-r from-black/40 via-transparent to-black/40" />

      {/* Subtle 0°C Cold-Vapor Mist animation around the platter */}
      <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden flex items-center justify-center">
        <div 
          className="w-96 h-96 rounded-full bg-white/[0.04] blur-3xl animate-pulse pointer-events-none"
          style={{
            transform: `translate(${tilt.x * 20}px, ${tilt.y * 15}px) scale(1.15)`,
            transition: 'transform 0.5s ease-out'
          }}
        />
        <div 
          className="w-80 h-80 rounded-full bg-cyan-200/[0.03] blur-2xl pointer-events-none"
          style={{
            transform: `translate(${tilt.x * -15}px, ${tilt.y * -10}px) scale(0.95)`,
            transition: 'transform 0.4s ease-out'
          }}
        />
      </div>

      {/* Floating Micro-Frost Crystals (Twinkling cold specks) */}
      <div className="absolute inset-0 pointer-events-none z-15 overflow-hidden">
        <span className="absolute top-[22%] left-[25%] w-1.5 h-1.5 rounded-full bg-white/40 blur-[0.5px] animate-ping" style={{ animationDuration: '4s' }} />
        <span className="absolute top-[35%] right-[28%] w-1 h-1 rounded-full bg-cyan-200/50 blur-[0.5px] animate-pulse" style={{ animationDuration: '3s' }} />
        <span className="absolute bottom-[30%] left-[32%] w-1.5 h-1.5 rounded-full bg-white/30 blur-[0.5px] animate-pulse" style={{ animationDuration: '5s' }} />
        <span className="absolute top-[18%] right-[38%] w-1 h-1 rounded-full bg-white/40 animate-ping" style={{ animationDuration: '6s' }} />
      </div>

      {/* ======================================================== */}
      {/* 2. TOP METADATA BAR (Seamless Floating Capsule Design)   */}
      {/* ======================================================== */}
      <div className="relative z-30 px-3 sm:px-10 pt-3 sm:pt-4 pb-1.5 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/40 backdrop-blur-xl ring-1 ring-white/10 shadow-sm shrink">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-white truncate">
            0°C – 4°C Active Cold Chain
          </span>
          <span className="text-gray-500 hidden sm:inline">•</span>
          <span className="text-[10px] sm:text-xs text-gray-300 font-semibold hidden sm:inline">
            ⚡ 90-Min Express
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNavigateToReturns}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-black/40 hover:bg-white/15 text-white text-[10px] sm:text-xs font-bold ring-1 ring-white/15 hover:ring-white/30 transition-all cursor-pointer backdrop-blur-xl shadow-sm"
          >
            <RotateCcw className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-300" />
            <span>₹250 Box Refund</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. MAIN 3D SHOWCASE HERO STAGE                           */}
      {/* ======================================================== */}
      <div className="relative min-h-[250px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[390px] flex items-center justify-center px-2 sm:px-4 overflow-hidden">
        
        {/* ---------------------------------------------------- */}
        {/* LAYER 1: SOLID GIGANTIC TYPOGRAPHY (BEHIND MEAT CUT) */}
        {/* Plain, clean, high-contrast, pure white bold letters */}
        {/* ---------------------------------------------------- */}
        <div 
          className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
          style={{
            transform: `translate(${tilt.x * -30}px, ${tilt.y * -16}px)`,
            transition: isAnimating ? 'all 0.4s ease' : 'transform 0.15s ease-out'
          }}
        >
          <span 
            className={`font-black uppercase tracking-[0.12em] sm:tracking-[0.14em] text-white select-none transition-all duration-500 truncate max-w-full text-center ${
              isAnimating ? 'opacity-0 scale-90 translate-y-8' : 'opacity-90 scale-100 translate-y-0'
            }`}
            style={{
              fontSize: 'clamp(2.4rem, 10vw, 9.5rem)',
              lineHeight: '0.85',
              fontFamily: 'Montserrat, system-ui, -apple-system, sans-serif',
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.4)'
            }}
          >
            {currentSlide.giantText}
          </span>
        </div>

        {/* ---------------------------------------------------- */}
        {/* FLOATING INLINE GARNISHES (Multi-depth parallax)     */}
        {/* ---------------------------------------------------- */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div 
            className="absolute top-[12%] left-[8%] sm:left-[14%] w-14 h-14 sm:w-20 sm:h-20 transition-transform duration-200"
            style={{ transform: `translate(${tilt.x * 35}px, ${tilt.y * 25}px)` }}
          >
            {currentSlide.garnishes[0]}
          </div>

          <div 
            className="absolute top-[14%] right-[8%] sm:right-[14%] w-14 h-14 sm:w-20 sm:h-20 transition-transform duration-200"
            style={{ transform: `translate(${tilt.x * -30}px, ${tilt.y * 35}px)` }}
          >
            {currentSlide.garnishes[1]}
          </div>

          <div 
            className="absolute bottom-[12%] right-[10%] sm:right-[16%] w-14 h-14 sm:w-18 sm:h-18 transition-transform duration-200"
            style={{ transform: `translate(${tilt.x * 20}px, ${tilt.y * -30}px)` }}
          >
            {currentSlide.garnishes[2]}
          </div>

          <div 
            className="absolute bottom-[14%] left-[10%] sm:left-[16%] w-14 h-14 sm:w-18 sm:h-18 transition-transform duration-200"
            style={{ transform: `translate(${tilt.x * -35}px, ${tilt.y * -20}px)` }}
          >
            {currentSlide.garnishes[3]}
          </div>
        </div>

        {/* ---------------------------------------------------- */}
        {/* LAYER 2: 3D HERO PRODUCT CENTERPIECE (PRISTINE CUT)  */}
        {/* ---------------------------------------------------- */}
        <div 
          className="relative z-20 cursor-pointer"
          style={{
            transform: `rotateY(${tilt.x * 14}deg) rotateX(${-tilt.y * 14}deg) translateZ(40px)`,
            transformStyle: 'preserve-3d',
            transition: isAnimating 
              ? 'transform 0.4s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.3s ease' 
              : 'transform 0.15s ease-out'
          }}
        >
          <div className={`relative flex items-center justify-center transition-all duration-500 ${
            isAnimating ? 'opacity-0 scale-75 translate-y-12' : 'opacity-100 scale-100 translate-y-0'
          }`}>
            
            {/* Frosted Glass Culinary Platter & Clean External Telemetry Badge */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-44 h-44 sm:w-60 sm:h-60 md:w-72 md:h-72 lg:w-76 lg:h-76 rounded-full p-2.5 sm:p-3 bg-gradient-to-tr from-white/15 via-white/5 to-transparent backdrop-blur-3xl ring-1 ring-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.5)] overflow-hidden flex items-center justify-center group">
                <img 
                  src={currentSlide.image} 
                  alt={currentSlide.title}
                  className="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-105"
                />
              </div>

              {/* Clean Cold-Chain Telemetry Pill Below Platter (Zero Clipping) */}
              <div className="-mt-4 sm:-mt-5 z-30 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-black/90 backdrop-blur-2xl ring-1 ring-white/25 shadow-2xl flex items-center gap-1.5 sm:gap-2 text-center max-w-[90%]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_#34d399] animate-pulse" />
                <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-wider text-white whitespace-nowrap">
                  {currentSlide.cutStyle}
                </span>
                <span className="text-gray-500 text-[10px] hidden sm:inline">•</span>
                <span className="text-[8px] sm:text-[10px] text-gray-300 font-semibold whitespace-nowrap hidden sm:inline">
                  {currentSlide.origin}
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ======================================================== */}
      {/* 4. BOTTOM CONTROL PANEL (Seamless Obsidian Glass)        */}
      {/* ======================================================== */}
      <div className="relative z-40 px-3.5 sm:px-10 pt-3 sm:pt-4 pb-20 sm:pb-5 bg-gradient-to-t from-black/95 via-black/75 to-transparent backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3.5 sm:gap-4">
          
          {/* Bottom Left: Title, Tagline, Description & Shop Now Button */}
          <div className="flex-1 space-y-1 text-center md:text-left">
            <div>
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-widest text-emerald-400">
                {currentSlide.category}
              </span>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {currentSlide.title}
              </h2>
            </div>

            <p className="text-[10px] sm:text-xs text-gray-200 max-w-md leading-relaxed font-medium line-clamp-2">
              {currentSlide.description}
            </p>

            <div className="pt-1.5 flex flex-wrap items-center justify-center md:justify-start gap-2">
              {/* Authentic Video "Shop now" Pill Button */}
              <button
                onClick={handleAddToCart}
                className={`px-5 sm:px-7 py-2 rounded-full font-black text-xs shadow-xl transition-all cursor-pointer tracking-wider uppercase flex items-center gap-2 ${
                  addedCutId === currentSlide.id
                    ? 'bg-emerald-400 text-black scale-105 ring-2 ring-emerald-300'
                    : 'bg-white text-black hover:bg-gray-200 hover:scale-105 active:scale-95'
                }`}
              >
                {addedCutId === currentSlide.id ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Added to Cart</span>
                  </>
                ) : (
                  <>
                    <span>Shop now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>

              <button
                onClick={onExploreCuts}
                className="text-gray-300 hover:text-white text-xs font-bold underline underline-offset-4 decoration-white/40 hover:decoration-white transition cursor-pointer"
              >
                View Full Catalog
              </button>
            </div>
          </div>

          {/* Bottom Center: Bold Price Tag Capsule */}
          <div className="text-center shrink-0 px-4 py-2 sm:px-6 sm:py-2.5 rounded-2xl bg-black/75 ring-1 ring-white/25 backdrop-blur-xl shadow-2xl">
            <span className="text-[10px] uppercase font-black text-gray-200 tracking-widest block mb-0.5">
              Price (500g)
            </span>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {currentSlide.price}
              </span>
              <span className="text-xs text-gray-400 line-through font-bold">
                {currentSlide.mrp}
              </span>
            </div>
          </div>

          {/* Bottom Right: Next / Prev Circular Buttons & Thumbnails */}
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-2 sm:gap-3 shrink-0 md:pr-10 lg:pr-20">
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1.5">
              <button 
                onClick={handlePrev}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/50 hover:bg-white text-white hover:text-black transition-all flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95 ring-1 ring-white/15"
                title="Previous Cut (Left Arrow)"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleNext}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 active:scale-95"
                title="Next Cut (Right Arrow)"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Navigation Bar */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-black/50 p-1 rounded-full ring-1 ring-white/15 backdrop-blur-xl">
              {SLIDES.map((slide, idx) => (
                <button
                  key={slide.id}
                  onClick={() => changeSlide(idx)}
                  className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full overflow-hidden transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'ring-2 ring-white scale-110 shadow-xl'
                      : 'opacity-40 hover:opacity-90'
                  }`}
                  title={slide.title}
                >
                  <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Counter */}
            <div className="text-xs font-black text-gray-400 tracking-widest pl-1 hidden sm:block">
              <span className="text-white">{String(currentIndex + 1).padStart(2, '0')}</span> / <span>{String(SLIDES.length).padStart(2, '0')}</span>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
