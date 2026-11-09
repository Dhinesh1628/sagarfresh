import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const diagramsDir = path.join(__dirname, 'diagrams');

if (!fs.existsSync(diagramsDir)) {
  fs.mkdirSync(diagramsDir, { recursive: true });
}

// 1. Overall MERN Architecture
const d1 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrowRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981"/>
    </marker>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bg)" stroke="#334155" stroke-width="1.5"/>

  <!-- Title -->
  <text x="40" y="48" font-family="system-ui, sans-serif" font-size="20" font-weight="800" fill="#f8fafc">GoMeat Full-Stack MERN System Architecture</text>
  <text x="40" y="70" font-family="system-ui, sans-serif" font-size="12" fill="#94a3b8">End-to-End Component Boundaries, Protocol Interfaces, and Data Flow</text>

  <!-- Client Layer -->
  <rect x="40" y="100" width="250" height="340" rx="12" fill="url(#cardGrad)" stroke="#38bdf8" stroke-width="1.5"/>
  <rect x="52" y="112" width="226" height="32" rx="6" fill="#0284c7" fill-opacity="0.2"/>
  <text x="64" y="133" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#38bdf8">Frontend: React 18 + Vite</text>
  
  <rect x="52" y="156" width="226" height="48" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="64" y="176" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">UI Views &amp; SPA Routing</text>
  <text x="64" y="193" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">Catalog, Tracking, Hub Ops, Returns</text>

  <rect x="52" y="214" width="226" height="48" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="64" y="234" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">State Contexts (Auth, Cart)</text>
  <text x="64" y="251" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">JWT Token Storage, Cart Calculation</text>

  <rect x="52" y="272" width="226" height="48" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="64" y="292" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">Client SDKs &amp; Modules</text>
  <text x="64" y="309" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">Razorpay Checkout Modal, Invoicing</text>

  <rect x="52" y="330" width="226" height="96" rx="6" fill="#0284c7" fill-opacity="0.1" stroke="#0284c7" stroke-dasharray="3 3"/>
  <text x="64" y="352" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">Edge CDN Hosting</text>
  <text x="64" y="372" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Vercel Global Edge Network</text>
  <text x="64" y="390" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Automated Git Main CI/CD</text>
  <text x="64" y="408" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">Brotli/Gzip Assets Delivery</text>

  <!-- Connectors Frontend -> Backend -->
  <path d="M 290 180 L 370 180" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="300" y="170" font-family="system-ui, sans-serif" font-size="9" fill="#38bdf8">REST HTTPS</text>

  <path d="M 370 210 L 290 210" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#arrow)"/>
  <text x="302" y="225" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">JSON DTO</text>

  <!-- Backend Layer -->
  <rect x="370" y="100" width="260" height="340" rx="12" fill="url(#cardGrad)" stroke="#10b981" stroke-width="1.5"/>
  <rect x="382" y="112" width="236" height="32" rx="6" fill="#059669" fill-opacity="0.2"/>
  <text x="394" y="133" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#34d399">Backend: Node.js + Express</text>

  <rect x="382" y="156" width="236" height="52" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="394" y="176" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">Cryptographic Router</text>
  <text x="394" y="193" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">rawBody Preservation for Webhooks</text>
  <text x="394" y="204" font-family="system-ui, sans-serif" font-size="9" fill="#10b981">crypto.createHmac('sha256')</text>

  <rect x="382" y="218" width="236" height="52" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="394" y="238" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">State Machine &amp; Pricing Engine</text>
  <text x="394" y="255" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">Server-authoritative Price Recalculation</text>
  <text x="394" y="266" font-family="system-ui, sans-serif" font-size="9" fill="#f59e0b">Zero trust on client-submitted prices</text>

  <rect x="382" y="280" width="236" height="52" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="394" y="300" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">Auth &amp; RBAC Middleware</text>
  <text x="394" y="317" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">JWT 7-day Tokens, Role Inspection</text>
  <text x="394" y="328" font-family="system-ui, sans-serif" font-size="9" fill="#38bdf8">requireAdmin &amp; authenticate</text>

  <rect x="382" y="342" width="236" height="84" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="394" y="362" font-family="system-ui, sans-serif" font-size="11" font-weight="600" fill="#f1f5f9">Persistence Abstraction Layer</text>
  <text x="394" y="380" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">Mongoose ODM + Multi-Model Sync</text>
  <text x="394" y="396" font-family="system-ui, sans-serif" font-size="10" fill="#64748b">Fallback High-Speed In-Memory Cache</text>
  <text x="394" y="414" font-family="system-ui, sans-serif" font-size="9" fill="#10b981">Auto-reconnection logic on drop</text>

  <!-- Connectors Backend -> Database -->
  <path d="M 630 200 L 710 200" stroke="#10b981" stroke-width="2" marker-end="url(#arrowGreen)"/>
  <text x="640" y="190" font-family="system-ui, sans-serif" font-size="9" fill="#10b981">Mongoose</text>

  <path d="M 710 230 L 630 230" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#arrow)"/>
  <text x="645" y="245" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">BSON Docs</text>

  <!-- Database Layer -->
  <rect x="710" y="100" width="210" height="340" rx="12" fill="url(#cardGrad)" stroke="#10b981" stroke-width="1.5"/>
  <rect x="722" y="112" width="186" height="32" rx="6" fill="#059669" fill-opacity="0.2"/>
  <text x="734" y="133" font-family="system-ui, sans-serif" font-size="14" font-weight="700" fill="#34d399">MongoDB Atlas Cloud</text>

  <rect x="722" y="156" width="186" height="42" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="732" y="174" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Users Collection</text>
  <text x="732" y="189" font-family="system-ui, sans-serif" font-size="9" fill="#64748b">Auth, Roles, Balances, UPI</text>

  <rect x="722" y="206" width="186" height="42" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="732" y="224" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Products Collection</text>
  <text x="732" y="239" font-family="system-ui, sans-serif" font-size="9" fill="#64748b">Prices, Stock, Weights, Cuts</text>

  <rect x="722" y="256" width="186" height="42" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="732" y="274" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Orders Collection</text>
  <text x="732" y="289" font-family="system-ui, sans-serif" font-size="9" fill="#64748b">Item Snapshots, State Machines</text>

  <rect x="722" y="306" width="186" height="42" rx="6" fill="#0f172a" stroke="#334155"/>
  <text x="732" y="324" font-family="system-ui, sans-serif" font-size="10" font-weight="600" fill="#f1f5f9">Coolers Fleet Collection</text>
  <text x="732" y="339" font-family="system-ui, sans-serif" font-size="9" fill="#64748b">ThermalVault Barcodes &amp; Cycles</text>

  <rect x="722" y="356" width="186" height="70" rx="6" fill="#059669" fill-opacity="0.1" stroke="#059669" stroke-dasharray="3 3"/>
  <text x="732" y="376" font-family="system-ui, sans-serif" font-size="10" font-weight="700" fill="#34d399">Cluster Resilience</text>
  <text x="732" y="393" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">3-Node Replica Set</text>
  <text x="732" y="408" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8">Automated Failover &amp; TLS 1.3</text>
