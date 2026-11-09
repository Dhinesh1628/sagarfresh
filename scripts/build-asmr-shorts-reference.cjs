const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const p1 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_1.jpg')).toString('base64');
const p3 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_3.jpg')).toString('base64');
const p4 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_4.jpg')).toString('base64');
const p6 = 'data:image/jpeg;base64,' + fs.readFileSync(path.join(rootDir, 'frontend/public/images/products/prod_6.jpg')).toString('base64');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>GoMeat • 15-Sec ASMR Recipe Shorts & 1-Tap Cook Prototype</title>
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
      background: #090a0f;
      color: #ffffff;
      min-height: 100vh;
      overflow-x: hidden;
    }

    .font-heavy {
      font-family: 'Cabinet Grotesk', 'Plus Jakarta Sans', sans-serif;
      font-weight: 900;
    }

    /* Shimmer animation */
    @keyframes shimmer {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    .animate-shimmer {
      animation: shimmer 2s infinite;
    }

    /* Pan sizzle vapor drift */
    @keyframes vapor {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.3; }
      50% { transform: translateY(-15px) scale(1.15); opacity: 0.6; }
    }
    .anim-vapor {
      animation: vapor 3s ease-in-out infinite;
    }

    /* Card glow hover */
    .reel-card {
      transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
    }
    .reel-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 25px 50px -12px rgba(225, 29, 72, 0.35);
    }

    /* Glass pill */
    .glass-pill {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    /* Custom scrollbar */
    ::-webkit-scrollbar {
      height: 6px;
      width: 6px;
    }
    ::-webkit-scrollbar-track {
      background: #0c0d14;
    }
    ::-webkit-scrollbar-thumb {
      background: #27272a;
      border-radius: 9999px;
    }
    ::-webkit-scrollbar-thumb:hover {
      background: #3f3f46;
    }
  </style>
</head>
<body class="p-4 sm:p-8">

  <!-- ================= TOP REFERENCE HEADER ================= -->
  <header class="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-rose-600/40">
        G
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-xl font-black text-white tracking-tight">GoMeat ASMR Shorts</h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30">
            Gen-Z Concept Reference
          </span>
        </div>
        <p class="text-xs text-gray-400">15-Sec Sizzle Videos with 1-Tap "Cook This Tonight" Instant Recipe Cart</p>
      </div>
    </div>

    <!-- Interactive Cart Counter Preview -->
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold">
        <span>🛒 Your Cold Box:</span>
        <span id="headerCartCount" class="px-2 py-0.5 rounded-full bg-rose-600 text-white font-black text-xs">0 items</span>
      </div>
    </div>
  </header>

  <!-- ================= HOMEPAGE EMBED PREVIEW ================= -->
  <main class="max-w-6xl mx-auto py-8 space-y-8">
    
    <!-- Section Header on Homepage -->
    <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 text-rose-400 text-xs font-black uppercase tracking-widest mb-1">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          <span>Sizzle & Cook in 15 Mins • ASMR Shorts</span>
        </div>
        <h2 class="text-2xl sm:text-4xl font-heavy text-white tracking-tight">
          Don't Just Buy Meat. <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-pink-400 to-amber-300">Cook Fire Tonight.</span>
        </h2>
        <p class="text-xs sm:text-sm text-gray-400 max-w-xl mt-1">
          Watch 15-second mouthwatering sizzle clips. Click 1 button to get the pre-cut meat, chef marinade rub, and fresh herbs delivered together in 90 minutes.
        </p>
      </div>

      <!-- Quick Category Filter Pills -->
      <div class="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <button class="px-3.5 py-1.5 rounded-full text-xs font-black bg-white text-black shadow-lg">🔥 All (4)</button>
        <button class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10">💪 High Protein</button>
        <button class="px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10">⏱️ Under 15m</button>
      </div>
    </div>

    <!-- ================= 4 HORIZONTAL REEL CARDS (Homepage Tray) ================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="shortsGrid">
      
      <!-- Reel 1: Surmai Tawa Fry -->
      <div class="reel-card relative h-[420px] rounded-3xl overflow-hidden cursor-pointer group bg-neutral-900 border border-white/10 shadow-2xl" onclick="openReel(0)">
        <img src="${p1}" alt="Surmai Tawa Fry" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>

        <!-- Top Badges -->
        <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-black text-rose-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
            <span>0:15 ASMR</span>
          </span>
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200">
            💪 46g Protein
          </span>
        </div>

        <!-- Center Sizzle Icon (appears on hover) -->
        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div class="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xl shadow-2xl backdrop-blur-md">
            ▶
          </div>
        </div>

        <!-- Bottom Details -->
        <div class="absolute bottom-4 inset-x-4 z-10 space-y-2.5">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-rose-400">Fish & Seafood</span>
            <h3 class="text-lg font-black text-white leading-snug">Mangalore Crispy Surmai Tawa Fry</h3>
            <p class="text-[11px] text-gray-300 font-medium">with Red Chili Masala Crust & Curry Leaves</p>
          </div>

          <!-- Price & 1-Tap Cook Button -->
          <div class="pt-1 flex items-center justify-between border-t border-white/15">
            <div>
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Bundle Price</span>
              <span class="text-base font-black text-white">₹799</span>
            </div>
            <button class="px-4 py-2 rounded-full bg-white text-black font-black text-xs hover:bg-rose-400 hover:text-white transition-all shadow-lg flex items-center gap-1.5">
              <span>⚡ Cook This</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Reel 2: Tiger Prawns Butter Garlic -->
      <div class="reel-card relative h-[420px] rounded-3xl overflow-hidden cursor-pointer group bg-neutral-900 border border-white/10 shadow-2xl" onclick="openReel(1)">
        <img src="${p3}" alt="Garlic Butter Prawns" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>

        <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-black text-amber-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            <span>0:12 ASMR</span>
          </span>
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200">
            💪 38g Protein
          </span>
        </div>

        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div class="w-14 h-14 rounded-full bg-amber-500/90 text-white flex items-center justify-center text-xl shadow-2xl backdrop-blur-md">
            ▶
          </div>
        </div>

        <div class="absolute bottom-4 inset-x-4 z-10 space-y-2.5">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-amber-400">Coastal Prawns</span>
            <h3 class="text-lg font-black text-white leading-snug">Smoked Butter Garlic Sea Prawns</h3>
            <p class="text-[11px] text-gray-300 font-medium">Tossed with Roasted Garlic & Chili Flakes</p>
          </div>

          <div class="pt-1 flex items-center justify-between border-t border-white/15">
            <div>
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Bundle Price</span>
              <span class="text-base font-black text-white">₹449</span>
            </div>
            <button class="px-4 py-2 rounded-full bg-white text-black font-black text-xs hover:bg-amber-400 hover:text-black transition-all shadow-lg flex items-center gap-1.5">
              <span>⚡ Cook This</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Reel 3: Mutton Pepper Ghee Roast -->
      <div class="reel-card relative h-[420px] rounded-3xl overflow-hidden cursor-pointer group bg-neutral-900 border border-white/10 shadow-2xl" onclick="openReel(2)">
        <img src="${p4}" alt="Mutton Pepper Roast" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>

        <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-black text-emerald-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
            <span>0:15 ASMR</span>
          </span>
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200">
            💪 52g Protein
          </span>
        </div>

        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div class="w-14 h-14 rounded-full bg-rose-600/90 text-white flex items-center justify-center text-xl shadow-2xl backdrop-blur-md">
            ▶
          </div>
        </div>

        <div class="absolute bottom-4 inset-x-4 z-10 space-y-2.5">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-rose-400">Pasture Mutton</span>
            <h3 class="text-lg font-black text-white leading-snug">Black Pepper Mutton Ghee Roast</h3>
            <p class="text-[11px] text-gray-300 font-medium">Tender Young Goat Braised in Desi Ghee</p>
          </div>

          <div class="pt-1 flex items-center justify-between border-t border-white/15">
            <div>
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Bundle Price</span>
              <span class="text-base font-black text-white">₹549</span>
            </div>
            <button class="px-4 py-2 rounded-full bg-white text-black font-black text-xs hover:bg-rose-500 hover:text-white transition-all shadow-lg flex items-center gap-1.5">
              <span>⚡ Cook This</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Reel 4: Andhra Chili Chicken -->
      <div class="reel-card relative h-[420px] rounded-3xl overflow-hidden cursor-pointer group bg-neutral-900 border border-white/10 shadow-2xl" onclick="openReel(3)">
        <img src="${p6}" alt="Andhra Chili Chicken" class="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 filter brightness-90 group-hover:brightness-100" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/20"></div>

        <div class="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-black text-orange-300 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping"></span>
            <span>0:14 ASMR</span>
          </span>
          <span class="glass-pill px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-200">
            💪 48g Protein
          </span>
        </div>

        <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none">
          <div class="w-14 h-14 rounded-full bg-orange-500/90 text-white flex items-center justify-center text-xl shadow-2xl backdrop-blur-md">
            ▶
          </div>
        </div>

        <div class="absolute bottom-4 inset-x-4 z-10 space-y-2.5">
          <div>
            <span class="text-[10px] font-black uppercase tracking-wider text-orange-400">Organic Chicken</span>
            <h3 class="text-lg font-black text-white leading-snug">Fiery Andhra Green Chili Chicken</h3>
            <p class="text-[11px] text-gray-300 font-medium">Pan-seared with slit green chilies & curry leaves</p>
          </div>

          <div class="pt-1 flex items-center justify-between border-t border-white/15">
            <div>
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Bundle Price</span>
              <span class="text-base font-black text-white">₹389</span>
            </div>
            <button class="px-4 py-2 rounded-full bg-white text-black font-black text-xs hover:bg-orange-500 hover:text-white transition-all shadow-lg flex items-center gap-1.5">
              <span>⚡ Cook This</span>
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- Instruction Callout -->
    <div class="p-6 rounded-3xl bg-white/5 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-2xl shadow-xl shrink-0">
          🔥
        </div>
        <div>
          <h4 class="font-black text-white text-sm">Click any reel above to test the Fullscreen TikTok/Reels Video Player</h4>
          <p class="text-xs text-gray-400">Includes procedural Audio ASMR pan sizzling, ingredients bundle breakdown, and 1-tap cart addition.</p>
        </div>
      </div>
      <span class="px-4 py-2 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-bold shrink-0">
        Try clicking Reel 1 or 2
      </span>
    </div>

  </main>

  <!-- ================= TIKTOK / REELS FULLSCREEN PLAYER MODAL ================= -->
  <div id="reelsModal" class="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl hidden items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
    
    <!-- Close Button -->
    <button onclick="closeReel()" class="absolute top-6 right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-2xl font-bold z-50 transition cursor-pointer">
      ✕
    </button>

    <!-- Modal Content: 9:16 Vertical Reel Player + Side Recipe Breakdown -->
    <div class="max-w-4xl w-full max-h-[92vh] flex flex-col md:flex-row rounded-3xl overflow-hidden bg-neutral-950 border border-white/15 shadow-2xl">
      
      <!-- Left: Vertical 9:16 Reel Player Screen -->
      <div class="relative w-full md:w-[380px] h-[480px] md:h-[640px] shrink-0 overflow-hidden bg-black flex items-center justify-center group">
        
        <!-- Video/Motion Background Image -->
        <img id="modalReelImg" src="${p1}" alt="Recipe Video" class="w-full h-full object-cover scale-105 transition-transform duration-1000" />
        <div class="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/40"></div>

        <!-- Simulated Sizzle Steam Mist -->
        <div class="absolute inset-0 pointer-events-none anim-vapor flex items-center justify-center">
          <div class="w-64 h-64 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        <!-- Reel Progress Bar (15s scrubber) -->
        <div class="absolute top-3 inset-x-3 h-1 bg-white/20 rounded-full overflow-hidden z-20">
          <div id="reelProgressBar" class="h-full bg-rose-500 w-1/3 transition-all duration-300"></div>
        </div>

        <!-- Audio Sizzle ASMR Toggle Pill -->
        <button id="asmrAudioBtn" onclick="toggleAsmrSound()" class="absolute top-6 right-4 z-20 glass-pill px-3 py-1.5 rounded-full text-xs font-black text-white flex items-center gap-1.5 hover:bg-white/20 transition cursor-pointer">
          <span id="asmrIcon">🔊</span>
          <span id="asmrLabel">ASMR Sizzle: OFF</span>
        </button>

        <!-- Social Action Column (TikTok/Reels icons) -->
        <div class="absolute right-4 bottom-24 flex flex-col items-center gap-4 z-20">
          <button onclick="toggleLike()" class="flex flex-col items-center gap-1 text-white hover:scale-110 transition cursor-pointer">
            <span id="heartIcon" class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-xl">🤍</span>
            <span id="likeCount" class="text-[10px] font-bold">84.2K</span>
          </button>
          <div class="flex flex-col items-center gap-1 text-white">
            <span class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-lg">💬</span>
            <span class="text-[10px] font-bold">1.2K</span>
          </div>
          <div class="flex flex-col items-center gap-1 text-white">
            <span class="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-lg">↗️</span>
            <span class="text-[10px] font-bold">Share</span>
          </div>
        </div>

        <!-- Video Overlay Bottom Caption -->
        <div class="absolute bottom-4 inset-x-4 z-20 space-y-1.5 pr-14">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-full bg-gradient-to-tr from-rose-500 to-amber-400 flex items-center justify-center text-xs font-black">
              GK
            </div>
            <span id="modalChefHandle" class="text-xs font-black text-white">@chef_kavya</span>
            <span class="text-[10px] text-rose-400 font-bold">• 15-Min Sizzle</span>
          </div>
          <h3 id="modalReelTitle" class="text-base font-black text-white leading-tight">Mangalore Crispy Surmai Tawa Fry</h3>
          <p id="modalReelAudioTrack" class="text-[10px] text-gray-300 flex items-center gap-1">
            <span>🎵 Original Audio • Sizzling Coconut Oil Pan ASMR</span>
          </p>
        </div>

      </div>

      <!-- Right: Interactive 1-Tap Recipe Bundle Breakdown Drawer -->
      <div class="flex-1 p-6 md:p-8 flex flex-col justify-between overflow-y-auto space-y-6">
        
        <div class="space-y-5">
          <!-- Header -->
          <div class="flex items-start justify-between">
            <div>
              <span class="text-[11px] font-black uppercase tracking-wider text-rose-400 block mb-0.5">
                Recipe Box Kit • Guaranteed 0°C Cold Delivery
              </span>
              <h2 id="modalRecipeName" class="text-2xl font-heavy text-white">
                Mangalore Surmai Tawa Fry Kit
              </h2>
            </div>
            <span id="modalCookTime" class="px-3 py-1 rounded-full bg-white/10 text-xs font-black text-white shrink-0">
              ⏱️ 12 Mins
            </span>
          </div>

          <!-- Nutritional Macro Badges (For Gen-Z Fitness/Gym Hackers) -->
          <div class="grid grid-cols-3 gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
            <div class="text-center">
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Protein</span>
              <span id="modalProtein" class="text-base font-black text-emerald-400">46g</span>
            </div>
            <div class="text-center border-x border-white/10">
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Carbs</span>
              <span id="modalCarbs" class="text-base font-black text-gray-200">4g</span>
            </div>
            <div class="text-center">
              <span class="text-[10px] text-gray-400 block uppercase font-bold">Clean Fats</span>
              <span id="modalFats" class="text-base font-black text-amber-300">11g</span>
            </div>
          </div>

          <!-- Bundle Checklist Breakdown -->
          <div class="space-y-2.5">
            <h4 class="text-xs font-black uppercase tracking-wider text-gray-300">
              Everything in this recipe box (1-Tap):
            </h4>

            <div class="space-y-2 text-xs" id="modalIngredientsList">
              <!-- Populated by JS -->
            </div>
          </div>

          <!-- Recipe Step Summary -->
          <div class="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/30 text-xs space-y-1">
            <span class="font-black text-rose-300 block">Chef's 3-Step Shortcut:</span>
            <p id="modalChefTip" class="text-gray-300 leading-relaxed text-[11px]">
              1. Coat steaks with the red masala rub. 2. Sear on cast iron tawa with 2 tbsp coconut oil for 4 mins each side. 3. Squeeze fresh lemon & serve hot!
            </p>
          </div>

        </div>

        <!-- Bottom Action CTA: 1-Tap Cook This Tonight -->
        <div class="pt-4 border-t border-white/10 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-gray-400 font-bold">Complete Bundle Price:</span>
            <div class="flex items-baseline gap-2">
              <span id="modalBundlePrice" class="text-2xl font-black text-white">₹799</span>
              <span id="modalBundleMrp" class="text-sm text-gray-500 line-through font-bold">₹949</span>
            </div>
          </div>

          <button 
            id="modalCookNowBtn"
            onclick="addRecipeBundleToCart()" 
            class="w-full py-4 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-600 text-white font-black text-sm uppercase tracking-wider shadow-2xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <span>⚡ Cook This Tonight (Add Bundle to Box)</span>
          </button>
          
          <p class="text-[10px] text-gray-400 text-center font-semibold">
            Delivered in 0°C ThermalVault Cold Box within 90 Mins • ₹250 Refundable Deposit
          </p>
        </div>

      </div>

    </div>
  </div>

  <!-- Toast Notification Feedback -->
  <div id="recipeToast" class="fixed bottom-6 right-6 z-50 bg-emerald-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-emerald-500/30 hidden">
    <span>✓</span>
    <span id="toastMsg">Recipe Bundle Added to Cart!</span>
  </div>

  <!-- ================= MASTER INTERACTION SCRIPT ================= -->
  <script>
    const REELS = [
      {
        id: "surmai_tawa_fry",
        title: "Mangalore Crispy Surmai Tawa Fry",
        chef: "@chef_kavya",
        cookTime: "⏱️ 12 Mins",
        protein: "46g",
        carbs: "4g",
        fats: "11g",
        price: "₹799",
        mrp: "₹949",
        image: "${p1}",
        tip: "1. Coat steaks with the coastal red masala rub. 2. Sear on a hot iron tawa with 2 tbsp coconut oil for 4 mins each side until crispy. 3. Squeeze fresh lemon over sizzling curry leaves!",
        ingredients: [
          { name: "500g Fresh Surmai Steaks (Curry & Tawa Cut)", price: "₹799", free: false },
          { name: "Coastal Red Chili Tawa Rub (Chef's Blend)", price: "₹65", free: true },
          { name: "Fresh Malabar Curry Leaves & Lemon Wedge", price: "₹25", free: true }
        ]
      },
      {
        id: "garlic_butter_prawns",
        title: "Smoked Butter Garlic Sea Prawns",
        chef: "@gym_bro_chef",
        cookTime: "⏱️ 10 Mins",
        protein: "38g",
        carbs: "2g",
        fats: "14g",
        price: "₹449",
        mrp: "₹529",
        image: "${p3}",
        tip: "1. Heat 2 tbsp butter on high flame. 2. Toss cleaned tiger prawns with minced garlic for 3 minutes. 3. Garnish with red pepper flakes and dill sprigs. High protein, zero carbs!",
        ingredients: [
          { name: "500g Wild Sea Tiger Prawns (Cleaned & Deveined)", price: "₹449", free: false },
          { name: "Fresh Garlic Pods & Herb Rub", price: "₹45", free: true },
          { name: "Organic Dill Sprigs & Lime Wedge", price: "₹35", free: true }
        ]
      },
      {
        id: "mutton_ghee_roast",
        title: "Black Pepper Mutton Ghee Roast",
        chef: "@bangalore_foodie",
        cookTime: "⏱️ 22 Mins",
        protein: "52g",
        carbs: "5g",
        fats: "18g",
        price: "₹549",
        mrp: "₹649",
        image: "${p4}",
        tip: "1. Sauté crushed Tellicherry black peppercorns in desi ghee. 2. Add tender goat cuts and roast on medium flame until deeply caramelized and tender.",
        ingredients: [
          { name: "500g Pasture-Raised Tender Goat Curry Cut", price: "₹549", free: false },
          { name: "Tellicherry Peppercorn & Star Anise Spice Mix", price: "₹55", free: true },
          { name: "Fresh Curry Leaves Pack", price: "₹20", free: true }
        ]
      },
      {
        id: "andhra_chili_chicken",
        title: "Fiery Andhra Green Chili Chicken",
        chef: "@rayalaseema_spices",
        cookTime: "⏱️ 15 Mins",
        protein: "48g",
        carbs: "3g",
        fats: "9g",
        price: "₹389",
        mrp: "₹459",
        image: "${p6}",
        tip: "1. Marinate bone-in chicken with salt and turmeric. 2. Toss in smoking oil with slit green chilies and pounded garlic until edges are crispy and fragrant.",
        ingredients: [
          { name: "500g Country Chicken (Nati Koli Curry Cut)", price: "₹389", free: false },
          { name: "Fresh Guntur Green Chilies & Garlic Pods", price: "₹35", free: true },
          { name: "Andhra Roast Seasoning", price: "₹45", free: true }
        ]
      }
    ];

    let currentReelIndex = 0;
    let cartItemCount = 0;
    let isAsmrPlaying = false;
    let audioCtx = null;
    let noiseNode = null;
    let gainNode = null;

    function openReel(idx) {
      currentReelIndex = idx;
      const data = REELS[idx];

      document.getElementById('modalReelImg').src = data.image;
      document.getElementById('modalReelTitle').innerText = data.title;
      document.getElementById('modalChefHandle').innerText = data.chef;
      document.getElementById('modalRecipeName').innerText = data.title + " Kit";
      document.getElementById('modalCookTime').innerText = data.cookTime;
      document.getElementById('modalProtein').innerText = data.protein;
      document.getElementById('modalCarbs').innerText = data.carbs;
      document.getElementById('modalFats').innerText = data.fats;
      document.getElementById('modalBundlePrice').innerText = data.price;
      document.getElementById('modalBundleMrp').innerText = data.mrp;
      document.getElementById('modalChefTip').innerText = data.tip;

      const listContainer = document.getElementById('modalIngredientsList');
      listContainer.innerHTML = data.ingredients.map(item => \`
        <div class="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10">
          <div class="flex items-center gap-2">
            <span class="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-black">✓</span>
            <span class="text-white font-medium">\${item.name}</span>
          </div>
          <div class="flex items-center gap-1.5 shrink-0">
            \${item.free ? '<span class="text-[10px] font-black uppercase text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950/40 border border-emerald-500/30">FREE PAIRING</span>' : ''}
            <span class="font-bold \${item.free ? 'line-through text-gray-500' : 'text-white'}">\${item.price}</span>
          </div>
        </div>
      \`).join('');

      document.getElementById('reelsModal').classList.remove('hidden');
      document.getElementById('reelsModal').classList.add('flex');
    }

    function closeReel() {
      document.getElementById('reelsModal').classList.add('hidden');
      document.getElementById('reelsModal').classList.remove('flex');
      if (isAsmrPlaying) toggleAsmrSound();
    }

    // Web Audio API Synthesized Pan Sizzle ASMR Sound Engine (Zero external dependencies)
    function toggleAsmrSound() {
      if (!isAsmrPlaying) {
        try {
          audioCtx = new (window.AudioContext || window.webkitAudioContext)();
          const bufferSize = audioCtx.sampleRate * 2;
          const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
          const output = noiseBuffer.getChannelData(0);
          for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
          }

          const whiteNoise = audioCtx.createBufferSource();
          whiteNoise.buffer = noiseBuffer;
          whiteNoise.loop = true;

          const filter = audioCtx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.value = 1400;
          filter.Q.value = 3.0;

          gainNode = audioCtx.createGain();
          gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);

          whiteNoise.connect(filter);
          filter.connect(gainNode);
          gainNode.connect(audioCtx.destination);

          whiteNoise.start();
          noiseNode = whiteNoise;
          isAsmrPlaying = true;

          document.getElementById('asmrIcon').innerText = '🔥';
          document.getElementById('asmrLabel').innerText = 'ASMR Sizzle: ON';
          document.getElementById('asmrAudioBtn').classList.add('bg-rose-600/80', 'ring-2', 'ring-rose-400');
        } catch (e) {
          console.log(e);
        }
      } else {
        if (noiseNode) {
          try { noiseNode.stop(); } catch(e){}
        }
        if (audioCtx) {
          try { audioCtx.close(); } catch(e){}
        }
        isAsmrPlaying = false;
        document.getElementById('asmrIcon').innerText = '🔊';
        document.getElementById('asmrLabel').innerText = 'ASMR Sizzle: OFF';
        document.getElementById('asmrAudioBtn').classList.remove('bg-rose-600/80', 'ring-2', 'ring-rose-400');
      }
    }

    function toggleLike() {
      const heart = document.getElementById('heartIcon');
      const count = document.getElementById('likeCount');
      if (heart.innerText === '🤍') {
        heart.innerText = '❤️';
        count.innerText = '84.3K';
      } else {
        heart.innerText = '🤍';
        count.innerText = '84.2K';
      }
    }

    function addRecipeBundleToCart() {
      const data = REELS[currentReelIndex];
      cartItemCount += 1;
      document.getElementById('headerCartCount').innerText = cartItemCount + " items";

      const btn = document.getElementById('modalCookNowBtn');
      btn.innerHTML = '✓ RECIPE KIT ADDED TO COLD BOX';
      btn.classList.add('bg-emerald-500', 'text-black');

      const toast = document.getElementById('recipeToast');
      document.getElementById('toastMsg').innerText = \`🎉 Added \${data.title} Kit! (500g Cut + Free Marinade & Herbs)\`;
      toast.classList.remove('hidden');

      setTimeout(() => {
        btn.innerHTML = '⚡ Cook This Tonight (Add Bundle to Box)';
        btn.classList.remove('bg-emerald-500', 'text-black');
      }, 1800);

      setTimeout(() => {
        toast.classList.add('hidden');
      }, 3500);
    }
  </script>
</body>
</html>`;

const outPath = 'C:/Users/dines/.gemini/antigravity/brain/099d1afc-5924-49f5-bd3a-3ed010f92bb9/GoMeat_ASMR_Recipe_Shorts_Reference.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully generated ASMR Recipe Shorts reference prototype!');
