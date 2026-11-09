# GoMeat

> **Fresh Quality. Delivered with Care.**  
> *Farm-to-Fork Direct-to-Consumer Fresh Meat & Coastal Seafood Platform with Circular Reusable Cold-Box Logistics*

---

## 🌟 Overview

**GoMeat** is an enterprise-grade full-stack e-commerce and cold-chain logistics platform modeled after tier-1 quick-commerce and meat delivery applications (Swiggy Instamart, Licious). GoMeat delivers 100% blast-chilled, never-frozen chicken, tender mutton, and daily coastal seafood directly to doorsteps within 90 minutes.

### Key Pillars
- **Strict 0°C–4°C Cold Chain:** Guaranteed optimal freshness from bio-secure farms and night-trawl harbors to the customer's kitchen.
- **ThermalVault™ Reusable Cold Box System:** High-density EPP insulated boxes with phase-change gel bricks eliminate single-use thermocol and plastic waste.
- **Protected ₹250 Refundable Deposit:** Tracked transparently at checkout and refunded with 1-click doorstep pickup to the customer's UPI ID or in-app GoMeat Wallet.
- **Swiggy-Grade Checkout & Tracking:**
  - Sticky floating bottom cart bar.
  - Tactile `- 1 +` stepper product card buttons.
  - "Add ₹X for Free Delivery" real-time progress gauge.
  - 1-Click discount coupon selector.
  - 1-Tap delivery instruction pills (e.g. *Leave at door*, *Don't ring bell*).
  - Optional delivery partner tip.
  - Unique dynamic 4-digit Handover PIN generated for every order and customer.
- **Conversational AI Commerce:** Meta WhatsApp Cloud API integration offering 24/7 intelligent meat butchery advice, catch inquiries, and deposit refund status.
- **Enterprise Operations Dashboard:** Real-time fleet tracking, UV sanitation logging, and courier dispatch controls.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Framer Motion |
| **Backend** | Node.js (v20+), Express.js 4, RESTful Architecture |
| **Database** | MongoDB Atlas (Mongoose ODM) with offline persistent document-store fallback |
| **Authentication** | JWT (JSON Web Tokens), Google OAuth 2.0 (`google-auth-library`), bcryptjs |
| **Payments** | Razorpay Payment Gateway (UPI, Cards, NetBanking), GoMeat Store Credit Wallet |
| **Integrations** | Meta WhatsApp Cloud API Webhooks & Intelligent AI Chatbot Engine |
| **DevOps & Deploy** | Vercel Serverless Edge, Node.js concurrently orchestrated Monorepo |

---

## 📁 Repository Structure

```
GoMeat/
├── frontend/                     # React 19 Client SPA
│   ├── public/                   # Static assets, product cuts, branding
│   ├── src/
│   │   ├── components/           # Reusable UI, Modals, Navbar, Checkout
│   │   ├── pages/                # Catalog, Customer/Admin Dashboards, Tracking
│   │   ├── context/              # AuthContext, CartContext
│   │   ├── utils/                # Invoices, PIN helper, formatters
│   │   ├── api.ts                # Unified REST API service
│   │   └── types.ts              # Domain interfaces & TypeScript definitions
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                      # Node.js + Express API
│   ├── models/                   # Mongoose schemas (Order, User, Product, Cooler)
│   ├── routes/                   # Payments, Google Auth, WhatsApp Webhooks
│   ├── services/                 # AI Butcher Bot & business logic
│   ├── db.js                     # Unified dual-layer database abstraction
│   ├── mongo.js                  # Resilient MongoDB connector
│   ├── data.json                 # Persistent local JSON data store
│   ├── package.json
│   └── server.js                 # API server entrypoint
│
├── docs/                         # Technical documentation
│   ├── BRANDING_AUDIT.md         # Comprehensive branding audit trail
│   ├── PROJECT_ARCHITECTURE.md   # System architecture & mermaid diagrams
│   ├── DATABASE_SCHEMA.md        # Data dictionary & ER diagrams
│   ├── API_DOCUMENTATION.md      # REST endpoints & payload examples
│   ├── DEVELOPMENT_GUIDE.md      # Local setup & testing instructions
│   ├── REBRANDING_REPORT.md      # Final migration summary
│   └── presentations/            # Business & technical slide decks
│
├── scripts/                      # Developer tooling & integration tests
│   ├── start-dev.js              # Concurrent dev server starter
│   ├── test-workflows.js         # End-to-end integration test runner
│   └── test-mongodb.js           # Database diagnostic utility
│
├── api/                          # Vercel Serverless Gateway
│   └── index.js
├── .env.example                  # Environment configuration template
├── .editorconfig                 # Editor style standardization
├── .gitattributes                # Line-ending normalization
├── .gitignore                    # Professional monorepo ignore rules
├── package.json                  # Root monorepo orchestration
├── GoMeat.code-workspace         # VS Code multi-root workspace file
└── README.md                     # This document
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v20.x or higher (Tested on Node.js v24.16.0)
- **npm**: v9.x or higher

### 2. Setup
```bash
# Clone the repository
git clone https://github.com/Dhinesh1628/sagarfresh.git GoMeat
cd GoMeat

# Setup environment variables
cp .env.example .env

# Install dependencies across frontend and backend
npm run install:all
```

### 3. Run Development Servers
Start both backend (port `5000`) and frontend (port `5173`) with a single command:
```bash
npm run dev
```

Visit **`http://localhost:5173/`** in your browser.

---

## 🧪 Available NPM Commands

| Command | Action |
|:---|:---|
| `npm run dev` | Runs both backend API and frontend Vite servers concurrently |
| `npm run dev:backend` | Runs Express API in watch mode (`backend/`) |
| `npm run dev:frontend` | Runs Vite frontend with HMR (`frontend/`) |
| `npm run build` | Builds frontend production bundle (`frontend/dist/`) |
| `npm run test` | Runs end-to-end integration tests (`scripts/test-workflows.js`) |
| `npm run lint` | Runs Oxlint linter on frontend code |

---

## 🔐 Default Test Accounts

| Role | Email / Phone | Password | Capabilities |
|:---|:---|:---|:---|
| **Customer** | `pooja.sundaram@gmail.com` (or `9876543210`) | `customer123` | Browsing, ordering, tracking, ₹250 cooler return |
| **Operations Admin**| `ops@gomeat.in` (legacy `ops@sagarfresh.in`) | `admin123` | Order pipeline, courier dispatch, box fleet sanitization |

---

## 📖 Extended Documentation

- [Architecture & System Design](file:///docs/PROJECT_ARCHITECTURE.md)
- [Database Schema & Data Dictionary](file:///docs/DATABASE_SCHEMA.md)
- [REST API Reference](file:///docs/API_DOCUMENTATION.md)
- [Developer & DevOps Guide](file:///docs/DEVELOPMENT_GUIDE.md)
- [Rebranding & Restructuring Report](file:///docs/REBRANDING_REPORT.md)
- [Branding Audit Trail](file:///docs/BRANDING_AUDIT.md)

---

## 📄 License & Credits

Copyright © 2026 **GoMeat Technologies Pvt. Ltd.** All rights reserved.  
*Fresh Quality. Delivered with Care.*