</svg>`;

// 2. Razorpay Payment Sequence Diagram
const d2 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 520" width="100%" height="100%">
  <defs>
    <linearGradient id="bg2" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <marker id="arrB" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrG" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981"/>
    </marker>
    <marker id="arrR" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
    <marker id="arrA" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b"/>
    </marker>
  </defs>

  <rect width="960" height="520" rx="16" fill="url(#bg2)" stroke="#334155" stroke-width="1.5"/>

  <!-- Title -->
  <text x="40" y="40" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#f8fafc">Razorpay Cryptographic Checkout &amp; Webhook Lifecycle Sequence</text>
  <text x="40" y="60" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Zero-Trust Server Price Recalculation + HMAC SHA-256 Dual Verification Flow</text>

  <!-- Lifeline Columns -->
  <!-- Col 1: Customer Browser -->
  <rect x="50" y="80" width="140" height="34" rx="6" fill="#1e293b" stroke="#38bdf8"/>
  <text x="120" y="102" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8" text-anchor="middle">Customer Client</text>
  <line x1="120" y1="114" x2="120" y2="480" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Col 2: GoMeat Express API -->
  <rect x="250" y="80" width="160" height="34" rx="6" fill="#1e293b" stroke="#10b981"/>
  <text x="330" y="102" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#34d399" text-anchor="middle">GoMeat Express Server</text>
  <line x1="330" y1="114" x2="330" y2="480" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Col 3: MongoDB Atlas -->
  <rect x="470" y="80" width="140" height="34" rx="6" fill="#1e293b" stroke="#059669"/>
  <text x="540" y="102" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#6ee7b7" text-anchor="middle">MongoDB Atlas</text>
  <line x1="540" y1="114" x2="540" y2="480" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Col 4: Razorpay Orders API -->
  <rect x="670" y="80" width="140" height="34" rx="6" fill="#1e293b" stroke="#f59e0b"/>
  <text x="740" y="102" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#fbbf24" text-anchor="middle">Razorpay API Gateway</text>
  <line x1="740" y1="114" x2="740" y2="480" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Col 5: Razorpay Webhook Engine -->
  <rect x="830" y="80" width="110" height="34" rx="6" fill="#1e293b" stroke="#f43f5e"/>
  <text x="885" y="102" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#fb7185" text-anchor="middle">Webhook Engine</text>
  <line x1="885" y1="114" x2="885" y2="480" stroke="#334155" stroke-dasharray="4 4"/>

  <!-- Step 1: POST create-order -->
  <line x1="120" y1="140" x2="320" y2="140" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrB)"/>
  <text x="210" y="133" font-family="system-ui, sans-serif" font-size="10" fill="#38bdf8" text-anchor="middle">1. POST /api/payments/create-order {items: [{id, qty}]}</text>

  <!-- Step 2: Query DB -->
  <line x1="330" y1="165" x2="530" y2="165" stroke="#10b981" stroke-width="2" marker-end="url(#arrG)"/>
  <text x="430" y="158" font-family="system-ui, sans-serif" font-size="10" fill="#10b981" text-anchor="middle">2. Product.find({ _id: { $in: ids } })</text>

  <!-- Step 3: Authoritative Price Return -->
  <line x1="530" y1="190" x2="340" y2="190" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrB)"/>
  <text x="430" y="184" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">3. Authoritative DB unit prices</text>

  <!-- Server Note -->
  <rect x="270" y="202" width="120" height="26" rx="4" fill="#0284c7" fill-opacity="0.15" stroke="#38bdf8"/>
  <text x="330" y="218" font-family="system-ui, sans-serif" font-size="9" fill="#38bdf8" text-anchor="middle">Recalc total + ₹250 Deposit</text>

  <!-- Step 4: Razorpay Orders Create -->
  <line x1="330" y1="242" x2="730" y2="242" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrA)"/>
  <text x="530" y="236" font-family="system-ui, sans-serif" font-size="10" fill="#f59e0b" text-anchor="middle">4. razorpay.orders.create({ amount: total * 100, currency: 'INR' })</text>

  <!-- Step 5: Order id response -->
  <line x1="730" y1="265" x2="340" y2="265" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrB)"/>
  <text x="530" y="260" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">5. Returns order_id (e.g. order_Q7b9L2...)</text>

  <!-- Step 6: Return payload to client -->
  <line x1="330" y1="290" x2="130" y2="290" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arrB)"/>
  <text x="220" y="284" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8" text-anchor="middle">6. { orderId, amount, keyId }</text>

  <!-- Step 7: Razorpay Checkout Modal Interaction -->
  <rect x="70" y="305" width="100" height="26" rx="4" fill="#f43f5e" fill-opacity="0.15" stroke="#f43f5e"/>
  <text x="120" y="321" font-family="system-ui, sans-serif" font-size="9" fill="#fb7185" text-anchor="middle">Customer pays via UPI/Card</text>

  <!-- Step 8: POST /api/payments/verify -->
  <line x1="120" y1="345" x2="320" y2="345" stroke="#38bdf8" stroke-width="2" marker-end="url(#arrB)"/>
  <text x="220" y="338" font-family="system-ui, sans-serif" font-size="10" fill="#38bdf8" text-anchor="middle">7. POST /api/payments/verify {order_id, payment_id, signature}</text>

  <!-- Server HMAC Check Box -->
  <rect x="250" y="358" width="160" height="36" rx="4" fill="#059669" fill-opacity="0.2" stroke="#10b981"/>
  <text x="330" y="373" font-family="system-ui, sans-serif" font-size="9" font-weight="700" fill="#34d399" text-anchor="middle">HMAC SHA-256 Digest Validation</text>
  <text x="330" y="386" font-family="system-ui, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">expectedSig === req.body.signature</text>

  <!-- Step 9: Save order to DB -->
  <line x1="330" y1="410" x2="530" y2="410" stroke="#10b981" stroke-width="2" marker-end="url(#arrG)"/>
  <text x="430" y="404" font-family="system-ui, sans-serif" font-size="10" fill="#10b981" text-anchor="middle">8. Order.create({ paymentStatus: 'PAID', ... })</text>

  <!-- Step 10: Asynchronous Webhook -->
  <line x1="885" y1="435" x2="340" y2="435" stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#arrR)"/>
  <text x="610" y="428" font-family="system-ui, sans-serif" font-size="10" fill="#fb7185" text-anchor="middle">9. Webhook: POST /api/payments/webhook [payment.captured] (Raw Body HMAC)</text>

  <!-- Webhook Idempotency Check -->
  <rect x="250" y="446" width="160" height="24" rx="4" fill="#f43f5e" fill-opacity="0.15" stroke="#f43f5e"/>
  <text x="330" y="462" font-family="system-ui, sans-serif" font-size="9" fill="#f43f5e" text-anchor="middle">Idempotent check (Prevents duplicate)</text>
</svg>`;

