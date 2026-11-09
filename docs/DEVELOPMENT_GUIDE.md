# GoMeat - Developer & DevOps Guide

**Official Project:** GoMeat  
**Tagline:** Fresh Quality. Delivered with Care.  
**Node.js Requirement:** v20.x or higher (Tested on Node v24.16.0)  
**Package Manager:** `npm`  
**Last Updated:** November 9, 2026

---

## 1. Quick Start

### 1.1 Clone & Setup Environment
```bash
# 1. Clone repository
git clone https://github.com/Dhinesh1628/sagarfresh.git GoMeat
cd GoMeat

# 2. Copy environment template
cp .env.example .env
```

### 1.2 Install Dependencies
Install dependencies across both `backend` and `frontend`:
```bash
npm run install:all
```

### 1.3 Run Local Development
You can run both backend and frontend concurrently with a single command:
```bash
npm run dev
```

Or run them in dedicated terminal sessions:
```bash
# Terminal 1 - Backend API (Port 5000)
npm run dev:backend

# Terminal 2 - Frontend Client (Port 5173 with HMR)
npm run dev:frontend
```

Open your browser at `http://localhost:5173/`.

---

## 2. Environment Variables Configuration

Create a root `.env` file (configured according to `.env.example`):

```ini
# Server Port
PORT=5000

# JSON Web Token Secret
JWT_SECRET=gomeat-cuts-india-secret-2026

# MongoDB Connection String (Atlas URI or local document store)
MONGODB_URI=mongodb://127.0.0.1:27017/gomeat

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com

# Razorpay Online Payment Gateway
RAZORPAY_KEY_ID=rzp_test_GoMeatDemoKey
RAZORPAY_KEY_SECRET=GoMeatTestSecret2026
RAZORPAY_WEBHOOK_SECRET=GoMeatWebhookSecret2026

# Meta WhatsApp Cloud API
WHATSAPP_TOKEN=your_meta_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_id_here
WHATSAPP_VERIFY_TOKEN=gomeat_whatsapp_verify_2026
```

---

## 3. Available NPM Scripts

| Command | Working Directory | Purpose |
|:---|:---|:---|
| `npm run dev` | Root | Starts both backend API and frontend Vite servers concurrently. |
| `npm run dev:backend` | `backend/` | Starts Express API with Node `--watch` live reload. |
| `npm run dev:frontend` | `frontend/` | Starts Vite React client dev server with Hot Module Replacement (HMR). |
| `npm run build` | `frontend/` | Runs TypeScript compilation (`tsc -b`) and Vite production bundle. |
| `npm run build:frontend` | `frontend/` | Alias for frontend production build. |
| `npm run install:all` | Root | Installs dependencies for both `backend` and `frontend`. |
| `npm run test` | Root | Executes end-to-end integration workflows (`scripts/test-workflows.js`). |
| `npm run lint` | `frontend/` | Runs Oxlint linter for code health and syntax checks. |

---

## 4. Default Seed Accounts for Testing

| Role | Username / Identifier | Password | Access Rights |
|:---|:---|:---|:---|
| **Customer** | `pooja.sundaram@gmail.com` (or mobile `9876543210`) | `customer123` | Storefront catalog, checkout, cart, active order tracking, cooler box return. |
| **Admin** | `ops@gomeat.in` (legacy `ops@sagarfresh.in` supported) | `admin123` | Operations dashboard, cooler fleet management, dispatch orders, deposit refunds. |

---

## 5. Deployment Guide (Vercel)

The repository includes a production-grade `vercel.json` configured for zero-downtime serverless deployment:

```json
{
  "version": 2,
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "rewrites": [
    { "source": "/api", "destination": "/api/index.js" },
    { "source": "/api/(.*)", "destination": "/api/index.js" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

1. Connect the GitHub repository to Vercel.
2. In Project Settings, set Environment Variables matching `.env.example`.
3. Vercel automatically runs the build and routes API calls to the serverless backend.
