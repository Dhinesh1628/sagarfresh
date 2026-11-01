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
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20 text-xs font-semibold text-rose-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                  </span>
                  <Zap className="w-3.5 h-3.5 text-amber-300" />
                  <span>Express 90-Min Delivery</span>
                  <span className="text-white/40">•</span>
                  <ThermometerSnowflake className="w-3.5 h-3.5 text-cyan-200" />
                  <span>0°C to 4°C FreshSeal™</span>
                </div>

                {/* Slogan & Main Headline */}
                <div className="space-y-1">
                  <div className="text-xs uppercase font-extrabold tracking-widest text-rose-200">
                    Freshness we can trust.
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white">
                    India's Purest Cold-Chain Meat & Coastal Seafood
                  </h1>
                </div>

                {/* Description */}
                <p className="text-sm text-rose-100/90 leading-relaxed max-w-xl font-normal">
                  Daily 4:00 AM harbor catches, bio-secured farm chicken, and pasture-grazed tender mutton. Delivered chilled in reusable <strong>ThermalVault</strong> boxes with ₹250 refundable security deposit.
                </p>

                {/* Dual CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    onClick={onExploreCuts}
                    className="px-6 py-3 rounded-xl bg-white hover:bg-rose-50 text-[#b80f3b] font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg hover:shadow-xl hover:scale-[1.02] transition cursor-pointer"
                  >
                    <span>Shop Today's Fresh Cuts</span>
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
                    <span>150+ Bio-Security Checks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>FSSAI Certified Hubs</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                    <span>100% Zero Formalin / Antibiotics</span>
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

                  {/* Floating Telemetry Badge: Live Cold-Chain Tag */}
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-lg border border-gray-100 flex items-center gap-2 text-gray-900">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div className="text-[10px] leading-tight">
                      <span className="font-extrabold block text-gray-950">Core Temp: 1.8°C</span>
                      <span className="text-[9px] text-emerald-700 font-medium">Active IoT Cold Chain</span>
                    </div>
                  </div>

                  {/* Daily Harbor Badge */}
                  <div className="absolute bottom-3 left-3 right-3 bg-black/75 backdrop-blur-md p-2.5 rounded-xl border border-white/15 flex items-center justify-between text-white text-[11px]">
                    <div>
                      <span className="font-bold block text-white">Daily Harbor & Farm Procurement</span>
                      <span className="text-[10px] text-rose-200">RO water cleaned • Scale scraped</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/90 text-[10px] font-black text-white uppercase tracking-wider">
                      Never Frozen
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Variant V1: Clean Studio White Card (Also in Figma) */
          <div className="bg-white text-gray-900 p-8 lg:p-10 border border-gray-200">
            <div className="grid grid-cols-12 gap-8 items-center">
              <div className="col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-xs font-bold text-[#d11243]">
                  <Zap className="w-3.5 h-3.5 text-[#d11243]" />
                  <span>Farm to Fork Fresh • 90-Min Express Dispatch</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-tight">
                  Freshness We Can Trust, <br />
                  <span className="text-[#d11243]">Delivered Chilled to Your Door</span>
                </h1>
                <p className="text-sm text-gray-600 leading-relaxed max-w-xl">
                  Order fresh harbor catch Surmai, Pomfret, and tender pasture mutton safely packed in reusable ThermalVault boxes with instant ₹250 UPI return refunds.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={onExploreCuts}
                    className="px-6 py-3 rounded-xl bg-[#d11243] hover:bg-[#b80f3b] text-white font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-md hover:shadow-lg transition cursor-pointer"
                  >
                    <span>Browse Fresh Cuts</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNavigateToReturns}
                    className="px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs tracking-wide flex items-center gap-2 border border-gray-300 transition cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-gray-600" />
                    <span>Return Cold Box (₹250 Refund)</span>
                  </button>
                </div>
              </div>

              <div className="col-span-5 relative">
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-xl bg-gray-50">
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

        {/* Variant Switcher Toggle (shown small at top right for design alignment) */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/20 text-[10px] text-white">
          <button
            onClick={() => setActiveSlide('gradient')}
            className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
              activeSlide === 'gradient' ? 'bg-white text-[#d11243]' : 'hover:text-rose-200'
            }`}
          >
            Crimson V2
          </button>
          <button
            onClick={() => setActiveSlide('minimal')}
            className={`px-2 py-0.5 rounded font-bold transition cursor-pointer ${
              activeSlide === 'minimal' ? 'bg-white text-gray-900' : 'hover:text-rose-200'
            }`}
          >
            Light V1
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
              <span>90-Min Express</span>
              <span>•</span>
              <ThermometerSnowflake className="w-3 h-3 text-cyan-200" />
              <span>0°C - 4°C Chilled</span>
            </div>

            {/* Headline */}
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-rose-200 block">
                Freshness we can trust.
              </span>
              <h1 className="text-xl font-black text-white leading-tight mt-0.5">
                India's Purest Cold-Chain Meat & Coastal Seafood
              </h1>
            </div>

            {/* Mobile Product Visual with Temperature Tag */}
            <div className="relative rounded-xl overflow-hidden border border-white/20 shadow-md">
              <img
                src="/images/hero_banner_meat.jpg"
                alt="Fresh cuts"
                className="w-full h-36 object-cover object-center"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-black/75 backdrop-blur-xs p-1.5 rounded-lg flex items-center justify-between text-[10px] text-white">
                <span className="font-bold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  0°C to 4°C Maintained
                </span>
                <span className="text-rose-200 font-semibold">100% Bio-Secure</span>
              </div>
            </div>

            <p className="text-[11px] text-rose-100/90 leading-normal">
              100% antibiotic-free farm chicken, daily harbor catch, & tender mutton in reusable ThermalVault boxes.
            </p>

            {/* Mobile Dual Action Buttons */}
            <div className="space-y-2 pt-1">
              <button
                onClick={onExploreCuts}
                className="w-full py-2.5 rounded-xl bg-white text-[#b80f3b] font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition"
              >
                <span>Shop Fresh Cuts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={onNavigateToReturns}
                className="w-full py-2.5 rounded-xl bg-black/30 text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-white/20 active:scale-98 transition"
              >
                <RotateCcw className="w-3.5 h-3.5 text-emerald-300" />
                <span>Return Box for ₹250 UPI Refund</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. REUSABLE BOX RETURN BANNER (ThermalVault QR in Figma) */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm text-gray-900">
                ThermalVault Reusable Box Initiative
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black tracking-wide border border-emerald-300">
                ₹250 REFUNDABLE DEPOSIT
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              Maintains 0°C to 4°C for 36 hours with zero thermocol waste. Hand back the empty cooler box to our delivery partner for an instant ₹250 refund to your UPI ID.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToReturns}
          className="w-full md:w-auto px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-xs transition shrink-0 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Schedule Box Return</span>
        </button>
      </div>
    </div>
  );
};