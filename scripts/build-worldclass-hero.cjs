const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const p1 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_1.jpg')).toString('base64');
const p4 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_4.jpg')).toString('base64');
const p6 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_6.jpg')).toString('base64');
const p3 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_3.jpg')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoMeat 3D Hero Showcase (Black & White Luxury Edition)</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;0,900;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      background: #050607;
    }

    .font-heavy {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
    }

    /* 3D Perspective Stage */
    .hero-stage {
      perspective: 1600px;
      perspective-origin: center center;
    }

    .preserve-3d {
      transform-style: preserve-3d;
    }

    /* Black & White Shade Smooth Morphing */
    .theme-transition {
      transition: background 0.85s cubic-bezier(0.2, 0.8, 0.2, 1);
    }

    /* LAYER 1: Giant 3D Solid Typography (Behind Meat Cut) */
    .giant-text-solid {
      font-size: clamp(5.5rem, 16vw, 16rem);
      line-height: 0.85;
      text-transform: uppercase;
      color: #ffffff;
      opacity: 0.95;
      letter-spacing: 0.10em;
      filter: drop-shadow(0 25px 50px rgba(0, 0, 0, 0.95));
      transition: transform 0.75s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.45s ease;
      will-change: transform, opacity;
      pointer-events: none;
    }

    /* LAYER 2: Giant 3D Stroked Typography (Directly In Front of Meat Cut) - Solves Visibility with 3D Depth! */
    .giant-text-stroke {
      font-size: clamp(5.5rem, 16vw, 16rem);
      line-height: 0.85;
      text-transform: uppercase;
      color: transparent;
      -webkit-text-stroke: 2.5px rgba(255, 255, 255, 0.95);
      letter-spacing: 0.10em;
      opacity: 0.92;
      filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.35));
      transition: transform 0.75s cubic-bezier(0.34, 1.45, 0.64, 1), opacity 0.45s ease;
      will-change: transform, opacity;
      pointer-events: none;
    }

    /* Floating Garnish Physics Animations */
    @keyframes float1 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-18px) rotate(8deg); }
    }
    @keyframes float2 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(16px) rotate(-10deg); }
    }
    @keyframes float3 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-14px) rotate(6deg); }
    }
    @keyframes float4 {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(18px) rotate(-8deg); }
    }

    .anim-float-1 { animation: float1 5.5s ease-in-out infinite; }
    .anim-float-2 { animation: float2 6.2s ease-in-out infinite 0.4s; }
    .anim-float-3 { animation: float3 5.8s ease-in-out infinite 0.8s; }
    .anim-float-4 { animation: float4 6.5s ease-in-out infinite 1.2s; }

    /* Frosted Monochrome Glass */
    .bw-glass {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .bw-glass-card {
      background: rgba(18, 20, 24, 0.7);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .hero-centerpiece {
      transition: transform 0.85s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.4s ease;
      will-change: transform, opacity;
    }

    .hero-drop-shadow {
      filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.85));
    }

    .garnish-shadow {
      filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.7));
    }

    .mode-btn.active {
      background: #ffffff;
      color: #000000;
      border-color: #ffffff;
    }
    .mode-btn {
      transition: all 0.25s ease;
      cursor: pointer;
    }
  </style>
