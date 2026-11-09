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
  <title>GoMeat 3D Kinetic Hero Showcase (Interactive Prototype)</title>
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,800;0,900;1,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow-x: hidden;
      user-select: none;
    }

    .font-heavy {
      font-family: 'Montserrat', sans-serif;
      font-weight: 900;
      letter-spacing: -0.05em;
    }

    /* 3D Perspective Stage */
    .hero-stage {
      perspective: 1400px;
      perspective-origin: center center;
    }

    .preserve-3d {
      transform-style: preserve-3d;
    }

    /* Floating Animations */
    @keyframes floatSlow {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-18px) rotate(6deg); }
    }

    @keyframes floatReverse {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(16px) rotate(-6deg); }
    }

    @keyframes heroFloat {
      0%, 100% { transform: translateY(0px) rotateX(6deg) rotateY(-6deg) scale(1); }
      50% { transform: translateY(-16px) rotateX(2deg) rotateY(-2deg) scale(1.02); }
    }

    .animate-float-1 { animation: floatSlow 5.5s ease-in-out infinite; }
    .animate-float-2 { animation: floatReverse 7s ease-in-out infinite; }
    .animate-float-3 { animation: floatSlow 4.5s ease-in-out infinite; }
    .animate-hero { animation: heroFloat 6s ease-in-out infinite; }

    /* Transitions */
    .theme-transition {
      transition: background-color 0.8s cubic-bezier(0.16, 1, 0.3, 1),
                  background 0.8s cubic-bezier(0.16, 1, 0.3, 1);
    }

    /* Giant Background 3D Text Cutout */
    .giant-text {
      font-size: clamp(6rem, 18vw, 17rem);
      line-height: 0.82;
      text-transform: uppercase;
      color: rgba(255, 255, 255, 0.88);
      text-shadow: 0 15px 45px rgba(0, 0, 0, 0.22);
      transition: transform 0.65s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.5s ease;
    }

    .product-shadow {
      filter: drop-shadow(0 35px 50px rgba(0, 0, 0, 0.55));
    }

    .garnish-shadow {
      filter: drop-shadow(0 15px 25px rgba(0, 0, 0, 0.4));
    }

    .glass-card {
      background: rgba(255, 255, 255, 0.16);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.28);
    }
  </style>
