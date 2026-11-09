import pptxgen from 'pptxgenjs';
import path from 'path';

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'GoMeat Engineering Team';
pptx.company = 'GoMeat Technologies Private Limited';
pptx.title = 'GoMeat - MERN Stack Production E-Commerce Platform';

// Brand Colors
const CRIMSON = 'D11243';
const CRIMSON_DARK = '9E0D32';
const SLATE_DARK = '0B1120';
const SLATE_CARD = '1E293B';
const SLATE_LIGHT = 'F1F5F9';
const WHITE = 'FFFFFF';
const EMERALD = '059669';
const EMERALD_LIGHT = 'D1FAE5';
const AMBER = 'D97706';
const GRAY_TEXT = '64748B';
const GRAY_LIGHT = '94A3B8';

// Helper: Header on content slides
function addSlideHeader(slide, title, category = 'GOMEAT E-COMMERCE PLATFORM') {
  slide.background = { color: 'F8FAFC' };
  
  // Category / Eyebrow
  slide.addText(category.toUpperCase(), {
    x: 0.8,
    y: 0.4,
    w: 8.5,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: CRIMSON,
    letterSpacing: 2
  });

  // Slide Title
  slide.addText(title, {
    x: 0.8,
    y: 0.7,
    w: 11.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    bold: true,
    color: '0F172A'
  });

  // Accent divider
  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.8,
    y: 1.35,
    w: 1.2,
    h: 0.05,
    fill: { color: CRIMSON },
    line: { color: CRIMSON }
  });
}

// =========================================================================
// SLIDE 1: TITLE SLIDE (Dark Premium Theme)
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: SLATE_DARK };

  // Decorative glow box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 0.8,
    w: 11.7,
    h: 5.9,
    rectRadius: 0.2,
    fill: { color: '131C31' },
    line: { color: '273553', width: 1.5 }
  });

  // Eyebrow badge
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.3,
    y: 1.3,
    w: 3.4,
    h: 0.35,
    rectRadius: 0.1,
    fill: { color: '2A111E' },
    line: { color: CRIMSON, width: 1 }
  });

  slide.addText('FSSAI 0°C - 4°C CERTIFIED FRESHCHAIN', {
    x: 1.3,
    y: 1.3,
    w: 3.4,
    h: 0.35,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    color: 'FDA4AF',
    align: 'center'
  });

  // Main Title
  slide.addText('GOMEAT', {
    x: 1.3,
    y: 1.8,
    w: 10.5,
    h: 1.0,
    fontSize: 48,
    fontFace: 'Arial Black',
    color: CRIMSON,
    letterSpacing: 3
  });

  slide.addText('Full-Stack Production MERN E-Commerce Upgrade', {
    x: 1.3,
    y: 2.7,
    w: 10.5,
    h: 0.6,
    fontSize: 22,
    fontFace: 'Arial',
    bold: true,
    color: WHITE
  });

  // Subtitle / Description
  slide.addText(
    'A deep-dive presentation covering real Razorpay payment rails, circular ₹250 refundable cold-box logistics, 6-stage IoT order tracking, customer & operations dashboards, and bank-grade security.',
    {
      x: 1.3,
      y: 3.4,
      w: 8.5,
      h: 0.9,
      fontSize: 13,
      fontFace: 'Arial',
      color: GRAY_LIGHT,
      lineSpacing: 20
    }
  );

  // Bottom Metadata Cards
  const cards = [
    { title: 'TECH STACK', desc: 'React.js • Node.js • Express • MongoDB Atlas' },
    { title: 'PAYMENTS', desc: 'Razorpay UPI, Cards, NetBanking & COD' },
    { title: 'CIRCULAR PACKAGING', desc: '₹250 Refundable ThermalVault™ Box' },
    { title: 'DEPLOYMENT', desc: 'Vercel Serverless + GitHub CI/CD' }
  ];

  cards.forEach((c, idx) => {
    const cardX = 1.3 + idx * 2.7;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: cardX,
      y: 4.8,
      w: 2.5,
      h: 1.2,
      rectRadius: 0.1,
      fill: { color: '1E293B' },
      line: { color: '334155', width: 1 }
    });

    slide.addText(c.title, {
      x: cardX + 0.15,
      y: 4.95,
      w: 2.2,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: CRIMSON
    });

    slide.addText(c.desc, {
      x: cardX + 0.15,
      y: 5.25,
      w: 2.2,
      h: 0.65,
      fontSize: 10,
      fontFace: 'Arial',
      bold: true,
      color: WHITE
    });
  });
}