// 3. Order Lifecycle State Transitions
const d3 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bg3" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <marker id="arr1" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#38bdf8"/>
    </marker>
    <marker id="arrRed2" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e"/>
    </marker>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bg3)" stroke="#334155" stroke-width="1.5"/>

  <!-- Title -->
  <text x="40" y="44" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#f8fafc">Order State Engine &amp; Decoupled Lifecycle Matrix</text>
  <text x="40" y="64" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Independent State Transitions: Fulfillment Pipeline vs Payment vs Deposit Refund</text>

  <!-- Pipeline Stages -->
  <!-- 1. PENDING -->
  <rect x="40" y="110" width="115" height="60" rx="8" fill="#1e293b" stroke="#64748b" stroke-width="1.5"/>
  <text x="97" y="135" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#cbd5e1" text-anchor="middle">PENDING</text>
  <text x="97" y="153" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Awaiting Checkout</text>

  <line x1="155" y1="140" x2="185" y2="140" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr1)"/>

  <!-- 2. CONFIRMED -->
  <rect x="185" y="110" width="115" height="60" rx="8" fill="#0284c7" fill-opacity="0.2" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="242" y="135" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8" text-anchor="middle">CONFIRMED</text>
  <text x="242" y="153" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Paid / COD Accepted</text>

  <line x1="300" y1="140" x2="330" y2="140" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr1)"/>

  <!-- 3. PREPARING -->
  <rect x="330" y="110" width="115" height="60" rx="8" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="387" y="135" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#fbbf24" text-anchor="middle">PREPARING</text>
  <text x="387" y="153" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Custom Cut Butchery</text>

  <line x1="445" y1="140" x2="475" y2="140" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr1)"/>

  <!-- 4. QUALITY_CHECK -->
  <rect x="475" y="110" width="125" height="60" rx="8" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
  <text x="537" y="135" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#c084fc" text-anchor="middle">QUALITY_CHECK</text>
  <text x="537" y="153" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">FSSAI Inward Inspection</text>

  <line x1="600" y1="140" x2="630" y2="140" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr1)"/>

  <!-- 5. PACKED -->
  <rect x="630" y="110" width="115" height="60" rx="8" fill="#1e293b" stroke="#06b6d4" stroke-width="1.5"/>
  <text x="687" y="135" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#22d3ee" text-anchor="middle">PACKED</text>
  <text x="687" y="153" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">EPP Cold-Box Sealed</text>

  <line x1="745" y1="140" x2="775" y2="140" stroke="#38bdf8" stroke-width="2" marker-end="url(#arr1)"/>

  <!-- 6. OUT_FOR_DELIVERY -->
  <rect x="775" y="110" width="145" height="60" rx="8" fill="#1e293b" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="847" y="135" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#60a5fa" text-anchor="middle">OUT_FOR_DELIVERY</text>
  <text x="847" y="153" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Insulated EV En Route</text>

  <!-- 7. DELIVERED (Lower right) -->
  <line x1="847" y1="170" x2="847" y2="210" stroke="#10b981" stroke-width="2" marker-end="url(#arr1)"/>
  <rect x="775" y="210" width="145" height="60" rx="8" fill="#059669" fill-opacity="0.2" stroke="#10b981" stroke-width="1.5"/>
  <text x="847" y="235" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#34d399" text-anchor="middle">DELIVERED</text>
  <text x="847" y="253" font-family="system-ui, sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">Order Complete</text>

  <!-- CANCELLED Branch -->
  <path d="M 242 170 L 242 220 L 330 220" stroke="#f43f5e" stroke-width="2" marker-end="url(#arrRed2)"/>
  <rect x="330" y="200" width="125" height="48" rx="8" fill="#f43f5e" fill-opacity="0.15" stroke="#f43f5e"/>
  <text x="392" y="222" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#fb7185" text-anchor="middle">CANCELLED</text>
  <text x="392" y="238" font-family="system-ui, sans-serif" font-size="8" fill="#94a3b8" text-anchor="middle">Restores Inventory &amp; Cooler</text>

  <!-- Decoupled Matrices Table (Lower) -->
  <rect x="40" y="295" width="880" height="155" rx="10" fill="#0f172a" stroke="#334155"/>
  <text x="60" y="322" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#f1f5f9">State Machine Decoupling Architecture</text>
  
  <!-- Sub-table cols -->
  <rect x="60" y="335" width="260" height="95" rx="6" fill="#1e293b" stroke="#475569"/>
  <text x="75" y="355" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#38bdf8">1. Payment Status (Razorpay)</text>
  <text x="75" y="375" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• PENDING (Awaiting Gateway)</text>
  <text x="75" y="392" font-family="system-ui, sans-serif" font-size="10" fill="#34d399">• PAID (Verified HMAC SHA-256)</text>
  <text x="75" y="409" font-family="system-ui, sans-serif" font-size="10" fill="#fb7185">• FAILED / REFUNDED</text>

  <rect x="350" y="335" width="260" height="95" rx="6" fill="#1e293b" stroke="#475569"/>
  <text x="365" y="355" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#fbbf24">2. Order Status (Fulfillment)</text>
  <text x="365" y="375" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• Managed by Operations Hub team</text>
  <text x="365" y="392" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• Advances from CONFIRMED to DELIVERED</text>
  <text x="365" y="409" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• Independent of gateway timeout</text>

  <rect x="640" y="335" width="260" height="95" rx="6" fill="#1e293b" stroke="#475569"/>
  <text x="655" y="355" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="#34d399">3. Cold-Box Deposit (₹250)</text>
  <text x="655" y="375" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• HELD (In customer possession)</text>
  <text x="655" y="392" font-family="system-ui, sans-serif" font-size="10" fill="#fbbf24">• RETURN_REQUESTED (Pickup booked)</text>
  <text x="655" y="409" font-family="system-ui, sans-serif" font-size="10" fill="#34d399">• REFUNDED (Processed to UPI ID)</text>
