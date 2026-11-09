import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>GoMeat Vault Wallet™ — Product & Architecture Blueprint</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@500;700&display=swap" rel="stylesheet">
  <style>
    body {
      font-family: 'Plus Jakarta Sans', sans-serif;
      margin: 0;
      padding: 0;
      background-color: #0b0f19;
      color: #f1f5f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .slide-page {
      width: 1920px;
      height: 1080px;
      page-break-after: always;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      box-sizing: border-box;
      padding: 60px 80px;
      background: radial-gradient(circle at 15% 15%, rgba(209, 18, 67, 0.12) 0%, transparent 45%),
                  radial-gradient(circle at 85% 85%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
                  #0b0f19;
    }
    .code-font {
      font-family: 'JetBrains Mono', monospace;
    }
    .glass-card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
    }
    .glass-card-accent {
      background: linear-gradient(135deg, rgba(209, 18, 67, 0.15) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(209, 18, 67, 0.35);
      border-radius: 24px;
    }
    .glass-card-green {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(255, 255, 255, 0.02) 100%);
      border: 1px solid rgba(16, 185, 129, 0.3);
      border-radius: 24px;
    }
    .glow-rose {
      box-shadow: 0 0 50px -10px rgba(209, 18, 67, 0.4);
    }
    .glow-emerald {
      box-shadow: 0 0 50px -10px rgba(16, 185, 129, 0.35);
    }
  </style>