</head>
<body class="text-white flex flex-col justify-between theme-transition relative" id="mainContainer" style="background: radial-gradient(circle at 50% 45%, #2a3138 0%, #181d22 35%, #0c0f12 70%, #050607 100%);">

  <!-- ================= TOP NAVIGATION BAR (Black & White Minimalist Luxury) ================= -->
  <header class="relative z-40 px-6 sm:px-14 pt-6 pb-3 flex items-center justify-between border-b border-white/10">
    <div class="flex items-center gap-3.5">
      <div class="w-10 h-10 rounded-2xl bg-white text-black flex items-center justify-center font-black text-xl shadow-2xl">
        G
      </div>
      <div>
        <h1 class="text-xl font-black tracking-tight leading-none text-white">GoMeat</h1>
        <p class="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">Fresh Quality. Delivered with Care.</p>
      </div>
    </div>

    <!-- Text Visibility Mode Switcher (Allows testing all 3 typography solutions) -->
    <div class="flex items-center gap-1.5 p-1 rounded-full bw-glass text-xs font-bold text-gray-200 shadow-xl">
      <span class="text-[10px] text-gray-400 font-bold px-2.5 uppercase tracking-wider hidden sm:inline">Text Style:</span>
      <button id="btnModeCut" onclick="setTextMode('cutthrough')" class="mode-btn active px-3.5 py-1.5 rounded-full text-xs font-black">
        ✨ 3D Cut-Through
      </button>
      <button id="btnModeTop" onclick="setTextMode('elevated')" class="mode-btn px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white">
        ⬆️ Elevated Top
      </button>
      <button id="btnModeSplit" onclick="setTextMode('split')" class="mode-btn px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white">
        ↔️ Split Wings
      </button>
    </div>

    <div class="hidden md:flex items-center gap-3">
      <span class="px-3.5 py-1.5 rounded-full text-[11px] font-black bg-white text-black shadow-2xl tracking-wider uppercase">
        0°C Never Frozen
      </span>
    </div>
  </header>

  <!-- ================= MAIN 3D SHOWCASE HERO STAGE ================= -->
  <main class="relative flex-1 flex items-center justify-center hero-stage px-4 sm:px-12 overflow-hidden">
    
    <!-- 1. LAYER 1: SOLID GIGANTIC TEXT (BEHIND THE MEAT CUT) -->
    <div id="solidTextContainer" class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 transition-transform duration-500">
      <span id="giantTextBack" class="font-heavy giant-text-solid select-none">
        SURMAI
      </span>
    </div>

    <!-- 2. INLINE SVGs FOR FLOATING INGREDIENTS -->
    <div id="floatingGarnishLayer" class="absolute inset-0 pointer-events-none z-10">
      <div id="garnish1" class="absolute top-[12%] left-[10%] sm:left-[16%] anim-float-1 garnish-shadow">
        <div id="garnishSlot1" class="w-24 h-24 sm:w-30 sm:h-30 flex items-center justify-center"></div>
      </div>
      <div id="garnish2" class="absolute top-[14%] right-[10%] sm:right-[16%] anim-float-2 garnish-shadow">
        <div id="garnishSlot2" class="w-24 h-24 sm:w-30 sm:h-30 flex items-center justify-center"></div>
      </div>
      <div id="garnish3" class="absolute bottom-[14%] right-[12%] sm:right-[20%] anim-float-3 garnish-shadow">
        <div id="garnishSlot3" class="w-20 h-20 sm:w-26 sm:h-26 flex items-center justify-center"></div>
      </div>
      <div id="garnish4" class="absolute bottom-[16%] left-[12%] sm:left-[18%] anim-float-4 garnish-shadow">
        <div id="garnishSlot4" class="w-22 h-22 sm:w-28 sm:h-28 flex items-center justify-center"></div>
      </div>
    </div>

    <!-- 3. LAYER 2: CENTRAL 3D HERO PRODUCT (Floating in 3D Space) -->
    <div id="hero3DWrapper" class="relative z-20 preserve-3d cursor-pointer">
      <div id="heroCenterpiece" class="hero-centerpiece relative flex items-center justify-center hero-drop-shadow">
        
        <!-- High-Contrast Monochrome Frosted Platter (Balanced Diameter so text breathes) -->
        <div class="relative w-64 h-64 sm:w-80 sm:h-80 md:w-[380px] md:h-[380px] rounded-full p-3.5 bg-gradient-to-tr from-white/30 via-white/10 to-transparent backdrop-blur-2xl border-4 border-white/50 shadow-2xl overflow-hidden flex items-center justify-center group">
          
          <!-- Realistic High-Res Meat / Fish Cut -->
          <img 
            id="heroImage" 
            src="${p1}" 
            alt="GoMeat Fresh Cut" 
            class="w-full h-full object-cover rounded-full transition-transform duration-700 group-hover:scale-108"
          />

          <!-- Live Cold-Chain Telemetry Pill Overlay Inside Platter -->
          <div class="absolute bottom-5 inset-x-7 bw-glass-card rounded-2xl py-2 px-3 text-center shadow-2xl border border-white/40">
            <div class="flex items-center justify-center gap-2 text-white font-black text-[11px] uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span id="heroCutBadge">Curry Cut & Tawa Fry Steaks</span>
            </div>
            <p id="heroOriginBadge" class="text-[10px] text-gray-300 font-semibold mt-0.5 tracking-wide">
              Daily 4:00 AM Mangalore Harbor Catch • 0°C Never Frozen
            </p>
          </div>

        </div>

      </div>
    </div>

    <!-- 4. LAYER 3: STROKED GIGANTIC TEXT (IN FRONT OF THE MEAT CUT - 100% VISIBLE WITH 3D DEPTH) -->
    <div id="strokeTextContainer" class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-30 transition-transform duration-500">
      <span id="giantTextFront" class="font-heavy giant-text-stroke select-none">
        SURMAI
      </span>
    </div>

  </main>

  <!-- ================= BOTTOM ACTION CONTROL PANEL ================= -->
  <footer class="relative z-40 px-6 sm:px-14 pb-7 pt-4 bg-black/60 backdrop-blur-xl border-t border-white/10">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
      
      <!-- Bottom Left: Title, Tagline, Description & Shop Now Button -->
      <div class="flex-1 space-y-1.5 text-center md:text-left">
        <div>
          <span id="productCategory" class="text-xs font-black uppercase tracking-widest text-gray-400">
            Fish & Seafood
          </span>
          <h2 id="productTitle" class="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight mt-0.5">
            Seer Fish / Surmai
          </h2>
        </div>

        <p id="productDescription" class="text-xs sm:text-sm text-gray-300 max-w-md leading-relaxed font-medium line-clamp-2">
          Center-cut neat steaks from daily fresh catches off the Mangalore-Malabar coast. Shucked, scale-scraped, cleaned in RO water, and immediately blast-chilled to 0°C.
        </p>

        <div class="pt-1.5 flex items-center justify-center md:justify-start gap-4">
          <button 
            id="shopNowBtn"
            onclick="handleShopNow()" 
            class="px-8 py-3 rounded-full bg-white text-black font-black text-xs shadow-2xl hover:bg-gray-200 hover:scale-105 active:scale-95 transition-all cursor-pointer tracking-wider uppercase"
          >
            Shop now
          </button>
          <span class="text-gray-400 text-xs font-bold">₹250 Refundable Cold Box Deposit</span>
        </div>
      </div>

      <!-- Bottom Center: Huge Bold Price Tag -->
      <div class="text-center shrink-0 px-6 py-2 rounded-2xl bw-glass-card">
        <span class="text-[10px] uppercase font-black text-gray-400 tracking-widest block mb-0.5">Price (500g)</span>
        <div class="flex items-baseline justify-center gap-2">
          <span id="productPrice" class="text-3xl sm:text-4xl font-black text-white tracking-tight">₹799</span>
          <span id="productMrp" class="text-base text-gray-500 line-through font-bold">₹899</span>
        </div>
      </div>

      <!-- Bottom Right: Next / Prev Circular Buttons & Thumbnails -->
      <div class="flex flex-col sm:flex-row items-center gap-4 shrink-0">
        
        <div class="flex items-center gap-2.5">
          <button 
            onclick="prevSlide()" 
            class="w-12 h-12 rounded-full bw-glass hover:bg-white text-white hover:text-black transition-all flex items-center justify-center text-xl font-black shadow-xl cursor-pointer hover:scale-110 active:scale-95 border border-white/20"
            title="Previous (Left Arrow)"
          >
            &#8592;
          </button>
          
          <button 
            onclick="nextSlide()" 
            class="w-12 h-12 rounded-full bg-white text-black hover:bg-gray-200 transition-all flex items-center justify-center text-xl font-black shadow-2xl cursor-pointer hover:scale-110 active:scale-95"
            title="Next (Right Arrow)"
          >
            &#8594;
          </button>
        </div>

        <div class="flex items-center gap-2 bw-glass p-1.5 rounded-2xl" id="thumbnailContainer"></div>

        <div class="text-xs font-black text-gray-300 tracking-widest pl-1">
          <span id="currentSlideIndex">01</span> / <span id="totalSlideCount">04</span>
        </div>

      </div>

    </div>
  </footer>

  <!-- ================= MASTER JAVASCRIPT ANIMATION ENGINE ================= -->
  <script>
    const GARNISH_SVGS = {
      iceCube: \`<svg viewBox="0 0 120 120" class="w-full h-full"><defs><linearGradient id="ice" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/><stop offset="50%" stop-color="#cbd5e1" stop-opacity="0.75"/><stop offset="100%" stop-color="#64748b" stop-opacity="0.5"/></linearGradient></defs><polygon points="60,10 105,35 105,85 60,110 15,85 15,35" fill="url(#ice)" stroke="#ffffff" stroke-width="2.5"/><line x1="60" y1="10" x2="60" y2="110" stroke="#ffffff" stroke-width="2" stroke-opacity="0.8"/><line x1="60" y1="60" x2="105" y2="35" stroke="#ffffff" stroke-width="2" stroke-opacity="0.8"/><line x1="60" y1="60" x2="15" y2="35" stroke="#ffffff" stroke-width="2" stroke-opacity="0.8"/><circle cx="45" cy="45" r="4" fill="#ffffff" opacity="0.8"/><circle cx="75" cy="75" r="3" fill="#ffffff" opacity="0.7"/></svg>\`,
      lemonSlice: \`<svg viewBox="0 0 140 140" class="w-full h-full"><circle cx="70" cy="70" r="65" fill="#facc15" stroke="#eab308" stroke-width="5"/><circle cx="70" cy="70" r="54" fill="#fef08a"/><circle cx="70" cy="70" r="50" fill="#facc15"/><g stroke="#fef08a" stroke-width="3" fill="#fef9c3"><path d="M70,70 L70,22 A48,48 0 0,1 104,36 Z"/><path d="M70,70 L104,36 A48,48 0 0,1 118,70 Z"/><path d="M70,70 L118,70 A48,48 0 0,1 104,104 Z"/><path d="M70,70 L104,104 A48,48 0 0,1 70,118 Z"/><path d="M70,70 L70,118 A48,48 0 0,1 36,104 Z"/><path d="M70,70 L36,104 A48,48 0 0,1 22,70 Z"/><path d="M70,70 L22,70 A48,48 0 0,1 36,36 Z"/><path d="M70,70 L36,36 A48,48 0 0,1 70,22 Z"/></g><circle cx="70" cy="70" r="8" fill="#fef08a"/></svg>\`,
      dillSprig: \`<svg viewBox="0 0 100 120" class="w-full h-full"><path d="M50,110 Q52,60 48,15" stroke="#15803d" stroke-width="4" fill="none" stroke-linecap="round"/><g stroke="#22c55e" stroke-width="3" fill="none" stroke-linecap="round"><path d="M49,85 Q30,75 18,80"/><path d="M51,75 Q70,65 82,70"/><path d="M49,60 Q32,50 20,54"/><path d="M51,50 Q68,40 80,44"/><path d="M49,35 Q35,28 25,30"/><path d="M50,25 Q65,18 75,20"/></g></svg>\`,
      starAnise: \`<svg viewBox="0 0 120 120" class="w-full h-full"><g fill="#78350f" stroke="#290e03" stroke-width="2.5"><path d="M60,60 C55,40 50,20 60,8 C70,20 65,40 60,60 Z"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(45 60 60)"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(90 60 60)"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(135 60 60)"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(180 60 60)"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(225 60 60)"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(270 60 60)"/><path d="M60,60 C75,45 95,40 107,50 C95,60 75,55 60,60 Z" transform="rotate(315 60 60)"/></g><circle cx="60" cy="60" r="10" fill="#92400e" stroke="#451a03" stroke-width="2.5"/></svg>\`,
      cinnamon: \`<svg viewBox="0 0 140 60" class="w-full h-full"><rect x="15" y="15" width="110" height="30" rx="15" fill="#7c2d12" stroke="#1c0a00" stroke-width="2.5"/><ellipse cx="25" cy="30" rx="8" ry="14" fill="#451a03" stroke="#9a3412" stroke-width="2"/><ellipse cx="115" cy="30" rx="8" ry="14" fill="#290e03"/></svg>\`,
      bayLeaf: \`<svg viewBox="0 0 100 140" class="w-full h-full"><path d="M50,130 Q10,75 50,10 Q90,75 50,130 Z" fill="#4d7c0f" stroke="#1a3d04" stroke-width="3"/><path d="M50,130 Q50,70 50,10" stroke="#bef264" stroke-width="2" fill="none"/></svg>\`,
      redChili: \`<svg viewBox="0 0 140 100" class="w-full h-full"><path d="M25,25 Q60,15 110,40 Q130,55 125,75 Q85,85 25,25 Z" fill="#dc2626" stroke="#5f0d0d" stroke-width="3"/><path d="M25,25 Q18,20 15,10 Q20,12 25,25" fill="#15803d" stroke="#14532d" stroke-width="2"/></svg>\`,
      garlic: \`<svg viewBox="0 0 100 100" class="w-full h-full"><path d="M50,15 Q20,50 35,80 Q50,92 65,80 Q80,50 50,15 Z" fill="#fef3c7" stroke="#b45309" stroke-width="3"/><path d="M50,15 Q46,55 48,85" stroke="#d97706" stroke-width="2" fill="none"/></svg>\`,
      lime: \`<svg viewBox="0 0 120 120" class="w-full h-full"><path d="M15,95 A80,80 0 0,1 95,15 L15,95 Z" fill="#65a30d" stroke="#365314" stroke-width="4"/><path d="M22,88 A68,68 0 0,1 88,22 L22,88 Z" fill="#bef264"/><g stroke="#f7fee7" stroke-width="2.5"><line x1="22" y1="88" x2="60" y2="40"/><line x1="22" y1="88" x2="40" y2="60"/><line x1="22" y1="88" x2="75" y2="55"/><line x1="22" y1="88" x2="55" y2="75"/></g></svg>\`,
      saltCrystal: \`<svg viewBox="0 0 90 90" class="w-full h-full"><polygon points="45,10 75,30 80,65 50,85 15,65 20,30" fill="#ffffff" stroke="#94a3b8" stroke-width="3" opacity="0.95"/><line x1="45" y1="10" x2="50" y2="85" stroke="#cbd5e1" stroke-width="2"/><line x1="75" y1="30" x2="15" y2="65" stroke="#cbd5e1" stroke-width="2"/></svg>\`
    };

    const slides = [
      {
        id: "surmai",
        giantText: "SURMAI",
        splitLeft: "SUR",
        splitRight: "MAI",
        title: "Seer Fish / Surmai",
        category: "Coastal Harbor Catch • 0°C Chilled",
        cutStyle: "Curry Cut & Tawa Fry Steaks",
        origin: "Daily 4:00 AM Mangalore Harbor Catch • 0°C Never Frozen",
        description: "Center-cut neat steaks from daily fresh catches off the Mangalore-Malabar coast. Shucked, scale-scraped, cleaned in RO water, and immediately blast-chilled to 0°C.",
        price: "₹799",
        mrp: "₹899",
        image: "${p1}",
        themeGradient: "radial-gradient(circle at 50% 45%, #2a3138 0%, #181d22 35%, #0c0f12 70%, #050607 100%)",
        garnishes: [
          GARNISH_SVGS.iceCube,
          GARNISH_SVGS.lemonSlice,
          GARNISH_SVGS.dillSprig,
          GARNISH_SVGS.iceCube
        ]
      },
      {
        id: "mutton",
        giantText: "MUTTON",
        splitLeft: "MUT",
        splitRight: "TON",
        title: "Tender Goat Curry Cut",
        category: "Grass-Fed • Pasture Raised",
        cutStyle: "Prime Bone-In Curry Cut",
        origin: "Dindigul Pasture Farms • 0°C Vacuum Cold Box",
        description: "Lean, tender young goat cuts with prime rib and shoulder pieces. Naturally grazed on open pastures, antibiotic-free, and blast chilled to lock in natural succulence.",
        price: "₹549",
        mrp: "₹599",
        image: "${p4}",
        themeGradient: "radial-gradient(circle at 50% 45%, #2c2527 0%, #1a1516 35%, #0e0b0c 70%, #050404 100%)",
        garnishes: [
          GARNISH_SVGS.starAnise,
          GARNISH_SVGS.cinnamon,
          GARNISH_SVGS.bayLeaf,
          GARNISH_SVGS.starAnise
        ]
      },
      {
        id: "chicken",
        giantText: "CHICKEN",
        splitLeft: "CHIC",
        splitRight: "KEN",
        title: "Country Nati Koli",
        category: "Free-Range • Antibiotic-Free",
        cutStyle: "Medium Bone-In Curry Cut",
        origin: "Naturally Foraged Organic Birds • Sealed within 90 Mins",
        description: "Naturally foraged country fowl with rich muscle density and authentic rustic flavor. Dressed cleanly and vacuum sealed within 90 minutes of processing.",
        price: "₹389",
        mrp: "₹429",
        image: "${p6}",
        themeGradient: "radial-gradient(circle at 50% 45%, #2d2824 0%, #1a1714 35%, #0e0c0a 70%, #050404 100%)",
        garnishes: [
          GARNISH_SVGS.redChili,
          GARNISH_SVGS.garlic,
          GARNISH_SVGS.redChili,
          GARNISH_SVGS.garlic
        ]
      },
      {
        id: "prawns",
        giantText: "PRAWNS",
        splitLeft: "PRA",
        splitRight: "WNS",
        title: "Sea Tiger Prawns",
        category: "Wild Catch • Jumbo Cleaned",
        cutStyle: "Tail-On Deveined Jumbo",
        origin: "Deep Coastal Waters of Karnataka • Pristine Catch",
        description: "Wild-caught sea tiger prawns, tail-on, cleaned in RO water and thoroughly deveined. Juicy, firm, and bursting with fresh oceanic sweetness.",
        price: "₹449",
        mrp: "₹499",
        image: "${p3}",
        themeGradient: "radial-gradient(circle at 50% 45%, #242c2c 0%, #151a1a 35%, #0b0e0e 70%, #040505 100%)",
        garnishes: [
          GARNISH_SVGS.lime,
          GARNISH_SVGS.saltCrystal,
          GARNISH_SVGS.lime,
          GARNISH_SVGS.saltCrystal
        ]
      }
    ];

    let currentIndex = 0;
    let isAnimating = false;
    let currentMode = 'cutthrough'; // 'cutthrough' | 'elevated' | 'split'

    function renderGarnishes(garnishes) {
      document.getElementById('garnishSlot1').innerHTML = garnishes[0];
      document.getElementById('garnishSlot2').innerHTML = garnishes[1];
      document.getElementById('garnishSlot3').innerHTML = garnishes[2];
      document.getElementById('garnishSlot4').innerHTML = garnishes[3];
    }

    function renderThumbnails() {
      const container = document.getElementById('thumbnailContainer');
      container.innerHTML = slides.map((s, idx) => \`
        <button 
          onclick="goToSlide(\${idx})"
          class="w-11 h-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer \${idx === currentIndex ? 'border-white scale-110 shadow-2xl ring-2 ring-white/60' : 'border-white/20 opacity-40 hover:opacity-90'}"
          title="\${s.title}"
        >
          <img src="\${s.image}" alt="\${s.title}" class="w-full h-full object-cover" />
        </button>
      \`).join('');
    }

    function applyTextForCurrentMode() {
      const slide = slides[currentIndex];
      const back = document.getElementById('giantTextBack');
      const front = document.getElementById('giantTextFront');
      const backCont = document.getElementById('solidTextContainer');
      const frontCont = document.getElementById('strokeTextContainer');

      if (currentMode === 'cutthrough') {
        back.innerText = slide.giantText;
        front.innerText = slide.giantText;
        frontCont.style.display = 'flex';
        backCont.style.transform = 'translateY(0)';
        frontCont.style.transform = 'translateY(0)';
      } else if (currentMode === 'elevated') {
        back.innerText = slide.giantText;
        front.innerText = '';
        frontCont.style.display = 'none';
        backCont.style.transform = 'translateY(-120px)';
      } else if (currentMode === 'split') {
        // Split text with wide gap so it sits on the left and right wings
        const splitText = \`\${slide.splitLeft}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\${slide.splitRight}\`;
        back.innerHTML = splitText;
        front.innerHTML = '';
        frontCont.style.display = 'none';
        backCont.style.transform = 'translateY(0)';
      }
    }

    function setTextMode(mode) {
      currentMode = mode;
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      if (mode === 'cutthrough') document.getElementById('btnModeCut').classList.add('active');
      if (mode === 'elevated') document.getElementById('btnModeTop').classList.add('active');
      if (mode === 'split') document.getElementById('btnModeSplit').classList.add('active');
      applyTextForCurrentMode();
    }

    function updateSlide(nextIndex, direction = 1) {
      if (isAnimating) return;
      isAnimating = true;

      const targetSlide = slides[nextIndex];
      currentIndex = nextIndex;

      // 1. Morph background
      document.getElementById('mainContainer').style.background = targetSlide.themeGradient;

      // 2. Animate elements out (drop down)
      const hero = document.getElementById('heroCenterpiece');
      const back = document.getElementById('giantTextBack');
      const front = document.getElementById('giantTextFront');

      hero.style.transform = \`translateY(\${direction * 120}vh) rotate(\${direction * -18}deg) scale(0.7)\`;
      hero.style.opacity = '0';

      back.style.transform = \`translateY(\${direction * 80}vh) scale(0.8)\`;
      back.style.opacity = '0';
      front.style.transform = \`translateY(\${direction * 80}vh) scale(0.8)\`;
      front.style.opacity = '0';

      [1, 2, 3, 4].forEach(n => {
        const el = document.getElementById('garnish' + n);
        el.style.transform = \`translateY(\${direction * (60 + n * 20)}px) scale(0.5)\`;
        el.style.opacity = '0';
      });

      // 3. Drop in new product from top
      setTimeout(() => {
        document.getElementById('heroImage').src = targetSlide.image;
        document.getElementById('heroCutBadge').innerText = targetSlide.cutStyle;
        document.getElementById('heroOriginBadge').innerText = targetSlide.origin;
        applyTextForCurrentMode();

        renderGarnishes(targetSlide.garnishes);

        document.getElementById('productCategory').innerText = targetSlide.category;
        document.getElementById('productTitle').innerText = targetSlide.title;
        document.getElementById('productDescription').innerText = targetSlide.description;
        document.getElementById('productPrice').innerText = targetSlide.price;
        document.getElementById('productMrp').innerText = targetSlide.mrp;
        document.getElementById('currentSlideIndex').innerText = String(currentIndex + 1).padStart(2, '0');

        hero.style.transition = 'none';
        back.style.transition = 'none';
        front.style.transition = 'none';
        hero.style.transform = \`translateY(\${direction * -120}vh) rotate(\${direction * 18}deg) scale(0.7)\`;
        back.style.transform = \`translateY(\${direction * -80}vh) scale(0.8)\`;
        front.style.transform = \`translateY(\${direction * -80}vh) scale(0.8)\`;

        requestAnimationFrame(() => {
          hero.style.transition = 'transform 0.85s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.4s ease';
          back.style.transition = 'transform 0.85s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.4s ease';
          front.style.transition = 'transform 0.85s cubic-bezier(0.34, 1.4, 0.64, 1), opacity 0.4s ease';
          
          hero.style.transform = 'translateY(0px) rotate(0deg) scale(1)';
          hero.style.opacity = '1';

          back.style.transform = 'translateY(0px) scale(1)';
          back.style.opacity = '0.95';
          front.style.transform = 'translateY(0px) scale(1)';
          front.style.opacity = '0.92';

          [1, 2, 3, 4].forEach(n => {
            const el = document.getElementById('garnish' + n);
            el.style.transform = 'translateY(0px) scale(1)';
            el.style.opacity = '1';
          });

          renderThumbnails();

          setTimeout(() => {
            isAnimating = false;
          }, 850);
        });

      }, 350);
    }

    function nextSlide() {
      const next = (currentIndex + 1) % slides.length;
      updateSlide(next, 1);
    }

    function prevSlide() {
      const prev = (currentIndex - 1 + slides.length) % slides.length;
      updateSlide(prev, -1);
    }

    function goToSlide(idx) {
      if (idx !== currentIndex) {
        updateSlide(idx, idx > currentIndex ? 1 : -1);
      }
    }

    // Interactive 3D Cursor Parallax
    const heroWrapper = document.getElementById('hero3DWrapper');
    const garnish1 = document.getElementById('garnish1');
    const garnish2 = document.getElementById('garnish2');
    const garnish3 = document.getElementById('garnish3');
    const garnish4 = document.getElementById('garnish4');
    const backText = document.getElementById('giantTextBack');
    const frontText = document.getElementById('giantTextFront');

    window.addEventListener('mousemove', (e) => {
      if (isAnimating) return;
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      // Hero Centerpiece Tilts with Realistic Depth
      heroWrapper.style.transform = \`rotateY(\${x * 16}deg) rotateX(\${-y * 16}deg) translateZ(40px)\`;

      // Dual Typography Layers Move in Absolute Lockstep
      const textTransform = \`translate(\${-x * 35}px, \${-y * 22}px)\`;
      backText.style.transform = textTransform;
      frontText.style.transform = textTransform;

      // Independent Multi-Layer Depth for Floating Garnishes
      garnish1.style.transform = \`translate(\${x * 40}px, \${y * 30}px)\`;
      garnish2.style.transform = \`translate(\${-x * 35}px, \${y * 45}px)\`;
      garnish3.style.transform = \`translate(\${x * 25}px, \${-y * 35}px)\`;
      garnish4.style.transform = \`translate(\${-x * 45}px, \${-y * 25}px)\`;
    });

    // Reset when cursor leaves window
    window.addEventListener('mouseleave', () => {
      heroWrapper.style.transform = 'rotateY(0deg) rotateX(0deg) translateZ(0px)';
      backText.style.transform = 'translate(0px, 0px)';
      frontText.style.transform = 'translate(0px, 0px)';
    });

    // Keyboard Arrow Navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });

    function handleShopNow() {
      const activeCut = slides[currentIndex];
      const btn = document.getElementById('shopNowBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ ADDED TO COLD BOX';
      btn.classList.add('bg-emerald-400', 'text-black');
      btn.classList.remove('bg-white');

      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('bg-emerald-400', 'text-black');
        btn.classList.add('bg-white');
      }, 1600);
    }

    // Initialize
    renderGarnishes(slides[0].garnishes);
    renderThumbnails();
    applyTextForCurrentMode();
  </script>
</body>
</html>`;

const outPath = 'C:/Users/dines/.gemini/antigravity/brain/099d1afc-5924-49f5-bd3a-3ed010f92bb9/GoMeat_3D_Hero_Showcase_Reference.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully generated updated 3D Hero reference with solved text visibility!');
