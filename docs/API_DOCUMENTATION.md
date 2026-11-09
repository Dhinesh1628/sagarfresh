# GoMeat - API Architecture & Reference Documentation

**Official Project:** GoMeat  
**Base URL:** `/api` (local: `http://localhost:5000/api`)  
**Data Format:** `application/json`  
**Authentication Scheme:** Bearer Token (`Authorization: Bearer <JWT>`)  
**Last Updated:** November 9, 2026

---

## 1. Authentication Endpoints

### 1.1 Customer & Admin Login
Authenticates an existing user with either email or 10-digit mobile number.
- **Endpoint:** `POST /api/auth/login`
- **Access:** Public
- **Request Body:**
```json
{
  "email": "pooja.sundaram@gmail.com",
  "password": "customer123"
}
```
- **Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_customer",
    "name": "Pooja Sundaram",
    "email": "pooja.sundaram@gmail.com",
    "phone": "+91 98765 43210",
    "role": "customer",
    "depositBalance": 500,
    "walletBalance": 250
  }
}
```

### 1.2 Customer Registration
Creates a new customer account with hashed password credentials.
- **Endpoint:** `POST /api/auth/register`
- **Access:** Public
- **Request Body:**
```json
{
  "name": "Arjun Rao",
  "email": "arjun@example.com",
  "phone": "+91 98451 22340",
  "password": "securePassword123",
  "address": "Flat 301, Brigade Metropolis, Whitefield, Bengaluru - 560048"
}
```
- **Response (201 Created):** Returns user object and JWT token.

### 1.3 Google One-Tap & OAuth 2.0
Server-side cryptographic token verification using `google-auth-library`.
- **Endpoint:** `POST /api/auth/google`
- **Access:** Public
- **Request Body:**
```json
{
  "credential": "<Google_ID_Token_JWT>"
}
```

### 1.4 Get Authenticated User Profile
Fetches the current user profile, active deposit balance, and wallet ledger.
- **Endpoint:** `GET /api/auth/me`
- **Access:** Authenticated (`Bearer <token>`)

---

## 2. Catalog & Products Endpoints

### 2.1 List All Cuts
Retrieves available cuts with optional category filter and keyword search.
- **Endpoint:** `GET /api/products`
- **Query Parameters:**
  - `category` (optional): `Fish & Seafood` | `Fresh Chicken` | `Tender Mutton` | `Ready to Cook`
  - `search` (optional): Keyword search across name, description, and harbor origin.
- **Response (200 OK):** Array of product objects.

### 2.2 Product Details
- **Endpoint:** `GET /api/products/:id`

### 2.3 Create Product Cut (Admin Only)
- **Endpoint:** `POST /api/products`
- **Access:** Admin

---

## 3. Order Management & Checkout Endpoints

### 3.1 Place Direct Order (COD / Wallet / Standard)
- **Endpoint:** `POST /api/orders`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "items": [
    { "productId": "prod_1", "quantity": 1 }
  ],
  "deliveryAddress": "Flat 402, Alpine Eco, Doddanekkundi, Bengaluru - 560037",
  "deliverySlot": "Today, Express in 90 Mins",
  "paymentMethod": "UPI (Google Pay)",
  "city": "Bengaluru"
}
```

### 3.2 List Customer Orders
- **Endpoint:** `GET /api/orders`
- **Access:** Authenticated (Returns caller's orders; returns all orders if caller is admin).

### 3.3 Create Payment Order (Razorpay & Combined Wallet)
- **Endpoint:** `POST /api/payments/create-order`
- **Access:** Authenticated / Guest Checkout
- **Payload:**
```json
{
  "items": [
    { "productId": "prod_1", "quantity": 1 }
  ],
  "addressDetails": {
    "fullName": "Dinesh Kandukuri",
    "email": "dinesh@example.com",
    "phone": "+91 97412 88301",
    "flatNo": "402",
    "building": "Alpine Eco",
    "street": "Outer Ring Road",
    "pincode": "560037"
  },
  "paymentMethod": "razorpay",
  "useWallet": true,
  "tipAmount": 30
}
```
- **Response (200 OK):** Returns `orderId`, `orderNumber`, `razorpayOrderId`, `amount`, and Razorpay key metadata.

### 3.4 Verify Razorpay Payment Signature
- **Endpoint:** `POST /api/payments/verify`
- **Access:** Public (cryptographically verified via HMAC SHA256 signature).

---

## 4. Cold Box Fleet & Deposit Refund Endpoints

### 4.1 Request Cold Box Return
- **Endpoint:** `POST /api/returns`
- **Access:** Authenticated
- **Request Body:**
```json
{
  "coolerId": "BOX-BLR-102",
  "pickupSlot": "Tomorrow Morning, 7:00 AM - 10:00 AM",
  "refundPreference": "wallet",
  "upiId": "customer@okhdfcbank"
}
```

### 4.2 List Returns
- **Endpoint:** `GET /api/returns`

### 4.3 Approve Return & Process Deposit Refund (Admin Only)
- **Endpoint:** `PATCH /api/returns/:id/status`
- **Access:** Admin
- **Request Body:**
```json
{
  "status": "refunded",
  "conditionNotes": "EPP insulated walls intact. Gel ice bricks clean."
}
```

---

## 5. Operations & Logistics Endpoints (Admin Only)

| Method | Endpoint | Description |
|:---|:---|:---|
| `GET` | `/api/admin/metrics` | Returns total revenue, active orders, cold chain compliance (99.6%), and return rates. |
| `GET` | `/api/admin/users` | Customer intelligence table showing order counts and lifetime value. |
| `POST` | `/api/coolers` | Onboards a new ThermalVault™ cold box into the active fleet. |
| `PATCH` | `/api/coolers/:id/status` | Updates cold box sanitation cycle or hub location. |
| `PATCH` | `/api/orders/:id/courier` | Dispatches an order to an EV delivery partner with assigned cold box. |
| `PATCH` | `/api/orders/:id/status` | Advances order pipeline status (`CONFIRMED`, `PREPARING`, `PACKED`, `OUT_FOR_DELIVERY`, `DELIVERED`). |

---

## 6. WhatsApp Cloud API & AI Bot Endpoints

- **`GET /api/webhook/whatsapp`**: Meta webhook challenge verification using `WHATSAPP_VERIFY_TOKEN`.
- **`POST /api/webhook/whatsapp`**: Inbound webhook processing customer messages and generating butcher recommendations.