</head>
<body class="bg-[#0284c7] text-white min-h-screen flex flex-col justify-between m-0 p-0 overflow-hidden theme-transition" id="mainContainer">

  <!-- ================= TOP BAR ================= -->
  <header class="relative z-30 px-6 sm:px-12 py-5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-10 h-10 rounded-2xl bg-white text-rose-600 flex items-center justify-center font-black text-xl shadow-lg">
        G
      </div>
      <div>
        <h1 class="text-xl font-extrabold tracking-tight leading-none text-white">GoMeat</h1>
        <p class="text-[11px] font-semibold text-white/80 tracking-wide mt-0.5">Fresh Quality. Delivered with Care.</p>
      </div>
    </div>

    <!-- Live Cold Chain Assurance Pill -->
    <div class="hidden md:flex items-center gap-2 px-4 py-2 rounded-full glass-card text-xs font-bold text-white shadow-sm">
      <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
      <span>0°C to 4°C ThermalVault Cold Box</span>
      <span class="text-white/60">•</span>
      <span class="text-amber-300">⚡ 90-Min Express Delivery</span>
    </div>

    <div class="flex items-center gap-2">
      <span class="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-white text-gray-900 shadow-md">
        INTERACTIVE REFERENCE
      </span>
    </div>
  </header>

  <!-- ================= MAIN 3D SHOWCASE HERO STAGE ================= -->
  <main class="relative flex-1 flex items-center justify-center hero-stage px-4 sm:px-12 py-4 overflow-hidden min-h-[560px]">
    
    <!-- 1. GIGANTIC 3D BACKGROUND TEXT (Cutout Behind Hero Product) -->
    <div class="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
      <span id="giantText" class="font-heavy giant-text tracking-tighter">
        SURMAI
      </span>
    </div>

    <!-- 2. FLOATING 3D INGREDIENTS / GARNISH (Exact Video Behavior) -->
    <div id="floatingGarnishLayer" class="absolute inset-0 pointer-events-none z-10">
      
      <!-- Garnish 1: Top Left -->
      <div id="garnish1" class="absolute top-[10%] left-[10%] sm:left-[18%] animate-float-1 transition-transform duration-300 garnish-shadow">
        <div class="text-center flex flex-col items-center">
          <span class="text-5xl sm:text-7xl block transform hover:scale-110 transition-transform" id="garnishEmoji1">🧊</span>
          <span class="text-xs font-black text-white/95 mt-1 px-2.5 py-0.5 rounded-full glass-card shadow-sm" id="garnishLabel1">0°C Cold Ice</span>
        </div>
      </div>

      <!-- Garnish 2: Top Right -->
      <div id="garnish2" class="absolute top-[14%] right-[10%] sm:right-[18%] animate-float-2 transition-transform duration-300 garnish-shadow">
        <div class="text-center flex flex-col items-center">
          <span class="text-5xl sm:text-7xl block transform rotate-[18deg]" id="garnishEmoji2">🍋</span>
          <span class="text-xs font-black text-white/95 mt-1 px-2.5 py-0.5 rounded-full glass-card shadow-sm" id="garnishLabel2">Fresh Lemon Cut</span>
        </div>
      </div>

      <!-- Garnish 3: Bottom Right -->
      <div id="garnish3" class="absolute bottom-[16%] right-[12%] sm:right-[20%] animate-float-3 transition-transform duration-300 garnish-shadow">
        <div class="text-center flex flex-col items-center">
          <span class="text-5xl sm:text-7xl block transform -rotate-[14deg]" id="garnishEmoji3">🌿</span>
          <span class="text-xs font-black text-white/95 mt-1 px-2.5 py-0.5 rounded-full glass-card shadow-sm" id="garnishLabel3">Dill & Sea Salt</span>
        </div>
      </div>

      <!-- Garnish 4: Bottom Left -->
      <div id="garnish4" class="absolute bottom-[18%] left-[10%] sm:left-[16%] animate-float-2 transition-transform duration-300 garnish-shadow">
        <div class="text-center flex flex-col items-center">
          <span class="text-4xl sm:text-6xl block transform rotate-[10deg]" id="garnishEmoji4">🌊</span>
          <span class="text-xs font-black text-white/95 mt-1 px-2.5 py-0.5 rounded-full glass-card shadow-sm" id="garnishLabel4">Daily Catch</span>
        </div>
      </div>

    </div>

    <!-- 3. CENTRAL 3D HERO PRODUCT (Floating Freely Like the Can in Video) -->
    <div id="heroCardWrapper" class="relative z-20 transition-transform duration-200 ease-out preserve-3d cursor-pointer">
      <div id="heroProduct" class="animate-hero relative w-68 h-68 sm:w-84 sm:h-84 md:w-96 md:h-96 flex items-center justify-center product-shadow">
        
        <!-- Hero Dish Presentation Platter with Soft Glow -->
        <div class="relative w-full h-full rounded-full p-3 bg-white/20 backdrop-blur-md border-4 border-white/40 shadow-2xl overflow-hidden flex items-center justify-center">
          <img 
            id="heroImage" 
            src="${p1}" 
            alt="GoMeat Fresh Cut" 
            class="w-full h-full object-cover rounded-full shadow-inner transition-all duration-500 hover:scale-105"
          />

          <!-- Live Cold-Chain Telemetry Pill Overlay -->
          <div class="absolute bottom-5 inset-x-6 glass-card rounded-2xl py-2 px-3 text-center border border-white/40 shadow-xl">
            <div class="flex items-center justify-center gap-1.5 text-amber-300 font-black text-xs uppercase tracking-wider">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span id="heroCutBadge">Curry Cut & Tawa Fry Steaks</span>
            </div>
            <p id="heroOriginBadge" class="text-[11px] text-white/95 font-medium mt-0.5">
              Mangalore Harbor Catch • 0°C Never Frozen
            </p>
          </div>
        </div>

      </div>
    </div>

  </main>

  <!-- ================= BOTTOM ACTION CONTROL PANEL (Exact Match to Reference Video) ================= -->
  <footer class="relative z-30 px-6 sm:px-12 py-5 bg-black/35 backdrop-blur-lg border-t border-white/20">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-5">
      
      <!-- Left: Product Story & Shop Now Button -->
      <div class="flex-1 space-y-1.5 text-center md:text-left">
        <div class="flex items-center justify-center md:justify-start gap-2">
          <span id="productCategory" class="px-2.5 py-0.5 rounded-full bg-white/25 text-white font-black text-[11px] uppercase tracking-wider">
            Fish & Seafood
          </span>
          <span class="text-emerald-300 text-xs font-bold flex items-center gap-1">
            <span>●</span> In Stock (Ready in 90 Mins)
          </span>
        </div>

        <h2 id="productTitle" class="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
          Seer Fish / Surmai (Large Steaks)
        </h2>

        <p id="productDescription" class="text-xs text-white/80 max-w-lg leading-relaxed line-clamp-2">
          Center-cut neat steaks from daily fresh catches off the Mangalore-Malabar coast. Shucked, scale-scraped, cleaned in RO water, and immediately blast-chilled to 0°C.
        </p>

        <div class="pt-2 flex items-center justify-center md:justify-start gap-3">
          <button 
            id="addToCartBtn"
            onclick="handleAddToCart()" 
            class="px-7 py-2.5 rounded-full bg-white text-gray-950 font-black text-xs shadow-2xl hover:bg-rose-50 hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
          >
            <span>Shop Now</span>
            <span class="text-rose-600 font-black text-sm">&rarr;</span>
          </button>
          <span class="text-white/70 text-xs font-medium">₹250 Refundable Cold Box Deposit</span>
        </div>
      </div>

      <!-- Center: Big Bold Price Tag (Matches Reference Video) -->
      <div class="text-center shrink-0 px-7 py-2.5 rounded-2xl glass-card border border-white/25 shadow-xl">
        <span class="text-[11px] uppercase font-extrabold text-white/75 tracking-widest block">Standard Pack (500g)</span>
        <div class="flex items-baseline justify-center gap-2 mt-0.5">
          <span id="productPrice" class="text-3xl sm:text-4xl font-black text-white">₹799</span>
          <span id="productMrp" class="text-base text-white/50 line-through">₹899</span>
        </div>
      </div>

      <!-- Right: Next / Prev Circular Arrows & Thumbnails (Matches Reference Video) -->
      <div class="flex flex-col sm:flex-row items-center gap-4 shrink-0">
        
        <!-- Miniature Product Thumbnails -->
        <div class="flex items-center gap-2 glass-card p-1.5 rounded-2xl" id="thumbnailContainer">
          <!-- Populated by JS -->
        </div>

        <!-- Prev / Next Circular Nav Buttons -->
        <div class="flex items-center gap-2">
          <button 
            onclick="prevSlide()" 
            class="w-12 h-12 rounded-full bg-white/20 hover:bg-white text-white hover:text-gray-900 transition-all flex items-center justify-center text-lg font-black shadow-lg cursor-pointer hover:scale-110 active:scale-95 border border-white/30"
            title="Previous Cut (Left Arrow)"
          >
            &#8592;
          </button>
          
          <button 
            onclick="nextSlide()" 
            class="w-12 h-12 rounded-full bg-white text-gray-900 hover:bg-rose-100 transition-all flex items-center justify-center text-lg font-black shadow-xl cursor-pointer hover:scale-110 active:scale-95 border border-white/40"
            title="Next Cut (Right Arrow)"
          >
            &#8594;
          </button>
        </div>

        <!-- Slide Index Counter -->
        <div class="text-xs font-black text-white/90 tracking-widest pl-1">
          <span id="currentSlideIndex">01</span> / <span id="totalSlideCount">04</span>
        </div>

      </div>

    </div>
  </footer>

  <!-- ================= SCRIPT ENGINE ================= -->
  <script>
    const slides = [
      {
        id: "surmai",
        giantText: "SURMAI",
        title: "Seer Fish / Surmai (Large Steaks)",
        category: "Fish & Seafood",
        cutStyle: "Curry Cut & Tawa Fry Steaks",
        origin: "Daily 4:00 AM Mangalore Harbor Catch • 0°C Chilled",
        description: "Center-cut neat steaks from daily fresh catches off the Mangalore-Malabar coast. Shucked, scale-scraped, cleaned in RO water, and blast-chilled to 0°C - 2°C.",
        price: "₹799",
        mrp: "₹899",
        image: "${p1}",
        themeGradient: "linear-gradient(135deg, #0369a1 0%, #0284c7 45%, #075985 100%)",
        garnishes: [
          { emoji: "🧊", label: "0°C Cold Ice" },
          { emoji: "🍋", label: "Fresh Lemon Cut" },
          { emoji: "🌿", label: "Dill & Sea Salt" },
          { emoji: "🌊", label: "Harbor Catch" }
        ]
      },
      {
        id: "mutton",
        giantText: "MUTTON",
        title: "Rich Tender Goat (Biryani & Rogan Josh Cut)",
        category: "Tender Mutton",
        cutStyle: "Biryani & Rogan Josh Cut",
        origin: "Grass-Fed Mandya Pasture Farms • Odor-Free",
        description: "Hand-selected tender pasture-raised goat cuts tailored specifically for dum biryani and rogan josh. Rich bone marrow pieces with succulent meat, 100% tender guaranteed.",
        price: "₹549",
        mrp: "₹629",
        image: "${p4}",
        themeGradient: "linear-gradient(135deg, #881337 0%, #9f1239 45%, #4c0519 100%)",
        garnishes: [
          { emoji: "⭐", label: "Star Anise" },
          { emoji: "🫚", label: "Whole Ginger" },
          { emoji: "🍃", label: "Bay Leaves" },
          { emoji: "🥩", label: "Bone Marrow" }
        ]
      },
      {
        id: "chicken",
        giantText: "CHICKEN",
        title: "Country Chicken / Nati Koli (Curry Cut)",
        category: "Fresh Chicken",
        cutStyle: "Medium Bone-In Curry Pieces",
        origin: "100% Free-Range Organic Farms • Antibiotic-Free",
        description: "Naturally foraged country fowl with rich muscle density and authentic rustic flavor. Dressed cleanly and vacuum sealed within 90 minutes of processing.",
        price: "₹389",
        mrp: "₹429",
        image: "${p6}",
        themeGradient: "linear-gradient(135deg, #c2410c 0%, #ea580c 45%, #7c2d12 100%)",
        garnishes: [
          { emoji: "🌶️", label: "Guntur Red Chili" },
          { emoji: "🧄", label: "Crushed Garlic" },
          { emoji: "🌿", label: "Curry Sprigs" },
          { emoji: "🍗", label: "Antibiotic-Free" }
        ]
      },
      {
        id: "prawns",
        giantText: "PRAWNS",
        title: "Sea Tiger Prawns (Jumbo Cleaned & Deveined)",
        category: "Fish & Seafood",
        cutStyle: "Tail-On Deveined Jumbo",
        origin: "Deep Coastal Waters of Karnataka • RO Cleaned",
        description: "Wild-caught sea tiger prawns, tail-on, cleaned in RO water and thoroughly deveined. Juicy, firm, and bursting with fresh oceanic sweetness.",
        price: "₹449",
        mrp: "₹499",
        image: "${p3}",
        themeGradient: "linear-gradient(135deg, #0f766e 0%, #0d9488 45%, #134e4a 100%)",
        garnishes: [
          { emoji: "🦐", label: "Jumbo Tail-On" },
          { emoji: "🧂", label: "Coarse Sea Salt" },
          { emoji: "🍋", label: "Meyer Lemon" },
          { emoji: "🌊", label: "Deep Marine" }
        ]
      }
    ];

    let currentIndex = 0;

    function renderThumbnails() {
      const container = document.getElementById('thumbnailContainer');
      container.innerHTML = slides.map((s, idx) => \`
        <button 
          onclick="goToSlide(\${idx})"
          class="w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer \${idx === currentIndex ? 'border-white scale-110 shadow-lg' : 'border-white/30 opacity-60 hover:opacity-100'}"
          title="\${s.title}"
        >
          <img src="\${s.image}" alt="\${s.title}" class="w-full h-full object-cover" />
        </button>
      \`).join('');
    }

    function updateSlide(index) {
      currentIndex = index;
      const slide = slides[currentIndex];

      // Morph background
      document.getElementById('mainContainer').style.background = slide.themeGradient;

      // Update Giant Text with drop animation
      const giantTextEl = document.getElementById('giantText');
      giantTextEl.style.transform = 'translateY(60px) scale(0.9)';
      giantTextEl.style.opacity = '0';
      setTimeout(() => {
        giantTextEl.innerText = slide.giantText;
        giantTextEl.style.transform = 'translateY(0px) scale(1)';
        giantTextEl.style.opacity = '0.88';
      }, 180);

      // Update Centerpiece Hero Product with drop
      const heroProduct = document.getElementById('heroProduct');
      heroProduct.style.transform = 'scale(0.85) rotateX(15deg)';
      heroProduct.style.opacity = '0.5';
      setTimeout(() => {
        document.getElementById('heroImage').src = slide.image;
        document.getElementById('heroCutBadge').innerText = slide.cutStyle;
        document.getElementById('heroOriginBadge').innerText = slide.origin;
        heroProduct.style.transform = 'scale(1) rotateX(0deg)';
        heroProduct.style.opacity = '1';
      }, 180);

      // Update Garnishes
      slide.garnishes.forEach((g, i) => {
        const emojiEl = document.getElementById(\`garnishEmoji\${i+1}\`);
        const labelEl = document.getElementById(\`garnishLabel\${i+1}\`);
        if (emojiEl) emojiEl.innerText = g.emoji;
        if (labelEl) labelEl.innerText = g.label;
      });

      // Update Details
      document.getElementById('productCategory').innerText = slide.category;
      document.getElementById('productTitle').innerText = slide.title;
      document.getElementById('productDescription').innerText = slide.description;
      document.getElementById('productPrice').innerText = slide.price;
      document.getElementById('productMrp').innerText = slide.mrp;
      document.getElementById('currentSlideIndex').innerText = String(currentIndex + 1).padStart(2, '0');
      document.getElementById('totalSlideCount').innerText = String(slides.length).padStart(2, '0');

      renderThumbnails();
    }

    function nextSlide() {
      const next = (currentIndex + 1) % slides.length;
      updateSlide(next);
    }

    function prevSlide() {
      const prev = (currentIndex - 1 + slides.length) % slides.length;
      updateSlide(prev);
    }

    function goToSlide(idx) {
      if (idx !== currentIndex) updateSlide(idx);
    }

    // 3D Mouse Parallax Movement
    const stage = document.querySelector('.hero-stage');
    const heroWrapper = document.getElementById('heroCardWrapper');
    const garnish1 = document.getElementById('garnish1');
    const garnish2 = document.getElementById('garnish2');
    const garnish3 = document.getElementById('garnish3');
    const garnish4 = document.getElementById('garnish4');

    window.addEventListener('mousemove', (e) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX - innerWidth / 2) / (innerWidth / 2);
      const y = (e.clientY - innerHeight / 2) / (innerHeight / 2);

      if (heroWrapper) {
        heroWrapper.style.transform = \`rotateY(\${x * 16}deg) rotateX(\${-y * 14}deg) translateZ(35px)\`;
      }

      if (garnish1) garnish1.style.transform = \`translate(\${x * 24}px, \${y * 24}px)\`;
      if (garnish2) garnish2.style.transform = \`translate(\${-x * 30}px, \${-y * 30}px)\`;
      if (garnish3) garnish3.style.transform = \`translate(\${x * 35}px, \${-y * 20}px)\`;
      if (garnish4) garnish4.style.transform = \`translate(\${-x * 20}px, \${y * 35}px)\`;
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    });

    function handleAddToCart() {
      const btn = document.getElementById('addToCartBtn');
      const originalText = btn.innerHTML;
      btn.innerHTML = \`<span class="text-emerald-600 font-bold">✓ Added to Cart!</span>\`;
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1800);
    }

    // Initialize
    updateSlide(0);
  </script>
</body>
</html>`;

const outPath = 'C:/Users/dines/.gemini/antigravity/brain/099d1afc-5924-49f5-bd3a-3ed010f92bb9/GoMeat_3D_Hero_Showcase_Reference.html';
fs.writeFileSync(outPath, html, 'utf8');
console.log('Successfully wrote GoMeat_3D_Hero_Showcase_Reference.html with embedded base64 images!');