</head>
<body>

  <!-- SLIDE 1: COVER -->
  <section class="slide-page">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-[#d11243] flex items-center justify-center font-black text-xl text-white shadow-lg">GM</div>
        <div>
          <span class="text-xl font-black tracking-tight text-white">GoMeat<span class="text-[#d11243]">.in</span></span>
          <span class="text-xs text-gray-400 block -mt-1 font-semibold">Engineering & Product Architecture</span>
        </div>
      </div>
      <div class="px-4 py-1.5 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        Retention & Fintech Initiative 2026
      </div>
    </div>

    <div class="my-auto max-w-5xl space-y-6">
      <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider">
        <span>Strategic Feature Proposal</span>
        <span>•</span>
        <span>Customer Retention Engine</span>
      </div>
      <h1 class="text-6xl font-black leading-tight tracking-tight text-white">
        GoMeat Vault Wallet™<br/>
        <span class="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-pink-400 to-amber-300">
          Transforming ₹250 Cooler Deposits into Repeat Orders
        </span>
      </h1>
      <p class="text-xl text-gray-300 font-medium leading-relaxed max-w-4xl">
        How an in-app digital credit ledger eliminates 5-day bank refund delays, guarantees 2nd and 3rd meat purchases, cuts payment gateway fees to zero, and replicates the retention playbook of Licious Cash & BigBasket bbwallet.
      </p>

      <div class="grid grid-cols-4 gap-5 pt-4">
        <div class="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div class="text-3xl font-black text-emerald-400">0 Seconds</div>
          <div class="text-xs text-gray-400 font-semibold mt-1">Instant Refund Latency (vs 3-5 Banking Days)</div>
        </div>
        <div class="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div class="text-3xl font-black text-rose-400">4.2x</div>
          <div class="text-xs text-gray-400 font-semibold mt-1">Expected 30-Day Repeat Purchase Frequency</div>
        </div>
        <div class="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div class="text-3xl font-black text-amber-400">₹0 Fees</div>
          <div class="text-xs text-gray-400 font-semibold mt-1">Zero Gateway Processing Costs on Wallet Balances</div>
        </div>
        <div class="p-5 rounded-2xl bg-white/5 border border-white/10">
          <div class="text-3xl font-black text-cyan-400">100%</div>
          <div class="text-xs text-gray-400 font-semibold mt-1">Automated Reconciliation via Ops Hub</div>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-between text-xs text-gray-500 border-t border-white/10 pt-4">
      <span>Prepared for: GoMeat Core Engineering, Operations & Product Leadership</span>
      <span>Confidential • Architecture Design Document • Nov 2026</span>
    </div>
  </section>

  <!-- SLIDE 2: THE BUSINESS CASE & RETENTION FLYWHEEL -->
  <section class="slide-page">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-rose-500 uppercase tracking-widest">Strategic Justification</span>
        <h2 class="text-3xl font-black text-white">The Business Case: Bank Refund vs. Vault Wallet</h2>
      </div>
      <span class="text-xs text-gray-400">Slide 02 / 06</span>
    </div>

    <div class="grid grid-cols-2 gap-8 my-auto">
      <!-- Old Way -->
      <div class="p-8 rounded-3xl bg-red-950/20 border border-red-500/20 space-y-5">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-lg">✕</div>
          <div>
            <h3 class="text-xl font-bold text-red-200">The Problem: Traditional Bank / UPI Refunds</h3>
            <p class="text-xs text-gray-400">Refunding ₹250 directly to customer's bank account</p>
          </div>
        </div>
        <ul class="space-y-4 text-sm text-gray-300">
          <li class="flex items-start gap-3">
            <span class="text-red-400 font-bold">•</span>
            <span><strong>Customer Churn Risk:</strong> Once the cash lands in their bank, the customer has zero incentive to return. They might order their next chicken/mutton cut from Zepto or local butcher.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-red-400 font-bold">•</span>
            <span><strong>3-5 Days Banking Latency:</strong> Payment gateways take 72+ hours to settle UPI/NEFT refunds, creating customer anxiety and support tickets ("Where is my ₹250?").</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-red-400 font-bold">•</span>
            <span><strong>Gateway Overhead:</strong> Processing micro-refunds incurs merchant processing costs and banking settlement overheads.</span>
          </li>
        </ul>
      </div>

      <!-- New Way -->
      <div class="p-8 rounded-3xl bg-emerald-950/25 border border-emerald-500/30 space-y-5 glow-emerald">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">✓</div>
          <div>
            <h3 class="text-xl font-bold text-emerald-200">The Solution: GoMeat Vault Wallet™</h3>
            <p class="text-xs text-emerald-400/80">Crediting ₹250 store credit directly into in-app wallet</p>
          </div>
        </div>
        <ul class="space-y-4 text-sm text-gray-300">
          <li class="flex items-start gap-3">
            <span class="text-emerald-400 font-bold">•</span>
            <span><strong>Guaranteed Repeat Order (LTV Spike):</strong> Having ₹250 locked in their GoMeat wallet acts as pre-paid store credit. Customers feel compelled to place a 2nd order to redeem it.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-emerald-400 font-bold">•</span>
            <span><strong>Instant 0-Second Gratification:</strong> As soon as the delivery rider or hub scans the box barcode, the wallet reflects ₹250 immediately with a delightful UI chime.</span>
          </li>
          <li class="flex items-start gap-3">
            <span class="text-emerald-400 font-bold">•</span>
            <span><strong>Frictionless 1-Click Checkout:</strong> A simple checkbox at checkout burns the ₹250, cutting out gateway OTPs and card entries.</span>
          </li>
        </ul>
      </div>
    </div>

    <!-- Industry Proof Point -->
    <div class="p-5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-gray-300">
      <div class="flex items-center gap-4">
        <span class="font-extrabold text-amber-400 uppercase tracking-wide">Industry Benchmarks:</span>
        <span><strong>Licious Cash</strong> drives 68% of second-month orders.</span>
        <span>•</span>
        <span><strong>BigBasket bbwallet</strong> eliminates 94% of return-related chargebacks.</span>
      </div>
      <span class="text-gray-400">Proven quick-commerce retention model</span>
    </div>
  </section>

  <!-- SLIDE 3: COMPLETE FLOW GRAPH & ARCHITECTURE -->
  <section class="slide-page">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-rose-500 uppercase tracking-widest">End-to-End Workflow</span>
        <h2 class="text-3xl font-black text-white">The 4-Stage Vault Wallet Flywheel</h2>
      </div>
      <span class="text-xs text-gray-400">Slide 03 / 06</span>
    </div>

    <div class="grid grid-cols-4 gap-6 my-auto">
      <!-- Step 1 -->
      <div class="glass-card p-6 space-y-4 flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-black text-lg">01</div>
          <h4 class="text-lg font-bold text-white mt-3">Initial Order & Deposit</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Customer places first meat order. An automated <strong>₹250 refundable deposit</strong> is charged for the insulated ThermalVault™ cooler box maintaining 0°C–4°C.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] code-font text-gray-300">
          deposit: +₹250<br/>
          boxStatus: 'delivered'<br/>
          sla: '36 hours return window'
        </div>
      </div>

      <!-- Step 2 -->
      <div class="glass-card p-6 space-y-4 flex flex-col justify-between">
        <div>
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-black text-lg">02</div>
          <h4 class="text-lg font-bold text-white mt-3">Return & Barcode Scan</h4>
          <p class="text-xs text-gray-400 mt-2 leading-relaxed">
            Customer hands back empty box at doorstep or schedules pickup. Rider or Hub Ops scans the ThermalVault™ QR / Barcode for quality inspection.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-black/40 border border-white/10 text-[11px] code-font text-gray-300">
          coolerId: 'CB-8821'<br/>
          inspection: 'PASSED_CLEAN'<br/>
          status: 'ready_for_credit'
        </div>
      </div>

      <!-- Step 3 -->
      <div class="glass-card-green p-6 space-y-4 flex flex-col justify-between glow-emerald">
        <div>
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-black text-lg">03</div>
          <h4 class="text-lg font-bold text-emerald-300 mt-3">Instant Wallet Credit</h4>
          <p class="text-xs text-gray-300 mt-2 leading-relaxed">
            Backend triggers atomic deposit refund. <strong>₹250 is instantly credited</strong> to customer's in-app wallet balance with an immutable ledger entry.
          </p>
        </div>
        <div class="p-3 rounded-xl bg-black/50 border border-emerald-500/30 text-[11px] code-font text-emerald-400 font-bold">
          walletBalance: 250<br/>
          type: 'credit'<br/>
          reason: 'cooler_refund'<br/>
          latency: '0 seconds'
        </div>
      </div>

      <!-- Step 4 -->
      <div class="glass-card-accent p-6 space-y-4 flex flex-col justify-between glow-rose">
        <div>
          <div class="w-10 h-10 rounded-xl bg-[#d11243] text-white flex items-center justify-center font-black text-lg">04</div>
          <h4 class="text-lg font-bold text-white mt-3">1-Click Next Order</h4>
          <p class="text-xs text-gray-300 mt-2 leading-relaxed">
            Customer opens app to buy fresh seer fish or chicken. At checkout, ₹250 wallet balance is automatically redeemed, driving an instant repeat conversion!
          </p>
        </div>
        <div class="p-3 rounded-xl bg-black/50 border border-rose-500/30 text-[11px] code-font text-rose-300">
          subtotal: ₹520<br/>
          walletDiscount: -₹250<br/>
          netPayable: ₹270
        </div>
      </div>
    </div>

    <!-- Technical Architecture Callout -->
    <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-gray-400">
      <span><strong>Ledger Audit Guarantee:</strong> Every credit and debit includes <code class="code-font text-emerald-400">balanceAfter</code>, immutable transaction IDs, and cryptographic idempotency.</span>
      <span class="text-emerald-400 font-bold">No double-spending risk</span>
    </div>
  </section>

  <!-- SLIDE 4: FRONTEND UI & USER EXPERIENCE -->
  <section class="slide-page">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-rose-500 uppercase tracking-widest">User Interface & Design</span>
        <h2 class="text-3xl font-black text-white">Where the Customer Sees Their Wallet</h2>
      </div>
      <span class="text-xs text-gray-400">Slide 04 / 06</span>
    </div>

    <div class="grid grid-cols-3 gap-6 my-auto">
      <!-- Navbar Pill -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-white text-base">1. Top Navbar Wallet Badge</h4>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 font-bold">Header</span>
        </div>
        <p class="text-xs text-gray-400">Persistent visual reminder that the customer has pre-loaded store credit waiting to be spent.</p>
        
        <!-- UI Mockup -->
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-bold text-white">GoMeat Navbar</span>
            <div class="flex items-center gap-2">
              <div class="px-3 py-1 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-extrabold text-xs flex items-center gap-1.5 shadow-sm">
                <span>👛</span>
                <span>₹250.00</span>
              </div>
              <div class="px-3 py-1 rounded-xl bg-[#d11243] text-white font-bold text-xs flex items-center gap-1">
                <span>🛍️ Cart (2)</span>
              </div>
            </div>
          </div>
          <div class="text-[11px] text-gray-400">
            Hovering displays: <em>"ThermalVault™ Deposit Credit: ₹250 available"</em>
          </div>
        </div>
      </div>

      <!-- Checkout Toggle -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-white text-base">2. Smart Checkout Toggle</h4>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">Checkout</span>
        </div>
        <p class="text-xs text-gray-400">Seamlessly applies wallet balance as a discount before gateway payment.</p>
        
        <!-- UI Mockup -->
        <div class="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
          <div class="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <input type="checkbox" checked class="w-4 h-4 text-emerald-500 rounded cursor-pointer" />
              <div>
                <span class="font-bold text-white block">Use GoMeat Wallet (₹250)</span>
                <span class="text-[10px] text-emerald-400">Instant savings applied</span>
              </div>
            </div>
            <span class="font-black text-emerald-400">-₹250.00</span>
          </div>

          <div class="pt-2 border-t border-slate-800 space-y-1 text-gray-400 text-[11px]">
            <div class="flex justify-between"><span>Cuts Subtotal:</span><span class="text-white">₹520.00</span></div>
            <div class="flex justify-between text-emerald-400"><span>Wallet Store Credit:</span><span>-₹250.00</span></div>
            <div class="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
              <span>Final Payable:</span><span class="text-rose-400 text-sm">₹270.00</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dashboard Passbook -->
      <div class="glass-card p-6 space-y-4">
        <div class="flex items-center justify-between">
          <h4 class="font-bold text-white text-base">3. Customer Passbook Ledger</h4>
          <span class="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 font-bold">Account</span>
        </div>
        <p class="text-xs text-gray-400">Complete transparency: customer can inspect all credits, debits, and download invoices.</p>
        
        <!-- UI Mockup -->
        <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-[11px]">
          <div class="p-2.5 rounded-lg bg-white/5 flex items-center justify-between">
            <div>
              <span class="font-bold text-white block">ThermalVault™ Box #8821 Refund</span>
              <span class="text-[10px] text-gray-500">Today, 04:30 PM • 36hr Return</span>
            </div>
            <span class="font-black text-emerald-400 text-xs">+₹250.00</span>
          </div>
          <div class="p-2.5 rounded-lg bg-white/5 flex items-center justify-between">
            <div>
              <span class="font-bold text-white block">Order #ORD-4491 Redemption</span>
              <span class="text-[10px] text-gray-500">Yesterday, 07:15 PM</span>
            </div>
            <span class="font-black text-gray-400 text-xs">-₹180.00</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-gray-400">
      <span><strong>Zero-Friction 100% Wallet Orders:</strong> When wallet balance covers the total order amount, the payment gateway is skipped entirely for 1-second order placement!</span>
      <span class="text-rose-400 font-bold">Industry leading checkout conversion</span>
    </div>
  </section>

  <!-- SLIDE 5: OPERATIONS & HUB RECONCILIATION -->
  <section class="slide-page">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-rose-500 uppercase tracking-widest">Darkstore & Admin Integration</span>
        <h2 class="text-3xl font-black text-white">How Darkstore Ops & Delivery Riders Trigger Credits</h2>
      </div>
      <span class="text-xs text-gray-400">Slide 05 / 06</span>
    </div>

    <div class="grid grid-cols-2 gap-8 my-auto">
      <div class="glass-card p-7 space-y-5">
        <h3 class="text-xl font-bold text-white">Admin Operations Hub 1-Click Approval</h3>
        <p class="text-xs text-gray-400 leading-relaxed">
          In the central operations hub under the <strong>"Cold-Box Returns"</strong> tab, darkstore supervisors inspect incoming returned cooler boxes. With a single button click, the system:
        </p>
        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">1</span>
            <span class="text-xs text-gray-300">Marks cooler box status from <code class="text-amber-400">in_transit</code> to <code class="text-emerald-400">inspected_passed</code>.</span>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">2</span>
            <span class="text-xs text-gray-300">Credits ₹250 directly into the customer's User record.</span>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">3</span>
            <span class="text-xs text-gray-300">Pushes real-time notification to the customer's dashboard and email.</span>
          </div>
        </div>
      </div>

      <div class="glass-card p-7 space-y-5">
        <h3 class="text-xl font-bold text-white">Security, Fraud & Concurrency Safeguards</h3>
        <p class="text-xs text-gray-400 leading-relaxed">
          Protecting company margins while ensuring lightning fast checkout:
        </p>
        <div class="space-y-3">
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">A</span>
            <span class="text-xs text-gray-300"><strong>Anti-Double Spend:</strong> Atomic database update prevents a customer from using the same ₹250 across multiple browser tabs.</span>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">B</span>
            <span class="text-xs text-gray-300"><strong>Order Cancellation Auto-Reversal:</strong> If an order paid with wallet funds is cancelled before cutting, the redeemed balance is automatically credited back.</span>
          </div>
          <div class="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-3">
            <span class="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs">C</span>
            <span class="text-xs text-gray-300"><strong>Tamper-Proof Audit Trail:</strong> Every rupee credited or debited is signed with timestamp and linked order/cooler barcode.</span>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs text-gray-400">
      <span>Zero human calculation errors • Instant reconciliation for accounting</span>
      <span class="text-emerald-400 font-bold">100% Audit Ready</span>
    </div>
  </section>

  <!-- SLIDE 6: ENGINEERING ROADMAP & ROLLOUT -->
  <section class="slide-page">
    <div class="flex items-center justify-between">
      <div>
        <span class="text-xs font-bold text-rose-500 uppercase tracking-widest">Execution Plan</span>
        <h2 class="text-3xl font-black text-white">Engineering Roadmap & Rollout Phases</h2>
      </div>
      <span class="text-xs text-gray-400">Slide 06 / 06</span>
    </div>

    <div class="grid grid-cols-4 gap-6 my-auto">
      <div class="glass-card p-6 space-y-4">
        <span class="px-2.5 py-1 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] uppercase">Phase 1</span>
        <h4 class="text-lg font-bold text-white">Backend Ledger & API</h4>
        <ul class="text-xs text-gray-400 space-y-2 leading-relaxed">
          <li>• Update User schema with <code class="text-white">walletBalance</code> & ledger array</li>
          <li>• Implement <code class="text-white">GET /api/wallet</code></li>
          <li>• Wire atomic deduction in <code class="text-white">POST /api/orders/create</code></li>
        </ul>
      </div>

      <div class="glass-card p-6 space-y-4">
        <span class="px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 font-bold text-[10px] uppercase">Phase 2</span>
        <h4 class="text-lg font-bold text-white">Checkout Redemption</h4>
        <ul class="text-xs text-gray-400 space-y-2 leading-relaxed">
          <li>• Build dynamic wallet toggle in <code class="text-white">CheckoutModal.tsx</code></li>
          <li>• Auto-calculate remaining balance</li>
          <li>• Enable 100% wallet paid orders (skip Razorpay popup)</li>
        </ul>
      </div>

      <div class="glass-card p-6 space-y-4">
        <span class="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] uppercase">Phase 3</span>
        <h4 class="text-lg font-bold text-white">Navbar & Dashboard UI</h4>
        <ul class="text-xs text-gray-400 space-y-2 leading-relaxed">
          <li>• Live <code class="text-white">👛 ₹250</code> badge in desktop & mobile Navbar</li>
          <li>• Build Vault Wallet Passbook in <code class="text-white">CustomerDashboardPage.tsx</code></li>
          <li>• Filterable transaction history</li>
        </ul>
      </div>

      <div class="glass-card p-6 space-y-4">
        <span class="px-2.5 py-1 rounded bg-cyan-500/20 text-cyan-400 font-bold text-[10px] uppercase">Phase 4</span>
        <h4 class="text-lg font-bold text-white">Hub Ops Automation</h4>
        <ul class="text-xs text-gray-400 space-y-2 leading-relaxed">
          <li>• One-click box inspection in <code class="text-white">AdminDashboardPage.tsx</code></li>
          <li>• Direct wallet credit trigger</li>
          <li>• End-to-end verification & Vercel deployment</li>
        </ul>
      </div>
    </div>

    <!-- Final CTA Banner -->
    <div class="p-6 rounded-2xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-500/30 flex items-center justify-between">
      <div>
        <h4 class="font-extrabold text-white text-base">Ready for Sprint Kickoff</h4>
        <p class="text-xs text-gray-400 mt-0.5">Estimated implementation timeline: 1 engineering day. Zero third-party dependencies required.</p>
      </div>
      <div class="px-5 py-2.5 rounded-xl bg-[#d11243] text-white font-extrabold text-xs shadow-lg flex items-center gap-2">
        <span>GoMeat Vault Wallet™ 2026</span>
        <span>&rarr;</span>
      </div>
    </div>
  </section>