// =========================================================================
// SLIDE 2: THE PROBLEM & MARKET OPPORTUNITY
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Industry Challenges & The GoMeat Solution', 'The Opportunity');

  const pillars = [
    {
      num: '01',
      title: 'The Frozen Meat Illusion',
      problem: 'Conventional quick-commerce platforms deliver rock-frozen meat or defrosted cuts with broken cold-chains, destroying texture, moisture, and nutritional value.',
      solution: 'GoMeat Guarantee: 0°C to 4°C active chilled cold chain from depot to doorstep in under 90 minutes. Never rock frozen.'
    },
    {
      num: '02',
      title: 'Single-Use Styrofoam Waste',
      problem: 'Every standard meat order creates 1–2 kg of toxic thermocol and plastic bubble wrap waste that remains in city landfills for over 500 years.',
      solution: 'GoMeat ThermalVault: Reusable EPP insulated boxes with frozen gel bricks and a signature ₹250 refundable deposit returned instantly via UPI.'
    },
    {
      num: '03',
      title: 'Insecure & Tampered Checkouts',
      problem: 'Many small e-commerce stores rely on frontend price calculations, mock payment flows, or single static UPI QR codes prone to fraud.',
      solution: 'GoMeat Enterprise Security: Server-side MongoDB price lookups, HMAC SHA-256 signatures, and cryptographic Razorpay webhooks.'
    }
  ];

  pillars.forEach((p, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.7,
      w: 3.65,
      h: 4.8,
      rectRadius: 0.15,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 }
    });

    // Number tag
    slide.addText(p.num, {
      x: x + 0.3,
      y: 1.9,
      w: 1.5,
      h: 0.4,
      fontSize: 20,
      fontFace: 'Arial Black',
      color: CRIMSON
    });

    // Title
    slide.addText(p.title, {
      x: x + 0.3,
      y: 2.35,
      w: 3.05,
      h: 0.5,
      fontSize: 13,
      fontFace: 'Arial',
      bold: true,
      color: '0F172A'
    });

    // Problem box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.3,
      y: 2.95,
      w: 3.05,
      h: 1.5,
      fill: { color: 'FFF1F2' },
      line: { color: 'FECDD3', width: 0.5 }
    });

    slide.addText('CHALLENGE:', {
      x: x + 0.4,
      y: 3.05,
      w: 2.8,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: CRIMSON
    });

    slide.addText(p.problem, {
      x: x + 0.4,
      y: 3.3,
      w: 2.85,
      h: 1.05,
      fontSize: 9.5,
      fontFace: 'Arial',
      color: '881337',
      lineSpacing: 14
    });

    // Solution box
    slide.addShape(pptx.shapes.RECTANGLE, {
      x: x + 0.3,
      y: 4.6,
      w: 3.05,
      h: 1.6,
      fill: { color: 'ECFDF5' },
      line: { color: 'A7F3D0', width: 0.5 }
    });

    slide.addText('GOMEAT SOLUTION:', {
      x: x + 0.4,
      y: 4.7,
      w: 2.8,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: EMERALD
    });

    slide.addText(p.solution, {
      x: x + 0.4,
      y: 4.95,
      w: 2.85,
      h: 1.15,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: '065F46',
      lineSpacing: 14
    });
  });
}

// =========================================================================
// SLIDE 3: FULL SYSTEM ARCHITECTURE & TECH STACK
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Full-Stack Production System Architecture', 'Technical Architecture');

  // Architecture Diagram 4 Layers
  const layers = [
    {
      title: 'CLIENT LAYER (Frontend)',
      tech: 'React 19 • Vite • Tailwind CSS • Lucide Icons',
      items: [
        'Responsive mobile-first e-commerce UI (Framer-style)',
        'Ambient lighting mesh with live Dark/Light mode toggle',
        'State persistence for Cart, User Auth & Wishlist',
        'Dynamic script injection for Razorpay Standard Checkout SDK',
        'Interactive SVG Order Pipeline & IoT Temperature Probing'
      ]
    },
    {
      title: 'API & ROUTING LAYER',
      tech: 'Node.js Express • RESTful Endpoints • CORS Middleware',
      items: [
        'Raw body preservation for cryptographic Webhook validation',
        'JWT Authentication & Role-Based Access Control (RBAC)',
        '/api/payments (create-order, verify, webhook, status, refund)',
        '/api/orders (pipeline status transitions, customer cancel)',
        '/api/products (full CRUD, stock adjustments & category filters)'
      ]
    },
    {
      title: 'PAYMENT GATEWAY LAYER',
      tech: 'Razorpay SDK • HMAC-SHA256 • Cryptographic Webhooks',
      items: [
        'Server-side Razorpay order generation (paise precision)',
        'HMAC SHA-256 signature verification (order_id + "|" + payment_id)',
        'Automated idempotent payment capture & duplicate prevention',
        'Razorpay Refund API for ₹250 cold-box deposit reversals',
        'Multi-rail fallback: UPI (GPay, PhonePe, Paytm), Cards, COD'
      ]
    },
    {
      title: 'DATA PERSISTENCE LAYER',
      tech: 'MongoDB Atlas (Replica Set) • Mongoose • Dual-Engine Engine',
      items: [
        'MongoDB Atlas cloud cluster (sagarfresh database)',
        'Atomic inventory stock deduction upon confirmed payment',
        'Order snapshots (frozen product prices & full delivery address)',
        'Independent orderStatus vs paymentStatus state machines',
        'Dual-engine fallback: live MongoDB + zero-downtime local cache'
      ]
    }
  ];

  layers.forEach((l, idx) => {
    const x = 0.8 + idx * 2.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.7,
      w: 2.75,
      h: 4.8,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'CBD5E1', width: 1 }
    });

    // Header bar
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.7,
      w: 2.75,
      h: 0.85,
      rectRadius: 0.1,
      fill: { color: idx === 2 ? CRIMSON : idx === 3 ? '0F172A' : '334155' }
    });

    slide.addText(l.title, {
      x: x + 0.15,
      y: 1.8,
      w: 2.45,
      h: 0.35,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: WHITE
    });

    slide.addText(l.tech, {
      x: x + 0.15,
      y: 2.15,
      w: 2.45,
      h: 0.35,
      fontSize: 8,
      fontFace: 'Arial',
      color: 'E2E8F0'
    });

    // Bullet items
    l.items.forEach((item, i) => {
      slide.addText(`• ${item}`, {
        x: x + 0.15,
        y: 2.75 + i * 0.72,
        w: 2.45,
        h: 0.65,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: '334155',
        lineSpacing: 12
      });
    });
  });
}

