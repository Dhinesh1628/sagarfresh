import React, { useState } from 'react';
import { 
  Zap, 
  RotateCcw, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle, 
  Sparkles, 
  QrCode, 
  ThermometerSnowflake,
  Clock,
  Award
} from 'lucide-react';

interface HeroSectionProps {
  onExploreCuts: () => void;
  onNavigateToReturns: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCuts,
  onNavigateToReturns
}) => {
  const [activeSlide, setActiveSlide] = useState<'gradient' | 'minimal'>('gradient');

  return (
    <div className="space-y-4">
      {/* ======================================================== */}
      {/* 1. DESKTOP HERO SECTION (Hidden on mobile, visible md+)   */}
      {/* ======================================================== */}
      <div className="hidden md:block relative overflow-hidden rounded-2xl shadow-md border border-rose-900/10 transition-all duration-300">
        {activeSlide === 'gradient' ? (
          /* Variant V2: Premium Crimson-Wine Gradient (Featured in Figma) */
          <div className="relative bg-gradient-to-r from-[#7a0624] via-[#b80f3b] to-[#d11243] text-white p-8 lg:p-10">
            {/* Ambient background glow patterns */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-20 w-80 h-80 bg-rose-950/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-12 gap-8 items-center">
              {/* Left Copy (7 cols) */}
              <div className="col-span-7 space-y-4">
                {/* Assurance Pill */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-rose-100">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/30 backdrop-blur-md border border-white/20">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                    </span>
                    <span>FRESH & CHILLED (0°C – 4°C)</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 text-emerald-300 backdrop-blur-md border border-emerald-400/30">
                    <Zap className="w-3.5 h-3.5 text-amber-300" />
                    <span>Express 90-Min Delivery</span>
                  </span>
                </div>

                {/* Slogan & Main Headline */}
                <div className="space-y-1">
                  <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-tight text-white">
                    Fresh Meat, Delivered to Your Door.
                  </h1>
                </div>

                {/* Subheading */}
                <p className="text-sm lg:text-base text-rose-100/90 leading-relaxed max-w-xl font-normal">
                  Shop your favourites and get fresh meat delivered right to your home. Never frozen, 100% clean, and always chilled.
                </p>

                {/* Clean Feature Badges */}
                <div className="flex items-center gap-3 text-xs text-rose-200">
                  <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>100% Chemical-Free</span>
                  </span>
                  <span className="flex items-center gap-1.5 bg-black/20 px-3 py-1.5 rounded-lg border border-white/10">
                    <Clock className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Cut Fresh Daily</span>
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onExploreCuts}
                    className="px-6 py-3 rounded-xl bg-white hover:bg-rose-50 text-[#b80f3b] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onNavigateToReturns}
                    className="px-5 py-3 rounded-xl bg-black/25 hover:bg-black/35 text-white font-bold text-xs tracking-wide flex items-center gap-2 border border-white/25 backdrop-blur-xs transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-emerald-300" />
                    <span>Return Box for ₹250 Refund</span>
                  </button>
                </div>

                {/* Trust Badges Strip */}
                <div className="pt-3 border-t border-white/15 flex flex-wrap items-center gap-5 text-[11px] text-rose-100/80 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Clean & Safe Everyday</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>Govt Approved Quality</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Zero Preservatives</span>
                  </div>
                </div>
              </div>

              {/* Right Hero Image Card (5 cols) */}
              <div className="col-span-5 relative">
                <div className="relative rounded-2xl overflow-hidden border-2 border-white/25 shadow-2xl bg-black/30 group">
                  <img
                    src="/images/hero_banner_meat.jpg"
                    alt="Fresh butcher cuts and steak"
                    className="w-full h-72 object-cover object-center group-hover:scale-105 transition duration-500"
                  />
                  
                  {/* Subtle vignette gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 pointer-events-none" />

                  {/* Clean Freshness Badge */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 flex items-center gap-2 text-gray-900">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-[10px] leading-tight">
                      <span className="font-extrabold block text-gray-950">Chilled Fresh (0°–4°C)</span>
                      <span className="text-[9px] text-emerald-700 font-medium">Never Frozen</span>
                    </div>
                  </div>

                  {/* Clean Bottom Strip */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-white/15 flex items-center justify-between text-white text-[11px]">
                    <div>
                      <span className="font-bold block text-white">Daily Fresh Sourcing</span>
                      <span className="text-[10px] text-rose-200">Cleaned & cut with care</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-[10px] font-black text-white uppercase tracking-wider">
                      100% Fresh
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Variant V1: Clean Light Style */
          <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 p-8 lg:p-10 border border-gray-200 dark:border-slate-800">
            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-bold text-[#d11243] dark:text-rose-400">
                  <Zap className="w-3.5 h-3.5 text-[#d11243] dark:text-rose-400" />
                  <span>Express 90-Min Delivery</span>
                </div>
                <h1 className="text-3xl lg:text-5xl font-black text-gray-950 dark:text-white tracking-tight leading-tight">
                  Fresh Meat, Delivered to Your Door.
                </h1>
                <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed max-w-xl">
                  Shop your favourites and get fresh meat delivered right to your home. Always fresh, carefully cleaned, and delivered in reusable cold boxes.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onExploreCuts}
                    className="px-6 py-3 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNavigateToReturns}
                    className="px-5 py-3 rounded-xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 font-bold text-xs tracking-wide flex items-center gap-2 border border-gray-300 dark:border-slate-700 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span>Return Cold Box (₹250 Refund)</span>
                  </button>
                </div>
              </div>

              <div className="col-span-5 relative">
                <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-slate-700 shadow-xl bg-gray-50 dark:bg-slate-800">
                  <img
                    src="/images/hero_banner_meat.jpg"
                    alt="Fresh butcher cuts"
                    className="w-full h-72 object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Variant Switcher Toggle */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/20 text-[10px] text-white">
          <button
            onClick={() => setActiveSlide('gradient')}
            className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
              activeSlide === 'gradient' ? 'bg-white text-[#d11243]' : 'hover:text-rose-200'
            }`}
          >
            Banner 1
          </button>
          <button
            onClick={() => setActiveSlide('minimal')}
            className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
              activeSlide === 'minimal' ? 'bg-white text-gray-900' : 'hover:text-rose-200'
            }`}
          >
            Banner 2
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. MOBILE HERO SECTION (Visible on mobile screens < md)  */}
      {/* ======================================================== */}
      <div className="md:hidden space-y-3">
        {/* Mobile Gradient Card Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#7a0624] via-[#b80f3b] to-[#d11243] text-white p-5 shadow-lg border border-rose-900/10">
          <div className="space-y-3 relative z-10">
            {/* Top Pill */}
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-[10px] font-semibold text-rose-100 border border-white/20">
              <Zap className="w-3 h-3 text-amber-300" />
              <span>90-Min Delivery</span>
              <span>•</span>
              <ThermometerSnowflake className="w-3 h-3 text-cyan-200" />
              <span>Chilled 0°C - 4°C</span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-xl font-black text-white leading-tight">
                Fresh Meat, Delivered to Your Door.
              </h1>
              <p className="text-[11px] text-rose-100/90 leading-normal mt-1">
                Shop your favourites and get fresh meat delivered right to your home.
              </p>
            </div>

            {/* Mobile Product Visual */}
            <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-md">
              <img
                src="/images/hero_banner_meat.jpg"
                alt="Fresh meat cuts"
                className="w-full h-36 object-cover object-center"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs p-1.5 rounded-lg flex items-center justify-between text-[10px] text-white">
                <span className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Chilled Fresh
                </span>
                <span className="text-rose-200 font-semibold">Never Frozen</span>
              </div>
            </div>

            {/* Mobile Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onExploreCuts}
                className="w-full py-2.5 rounded-xl bg-white text-[#b80f3b] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition"
              >
                <span>Shop Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToReturns}
                className="w-full py-2.5 rounded-xl bg-black/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 active:scale-98 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                <span>Return Box for ₹250 Refund</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. REUSABLE COLD BOX RETURN BANNER                       */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                Reusable Cold Box
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[10px] font-black tracking-wide border border-emerald-300 dark:border-emerald-800">
                ₹250 REFUNDABLE DEPOSIT
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              Your order comes in a reusable cold box. Return the box after delivery and get ₹250 back once it's checked.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToReturns}
          className="w-full md:w-auto px-4 py-2.5 bg-emerald-700 dark:bg-emerald-600 hover:bg-emerald-800 dark:hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Return Box for ₹250</span>
        </button>
      </div>
    </div>
  );
};