const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const imgDir = path.join(rootDir, 'frontend/public/images/products');

// Raw Images (Base64)
const raw1 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'prod_1.jpg')).toString('base64');
const raw2 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'prod_2.jpg')).toString('base64');
const raw3 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'prod_3.jpg')).toString('base64');
const raw4 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'prod_4.jpg')).toString('base64');

// EXACT REAL Cooked Images matching website catalog cuts (Base64)
const cookedSurmai = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'cooked_surmai_tawa_fry.jpg')).toString('base64');
const cookedPomfret = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'cooked_white_pomfret.jpg')).toString('base64');
const cookedPrawns = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'cooked_tiger_prawns.jpg')).toString('base64');
const cookedMutton = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(imgDir, 'cooked_mutton_rogan_josh.jpg')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoMeat • Master Innovation Reference (All 5 Concepts)</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Cabinet+Grotesk:wght@800;900&display=swap');

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
    }

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      background: #08090c;
      color: #ffffff;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .font-heavy {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
    }

    /* Glass Panels */
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.10);
    }

    .glass-pill {
      background: rgba(255, 255, 255, 0.06);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.12);
    }

    /* Tab button active state */
    .concept-tab.active {
      background: #ffffff;
      color: #000000;
      border-color: #ffffff;
      font-weight: 900;
      box-shadow: 0 10px 30px rgba(255, 255, 255, 0.2);
    }

    /* Steam Vapor Animation */
    @keyframes steamDrift {
      0% { transform: translateY(0) scale(1); opacity: 0.15; }
      50% { transform: translateY(-16px) scale(1.15); opacity: 0.55; }
      100% { transform: translateY(0) scale(1); opacity: 0.15; }
    }
    .anim-steam {
      animation: steamDrift 3.5s ease-in-out infinite;
    }

    /* Pulse Glow */
    @keyframes cyanPulse {
      0%, 100% { box-shadow: 0 0 25px rgba(6, 182, 212, 0.2); }
      50% { box-shadow: 0 0 50px rgba(6, 182, 212, 0.5); }
    }
    .glow-cyan {
      animation: cyanPulse 2.5s infinite;
    }

    /* Buttery Smooth Cross-Fade Transitions */
    .crossfade-img {
      transition: opacity 0.85s cubic-bezier(0.4, 0, 0.2, 1), transform 0.85s cubic-bezier(0.4, 0, 0.2, 1);
      will-change: opacity, transform;
    }

    /* Before-After Split Slider */
    .split-slider-container {
      position: relative;
      overflow: hidden;
    }
  </style>