// =========================================================================
// SLIDE 4: MODULE 1 - REAL RAZORPAY PAYMENT INTEGRATION
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 1: Real Razorpay Payment Gateway Integration', 'Payment Engineering');

  // Left side: Requirements & Flow
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 5.7,
    h: 4.9,
    rectRadius: 0.15,
    fill: { color: WHITE },
    line: { color: 'E2E8F0', width: 1 }
  });

  slide.addText('CORE BACKEND PAYMENT REQUIREMENTS MET', {
    x: 1.1,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: CRIMSON
  });

  const bullets = [
    { title: 'Server-Side Price Calculation', desc: 'Prices queried directly from MongoDB. Frontend submitted prices are strictly discarded to eliminate inspect-element tampering.' },
    { title: 'HMAC SHA-256 Signature Verification', desc: 'Crypto engine hashes (razorpay_order_id + "|" + razorpay_payment_id) with RAZORPAY_KEY_SECRET to guarantee authentic bank confirmation.' },
    { title: 'Raw Request Body Webhooks', desc: 'Configured express.json verify hook to retain req.rawBody, allowing accurate signature validation of x-razorpay-signature.' },
    { title: 'Idempotency & Duplicate Prevention', desc: 'Cached transaction states prevent duplicate debits, repeated order generation, or race-condition verification.' },
    { title: 'Multi-Rail Indian Payment Support', desc: 'Instant UPI (Google Pay, PhonePe, Paytm, QR Code), Cards (Visa/Mastercard/RuPay), Net Banking (50+ banks), and COD.' }
  ];

  bullets.forEach((b, i) => {
    slide.addText(b.title, {
      x: 1.1,
      y: 2.25 + i * 0.8,
      w: 5.1,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: '0F172A'
    });
    slide.addText(b.desc, {
      x: 1.1,
      y: 2.5 + i * 0.8,
      w: 5.1,
      h: 0.5,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: GRAY_TEXT,
      lineSpacing: 12
    });
  });

  // Right side: Architecture Diagram of Payment Flow
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.65,
    w: 5.7,
    h: 4.9,
    rectRadius: 0.15,
    fill: { color: SLATE_DARK },
    line: { color: '334155', width: 1 }
  });

  slide.addText('CRYPTOGRAPHIC PAYMENT FLOW SEQUENCE', {
    x: 7.1,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: 'FDA4AF'
  });

  const steps = [
    { step: '1', title: 'POST /api/payments/create-order', text: 'Backend validates stock, calculates item total + ₹250 deposit, and calls Razorpay SDK to create order_id.' },
    { step: '2', title: 'Razorpay Standard Checkout Modal', text: 'Client loads checkout.js and opens payment modal for user to pay via GPay, PhonePe, Card or NetBanking.' },
    { step: '3', title: 'POST /api/payments/verify', text: 'Client submits payment credentials. Node crypto verifies HMAC SHA-256 signature and Razorpay payment fetch status.' },
    { step: '4', title: 'Order State Transition to PAID', text: 'Atomically decrements product inventory, locks cold-box serial number, and transitions orderStatus to CONFIRMED.' }
  ];

  steps.forEach((s, i) => {
    const yPos = 2.3 + i * 1.0;
    slide.addShape(pptx.shapes.OVAL, {
      x: 7.1,
      y: yPos,
      w: 0.45,
      h: 0.45,
      fill: { color: CRIMSON }
    });
    slide.addText(s.step, {
      x: 7.1,
      y: yPos + 0.05,
      w: 0.45,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: WHITE,
      align: 'center'
    });
    slide.addText(s.title, {
      x: 7.7,
      y: yPos,
      w: 4.5,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: WHITE
    });
    slide.addText(s.text, {
      x: 7.7,
      y: yPos + 0.25,
      w: 4.5,
      h: 0.65,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: GRAY_LIGHT,
      lineSpacing: 12
    });
  });
}