</svg>`;

// 4. Circular Packaging Lifecycle
const d4 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bg4" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <marker id="arrC" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1 L 8 5 L 0 9 z" fill="#10b981"/>
    </marker>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bg4)" stroke="#334155" stroke-width="1.5"/>

  <!-- Title -->
  <text x="40" y="44" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#f8fafc">Circular Packaging Architecture: The ₹250 ThermalVault™ Closed-Loop Engine</text>
  <text x="40" y="64" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Zero-Waste Sustainable Packaging, Automated Asset Tracking, and Instant Deposit Refunds</text>

  <!-- Cycle Node 1: Depot Sanitization -->
  <rect x="80" y="110" width="220" height="90" rx="10" fill="#1e293b" stroke="#38bdf8" stroke-width="1.5"/>
  <text x="100" y="136" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#38bdf8">1. Hub Wash &amp; UV Sanitization</text>
  <text x="100" y="156" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• Medical-grade sanitization chamber</text>
  <text x="100" y="172" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• Cold gel bricks frozen to -18°C</text>
  <text x="100" y="188" font-family="system-ui, sans-serif" font-size="10" fill="#34d399">• Status: AVAILABLE in Depot</text>

  <!-- Arrow 1 -> 2 -->
  <path d="M 300 155 L 420 155" stroke="#10b981" stroke-width="2" marker-end="url(#arrC)"/>

  <!-- Cycle Node 2: Packing & Dispatch -->
  <rect x="420" y="110" width="220" height="90" rx="10" fill="#1e293b" stroke="#10b981" stroke-width="1.5"/>
  <text x="440" y="136" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#34d399">2. Cold-Box Packing &amp; Dispatch</text>
  <text x="440" y="156" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• ₹250 refundable deposit attached</text>
  <text x="440" y="172" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• QR Code scanned and linked to Order</text>
  <text x="440" y="188" font-family="system-ui, sans-serif" font-size="10" fill="#38bdf8">• Status: IN_TRANSIT (0°C to 4°C)</text>

  <!-- Arrow 2 -> 3 -->
  <path d="M 640 155 L 720 155 L 720 250" stroke="#10b981" stroke-width="2" marker-end="url(#arrC)"/>

  <!-- Cycle Node 3: Customer Possession -->
  <rect x="610" y="250" width="220" height="90" rx="10" fill="#1e293b" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="630" y="276" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#fbbf24">3. Customer Delivery</text>
  <text x="630" y="296" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• Chilled cuts transferred to fridge</text>
  <text x="630" y="312" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• Box kept safely for next return</text>
  <text x="630" y="328" font-family="system-ui, sans-serif" font-size="10" fill="#fbbf24">• Status: WITH_CUSTOMER</text>

  <!-- Arrow 3 -> 4 -->
  <path d="M 610 295 L 490 295" stroke="#10b981" stroke-width="2" marker-end="url(#arrC)"/>

  <!-- Cycle Node 4: Return Request & Pickup -->
  <rect x="270" y="250" width="220" height="90" rx="10" fill="#1e293b" stroke="#a855f7" stroke-width="1.5"/>
  <text x="290" y="276" font-family="system-ui, sans-serif" font-size="13" font-weight="700" fill="#c084fc">4. Reverse Logistics Pickup</text>
  <text x="290" y="296" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• Customer taps "Return Box" in App</text>
  <text x="290" y="312" font-family="system-ui, sans-serif" font-size="10" fill="#94a3b8">• Delivery agent scans box on next trip</text>
  <text x="290" y="328" font-family="system-ui, sans-serif" font-size="10" fill="#c084fc">• Status: RETURN_REQUESTED</text>

  <!-- Arrow 4 -> 5 -->
  <path d="M 270 295 L 190 295 L 190 230" stroke="#10b981" stroke-width="2" marker-end="url(#arrC)"/>

  <!-- Callout: Financial & Environmental Impact -->
  <rect x="80" y="360" width="800" height="90" rx="8" fill="#0f172a" stroke="#334155"/>
  <text x="100" y="385" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#34d399">The Double Benefit: Economic Viability + Zero Single-Use Thermocol</text>
  <text x="100" y="405" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• Each ThermalVault box delivers 50+ fresh meat orders across its operational lifetime, eliminating single-use ice packs.</text>
  <text x="100" y="422" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• Instant Refund Protocol: Once depot staff verifies physical integrity, ₹250 is instantly refunded back via UPI/Razorpay.</text>
  <text x="100" y="439" font-family="system-ui, sans-serif" font-size="10" fill="#cbd5e1">• Prevents double refunds through MongoDB duplicate transaction locks and idempotent status checking.</text>
</svg>`;