</body>
</html>
`;

async function buildPdf() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('[PDF Generator] Launching browser with:', executablePath);

  const htmlFile = path.resolve('GoMeat_Vault_Wallet_Presentation.html');
  fs.writeFileSync(htmlFile, htmlContent, 'utf-8');
  console.log('[PDF Generator] Wrote presentation HTML to:', htmlFile);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

  await page.goto(`file://${htmlFile}`, { waitUntil: 'networkidle0' });

  const rootPdfPath = path.resolve('GoMeat_Vault_Wallet_Presentation.pdf');
  const publicPdfPath = path.resolve('client/public/GoMeat_Vault_Wallet_Presentation.pdf');
  const artifactPdfPath = 'C:\\Users\\dines\\.gemini\\antigravity\\brain\\099d1afc-5924-49f5-bd3a-3ed010f92bb9\\GoMeat_Vault_Wallet_Presentation.pdf';

  console.log('[PDF Generator] Rendering 1920x1080 slide pages to PDF...');
  await page.pdf({
    path: rootPdfPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // Copy to client/public so it can be viewed on localhost / live web
  fs.copyFileSync(rootPdfPath, publicPdfPath);
  // Copy to artifacts directory so it appears directly in the agent's artifacts
  fs.copyFileSync(rootPdfPath, artifactPdfPath);

  // Take screenshot of Slide 1 and Slide 3 for quick visual preview
  await page.screenshot({
    path: 'C:\\Users\\dines\\.gemini\\antigravity\\brain\\099d1afc-5924-49f5-bd3a-3ed010f92bb9\\screenshots\\wallet_slide_01.png',
    clip: { x: 0, y: 0, width: 1920, height: 1080 }
  });
  await page.screenshot({
    path: 'C:\\Users\\dines\\.gemini\\antigravity\\brain\\099d1afc-5924-49f5-bd3a-3ed010f92bb9\\screenshots\\wallet_slide_03.png',
    clip: { x: 0, y: 1080 * 2, width: 1920, height: 1080 }
  });

  await browser.close();
  console.log('[SUCCESS] Generated high-res PDF presentation:', rootPdfPath);
  console.log('[SUCCESS] Copied to public web:', publicPdfPath);
  console.log('[SUCCESS] Copied to artifacts:', artifactPdfPath);
}

buildPdf().catch(err => {
  console.error('[ERROR] Failed generating wallet presentation:', err);
  process.exit(1);
});