// =========================================================================
// SLIDE 5: MODULE 2 & 3 - COMPLETE CHECKOUT & ORDER MANAGEMENT
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 2 & 3: Production Checkout & Order Lifecycle Engine', 'Checkout & Orders');

  // Left Column: Checkout Fields
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 5.7,
    h: 4.9,
    rectRadius: 0.15,
    fill: { color: WHITE },
    line: { color: 'E2E8F0', width: 1 }
  });

  slide.addText('MODULE 2: COMPLETE CHECKOUT SPECIFICATION', {
    x: 1.1,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: CRIMSON
  });

  const checkoutSections = [
    { title: '1. Contact Details Validation', desc: 'Full Name, Email Address (for automated FSSAI/GST invoices), and 10-digit Indian Mobile validation with real-time feedback.' },
    { title: '2. Delivery Slot Engine', desc: 'Choose between "⚡ Express 90 Mins Delivery" (hub immediate dispatch) and "📅 Scheduled Slots" (Today/Tomorrow morning & evening).' },
    { title: '3. Hierarchical Address Details', desc: 'Address tag (Home/Work/Other), Flat/House No, Society/Building Name, Street/Locality, City, State, and 6-digit Pincode.' },
    { title: '4. Delivery Instructions & Rider Tags', desc: 'Quick one-tap instructions: "Leave with security guard", "Do not ring bell (Sleeping baby)", plus custom landmark notes.' },
    { title: '5. Transparent Order Breakdown', desc: 'Items subtotal, ₹250 refundable cold-box deposit displayed separately, coupon discounts, express shipping fee, and final payable total.' }
  ];

  checkoutSections.forEach((c, idx) => {
    slide.addText(c.title, {
      x: 1.1,
      y: 2.25 + idx * 0.8,
      w: 5.1,
      h: 0.25,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: '0F172A'
    });
    slide.addText(c.desc, {
      x: 1.1,
      y: 2.5 + idx * 0.8,
      w: 5.1,
      h: 0.5,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: GRAY_TEXT,
      lineSpacing: 12
    });
  });

  // Right Column: Order Model & Independent Status Engine
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 6.8,
    y: 1.65,
    w: 5.7,
    h: 4.9,
    rectRadius: 0.15,
    fill: { color: WHITE },
    line: { color: 'E2E8F0', width: 1 }
  });

  slide.addText('MODULE 3: INDEPENDENT STATUS LIFECYCLE', {
    x: 7.1,
    y: 1.85,
    w: 5.1,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: '0F172A'
  });

  slide.addText('Order Status and Payment Status are decoupled and managed independently to handle webhooks, retries, and refunds safely.', {
    x: 7.1,
    y: 2.15,
    w: 5.1,
    h: 0.45,
    fontSize: 9,
    fontFace: 'Arial',
    color: GRAY_TEXT
  });

  // Pipeline Status Boxes
  const stages = [
    { name: '1. PENDING', desc: 'Order created; awaiting payment verification' },
    { name: '2. CONFIRMED', desc: 'Payment verified; order queued at dark depot' },
    { name: '3. PREPARING', desc: 'Master butchers precision trimming fresh cuts' },
    { name: '4. QUALITY_CHECK', desc: '150-point bio-security, FSSAI assay & 0°C probe' },
    { name: '5. PACKED', desc: 'Sealed inside ThermalVault with sub-zero gel' },
    { name: '6. OUT_FOR_DELIVERY', desc: 'En route with cold-chain EV fleet partner' },
    { name: '7. DELIVERED', desc: 'Handed over; ₹250 refundable deposit logged' }
  ];

  stages.forEach((st, idx) => {
    const y = 2.65 + idx * 0.52;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 7.1,
      y,
      w: 2.1,
      h: 0.42,
      rectRadius: 0.05,
      fill: { color: idx === 6 ? EMERALD : idx === 1 ? CRIMSON : 'F1F5F9' },
      line: { color: idx === 6 ? EMERALD : idx === 1 ? CRIMSON : 'CBD5E1', width: 1 }
    });

    slide.addText(st.name, {
      x: 7.2,
      y: y + 0.06,
      w: 1.9,
      h: 0.3,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: idx === 6 || idx === 1 ? WHITE : '0F172A'
    });

    slide.addText(st.desc, {
      x: 9.35,
      y: y + 0.06,
      w: 2.9,
      h: 0.35,
      fontSize: 8,
      fontFace: 'Arial',
      color: '475569'
    });
  });
}

// =========================================================================
// SLIDE 6: MODULE 4 - CUSTOMER DASHBOARD
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 4: Customer Dashboard Experience', 'Customer Portal');

  const sections = [
    {
      title: '1. My Profile',
      desc: 'Customer details, phone number, default delivery city, verified Google Auth badge, and active refundable deposit held.'
    },
    {
      title: '2. My Orders History',
      desc: 'Complete order log with order numbers, item snapshots, delivery timestamps, live status badges, and 1-click reordering.'
    },
    {
      title: '3. Order Details & Telemetry',
      desc: 'Itemized price breakdown, cut specifications, allocated courier contact details, and continuous IoT cold-chain temperature logs.'
    },
    {
      title: '4. Payment History Ledger',
      desc: 'Transparent ledger of all transactions with Razorpay Payment IDs, payment methods (UPI/Card/COD), and refund states.'
    },
    {
      title: '5. Wishlist Management',
      desc: 'Heart-tagged favorite seafood and meat cuts stored across sessions with 1-click "Add to Cold Box" instant ordering.'
    },
    {
      title: '6. Saved Addresses & Pickup',
      desc: 'Multiple delivery address profiles with flat, building, society and PIN code for fast checkout.'
    },
    {
      title: '7. Cold-Box Returns Portal',
      desc: 'Track circulating ThermalVault boxes and request free doorstep pickup with instant ₹250 UPI deposit refund.'
    },
    {
      title: '8. FSSAI & GST Tax Invoices',
      desc: 'Automated 1-click invoice generator formatted to commercial accounting standards with print/PDF preview.'
    }
  ];

  sections.forEach((sec, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 0.8 + col * 2.95;
    const y = 1.7 + row * 2.45;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.75,
      h: 2.25,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addText(sec.title, {
      x: x + 0.2,
      y: y + 0.2,
      w: 2.35,
      h: 0.35,
      fontSize: 10.5,
      fontFace: 'Arial',
      bold: true,
      color: CRIMSON
    });

    slide.addText(sec.desc, {
      x: x + 0.2,
      y: y + 0.6,
      w: 2.35,
      h: 1.45,
      fontSize: 9,
      fontFace: 'Arial',
      color: '334155',
      lineSpacing: 14
    });
  });
}