</head>
<body class="p-4 sm:p-8">

  <!-- ================= TOP MASTER CONTROLLER ================= -->
  <header class="max-w-6xl mx-auto pb-6 border-b border-white/10 space-y-4">
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-2xl bg-white text-black flex items-center justify-center font-black text-2xl shadow-2xl">
          G
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl sm:text-2xl font-black text-white tracking-tight">GoMeat Innovation Suite</h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/10 text-white border border-white/20">
              Interactive Reference Lab
            </span>
          </div>
          <p class="text-xs text-gray-400">100% Authentic Indian Cooked Dishes matched with GoMeat website catalog names.</p>
        </div>
      </div>

      <div class="text-xs text-gray-400 font-bold bg-white/5 px-4 py-2 rounded-2xl border border-white/10 flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
        <span>Catalog-Accurate Dish Photos Loaded</span>
      </div>
    </div>

    <!-- Master Concept Switcher Tabs (All 5 Concepts) -->
    <div class="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none" id="tabBar">
      <button onclick="switchTab('concept1')" id="tab1" class="concept-tab active px-4 py-2.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer border border-white/10">
        🍳 1. Catalog Raw-to-Cooked Cross-Fade
      </button>
      <button onclick="switchTab('concept2')" id="tab2" class="concept-tab px-4 py-2.5 rounded-full text-xs font-bold text-gray-300 hover:text-white transition-all shrink-0 cursor-pointer border border-white/10">
        🧊 2. Interactive 3D Cold Box Packer
      </button>
      <button onclick="switchTab('concept3')" id="tab3" class="concept-tab px-4 py-2.5 rounded-full text-xs font-bold text-gray-300 hover:text-white transition-all shrink-0 cursor-pointer border border-white/10">
        📐 3. Cut Anatomy & Thickness Ruler
      </button>
      <button onclick="switchTab('concept4')" id="tab4" class="concept-tab px-4 py-2.5 rounded-full text-xs font-bold text-gray-300 hover:text-white transition-all shrink-0 cursor-pointer border border-white/10">
        🛰️ 4. Live Cold-Chain Telemetry HUD
      </button>
      <button onclick="switchTab('concept5')" id="tab5" class="concept-tab px-4 py-2.5 rounded-full text-xs font-bold text-gray-300 hover:text-white transition-all shrink-0 cursor-pointer border border-white/10">
        🎁 5. Curated Occasion Vault Boxes
      </button>
    </div>
  </header>

  <!-- ================= MASTER TAB PANELS CONTAINER ================= -->
  <main class="max-w-6xl mx-auto py-8">

    <!-- ======================================================== -->
    <!-- CONCEPT 1: REAL RAW-TO-COOKED SIZZLE CROSS-FADE          -->
    <!-- ======================================================== -->
    <section id="panelConcept1" class="space-y-6">
      <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest">
            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
            <span>Accurate Recipe Visuals</span>
          </div>
          <h2 class="text-2xl sm:text-3xl font-heavy text-white">
            Raw-to-Cooked Sizzle Cross-Fade
          </h2>
          <p class="text-xs sm:text-sm text-gray-400 max-w-2xl">
            Hover your cursor over any card (or click the toggle below). Watch the exact raw cut from our catalog smoothly dissolve into the <strong>real finished Indian dish</strong> with rising aroma steam.
          </p>
        </div>

        <!-- Global Force-Cooked View Toggle -->
        <div class="flex items-center gap-2 p-1.5 rounded-full glass-card shrink-0">
          <span class="text-[11px] font-bold text-gray-400 px-2">Preview Mode:</span>
          <button id="btnStateHover" onclick="setCookedMode('hover')" class="px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-black shadow-lg">
            ✨ Hover / Tap
          </button>
          <button id="btnStateCooked" onclick="setCookedMode('allCooked')" class="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white">
            🔥 Show All Cooked
          </button>
          <button id="btnStateRaw" onclick="setCookedMode('allRaw')" class="px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white">
            ❄️ Show All Raw
          </button>
        </div>
      </div>

      <!-- Feature 1: Interactive Draggable Split-Screen Slider (Hero Cut: Surmai) -->
      <div class="p-6 rounded-3xl glass-card space-y-4 border border-rose-500/20">
        <div class="flex items-center justify-between">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-rose-400">Interactive Split Viewer</span>
            <h3 class="text-lg font-black text-white">Drag the Slider: Raw Surmai Steaks vs. Crispy Tawa Fry</h3>
          </div>
          <span class="text-xs font-bold text-gray-400">Drag handle left ⇄ right</span>
        </div>

        <div class="relative h-72 sm:h-96 rounded-2xl overflow-hidden split-slider-container border border-white/15">
          <!-- Real Cooked Layer (Right / Background) -->
          <img src="${cookedSurmai}" alt="Real Cooked Surmai Tawa Fry" class="absolute inset-0 w-full h-full object-cover" />
          <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>
          
          <div class="absolute bottom-4 right-6 text-right z-10 pointer-events-none">
            <span class="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-black uppercase shadow-lg">
              🔥 Crispy Tawa Fry (Cooked)
            </span>
          </div>

          <!-- Raw Layer (Left / Clipped by slider) -->
          <div id="splitRawClip" class="absolute inset-0 overflow-hidden" style="width: 50%;">
            <img src="${raw1}" alt="Raw Surmai Steaks" class="absolute inset-0 w-full h-full object-cover" style="width: 200%; max-width: none;" id="splitRawImg" />
            <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none"></div>
            
            <div class="absolute bottom-4 left-6 z-10 pointer-events-none">
              <span class="px-3 py-1 rounded-full bg-cyan-500 text-black text-xs font-black uppercase shadow-lg">
                ❄️ 0°C Never Frozen (Raw Cut)
              </span>
            </div>
          </div>

          <!-- Draggable Divider Line & Handle -->
          <div id="splitHandle" class="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 shadow-[0_0_20px_rgba(255,255,255,0.8)]" style="left: 50%;">
            <div class="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 rounded-full bg-white text-black flex items-center justify-center font-black text-xs shadow-2xl ring-4 ring-black/40">
              ⇄
            </div>
          </div>
        </div>
      </div>

      <!-- Live Product Cards Grid: 4 EXACT CATALOG PRODUCTS with Real Cooked Matches -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2" id="crossfadeCardsGrid">
        
        <!-- Card 1: Seer Fish / Surmai (Large Steaks) -->
        <div class="glass-card rounded-3xl overflow-hidden p-4 space-y-3 group cursor-pointer transition-all hover:scale-[1.02] hover:border-white/30 card-item" data-card="0">
          <div class="relative h-60 rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
            
            <!-- REAL Cooked Photo: Mangalore Surmai Tawa Fry on Cast-Iron Tawa -->
            <img src="${cookedSurmai}" alt="Authentic Surmai Tawa Fry" class="cooked-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
            
            <!-- Raw Photo: prod_1.jpg -->
            <img src="${raw1}" alt="Raw Surmai Steaks" class="raw-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-105" />

            <!-- Rising Steam Particle -->
            <div class="absolute inset-0 anim-steam flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div class="w-36 h-36 rounded-full bg-white/10 blur-2xl"></div>
            </div>

            <!-- Dynamic State Badge -->
            <div class="absolute top-3 left-3 z-10">
              <span class="badge-raw glass-pill px-2.5 py-1 rounded-full text-[10px] font-black text-cyan-300 block group-hover:hidden">
                ❄️ 0°C Raw Steaks
              </span>
              <span class="badge-cooked px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500 text-black hidden group-hover:block shadow-lg">
                🔥 Tawa Fry Steaks
              </span>
            </div>

            <!-- Hover Callout -->
            <div class="absolute bottom-2.5 inset-x-3 text-center pointer-events-none">
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-gray-200 group-hover:hidden shadow-lg">
                Hover to see Cooked ➔
              </span>
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-amber-200 hidden group-hover:inline-block shadow-lg">
                Crispy Red Chili Crust
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Fish & Seafood • 0°C</span>
            <h3 class="text-base font-black text-white">Seer Fish / Surmai (Large Steaks)</h3>
            <p class="text-xs text-gray-400 line-clamp-1">Curry Cut & Tawa Fry Steaks • Cleaned in RO water.</p>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-lg font-black text-white">₹799 <span class="text-xs text-gray-500 line-through font-normal">₹899</span></span>
            <button class="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black hover:bg-gray-200 transition">
              + Add
            </button>
          </div>
        </div>

        <!-- Card 2: White Pomfret (Paplet) - Whole Cleaned -->
        <div class="glass-card rounded-3xl overflow-hidden p-4 space-y-3 group cursor-pointer transition-all hover:scale-[1.02] hover:border-white/30 card-item" data-card="1">
          <div class="relative h-60 rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
            
            <!-- REAL Cooked Photo: Whole White Pomfret Diamond Slit Fry -->
            <img src="${cookedPomfret}" alt="Authentic Pomfret Fry" class="cooked-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
            
            <!-- Raw Photo: prod_2.jpg -->
            <img src="${raw2}" alt="Raw White Pomfret" class="raw-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-105" />

            <div class="absolute inset-0 anim-steam flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div class="w-36 h-36 rounded-full bg-yellow-300/10 blur-2xl"></div>
            </div>

            <div class="absolute top-3 left-3 z-10">
              <span class="badge-raw glass-pill px-2.5 py-1 rounded-full text-[10px] font-black text-cyan-300 block group-hover:hidden">
                ❄️ 0°C Whole Cleaned
              </span>
              <span class="badge-cooked px-2.5 py-1 rounded-full text-[10px] font-black bg-yellow-400 text-black hidden group-hover:block shadow-lg">
                🔥 Diamond Slit Fry
              </span>
            </div>

            <div class="absolute bottom-2.5 inset-x-3 text-center pointer-events-none">
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-gray-200 group-hover:hidden shadow-lg">
                Hover to see Cooked ➔
              </span>
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-yellow-200 hidden group-hover:inline-block shadow-lg">
                Golden-Crisp Whole Fish
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Fish & Seafood • 0°C</span>
            <h3 class="text-base font-black text-white">White Pomfret (Paplet)</h3>
            <p class="text-xs text-gray-400 line-clamp-1">Whole Cleaned with Diamond Slits • Never Frozen.</p>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-lg font-black text-white">₹649 <span class="text-xs text-gray-500 line-through font-normal">₹749</span></span>
            <button class="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black hover:bg-gray-200 transition">
              + Add
            </button>
          </div>
        </div>

        <!-- Card 3: Sea Tiger Prawns (Jumbo Cleaned & Deveined) -->
        <div class="glass-card rounded-3xl overflow-hidden p-4 space-y-3 group cursor-pointer transition-all hover:scale-[1.02] hover:border-white/30 card-item" data-card="2">
          <div class="relative h-60 rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
            
            <!-- REAL Cooked Photo: Sizzling Tiger Prawns Garlic-Chili Glaze -->
            <img src="${cookedPrawns}" alt="Authentic Cooked Tiger Prawns" class="cooked-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
            
            <!-- Raw Photo: prod_3.jpg -->
            <img src="${raw3}" alt="Raw Tiger Prawns" class="raw-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-105" />

            <div class="absolute inset-0 anim-steam flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div class="w-36 h-36 rounded-full bg-rose-400/10 blur-2xl"></div>
            </div>

            <div class="absolute top-3 left-3 z-10">
              <span class="badge-raw glass-pill px-2.5 py-1 rounded-full text-[10px] font-black text-cyan-300 block group-hover:hidden">
                ❄️ 0°C Peeled Tail-On
              </span>
              <span class="badge-cooked px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500 text-white hidden group-hover:block shadow-lg">
                🥘 Garlic Chili Roast
              </span>
            </div>

            <div class="absolute bottom-2.5 inset-x-3 text-center pointer-events-none">
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-gray-200 group-hover:hidden shadow-lg">
                Hover to see Cooked ➔
              </span>
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-rose-200 hidden group-hover:inline-block shadow-lg">
                Plump Spiced Glaze
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Fish & Seafood • 0°C</span>
            <h3 class="text-base font-black text-white">Sea Tiger Prawns (Jumbo)</h3>
            <p class="text-xs text-gray-400 line-clamp-1">Peeled & Deveined (Tail On) • Juicy & Firm.</p>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-lg font-black text-white">₹449 <span class="text-xs text-gray-500 line-through font-normal">₹499</span></span>
            <button class="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black hover:bg-gray-200 transition">
              + Add
            </button>
          </div>
        </div>

        <!-- Card 4: Rich Tender Goat (Biryani & Rogan Josh Cut) -->
        <div class="glass-card rounded-3xl overflow-hidden p-4 space-y-3 group cursor-pointer transition-all hover:scale-[1.02] hover:border-white/30 card-item" data-card="3">
          <div class="relative h-60 rounded-2xl overflow-hidden bg-neutral-900 flex items-center justify-center">
            
            <!-- REAL Cooked Photo: Kashmiri Mutton Rogan Josh in Handi -->
            <img src="${cookedMutton}" alt="Authentic Mutton Rogan Josh" class="cooked-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100" />
            
            <!-- Raw Photo: prod_4.jpg -->
            <img src="${raw4}" alt="Raw Goat Curry Cut" class="raw-layer absolute inset-0 w-full h-full object-cover crossfade-img opacity-100 scale-100 group-hover:opacity-0 group-hover:scale-105" />

            <div class="absolute inset-0 anim-steam flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700">
              <div class="w-36 h-36 rounded-full bg-red-400/10 blur-2xl"></div>
            </div>

            <div class="absolute top-3 left-3 z-10">
              <span class="badge-raw glass-pill px-2.5 py-1 rounded-full text-[10px] font-black text-cyan-300 block group-hover:hidden">
                ❄️ 0°C Pasture Cut
              </span>
              <span class="badge-cooked px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600 text-white hidden group-hover:block shadow-lg">
                🍲 Rogan Josh Handi
              </span>
            </div>

            <div class="absolute bottom-2.5 inset-x-3 text-center pointer-events-none">
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-gray-200 group-hover:hidden shadow-lg">
                Hover to see Cooked ➔
              </span>
              <span class="glass-pill px-3 py-1 rounded-full text-[10px] font-bold text-red-200 hidden group-hover:inline-block shadow-lg">
                Tender Bone-In Marrow
              </span>
            </div>
          </div>

          <div class="space-y-1">
            <span class="text-[10px] font-black uppercase tracking-wider text-gray-400">Tender Mutton • 0°C</span>
            <h3 class="text-base font-black text-white">Rich Tender Goat (Mutton)</h3>
            <p class="text-xs text-gray-400 line-clamp-1">Biryani & Rogan Josh Cut • Pasture Raised.</p>
          </div>

          <div class="pt-2 border-t border-white/10 flex items-center justify-between">
            <span class="text-lg font-black text-white">₹549 <span class="text-xs text-gray-500 line-through font-normal">₹599</span></span>
            <button class="px-4 py-1.5 rounded-full bg-white text-black text-xs font-black hover:bg-gray-200 transition">
              + Add
            </button>
          </div>
        </div>

      </div>
    </section>

    <!-- ======================================================== -->
    <!-- CONCEPT 2: INTERACTIVE 3D COLD BOX PACKER                -->
    <!-- ======================================================== -->
    <section id="panelConcept2" class="space-y-6 hidden">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Gamified Cold-Chain Packing</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-heavy text-white">
          "Build Your ThermalVault Cold Box"
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 max-w-2xl">
          Click any meat cut to pack it into the 3D Thermal Box. Watch the digital thermometer drop in real-time down to 1.6°C, ice gel packs activate, and the capacity meter fill up.
        </p>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
        <div class="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 space-y-6 relative overflow-hidden glow-cyan">
          <div class="flex items-center justify-between border-b border-white/10 pb-4">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-black text-xl">
                ❄️
              </span>
              <div>
                <h3 class="text-base font-black text-white">ThermalVault™ EPP Cold Box</h3>
                <p class="text-xs text-gray-400">Reusable Insulated Container • ₹250 Refundable Deposit</p>
              </div>
            </div>

            <div class="text-right">
              <span class="text-[10px] uppercase font-bold text-gray-400 block">Core Internal Temp</span>
              <span id="boxTempGauge" class="text-2xl sm:text-3xl font-black text-cyan-300 tracking-tight transition-all duration-700">
                28.0°C
              </span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4" id="boxSlots">
            <div id="slot0" class="h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center p-3 transition-all duration-500 bg-white/[0.02]">
              <span class="text-xs font-bold text-gray-500 block">Slot 1 (Empty)</span>
              <span class="text-[10px] text-gray-600">Click a cut on right to pack</span>
            </div>
            <div id="slot1" class="h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center p-3 transition-all duration-500 bg-white/[0.02]">
              <span class="text-xs font-bold text-gray-500 block">Slot 2 (Empty)</span>
              <span class="text-[10px] text-gray-600">Click a cut on right to pack</span>
            </div>
            <div id="slot2" class="h-36 rounded-2xl border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-center p-3 transition-all duration-500 bg-white/[0.02]">
              <span class="text-xs font-bold text-gray-500 block">Slot 3 (Empty)</span>
              <span class="text-[10px] text-gray-600">Click a cut on right to pack</span>
            </div>
            <div class="h-36 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 flex flex-col items-center justify-center text-center p-3">
              <span class="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-sm font-black mb-1">
                🧊
              </span>
              <span class="text-xs font-black text-cyan-200">Twin RO Ice Gel Packs</span>
              <span class="text-[10px] text-cyan-400/80">Active Sub-Zero Barrier</span>
            </div>
          </div>

          <div class="space-y-1.5 pt-2">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-400 font-bold">Box Capacity: <span id="boxCountText" class="text-white">0 / 3 Cuts Packed</span></span>
              <span id="boxDeliveryStatus" class="text-amber-400 font-bold">Pack 1 more cut for Free Delivery</span>
            </div>
            <div class="h-2.5 rounded-full bg-white/10 overflow-hidden">
              <div id="boxProgressBar" class="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 w-0 transition-all duration-500"></div>
            </div>
          </div>

          <button onclick="resetBox()" class="text-xs text-gray-400 hover:text-white underline cursor-pointer">
            ↻ Empty Cold Box & Start Over
          </button>
        </div>

        <div class="lg:col-span-5 space-y-3">
          <h4 class="text-xs font-black uppercase tracking-wider text-gray-400">Available Fresh Cuts:</h4>
          
          <button onclick="packCut('Surmai Steaks (500g)', '₹799', '${raw1}')" class="w-full p-3 rounded-2xl glass-card hover:bg-white/10 flex items-center justify-between text-left transition cursor-pointer">
            <div class="flex items-center gap-3">
              <img src="${raw1}" class="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h5 class="text-xs font-black text-white">Surmai Steaks (500g)</h5>
                <p class="text-[10px] text-gray-400">Mangalore Daily Catch</p>
              </div>
            </div>
            <span class="text-xs font-black text-white">+ Pack</span>
          </button>

          <button onclick="packCut('White Pomfret (Whole)', '₹649', '${raw2}')" class="w-full p-3 rounded-2xl glass-card hover:bg-white/10 flex items-center justify-between text-left transition cursor-pointer">
            <div class="flex items-center gap-3">
              <img src="${raw2}" class="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h5 class="text-xs font-black text-white">White Pomfret (Paplet)</h5>
                <p class="text-[10px] text-gray-400">Whole Diamond Cleaned</p>
              </div>
            </div>
            <span class="text-xs font-black text-white">+ Pack</span>
          </button>

          <button onclick="packCut('Tiger Prawns (500g)', '₹449', '${raw3}')" class="w-full p-3 rounded-2xl glass-card hover:bg-white/10 flex items-center justify-between text-left transition cursor-pointer">
            <div class="flex items-center gap-3">
              <img src="${raw3}" class="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h5 class="text-xs font-black text-white">Sea Tiger Prawns (500g)</h5>
                <p class="text-[10px] text-gray-400">Deveined Jumbo</p>
              </div>
            </div>
            <span class="text-xs font-black text-white">+ Pack</span>
          </button>

          <button onclick="packCut('Goat Curry Cut (500g)', '₹549', '${raw4}')" class="w-full p-3 rounded-2xl glass-card hover:bg-white/10 flex items-center justify-between text-left transition cursor-pointer">
            <div class="flex items-center gap-3">
              <img src="${raw4}" class="w-12 h-12 rounded-xl object-cover" />
              <div>
                <h5 class="text-xs font-black text-white">Tender Goat Curry Cut (500g)</h5>
                <p class="text-[10px] text-gray-400">Dindigul Pasture Raised</p>
              </div>
            </div>
            <span class="text-xs font-black text-white">+ Pack</span>
          </button>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- CONCEPT 3: CUT ANATOMY & THICKNESS VISUALIZER            -->
    <!-- ======================================================== -->
    <section id="panelConcept3" class="space-y-6 hidden">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-widest">
          <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Zero Buying Anxiety</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-heavy text-white">
          Cut Anatomy & Thickness Visualizer
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 max-w-2xl">
          Online meat buyers worry about bone size, piece thickness, and portion sizes. This interactive inspector displays the exact physical measurements and piece breakdown before ordering.
        </p>
      </div>

      <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6">
        <div class="flex items-center gap-2 overflow-x-auto pb-1">
          <button onclick="selectAnatomy(0)" id="anaBtn0" class="px-4 py-2 rounded-full text-xs font-black bg-white text-black shadow-lg">Surmai Steaks</button>
          <button onclick="selectAnatomy(1)" id="anaBtn1" class="px-4 py-2 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10 hover:text-white">White Pomfret</button>
          <button onclick="selectAnatomy(2)" id="anaBtn2" class="px-4 py-2 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10 hover:text-white">Goat Curry Cut</button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div class="md:col-span-5 relative h-72 rounded-2xl overflow-hidden bg-neutral-900 border border-white/15 flex items-center justify-center p-4">
            <img id="anatomyImg" src="${raw1}" class="w-full h-full object-cover rounded-xl" />
            
            <div class="absolute bottom-4 inset-x-4 glass-pill p-3 rounded-xl flex items-center justify-between text-xs">
              <span class="font-bold text-gray-300">Cut Thickness:</span>
              <span id="anatomyThickness" class="font-black text-emerald-400 text-sm">1.25 Inches (Center-Cut)</span>
            </div>
          </div>

          <div class="md:col-span-7 space-y-5">
            <div>
              <span id="anatomyCategory" class="text-[10px] font-black uppercase tracking-wider text-emerald-400">Fish & Seafood</span>
              <h3 id="anatomyTitle" class="text-2xl font-black text-white">Seer Fish / Surmai Large Steaks</h3>
              <p id="anatomyDesc" class="text-xs text-gray-300 mt-1">Center slices taken perpendicular to the spine for tawa searing without tearing or curling.</p>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div class="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span class="text-[10px] text-gray-400 block font-bold uppercase">Piece Count</span>
                <span id="anaPieces" class="text-lg font-black text-white">8 - 10</span>
                <span class="text-[9px] text-gray-400 block">Uniform Slices</span>
              </div>
              <div class="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span class="text-[10px] text-gray-400 block font-bold uppercase">Meat vs Bone</span>
                <span id="anaRatio" class="text-lg font-black text-emerald-400">90% Meat</span>
                <span class="text-[9px] text-gray-400 block">Center Bone Only</span>
              </div>
              <div class="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span class="text-[10px] text-gray-400 block font-bold uppercase">Serves</span>
                <span id="anaServes" class="text-lg font-black text-white">3 - 4 Adults</span>
                <span class="text-[9px] text-gray-400 block">Generous Meal</span>
              </div>
              <div class="p-3 rounded-2xl bg-white/5 border border-white/10">
                <span class="text-[10px] text-gray-400 block font-bold uppercase">Best Cooking</span>
                <span id="anaCook" class="text-lg font-black text-amber-300">Tawa Fry</span>
                <span class="text-[9px] text-gray-400 block">Or Malabar Curry</span>
              </div>
            </div>

            <div class="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-center gap-2.5">
              <span>🛡️</span>
              <span><strong>Master Butcher Cut Assurance:</strong> Every piece is weighed post-cleaning with zero scale scrap residue or excess water weight.</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- CONCEPT 4: NASA-GRADE COLD-CHAIN TELEMETRY HUD           -->
    <!-- ======================================================== -->
    <section id="panelConcept4" class="space-y-6 hidden">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-widest">
          <span class="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>Zero-BS Transparency</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-heavy text-white">
          NASA-Grade "Cold-Chain Telemetry" HUD
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 max-w-2xl">
          Real IoT sensor telemetry streaming live from the cold hub to prove that GoMeat is 0°C to 4°C active chilled, not sitting in warm ambient store racks like competitors.
        </p>
      </div>

      <div class="glass-card rounded-3xl p-6 sm:p-8 space-y-6 border border-cyan-500/30">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div class="flex items-center gap-3">
            <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
            <div>
              <h3 class="text-base font-black text-white">Depot Chiller IoT Sensor #84-A</h3>
              <p class="text-xs text-gray-400">Hyderabad Hub • Central Fulfilment Vault</p>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <div class="px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-black">
              LIVE SENSOR PING: 1.8°C
            </div>
            <span class="text-emerald-400 font-bold">● 100% Cold Compliant</span>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-black">Step 1: Harbor Catch</span>
            <div class="text-sm font-black text-white">4:12 AM Today</div>
            <p class="text-[11px] text-gray-400">Mangalore Harbor Old Port</p>
          </div>
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-black">Step 2: RO Cleaned</span>
            <div class="text-sm font-black text-white">5:45 AM Today</div>
            <p class="text-[11px] text-gray-400">Blast Chilled to 0°C within 30m</p>
          </div>
          <div class="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-1">
            <span class="text-[10px] text-gray-400 uppercase font-black">Step 3: ThermalVault Pack</span>
            <div class="text-sm font-black text-white">Current Hub Status</div>
            <p class="text-[11px] text-cyan-300 font-semibold">1.8°C Constant Chilled</p>
          </div>
          <div class="p-4 rounded-2xl bg-gradient-to-tr from-cyan-950/60 to-emerald-950/60 border border-cyan-500/30 space-y-1">
            <span class="text-[10px] text-cyan-300 uppercase font-black">Step 4: Express ETA</span>
            <div class="text-sm font-black text-white">90 Mins Delivery</div>
            <p class="text-[11px] text-emerald-300 font-semibold">Cold Sealed to Doorstep</p>
          </div>
        </div>

        <div class="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-3">
          <div class="flex items-center justify-between text-xs font-bold text-gray-400">
            <span>24-Hour Temperature Stability Log (Target: 0°C – 4°C)</span>
            <span class="text-cyan-400">Avg Temp: 1.9°C</span>
          </div>
          <div class="h-20 flex items-end gap-1.5 pt-4">
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[45%]" title="02:00 - 1.8°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[50%]" title="04:00 - 2.0°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[42%]" title="06:00 - 1.7°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[48%]" title="08:00 - 1.9°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[52%]" title="10:00 - 2.1°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[46%]" title="12:00 - 1.8°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[44%]" title="14:00 - 1.7°C"></div>
            <div class="flex-1 bg-cyan-500/40 hover:bg-cyan-400 rounded-t h-[49%]" title="16:00 - 1.9°C"></div>
            <div class="flex-1 bg-cyan-400 rounded-t h-[46%] animate-pulse" title="Live - 1.8°C"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ======================================================== -->
    <!-- CONCEPT 5: CURATED OCCASION VAULT BOXES                  -->
    <!-- ======================================================== -->
    <section id="panelConcept5" class="space-y-6 hidden">
      <div class="space-y-1">
        <div class="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-widest">
          <span class="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span>Zero-Effort High-Value Drops</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-heavy text-white">
          Curated "Occasion Vault Boxes"
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 max-w-2xl">
          Instead of forcing customers to piece together individual cuts, offer pre-curated occasion kits with 1-tap checkout. Higher order value and zero thinking for the customer.
        </p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
        <div class="glass-card rounded-3xl p-6 space-y-4 border border-amber-500/30 flex flex-col justify-between">
          <div class="space-y-3">
            <span class="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              Weekend Special Drop
            </span>
            <h3 class="text-xl font-heavy text-white">The Sunday Biryani Vault</h3>
            <p class="text-xs text-gray-300">Complete multi-meat biryani feast for 6–8 family members or roomies.</p>
            
            <ul class="space-y-2 text-xs text-gray-300 pt-2 border-t border-white/10">
              <li class="flex items-center gap-2">✓ 1kg Tender Goat Prime Biryani Cut</li>
              <li class="flex items-center gap-2">✓ 500g Bone-In Country Chicken</li>
              <li class="flex items-center gap-2">✓ Toasted Royal Whole Spices Pouch</li>
              <li class="flex items-center gap-2">✓ Pure Kashmiri Saffron Strands</li>
            </ul>
          </div>

          <div class="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-bold block">Box Total</span>
              <span class="text-xl font-black text-white">₹1,249 <span class="text-xs text-gray-500 line-through">₹1,450</span></span>
            </div>
            <button class="px-5 py-2.5 rounded-full bg-amber-400 text-black font-black text-xs hover:bg-amber-300 transition shadow-lg">
              Order Vault
            </button>
          </div>
        </div>

        <div class="glass-card rounded-3xl p-6 space-y-4 border border-cyan-500/30 flex flex-col justify-between">
          <div class="space-y-3">
            <span class="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
              Fitness & Macro Hacker
            </span>
            <h3 class="text-xl font-heavy text-white">The 7-Day Protein Arsenal</h3>
            <p class="text-xs text-gray-300">Pre-portioned lean high-protein fuel for athletes and lifters.</p>
            
            <ul class="space-y-2 text-xs text-gray-300 pt-2 border-t border-white/10">
              <li class="flex items-center gap-2">✓ <strong>420g Pure Protein Total</strong></li>
              <li class="flex items-center gap-2">✓ 2kg Lean Chicken Breast (4 packs)</li>
              <li class="flex items-center gap-2">✓ 1kg Surmai Fillets (Zero Carbs)</li>
              <li class="flex items-center gap-2">✓ Stamped with exact Macro Labels</li>
            </ul>
          </div>

          <div class="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-bold block">7-Day Supply</span>
              <span class="text-xl font-black text-white">₹1,799 <span class="text-xs text-gray-500 line-through">₹2,100</span></span>
            </div>
            <button class="px-5 py-2.5 rounded-full bg-cyan-400 text-black font-black text-xs hover:bg-cyan-300 transition shadow-lg">
              Order Vault
            </button>
          </div>
        </div>

        <div class="glass-card rounded-3xl p-6 space-y-4 border border-rose-500/30 flex flex-col justify-between">
          <div class="space-y-3">
            <span class="px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-black uppercase tracking-wider">
              Hostel / Apartment Party
            </span>
            <h3 class="text-xl font-heavy text-white">Friday Tawa & Grill Kit</h3>
            <p class="text-xs text-gray-300">Fast 15-minute appetizers for friends and flatmate parties.</p>
            
            <ul class="space-y-2 text-xs text-gray-300 pt-2 border-t border-white/10">
              <li class="flex items-center gap-2">✓ 500g Wild Tiger Prawns</li>
              <li class="flex items-center gap-2">✓ 500g Chicken Seekh / Tikka Cuts</li>
              <li class="flex items-center gap-2">✓ 10 Bamboo Skewers + Peri Peri Rub</li>
              <li class="flex items-center gap-2">✓ Fresh Mint Chutney & Lime Pack</li>
            </ul>
          </div>

          <div class="pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-bold block">Party Kit</span>
              <span class="text-xl font-black text-white">₹899 <span class="text-xs text-gray-500 line-through">₹1,050</span></span>
            </div>
            <button class="px-5 py-2.5 rounded-full bg-rose-500 text-white font-black text-xs hover:bg-rose-400 transition shadow-lg">
              Order Vault
            </button>
          </div>
        </div>
      </div>
    </section>

  </main>

  <!-- ================= MASTER JAVASCRIPT CONTROLLER ================= -->
  <script>
    function switchTab(tabId) {
      ['concept1', 'concept2', 'concept3', 'concept4', 'concept5'].forEach((id, idx) => {
        const panel = document.getElementById('panel' + id.charAt(0).toUpperCase() + id.slice(1));
        const tabBtn = document.getElementById('tab' + (idx + 1));
        if (id === tabId) {
          panel.classList.remove('hidden');
          tabBtn.classList.add('active');
        } else {
          panel.classList.add('hidden');
          tabBtn.classList.remove('active');
        }
      });
    }

    function setCookedMode(mode) {
      const cards = document.querySelectorAll('.card-item');
      document.querySelectorAll('#btnStateHover, #btnStateCooked, #btnStateRaw').forEach(b => {
        b.className = "px-3.5 py-1.5 rounded-full text-xs font-bold text-gray-300 hover:text-white";
      });

      if (mode === 'hover') {
        document.getElementById('btnStateHover').className = "px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-black shadow-lg";
        cards.forEach(c => {
          c.querySelector('.raw-layer').style.opacity = '';
          c.querySelector('.cooked-layer').style.opacity = '';
        });
      } else if (mode === 'allCooked') {
        document.getElementById('btnStateCooked').className = "px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-400 text-black shadow-lg";
        cards.forEach(c => {
          c.querySelector('.raw-layer').style.opacity = '0';
          c.querySelector('.cooked-layer').style.opacity = '1';
        });
      } else if (mode === 'allRaw') {
        document.getElementById('btnStateRaw').className = "px-3.5 py-1.5 rounded-full text-xs font-black bg-cyan-400 text-black shadow-lg";
        cards.forEach(c => {
          c.querySelector('.raw-layer').style.opacity = '1';
          c.querySelector('.cooked-layer').style.opacity = '0';
        });
      }
    }

    const splitContainer = document.querySelector('.split-slider-container');
    const splitHandle = document.getElementById('splitHandle');
    const splitRawClip = document.getElementById('splitRawClip');
    const splitRawImg = document.getElementById('splitRawImg');

    let isDragging = false;

    function updateSplitPosition(clientX) {
      const rect = splitContainer.getBoundingClientRect();
      let x = clientX - rect.left;
      x = Math.max(0, Math.min(rect.width, x));
      const pct = (x / rect.width) * 100;

      splitHandle.style.left = pct + '%';
      splitRawClip.style.width = pct + '%';
      splitRawImg.style.width = (100 / (pct / 100)) + '%';
    }

    splitHandle.addEventListener('mousedown', () => isDragging = true);
    window.addEventListener('mouseup', () => isDragging = false);
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSplitPosition(e.clientX);
    });

    splitHandle.addEventListener('touchstart', () => isDragging = true);
    window.addEventListener('touchend', () => isDragging = false);
    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      updateSplitPosition(e.touches[0].clientX);
    });

    // Concept 2: Cold Box Packer
    let packedCuts = [];
    const MAX_CUTS = 3;

    function packCut(name, price, img) {
      if (packedCuts.length >= MAX_CUTS) {
        alert("Your Thermal Box is completely packed! Ready for 0°C sealed dispatch.");
        return;
      }
      packedCuts.push({ name, price, img });
      renderBox();
    }

    function renderBox() {
      for (let i = 0; i < 3; i++) {
        const slotEl = document.getElementById('slot' + i);
        if (packedCuts[i]) {
          slotEl.innerHTML = \`
            <div class="w-full h-full rounded-xl overflow-hidden relative group">
              <img src="\${packedCuts[i].img}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-2 text-center">
                <span class="text-[10px] font-black text-white">\${packedCuts[i].name}</span>
                <span class="text-[9px] text-cyan-300 font-bold">\${packedCuts[i].price}</span>
              </div>
            </div>
          \`;
          slotEl.classList.remove('border-dashed', 'border-white/20');
          slotEl.classList.add('border-cyan-400', 'bg-cyan-950/30');
        } else {
          slotEl.innerHTML = \`
            <span class="text-xs font-bold text-gray-500 block">Slot \${i + 1} (Empty)</span>
            <span class="text-[10px] text-gray-600">Click a cut on right to pack</span>
          \`;
          slotEl.classList.add('border-dashed', 'border-white/20');
          slotEl.classList.remove('border-cyan-400', 'bg-cyan-950/30');
        }
      }

      const temps = ["28.0°C", "14.2°C", "4.0°C", "1.6°C"];
      const currentTemp = temps[packedCuts.length];
      document.getElementById('boxTempGauge').innerText = currentTemp;

      const pct = (packedCuts.length / MAX_CUTS) * 100;
      document.getElementById('boxProgressBar').style.width = pct + "%";
      document.getElementById('boxCountText').innerText = \`\${packedCuts.length} / \${MAX_CUTS} Cuts Packed\`;

      if (packedCuts.length === MAX_CUTS) {
        document.getElementById('boxDeliveryStatus').innerText = "✓ Free 90-Min Express Delivery Unlocked!";
        document.getElementById('boxDeliveryStatus').classList.remove('text-amber-400');
        document.getElementById('boxDeliveryStatus').classList.add('text-emerald-400');
      } else {
        document.getElementById('boxDeliveryStatus').innerText = \`Pack \${MAX_CUTS - packedCuts.length} more cut for Free Delivery\`;
        document.getElementById('boxDeliveryStatus').classList.add('text-amber-400');
        document.getElementById('boxDeliveryStatus').classList.remove('text-emerald-400');
      }
    }

    function resetBox() {
      packedCuts = [];
      renderBox();
    }

    // Concept 3: Cut Anatomy Data
    const ANATOMIES = [
      {
        title: "Seer Fish / Surmai Large Steaks",
        category: "Coastal Harbor Catch • 0°C",
        desc: "Center slices taken perpendicular to the spine for tawa searing without curling.",
        thickness: "1.25 Inches (Center-Cut)",
        pieces: "8 - 10",
        ratio: "90% Meat",
        serves: "3 - 4 Adults",
        cook: "Tawa Fry",
        img: "${raw1}"
      },
      {
        title: "White Pomfret (Paplet) - Whole Cleaned",
        category: "Coastal Harbor Catch • 0°C",
        desc: "Whole gutted and descaled pomfret scored with deep diamond slits for rapid heat and spice absorption.",
        thickness: "Whole Cleaned (300g–400g)",
        pieces: "1 Whole Fish",
        ratio: "85% Meat",
        serves: "1 - 2 Adults",
        cook: "Tawa Fry or Rava Fry",
        img: "${raw2}"
      },
      {
        title: "Rich Tender Goat (Mutton)",
        category: "Pasture Raised • Young",
        desc: "Hand-curated bone-in pieces from ribs, chops, and shoulder with balanced meat-to-marrow distribution.",
        thickness: "1.5 Inch Cubes",
        pieces: "12 - 14",
        ratio: "75% Meat",
        serves: "4 Adults",
        cook: "Rogan Josh or Biryani",
        img: "${raw4}"
      }
    ];

    function selectAnatomy(idx) {
      const data = ANATOMIES[idx];
      document.getElementById('anatomyImg').src = data.img;
      document.getElementById('anatomyThickness').innerText = data.thickness;
      document.getElementById('anatomyCategory').innerText = data.category;
      document.getElementById('anatomyTitle').innerText = data.title;
      document.getElementById('anatomyDesc').innerText = data.desc;
      document.getElementById('anaPieces').innerText = data.pieces;
      document.getElementById('anaRatio').innerText = data.ratio;
      document.getElementById('anaServes').innerText = data.serves;
      document.getElementById('anaCook').innerText = data.cook;

      [0, 1, 2].forEach(i => {
        const btn = document.getElementById('anaBtn' + i);
        if (i === idx) {
          btn.className = "px-4 py-2 rounded-full text-xs font-black bg-white text-black shadow-lg";
        } else {
          btn.className = "px-4 py-2 rounded-full text-xs font-bold bg-white/5 text-gray-300 border border-white/10 hover:text-white";
        }
      });
    }
  </script>
</body>
</html>`;

const outPath = 'C:/Users/dines/.gemini/antigravity/brain/099d1afc-5924-49f5-bd3a-3ed010f92bb9/GoMeat_Full_Experience_Design_System_Reference.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully updated Innovation Reference Lab with exact catalog-matched Indian dishes!');