// 5. MongoDB Data Persistence Schema
const d5 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 480" width="100%" height="100%">
  <defs>
    <linearGradient id="bg5" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1120"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
  </defs>

  <rect width="960" height="480" rx="16" fill="url(#bg5)" stroke="#334155" stroke-width="1.5"/>

  <!-- Title -->
  <text x="40" y="44" font-family="system-ui, sans-serif" font-size="18" font-weight="800" fill="#f8fafc">MongoDB Schemas &amp; Entity Relationships</text>
  <text x="40" y="64" font-family="system-ui, sans-serif" font-size="11" fill="#94a3b8">Strong Typing, Snapshot Isolation for Auditing, and Normalized Fleet References</text>

  <!-- User Schema -->
  <rect x="40" y="90" width="200" height="200" rx="8" fill="#1e293b" stroke="#38bdf8"/>
  <rect x="40" y="90" width="200" height="28" rx="8" fill="#0284c7" fill-opacity="0.3"/>
  <text x="50" y="109" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#38bdf8">User Schema</text>
  <text x="50" y="132" font-family="monospace" font-size="10" fill="#f1f5f9">_id: ObjectId / String</text>
  <text x="50" y="148" font-family="monospace" font-size="10" fill="#f1f5f9">name: String</text>
  <text x="50" y="164" font-family="monospace" font-size="10" fill="#f1f5f9">email: String (Indexed)</text>
  <text x="50" y="180" font-family="monospace" font-size="10" fill="#f1f5f9">password: Hash (bcrypt)</text>
  <text x="50" y="196" font-family="monospace" font-size="10" fill="#f1f5f9">role: 'customer' | 'admin'</text>
  <text x="50" y="212" font-family="monospace" font-size="10" fill="#f1f5f9">phone: String</text>
  <text x="50" y="228" font-family="monospace" font-size="10" fill="#f1f5f9">depositBalance: Number</text>
  <text x="50" y="244" font-family="monospace" font-size="10" fill="#f1f5f9">upiId: String</text>
  <text x="50" y="260" font-family="monospace" font-size="10" fill="#f1f5f9">savedAddresses: Array</text>

  <!-- Order Schema (Center) -->
  <rect x="270" y="90" width="250" height="360" rx="8" fill="#1e293b" stroke="#10b981"/>
  <rect x="270" y="90" width="250" height="28" rx="8" fill="#059669" fill-opacity="0.3"/>
  <text x="280" y="109" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#34d399">Order Schema (Auditable)</text>
  <text x="280" y="130" font-family="monospace" font-size="10" fill="#f1f5f9">_id / id: String (Unique)</text>
  <text x="280" y="146" font-family="monospace" font-size="10" fill="#f1f5f9">userId: Ref('User')</text>
  <text x="280" y="162" font-family="monospace" font-size="10" fill="#f1f5f9">customerName, customerEmail</text>
  <text x="280" y="178" font-family="monospace" font-size="10" fill="#f1f5f9">deliveryAddress: Snapshot</text>
  <text x="280" y="194" font-family="monospace" font-size="10" fill="#fbbf24">items: [{</text>
  <text x="295" y="210" font-family="monospace" font-size="9" fill="#94a3b8">productId, name, priceSnapshot,</text>
  <text x="295" y="224" font-family="monospace" font-size="9" fill="#94a3b8">quantity, cutStyle, unit</text>
  <text x="280" y="238" font-family="monospace" font-size="10" fill="#fbbf24">}]</text>
  <text x="280" y="254" font-family="monospace" font-size="10" fill="#f1f5f9">subtotal, coolerDeposit: 250</text>
  <text x="280" y="270" font-family="monospace" font-size="10" fill="#f1f5f9">total: Number</text>
  <text x="280" y="286" font-family="monospace" font-size="10" fill="#38bdf8">paymentStatus: 'PAID'|'PENDING'</text>
  <text x="280" y="302" font-family="monospace" font-size="10" fill="#38bdf8">razorpayOrderId, paymentId</text>
  <text x="280" y="318" font-family="monospace" font-size="10" fill="#fbbf24">status: 7-Stage Pipeline Enum</text>
  <text x="280" y="334" font-family="monospace" font-size="10" fill="#34d399">coolerId: Ref('Cooler')</text>
  <text x="280" y="350" font-family="monospace" font-size="10" fill="#34d399">coldBoxRefundStatus: Enum</text>
  <text x="280" y="366" font-family="monospace" font-size="10" fill="#f1f5f9">liveTemp, tempLog: Array</text>
  <text x="280" y="382" font-family="monospace" font-size="10" fill="#f1f5f9">createdAt: ISODate</text>

  <!-- Product Schema -->
  <rect x="550" y="90" width="180" height="230" rx="8" fill="#1e293b" stroke="#f59e0b"/>
  <rect x="550" y="90" width="180" height="28" rx="8" fill="#d97706" fill-opacity="0.3"/>
  <text x="560" y="109" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#fbbf24">Product Schema</text>
  <text x="560" y="132" font-family="monospace" font-size="10" fill="#f1f5f9">_id: String</text>
  <text x="560" y="148" font-family="monospace" font-size="10" fill="#f1f5f9">name, category</text>
  <text x="560" y="164" font-family="monospace" font-size="10" fill="#f1f5f9">price, mrp (Authoritative)</text>
  <text x="560" y="180" font-family="monospace" font-size="10" fill="#f1f5f9">unit, netWeight, gross</text>
  <text x="560" y="196" font-family="monospace" font-size="10" fill="#f1f5f9">stock: Number</text>
  <text x="560" y="212" font-family="monospace" font-size="10" fill="#f1f5f9">chillingMethod</text>
  <text x="560" y="228" font-family="monospace" font-size="10" fill="#f1f5f9">cutStyle: String</text>
  <text x="560" y="244" font-family="monospace" font-size="10" fill="#f1f5f9">origin, catchDate</text>

  <!-- Cooler & Returns -->
  <rect x="755" y="90" width="165" height="230" rx="8" fill="#1e293b" stroke="#a855f7"/>
  <rect x="755" y="90" width="165" height="28" rx="8" fill="#7e22ce" fill-opacity="0.3"/>
  <text x="765" y="109" font-family="system-ui, sans-serif" font-size="12" font-weight="700" fill="#c084fc">Cooler Fleet Schema</text>
  <text x="765" y="132" font-family="monospace" font-size="10" fill="#f1f5f9">_id: BOX-BLR-xxx</text>
  <text x="765" y="148" font-family="monospace" font-size="10" fill="#f1f5f9">qrCode: String</text>
  <text x="765" y="164" font-family="monospace" font-size="10" fill="#f1f5f9">model: ThermalVault</text>
  <text x="765" y="180" font-family="monospace" font-size="10" fill="#f1f5f9">status: Enum</text>
  <text x="765" y="196" font-family="monospace" font-size="10" fill="#f1f5f9">currentOrderId: Ref</text>
  <text x="765" y="212" font-family="monospace" font-size="10" fill="#f1f5f9">currentUserId: Ref</text>
  <text x="765" y="228" font-family="monospace" font-size="10" fill="#f1f5f9">cyclesUsed: Number</text>
  <text x="765" y="244" font-family="monospace" font-size="10" fill="#f1f5f9">depositAmount: 250</text>

  <!-- Relationship Connectors & Annotations -->
  <path d="M 240 145 L 270 145" stroke="#38bdf8" stroke-width="2"/>
  <path d="M 520 180 L 550 180" stroke="#f59e0b" stroke-width="2"/>
  <path d="M 520 330 L 755 180" stroke="#a855f7" stroke-width="2"/>
</svg>`;

fs.writeFileSync(path.join(diagramsDir, '01_mern_architecture.svg'), d1, 'utf8');
fs.writeFileSync(path.join(diagramsDir, '02_razorpay_payment_sequence.svg'), d2, 'utf8');
fs.writeFileSync(path.join(diagramsDir, '03_order_state_transitions.svg'), d3, 'utf8');
fs.writeFileSync(path.join(diagramsDir, '04_coldbox_circular_lifecycle.svg'), d4, 'utf8');
fs.writeFileSync(path.join(diagramsDir, '05_mongodb_schemas.svg'), d5, 'utf8');

console.log('Technical SVGs generated successfully in /diagrams!');