// =========================================================================
// SLIDE 7: MODULE 5 - ORDER TRACKING & IOT COLD TELEMETRY
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 5: Status-Based Tracking & Active Cold-Chain Telemetry', 'Live Tracking');

  // Left Card: 6-Stage Timeline
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 1.65,
    w: 6.8,
    h: 4.9,
    rectRadius: 0.15,
    fill: { color: WHITE },
    line: { color: 'E2E8F0', width: 1 }
  });

  slide.addText('STATUS-BASED 6-STAGE TIMELINE (NO FAKE GPS)', {
    x: 1.1,
    y: 1.85,
    w: 6.2,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: CRIMSON
  });

  slide.addText('Per prompt requirements: Implemented verified operational status milestones with dynamic ETA instead of simulated GPS animations.', {
    x: 1.1,
    y: 2.15,
    w: 6.2,
    h: 0.45,
    fontSize: 9,
    fontFace: 'Arial',
    color: GRAY_TEXT
  });

  const timelineSteps = [
    { title: 'Order Confirmed', time: '0-10 Mins', detail: 'Central depot validates payment and queues cuts for master butchery.' },
    { title: 'Preparing Your Order', time: '10-25 Mins', detail: 'Master butchers precision-trim, bone, and portion cuts in RO sanitized rooms.' },
    { title: 'Quality Check', time: '25-35 Mins', detail: '150-point FSSAI inspection, digital weigh-in, and microbial cold assurance.' },
    { title: 'Packed in Cold Box', time: '35-50 Mins', detail: 'Sealed inside ThermalVault with frozen gel packs; digital lock engaged.' },
    { title: 'Out for Delivery', time: '50-75 Mins', detail: 'Assigned to EV cold-chain partner heading directly to your doorstep.' },
    { title: 'Delivered', time: 'Within 90 Mins', detail: 'Handed over chilled at 0°C–4°C; box return scheduled or kept for reuse.' }
  ];

  timelineSteps.forEach((t, i) => {
    const yPos = 2.65 + i * 0.62;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 1.1,
      y: yPos,
      w: 6.2,
      h: 0.52,
      rectRadius: 0.05,
      fill: { color: 'F8FAFC' },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addText(`${i + 1}`, {
      x: 1.25,
      y: yPos + 0.1,
      w: 0.35,
      h: 0.32,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: CRIMSON
    });

    slide.addText(t.title, {
      x: 1.65,
      y: yPos + 0.08,
      w: 2.1,
      h: 0.22,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: '0F172A'
    });

    slide.addText(t.time, {
      x: 1.65,
      y: yPos + 0.28,
      w: 2.1,
      h: 0.2,
      fontSize: 8,
      fontFace: 'Arial',
      bold: true,
      color: EMERALD
    });

    slide.addText(t.detail, {
      x: 3.8,
      y: yPos + 0.08,
      w: 3.3,
      h: 0.38,
      fontSize: 8,
      fontFace: 'Arial',
      color: GRAY_TEXT,
      lineSpacing: 11
    });
  });

  // Right Card: IoT Cold-Chain Readout
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 7.9,
    y: 1.65,
    w: 4.6,
    h: 4.9,
    rectRadius: 0.15,
    fill: { color: SLATE_DARK },
    line: { color: '334155', width: 1 }
  });

  slide.addText('IOT CORE TEMPERATURE READOUT', {
    x: 8.2,
    y: 1.85,
    w: 4.0,
    h: 0.3,
    fontSize: 11,
    fontFace: 'Arial',
    bold: true,
    color: '34D399'
  });

  // Large Temp Display
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 8.2,
    y: 2.3,
    w: 4.0,
    h: 1.5,
    rectRadius: 0.1,
    fill: { color: '131C31' },
    line: { color: '059669', width: 1.5 }
  });

  slide.addText('0.8°C - 2.3°C', {
    x: 8.3,
    y: 2.45,
    w: 3.8,
    h: 0.7,
    fontSize: 32,
    fontFace: 'Arial Black',
    color: '34D399',
    align: 'center'
  });

  slide.addText('ACTIVE SAFE FRESHZONE • NEVER FROZEN', {
    x: 8.3,
    y: 3.25,
    w: 3.8,
    h: 0.3,
    fontSize: 8.5,
    fontFace: 'Arial',
    bold: true,
    color: WHITE,
    align: 'center'
  });

  // Telemetry items
  const teleItems = [
    { label: 'ThermalVault Packaging', val: 'EPP Sub-Zero Ice Gels Intact' },
    { label: 'Delivery Partner Contact', val: 'Ramesh Kumar (EV Fleet #12)' },
    { label: 'Direct Actions', val: '1-Tap Call Courier & WhatsApp Fleet' },
    { label: 'Digital Lock Security', val: 'Tamper-Evident FreshSeal #FS-8492' }
  ];

  teleItems.forEach((it, idx) => {
    const y = 4.0 + idx * 0.58;
    slide.addText(it.label.toUpperCase(), {
      x: 8.2,
      y,
      w: 4.0,
      h: 0.2,
      fontSize: 7.5,
      fontFace: 'Arial',
      bold: true,
      color: GRAY_LIGHT
    });
    slide.addText(it.val, {
      x: 8.2,
      y: y + 0.18,
      w: 4.0,
      h: 0.25,
      fontSize: 9,
      fontFace: 'Arial',
      bold: true,
      color: WHITE
    });
  });
}

