# GoMeat

> **Freshness we can trust.**
> *Farm-to-Fork Indian D2C Fresh Meat & Coastal Seafood Platform with Circular Reusable Cold-Box Logistics*

Modeled after modern fresh delivery platforms like Licious.in, GoMeat brings high-integrity cold-chain meat and seafood to Indian households while eliminating single-use thermocol waste through a circular packaging loop.

---

## 🌟 Key Highlights

- **Farm-to-Fork Cold Chain**: Strict 0°C to 4°C temperature regulation across procurement, processing, and delivery.
- **Zero-Thermocol Packaging Loop**: Orders arrive in food-grade insulated EPP cold boxes with phase-change gel bricks holding 0°C to 4°C for 36 hours.
- **₹250 Refundable Security Deposit**: Collected at checkout; 100% credited back to the customer's UPI ID upon doorstep box pickup.
- **AI WhatsApp Commerce Bot**: 24/7 intelligent butcher & cold-chain assistant that answers customer inquiries directly on WhatsApp (or via the interactive web simulator):
  - Inward 4:00 AM harbor seafood availability (Surmai, Pomfret, Prawns)
  - Real-time catalog pricing & stock lookup
  - Reusable box return & ₹250 instant UPI refund instructions
  - Live core cold-chain temperature telemetry & order tracking
- **Live IoT Temperature Sensor Telemetry**: Embedded core probe sensors stream internal box temperatures in real time.
- **Authentic Indian Regional Cuts**:
  - *Fish & Seafood*: Malabar Seer Fish (Surmai), White Pomfret (Safed Paplet), Sea Tiger Prawns (Jumbo Cleaned & Deveined).
  - *Tender Mutton*: Mandya & Bannur pasture goat (Biryani & Rogan Josh Cuts, Boneless Chunks).
  - *Fresh Chicken*: Bio-secured farm breast fillets, Free-range Country Chicken / Nati Koli (skin-on curry cut).
  - *Ready to Cook*: Chef-crafted Amritsari Fish Tikka.
  - *Combo Boxes*: Weekend Coastal Feast Variety Packs.
- **Dual Role System**: Explicit credential-based authentication for Customers and Hub Operations Managers.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide icons.
- **Backend**: Node.js, Express REST API.
- **Database**: Persistent JSON data layer with atomic synchronous writes (`server/data.json`).
- **Security**: JWT tokens, bcrypt password hashing.
- **Testing**: Automated end-to-end integration test suite (`test-workflows.js`).

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
```bash
# Clone the repository
git clone https://github.com/Dhinesh1628/sagarfresh.git
cd sagarfresh

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running the Application

```bash
# 1. Start the Backend API & Unified Production Server (Port 5000)
cd server
npm start

# 2. In a separate terminal, start Vite for hot-reload development (Port 5173)
cd client
npm run dev
```

Open your browser to:
- **Production Server**: [http://localhost:5000](http://localhost:5000)
- **Vite Dev Server**: [http://localhost:5173](http://localhost:5173)

---

## 🔑 Login Credentials

| Role | Username / Identifier | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Customer (Pooja Sundaram)** | `pooja.sundaram@gmail.com` *(or `9876543210`)* | `customer123` | Browse cuts, custom butchery styles, cart & checkout, live temperature tracking, and box returns with ₹250 UPI refunds. |
| **Operations Admin (Rajeshwar Rao)** | `ops@gomeat.in` *(or `ops@sagarfresh.in`)* | `admin123` | Central Hub operations, dispatch management, cooler fleet inventory, return approvals, and catalog inventory CRUD. |

---

## 🧪 Running Automated Tests

Run the comprehensive end-to-end integration test suite verifying all 9 critical customer and admin workflows:

```bash
node test-workflows.js
```

---

## 📜 Regulatory & Food Safety Compliance

- **FSSAI Central License**: `11224333000491`
- **FSSC 22000**: Food Safety Management Standard
- **GSTIN**: `29AAECS4912J1Z8`
- **Privacy Policy**: Compliant with India's Digital Personal Data Protection (DPDP) Act.