// =========================================================================
// SLIDE 8: MODULE 6 - COLD-BOX DEPOSIT & REFUND WORKFLOW
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 6: Signature ₹250 Refundable Cold-Box System', 'Circular Packaging');

  const steps = [
    {
      phase: 'STAGE 1: CHECKOUT',
      title: 'Transparent Deposit Billing',
      desc: 'A refundable ₹250 security deposit is itemized separately at checkout and clearly printed on the GST/FSSAI tax invoice.'
    },
    {
      phase: 'STAGE 2: DELIVERY',
      title: 'ThermalVault Handover',
      desc: 'Customer receives fresh cuts in sanitized ThermalVault box. Customer may choose to keep the box or return it on the spot.'
    },
    {
      phase: 'STAGE 3: INITIATION',
      title: '1-Click Return Request',
      desc: 'Customer opens Dashboard and clicks "Schedule Box Return". Customer selects preferred pickup slot and enters UPI ID.'
    },
    {
      phase: 'STAGE 4: DEPOT AUDIT',
      title: 'Sanitization & Quality Verification',
      desc: 'Hub logistics team inspects the returned EPP box, cleans surfaces with food-grade sanitization, and verifies gel bricks.'
    },
    {
      phase: 'STAGE 5: EXECUTION',
      title: 'Automated Razorpay Refund',
      desc: 'Admin approves return in 1 click via /api/payments/refund-coldbox. Razorpay API executes genuine ₹250 refund to source account.'
    },
    {
      phase: 'STAGE 6: AUDIT TRAIL',
      title: 'Duplicate Reversal Prevention',
      desc: 'System logs refundTxnId and transitions state to REFUNDED. Subsequent attempts return 400 Bad Request to prevent double refunds.'
    }
  ];

  steps.forEach((s, idx) => {
    const col = idx % 3;
    const row = Math.floor(idx / 3);
    const x = 0.8 + col * 3.9;
    const y = 1.7 + row * 2.45;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 3.65,
      h: 2.25,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addText(s.phase, {
      x: x + 0.2,
      y: y + 0.2,
      w: 3.25,
      h: 0.25,
      fontSize: 8.5,
      fontFace: 'Arial',
      bold: true,
      color: CRIMSON
    });

    slide.addText(s.title, {
      x: x + 0.2,
      y: y + 0.48,
      w: 3.25,
      h: 0.35,
      fontSize: 11,
      fontFace: 'Arial',
      bold: true,
      color: '0F172A'
    });

    slide.addText(s.desc, {
      x: x + 0.2,
      y: y + 0.85,
      w: 3.25,
      h: 1.25,
      fontSize: 9,
      fontFace: 'Arial',
      color: '475569',
      lineSpacing: 14
    });
  });
}

// =========================================================================
// SLIDE 9: MODULE 7 - CENTRAL OPERATIONS ADMIN DASHBOARD
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 7: Central Hub Operations Control Room', 'Admin Operations');

  // Top Row: 6 KPI Cards
  const kpis = [
    { title: 'Total Revenue', val: '₹1,48,500', color: EMERALD },
    { title: 'Total Orders', val: '142 Orders', color: CRIMSON },
    { title: 'Active In-Transit', val: '24 Orders', color: AMBER },
    { title: 'Delivered SLA', val: '118 Orders', color: EMERALD },
    { title: 'Unique Customers', val: '86 Profiles', color: '2563EB' },
    { title: 'Verified Payments', val: '100% SHA256', color: '7C3AED' }
  ];

  kpis.forEach((k, idx) => {
    const x = 0.8 + idx * 1.95;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 1.65,
      w: 1.8,
      h: 1.15,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addText(k.title, {
      x: x + 0.1,
      y: 1.75,
      w: 1.6,
      h: 0.25,
      fontSize: 8,
      fontFace: 'Arial',
      bold: true,
      color: GRAY_TEXT
    });

    slide.addText(k.val, {
      x: x + 0.1,
      y: 2.05,
      w: 1.6,
      h: 0.5,
      fontSize: 14,
      fontFace: 'Arial',
      bold: true,
      color: k.color
    });
  });

  // 3 Feature Cards Below
  const adminModules = [
    {
      title: 'Order Pipeline & Dispatch Management',
      color: CRIMSON,
      bullets: [
        'Live search by Order ID, Customer Name, Mobile Number',
        '7-stage pipeline dropdown updater (PENDING to DELIVERED)',
        'Immediate customer synchronization and SMS/WhatsApp trigger',
        'Payment transaction ID & Razorpay Order status verification',
        'Order cancellation with automatic cold storage restocking'
      ]
    },
    {
      title: 'Inventory & Low-Stock Alerts Engine',
      color: AMBER,
      bullets: [
        'Real-time automated low-stock warnings for items < 10 units',
        'Critical alert banner identifying impending stockouts',
        'Quick +/- inline stock adjuster (+5, +10, +50 bulk add)',
        'Add fresh cuts with image URLs, weights, cuts and pieces',
        'Deactivate unavailable cuts to prevent checkout failures'
      ]
    },
    {
      title: 'Payment & Cold-Box Refund Execution',
      color: EMERALD,
      bullets: [
        'Complete Razorpay payment transaction ledger',
        'Separate accounting for ₹250 refundable box deposits',
        '1-click "Refund ₹250" trigger calling Razorpay API directly',
        'Automated idempotent refund logging (refundTxnId)',
        'Circulating ThermalVault fleet tracking (available vs customer)'
      ]
    }
  ];

  adminModules.forEach((m, idx) => {
    const x = 0.8 + idx * 3.9;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 3.05,
      w: 3.65,
      h: 3.5,
      rectRadius: 0.15,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 3.05,
      w: 3.65,
      h: 0.6,
      rectRadius: 0.15,
      fill: { color: m.color }
    });

    slide.addText(m.title, {
      x: x + 0.2,
      y: 3.15,
      w: 3.25,
      h: 0.4,
      fontSize: 9.5,
      fontFace: 'Arial',
      bold: true,
      color: WHITE
    });

    m.bullets.forEach((b, i) => {
      slide.addText(`• ${b}`, {
        x: x + 0.2,
        y: 3.8 + i * 0.52,
        w: 3.25,
        h: 0.48,
        fontSize: 8.5,
        fontFace: 'Arial',
        color: '334155',
        lineSpacing: 12
      });
    });
  });
}

// =========================================================================
// SLIDE 10: MODULE 8 & 9 - CUSTOMER EXPERIENCE & PREMIUM UI/UX
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 8 & 9: Premium UI/UX & Customer Experience', 'UI/UX Engineering');

  const uxFeatures = [
    {
      title: 'Multi-Criteria Sorting',
      desc: 'Sort cuts by Featured, Price (Low to High), Price (High to Low), or Highest Discount % for quick shopping.'
    },
    {
      title: 'Price Budget Pills',
      desc: 'One-tap budget filtering: All Prices, Under ₹300, Under ₹500, and Premium ₹500+ cuts.'
    },
    {
      title: 'Wishlist Heart Persistence',
      desc: 'Toggle favorites on product cards and detail modals; persists across browser reloads via localStorage.'
    },
    {
      title: 'Instant Toast Feedback',
      desc: 'Non-intrusive floating toasts notify users of cart additions, wishlist updates, and status updates.'
    },
    {
      title: 'Ambient Lighting & Dark Mode',
      desc: 'Lush dark/light themes with luminous radial mesh glowing orbs and neon card-hover effects.'
    },
    {
      title: 'Custom Butchery Options',
      desc: 'Detail modal lets users select custom cuts: Curry Cut, Biryani Cut, Boneless Fillet, or Hand-Minced Keema.'
    },
    {
      title: 'Zero Upfront Login Barrier',
      desc: 'Users explore and customize freely; Google Sign-In or credentials only prompted at final checkout.'
    },
    {
      title: 'Non-Destructive Back Button',
      desc: 'Browser history sync ensures pressing "Back" retreats exactly 1 modal/tab instead of exiting the website.'
    }
  ];

  uxFeatures.forEach((f, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const x = 0.8 + col * 2.95;
    const y = 1.7 + row * 2.45;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y,
      w: 2.75,
      h: 2.25,
      rectRadius: 0.1,
      fill: { color: WHITE },
      line: { color: 'E2E8F0', width: 1 }
    });

    slide.addText(f.title, {
      x: x + 0.2,
      y: y + 0.2,
      w: 2.35,
      h: 0.35,
      fontSize: 10.5,
      fontFace: 'Arial',
      bold: true,
      color: CRIMSON
    });

    slide.addText(f.desc, {
      x: x + 0.2,
      y: y + 0.6,
      w: 2.35,
      h: 1.45,
      fontSize: 9,
      fontFace: 'Arial',
      color: '334155',
      lineSpacing: 14
    });
  });
}

// =========================================================================
// SLIDE 11: MODULE 10 - SECURITY, VERIFICATION & TESTING
// =========================================================================
{
  const slide = pptx.addSlide();
  addSlideHeader(slide, 'Module 10: Security Engineering & End-to-End Test Matrix', 'Security & Testing');

  // Table of Test Results
  const testRows = [
    [
      { text: 'Test Scenario', options: { bold: true, fill: { color: '0F172A' }, color: WHITE, fontSize: 9 } },
      { text: 'Test Methodology', options: { bold: true, fill: { color: '0F172A' }, color: WHITE, fontSize: 9 } },
      { text: 'Result & Observation', options: { bold: true, fill: { color: '0F172A' }, color: WHITE, fontSize: 9 } },
      { text: 'Status', options: { bold: true, fill: { color: '0F172A' }, color: WHITE, fontSize: 9 } }
    ],
    [
      { text: 'Server-Side Price Calculation', options: { bold: true, fontSize: 8.5 } },
      { text: 'Submitted fake price & nonexistent prod_chicken_curry ID', options: { fontSize: 8 } },
      { text: 'Backend rejected untrusted price; calculated exact DB total (2x ₹289 + ₹250 = ₹868)', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ],
    [
      { text: 'HMAC SHA-256 Verification', options: { bold: true, fontSize: 8.5 } },
      { text: 'Crypto hash verification on POST /api/payments/verify', options: { fontSize: 8 } },
      { text: 'Signature matched; transitioned order GOM-280363 to PAID & CONFIRMED', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ],
    [
      { text: 'Idempotency Check', options: { bold: true, fontSize: 8.5 } },
      { text: 'Re-called verification API on already PAID order', options: { fontSize: 8 } },
      { text: 'Returned 200 OK with cached order without creating duplicates', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ],
    [
      { text: 'Razorpay Cold-Box Refund', options: { bold: true, fontSize: 8.5 } },
      { text: 'POST /api/payments/refund-coldbox on order GOM-280363', options: { fontSize: 8 } },
      { text: 'Generated refundId rfnd_df866178; status updated to REFUNDED', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ],
    [
      { text: 'Duplicate Refund Prevention', options: { bold: true, fontSize: 8.5 } },
      { text: 'Attempted second refund call on same order', options: { fontSize: 8 } },
      { text: 'Blocked with 400 Bad Request: "₹250 deposit already refunded"', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ],
    [
      { text: 'Client TypeScript Build', options: { bold: true, fontSize: 8.5 } },
      { text: 'Executed tsc -b && vite build across 2052 modules', options: { fontSize: 8 } },
      { text: 'Zero compiler errors; built dist bundle in 2.56 seconds', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ],
    [
      { text: 'Live Vercel Health Check', options: { bold: true, fontSize: 8.5 } },
      { text: 'Queried GET /api/health on production Vercel deployment', options: { fontSize: 8 } },
      { text: 'HTTP 200 OK {"status":"ok","name":"GoMeat API"} uptime verified', options: { fontSize: 8 } },
      { text: 'PASSED', options: { bold: true, color: EMERALD, fontSize: 8.5 } }
    ]
  ];

  slide.addTable(testRows, {
    x: 0.8,
    y: 1.7,
    w: 11.7,
    h: 4.8,
    colW: [2.5, 3.2, 4.8, 1.2],
    border: { color: 'CBD5E1', width: 0.5 },
    fill: { color: WHITE }
  });
}

// =========================================================================
// SLIDE 12: BUSINESS IMPACT & CONCLUSION
// =========================================================================
{
  const slide = pptx.addSlide();
  slide.background = { color: SLATE_DARK };

  // Decorative glow box
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.8,
    y: 0.8,
    w: 11.7,
    h: 5.9,
    rectRadius: 0.2,
    fill: { color: '131C31' },
    line: { color: '273553', width: 1.5 }
  });

  slide.addText('BUSINESS IMPACT & SUMMARY', {
    x: 1.3,
    y: 1.2,
    w: 8.5,
    h: 0.3,
    fontSize: 10,
    fontFace: 'Arial',
    bold: true,
    color: CRIMSON,
    letterSpacing: 2
  });

  slide.addText('A Truly Sustainable, Scalable Meat E-Commerce Platform', {
    x: 1.3,
    y: 1.5,
    w: 10.5,
    h: 0.6,
    fontSize: 24,
    fontFace: 'Arial',
    bold: true,
    color: WHITE
  });

  const impactStats = [
    { num: '0 kg', title: 'Single-Use Styrofoam Waste', desc: '100% circular packaging eliminates disposable thermocol and bubble wrap.' },
    { num: '90 Mins', title: 'Hyperlocal Delivery', desc: 'Active chilled 0°C–4°C cold chain dispatched directly from neighborhood hub depots.' },
    { num: '100%', title: 'Tamper-Proof Payments', desc: 'Cryptographic SHA-256 signatures, server-calculated totals, and bank-grade APIs.' },
    { num: '1-Click', title: 'Automated UPI Refunds', desc: 'Instant ₹250 cold-box deposit reversals powered directly by the Razorpay Refund API.' }
  ];

  impactStats.forEach((st, idx) => {
    const x = 1.3 + idx * 2.7;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x,
      y: 2.35,
      w: 2.5,
      h: 2.3,
      rectRadius: 0.15,
      fill: { color: SLATE_CARD },
      line: { color: '334155', width: 1 }
    });

    slide.addText(st.num, {
      x: x + 0.15,
      y: 2.55,
      w: 2.2,
      h: 0.55,
      fontSize: 26,
      fontFace: 'Arial Black',
      color: CRIMSON
    });

    slide.addText(st.title, {
      x: x + 0.15,
      y: 3.15,
      w: 2.2,
      h: 0.45,
      fontSize: 10.5,
      fontFace: 'Arial',
      bold: true,
      color: WHITE
    });

    slide.addText(st.desc, {
      x: x + 0.15,
      y: 3.65,
      w: 2.2,
      h: 0.85,
      fontSize: 8.5,
      fontFace: 'Arial',
      color: GRAY_LIGHT,
      lineSpacing: 13
    });
  });

  // Bottom Links Callout
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 1.3,
    y: 4.95,
    w: 10.6,
    h: 1.3,
    rectRadius: 0.1,
    fill: { color: '0F172A' },
    line: { color: '334155', width: 1 }
  });

  slide.addText('LIVE PRODUCTION DEPLOYMENT & REPOSITORY LINKS', {
    x: 1.6,
    y: 5.1,
    w: 10.0,
    h: 0.25,
    fontSize: 9,
    fontFace: 'Arial',
    bold: true,
    color: '38BDF8'
  });

  slide.addText(
    '• Live Website: https://gomeat-git-main-dhinesh-s-projects1.vercel.app\n• API Production Health: https://gomeat-git-main-dhinesh-s-projects1.vercel.app/api/health\n• GitHub Repository: https://github.com/Dhinesh1628/sagarfresh (Branch: main)',
    {
      x: 1.6,
      y: 5.38,
      w: 10.0,
      h: 0.75,
      fontSize: 9,
      fontFace: 'Courier New',
      color: WHITE,
      lineSpacing: 14
    }
  );
}

// Generate Presentation File
const outputPath = path.resolve('GoMeat_Full_Production_Presentation.pptx');
pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`[SUCCESS] PowerPoint slides generated at: ${outputPath}`);
  })
  .catch(err => {
    console.error('[ERROR] Failed to generate slides:', err);
    process.exit(1);
  });
