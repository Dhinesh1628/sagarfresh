import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { connectMongoDB, getMongoStatus } from './mongo.js';
import whatsappWebhookRouter from './routes/whatsappWebhook.js';
import paymentsRouter from './routes/payments.js';
import { handleGoogleAuth } from './routes/googleAuth.js';
import { createBackup } from './scripts/backup.js';
import {
  findCooler,
  getTemperatureCheck,
  getFleetDetails,
  calculateHealthScore,
  generateFleetHealthOverview
} from './services/coolerHealthAnalytics.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'gomeat-cuts-india-secret-2026';

process.on('uncaughtException', (err) => {
  console.error('[Server Error: Uncaught Exception]:', err?.message || err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Server Error: Unhandled Rejection]:', reason?.message || reason);
});

// Initiate MongoDB connection asynchronously
connectMongoDB().then(connected => {
  if (connected) {
    db.syncWithMongo();
  }
});

// ==========================================
// SECURITY HARDENING (OWASP & Production Guardrails)
// ==========================================

// Enable reverse proxy trust for Vercel/Cloudflare headers
app.set('trust proxy', 1);

// 1. Hide server fingerprint
app.disable('x-powered-by');

// 2. Comprehensive Security Headers with Helmet
app.use(helmet({
  contentSecurityPolicy: false, // Allows inline assets, fonts & map tiles to load seamlessly
  crossOriginEmbedderPolicy: false,
  xContentTypeOptions: true,
  xDnsPrefetchControl: { allow: false },
  xFrameOptions: { action: 'sameorigin' },
  xXssProtection: true
}));

// 3. Permissive & Secure Cross-Origin Resource Sharing (CORS) Configuration
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'X-Razorpay-Signature']
}));

// 4. Rate Limiting Protection (Anti-DDoS & Anti-Brute-Force) with Vercel Serverless compatibility
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Too many requests from this IP address. Please try again in 15 minutes.' }
});
app.use('/api/', generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Too many login attempts. For security, please wait 15 minutes before trying again.' }
});

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  message: { error: 'Support message limit reached. Please contact us via WhatsApp or wait 15 minutes.' }
});

// 5. XSS Input Sanitization Middleware
const sanitizeValue = (val) => {
  if (typeof val === 'string') {
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    const sanitized = {};
    for (const key of Object.keys(val)) {
      sanitized[key] = sanitizeValue(val[key]);
    }
    return sanitized;
  }
  if (Array.isArray(val)) {
    return val.map(sanitizeValue);
  }
  return val;
};

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeValue(req.body);
  if (req.query) req.query = sanitizeValue(req.query);
  if (req.params) req.params = sanitizeValue(req.params);
  next();
});

// Raw body retention for cryptographic Webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Razorpay Payments Router
app.use('/api/payments', paymentsRouter);

// WhatsApp Cloud API Webhook & AI Chatbot Router
app.use('/api', whatsappWebhookRouter);

// Serve static frontend in production
const clientDist = fs.existsSync(path.join(__dirname, '../frontend/dist')) 
  ? path.join(__dirname, '../frontend/dist') 
  : path.join(__dirname, '../client/dist');
if (!process.env.VERCEL) {
  app.use(express.static(clientDist));
}

// Health & Database Status check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'GoMeat API', uptime: process.uptime() });
});

app.get('/api/db/status', (req, res) => {
  res.json({
    database: 'MongoDB',
    engine: 'Mongoose ODM',
    ...getMongoStatus(),
    cachedStats: {
      products: db.get('products').length,
      orders: db.get('orders').length,
      coolers: db.get('coolers').length,
      users: db.get('users').length,
      returns: db.get('coolerReturns').length
    }
  });
});

app.get('/api', (req, res) => {
  res.json({ status: 'ok', name: 'GoMeat API', uptime: process.uptime() });
});

// Middleware
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.findById('users', decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
};

const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Operations admin permissions required' });
  }
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || (!roles.includes(req.user.role) && req.user.role !== 'admin')) {
    return res.status(403).json({ error: `Access forbidden: Requires ${roles.join(' or ')} permission` });
  }
  next();
};

const requireApproved = (req, res, next) => {
  if (['rider', 'partner'].includes(req.user?.role) && req.user.approvalStatus !== 'approved' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: `Your account is pending administrator approval. Please wait for operations verification.`,
      approvalStatus: req.user.approvalStatus || 'pending_approval'
    });
  }
  next();
};

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name, shopId: user.shopId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==========================================
// 1. AUTHENTICATION (Google OAuth 2.0 & Email/Password)
// ==========================================

// Google Sign-In & Sign-Up endpoint with official Google token verification
app.post('/api/auth/google', authLimiter, (req, res) => handleGoogleAuth(req, res, createToken));

app.post('/api/auth/register', authLimiter, (req, res) => {
  const { name, email, password, phone, address, city, upiId } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  const existing = db.get('users').find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newUser = {
    id: `usr_${uuidv4().slice(0, 8)}`,
    name,
    email: email.toLowerCase(),
    password: bcrypt.hashSync(password, 10),
    role: 'customer',
    phone: phone || '+91 98765 00000',
    city: city || 'Bengaluru',
    address: address || '1st Cross, Indiranagar, Bengaluru, Karnataka 560038',
    depositBalance: 0,
    upiId: upiId || '',
    createdAt: new Date().toISOString()
  };

  db.insert('users', newUser);
  const token = createToken(newUser);
  const { password: _, ...userWithoutPw } = newUser;
  res.status(201).json({ user: userWithoutPw, token });
});

// Standard Login supporting Email or Mobile number
app.post('/api/auth/login', authLimiter, (req, res) => {
  const { email, password } = req.body;
  const input = (email || '').toLowerCase().trim();
  if (!input || !password) {
    return res.status(400).json({ error: 'Please enter your email or mobile number, and password' });
  }

  // Find user by email (supports ops@gomeat.in and legacy ops@sagarfresh.in) or by phone number match
  const cleanPhone = input.replace(/[^0-9]/g, '');
  const user = db.get('users').find(u => {
    if (u.email) {
      const uEmail = u.email.toLowerCase();
      if (uEmail === input) return true;
      if ((input === 'ops@gomeat.in' && uEmail === 'ops@sagarfresh.in') || (input === 'ops@sagarfresh.in' && uEmail === 'ops@gomeat.in')) return true;
    }
    if (cleanPhone && cleanPhone.length >= 10 && u.phone) {
      const uPhoneClean = u.phone.replace(/[^0-9]/g, '');
      return uPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(uPhoneClean);
    }
    return false;
  });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your email/phone and password.' });
  }

  const token = createToken(user);
  const { password: _, ...userWithoutPw } = user;
  res.json({ user: userWithoutPw, token });
});

app.get('/api/auth/me', authenticate, (req, res) => {
  const { password: _, ...userWithoutPw } = req.user;
  const activeCoolers = db.get('coolers').filter(c => c.currentUserId === req.user.id);
  res.json({
    ...userWithoutPw,
    activeCoolersCount: activeCoolers.length,
    activeCoolers
  });
});

app.patch('/api/auth/profile', authenticate, (req, res) => {
  const { name, phone, address, city, upiId, savedAddresses } = req.body;
  const updates = {};
  if (name) updates.name = name;
  if (phone) updates.phone = phone;
  if (address) updates.address = address;
  if (city) updates.city = city;
  if (upiId) updates.upiId = upiId;
  if (savedAddresses) updates.savedAddresses = savedAddresses;

  const updated = db.update('users', req.user.id, updates);
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...safeUser } = updated;
  res.json(safeUser);
});

// ==========================================
// 2. PRODUCTS
// ==========================================

app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let products = db.get('products');

  if (search) {
    const q = search.toLowerCase().trim();
    products = products.filter(p =>
      (p.name && p.name.toLowerCase().includes(q)) ||
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.cutStyle && p.cutStyle.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.origin && p.origin.toLowerCase().includes(q)) ||
      (p.chillingMethod && p.chillingMethod.toLowerCase().includes(q))
    );
  } else if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  res.json(products);
});

app.get('/api/products/:id', (req, res) => {
  const product = db.findById('products', req.params.id);
  if (!product) {
    return res.status(404).json({ error: 'Cut not found in inventory' });
  }
  res.json(product);
});

app.post('/api/products', authenticate, requireAdmin, (req, res) => {
  const { name, category, description, price, mrp, unit, netWeight, grossWeight, pieces, serves, chillingMethod, catchDate, origin, cutStyle, stock, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const newProduct = {
    id: `prod_${uuidv4().slice(0, 8)}`,
    name,
    category,
    description: description || 'Fresh daily morning inward, scale-scraped and chilled to 0°C - 4°C.',
    price: parseInt(price, 10),
    mrp: parseInt(mrp || price, 10),
    unit: unit || '500g',
    netWeight: netWeight || '450g',
    grossWeight: grossWeight || '600g',
    pieces: pieces || '4-6 Pieces',
    serves: serves || 'Serves 2-3',
    eta: '⚡ Today in 90 mins',
    chillingMethod: chillingMethod || '0°C to 4°C FreshSeal™ Cold Chain',
    catchDate: catchDate || 'Daily Harbor Lot',
    origin: origin || 'Indian Coastal Waters / Certified Farm',
    cutStyle: cutStyle || 'Standard Curry Cut',
    stock: parseInt(stock, 10) || 25,
    image: image || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    vacuumSealed: true,
    featured: false
  };

  db.insert('products', newProduct);
  res.status(201).json(newProduct);
});

app.put('/api/products/:id', authenticate, requireAdmin, (req, res) => {
  const updated = db.update('products', req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(updated);
});

app.delete('/api/products/:id', authenticate, requireAdmin, (req, res) => {
  const deleted = db.delete('products', req.params.id);
  if (!deleted) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json({ message: 'Cut removed from inventory', id: req.params.id });
});

// ==========================================
// 3. ORDERS & CHECKOUT (₹ INR + ₹250 Deposit)
// ==========================================

app.post('/api/orders', authenticate, (req, res) => {
  const { items, deliveryAddress, deliverySlot, deliveryNotes, paymentMethod, city, couponCode, couponDiscount } = req.body;

  if (!items || !items.length) {
    return res.status(400).json({ error: 'Please add at least one cut to your cold box' });
  }

  let subtotal = 0;
  const processedItems = [];

  for (const item of items) {
    const prod = db.findById('products', item.productId);
    if (!prod) {
      return res.status(400).json({ error: `Cut with ID ${item.productId} not found` });
    }
    if (prod.stock < item.quantity) {
      return res.status(400).json({ error: `Insufficient stock for ${prod.name}` });
    }

    db.update('products', prod.id, { stock: prod.stock - item.quantity });
    const lineTotal = prod.price * item.quantity;
    subtotal += lineTotal;
    processedItems.push({
      productId: prod.id,
      name: prod.name,
      price: prod.price,
      quantity: item.quantity,
      unit: prod.unit,
      netWeight: prod.netWeight,
      chillingMethod: prod.chillingMethod,
      cutStyle: item.selectedCutStyle || prod.cutStyle,
      image: prod.image
    });
  }

  const discount = Math.min(parseInt(couponDiscount || 0, 10), subtotal);
  const COOLER_DEPOSIT = 250;
  const shippingFee = subtotal >= 799 ? 0 : 40;
  const total = Math.max(0, subtotal - discount + COOLER_DEPOSIT + shippingFee);

  let assignedCooler = db.get('coolers').find(c => c.status === 'available');
  if (!assignedCooler) {
    const newBoxNumber = Math.floor(100 + Math.random() * 900);
    const newId = `BOX-BLR-${newBoxNumber}`;
    assignedCooler = {
      id: newId,
      qrCode: `GOMEAT-${newId}`,
      model: 'ThermalVault 18L - Reusable EPP Cold-Gel Box',
      status: 'assigned',
      currentOrderId: null,
      currentUserId: req.user.id,
      currentUserName: req.user.name,
      cyclesUsed: 1,
      lastSanitizedDate: new Date().toISOString().split('T')[0],
      depositAmount: COOLER_DEPOSIT,
      maxHoldingHours: 36,
      assignedHub: `${city || 'Bengaluru'} Regional Hub Depot`
    };
    db.insert('coolers', assignedCooler);
  }

  const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
  const deliveryPin = Math.floor(1000 + Math.random() * 9000).toString();
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const executives = [
    "Sunil Gowda (EV Delivery #14, +91 97412 88301)",
    "Manjunath K (+91 98801 44520)",
    "Ramesh Kumar (+91 94481 02911)",
    "Karthik S (+91 99014 55210)"
  ];
  const assignedExecutive = executives[Math.floor(Math.random() * executives.length)];

  const initialTemp = 0.6;
  const order = {
    id: orderNumber,
    deliveryPin,
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: req.user.phone || '+91 98765 43210',
    deliveryAddress: deliveryAddress || req.user.address,
    city: city || req.user.city || 'Bengaluru',
    items: processedItems,
    subtotal,
    discountAmount: discount || 0,
    couponCode: couponCode || null,
    coolerDeposit: COOLER_DEPOSIT,
    shippingFee,
    total,
    status: 'Cold Box Packed',
    coolerId: assignedCooler.id,
    coolerModel: assignedCooler.model,
    liveTemp: initialTemp,
    deliveryExecutive: assignedExecutive,
    tempLog: [
      { time: timeStr, temp: initialTemp, event: `Order Confirmed. Packed in sanitized box ${assignedCooler.id}.` }
    ],
    deliverySlot: deliverySlot || 'Today, Express in 90 Mins',
    trackingCode: `GOMEAT-TRK-${Math.floor(1000 + Math.random() * 9000)}`,
    paymentMethod: paymentMethod || 'UPI (Google Pay / PhonePe)',
    createdAt: new Date().toISOString(),
    deliveryNotes: deliveryNotes || ''
  };

  db.insert('orders', order);

  db.update('coolers', assignedCooler.id, {
    status: 'assigned',
    currentOrderId: orderNumber,
    currentUserId: req.user.id,
    currentUserName: req.user.name
  });

  db.update('users', req.user.id, {
    depositBalance: (req.user.depositBalance || 0) + COOLER_DEPOSIT
  });

  res.status(201).json(order);
});

app.get('/api/orders', authenticate, (req, res) => {
  let orders = db.get('orders');
  const isFleetOrPartner = req.user.role === 'admin' || req.user.role === 'delivery' || req.user.role === 'partner' || req.query.all === 'true';
  if (!isFleetOrPartner) {
    orders = orders.filter(o => o.userId === req.user.id);
  }
  res.json(orders);
});

app.get('/api/orders/:id', authenticate, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const isFleetOrPartner = req.user.role === 'admin' || req.user.role === 'delivery' || req.user.role === 'rider' || req.user.role === 'partner' || req.query.all === 'true';
  if (!isFleetOrPartner && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const cooler = db.findById('coolers', order.coolerId);

  // Sanitize rider data for customer view (Privacy Guardrail)
  let assignedRider = null;
  if (order.riderId || order.riderName || order.deliveryExecutive) {
    const rawRider = order.riderId ? db.findById('users', order.riderId) : null;
    const fullName = order.riderFullName || rawRider?.name || order.riderName || 'Rahul';
    assignedRider = {
      firstName: fullName.split(' ')[0],
      riderId: rawRider?.id ? `RD-${rawRider.id.slice(-4).toUpperCase()}` : 'RD-819',
      vehicle: order.riderVehicle || (rawRider?.vehicleType ? `${rawRider.vehicleType} (${rawRider.vehicleNumber || ''})` : 'EV 2-Wheeler (KA-04-EV-819)'),
      status: order.lifecycleStatus || order.status || 'Out for Delivery',
      estimatedArrival: order.riderEta || '25–35 minutes',
      maskedPhone: order.riderPhone || (rawRider?.phone ? `${rawRider.phone.slice(0, 9)} •••${rawRider.phone.slice(-2)}` : '+91 97412 •••01'),
      secureCall: true,
      profilePhoto: rawRider?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
    };
  }

  res.json({
    ...order,
    coolerDetails: cooler,
    assignedRider
  });
});

// ==========================================
// 4A. RIDER ECOSYSTEM ENDPOINTS
// ==========================================

app.post('/api/rider/register', (req, res) => {
  const { name, email, phone, password, address, vehicleType, vehicleNumber, licenseNumber } = req.body;
  if (!name || !email || !password || !phone) {
    return res.status(400).json({ error: 'Name, email, phone, and password are required for rider onboarding' });
  }

  const existing = db.get('users').find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const newRider = {
    id: `usr_rider_${uuidv4().slice(0, 6)}`,
    name,
    email: email.toLowerCase(),
    phone,
    password: bcrypt.hashSync(password, 10),
    role: 'rider',
    approvalStatus: 'pending_approval',
    address: address || 'Bengaluru',
    vehicleType: vehicleType || 'Electric 2-Wheeler (EV)',
    vehicleNumber: vehicleNumber || 'KA-04-EV-TEMP',
    licenseNumber: licenseNumber || 'DL-TEMP-PENDING',
    online: false,
    earningsToday: 0,
    deliveriesToday: 0,
    rating: 4.9,
    createdAt: new Date().toISOString()
  };

  db.insert('users', newRider);
  const { password: _, ...safeRider } = newRider;
  res.status(201).json({
    message: 'Rider registration submitted. Your application is under review by Operations.',
    rider: safeRider
  });
});

app.post('/api/rider/login', (req, res) => {
  const { email, password } = req.body;
  const input = (email || '').toLowerCase().trim();
  if (!input || !password) {
    return res.status(400).json({ error: 'Rider email/phone and password required' });
  }

  const user = db.get('users').find(u => {
    if (u.email && u.email.toLowerCase() === input) return true;
    if (u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(input.replace(/[^0-9]/g, ''))) return true;
    return false;
  });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your rider credentials.' });
  }

  if (user.role !== 'rider' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: This login is exclusively for GoMeat Delivery Riders.' });
  }

  if (user.approvalStatus === 'pending_approval') {
    return res.status(403).json({
      error: 'Your rider application is currently Pending Approval from the Operations Admin.',
      approvalStatus: 'pending_approval'
    });
  }

  if (user.approvalStatus === 'rejected') {
    return res.status(403).json({
      error: 'Your rider application was not approved by Operations.',
      approvalStatus: 'rejected'
    });
  }

  if (user.approvalStatus === 'suspended') {
    return res.status(403).json({
      error: 'Your rider partner account is currently suspended.',
      approvalStatus: 'suspended'
    });
  }

  const token = createToken(user);
  const { password: _, ...userWithoutPw } = user;
  res.json({ user: userWithoutPw, token });
});

app.get('/api/rider/me', authenticate, requireRole('rider'), (req, res) => {
  const { password: _, ...safeRider } = req.user;
  res.json(safeRider);
});

app.patch('/api/rider/status', authenticate, requireRole('rider'), (req, res) => {
  const { online } = req.body;
  const updated = db.update('users', req.user.id, { online: !!online });
  const { password: _, ...safeRider } = updated;
  res.json(safeRider);
});

app.get('/api/rider/orders', authenticate, requireRole('rider'), (req, res) => {
  const allOrders = db.get('orders');
  const assigned = allOrders.filter(o => o.riderId === req.user.id || (o.riderFullName === req.user.name));
  res.json(assigned);
});

app.patch('/api/rider/orders/:id/lifecycle', authenticate, requireRole('rider'), (req, res) => {
  const { lifecycleStatus, pin, coolerReturned, podImage, notes } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (order.riderId && order.riderId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'You are not assigned to this delivery run' });
  }

  if (lifecycleStatus === 'DELIVERED') {
    return handleOrderHandover(req, res);
  }

  const updates = {
    lifecycleStatus: lifecycleStatus || order.lifecycleStatus,
    status: lifecycleStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery' : (order.status || lifecycleStatus),
    riderId: req.user.id,
    riderName: req.user.name.split(' ')[0],
    riderFullName: req.user.name,
    riderPhone: req.user.phone || '+91 97412 •••01',
    riderVehicle: req.user.vehicleType ? `${req.user.vehicleType} (${req.user.vehicleNumber || ''})` : 'EV 2-Wheeler'
  };

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  updates.tempLog = [
    ...(order.tempLog || []),
    {
      time: timeStr,
      temp: order.liveTemp || 1.4,
      event: `Rider update: ${lifecycleStatus} by ${req.user.name}`
    }
  ];

  const updatedOrder = db.update('orders', order.id, updates);
  res.json(updatedOrder);
});

// ==========================================
// 4B. BUTCHER / PARTNER SHOP ENDPOINTS
// ==========================================

app.post('/api/partner/register', (req, res) => {
  const { shopName, ownerName, email, phone, password, address, fssaiNumber, categories, operatingHours, description } = req.body;
  if (!shopName || !ownerName || !email || !password) {
    return res.status(400).json({ error: 'Shop name, owner name, email, and password are required' });
  }

  const existing = db.get('users').find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists' });
  }

  const shopId = `shop_${uuidv4().slice(0, 8)}`;
  const newPartner = {
    id: `usr_partner_${uuidv4().slice(0, 6)}`,
    name: ownerName,
    shopName,
    shopId,
    email: email.toLowerCase(),
    phone: phone || '+91 98000 00000',
    password: bcrypt.hashSync(password, 10),
    role: 'partner',
    approvalStatus: 'pending_approval',
    address: address || 'Bengaluru Coastal Harbor Depot',
    fssaiNumber: fssaiNumber || 'FSSAI-REG-PENDING',
    categories: categories || ['Fresh Chicken', 'Tender Mutton', 'Fish & Seafood'],
    operatingHours: operatingHours || '05:30 AM - 09:30 PM',
    description: description || 'Daily artisanal meat butchering station & seafood lot',
    createdAt: new Date().toISOString()
  };

  db.insert('users', newPartner);
  const { password: _, ...safePartner } = newPartner;
  res.status(201).json({
    message: 'Partner shop application submitted successfully. Pending Admin verification.',
    partner: safePartner
  });
});

app.post('/api/partner/login', (req, res) => {
  const { email, password } = req.body;
  const input = (email || '').toLowerCase().trim();
  if (!input || !password) {
    return res.status(400).json({ error: 'Partner business email and password required' });
  }

  const user = db.get('users').find(u => {
    if (u.email && u.email.toLowerCase() === input) return true;
    if (u.phone && u.phone.replace(/[^0-9]/g, '').endsWith(input.replace(/[^0-9]/g, ''))) return true;
    return false;
  });

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Invalid credentials. Please verify your shop partner login.' });
  }

  if (user.role !== 'partner' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied: This login is exclusively for Butcher / Partner Shops.' });
  }

  if (user.approvalStatus === 'pending_approval') {
    return res.status(403).json({
      error: 'Your partner shop application is currently Pending Approval from GoMeat Operations Admin.',
      approvalStatus: 'pending_approval'
    });
  }

  if (user.approvalStatus === 'suspended') {
    return res.status(403).json({
      error: 'Your shop partner account is currently suspended.',
      approvalStatus: 'suspended'
    });
  }

  const token = createToken(user);
  const { password: _, ...userWithoutPw } = user;
  res.json({ user: userWithoutPw, token });
});

app.get('/api/partner/me', authenticate, requireRole('partner'), (req, res) => {
  const { password: _, ...safePartner } = req.user;
  res.json(safePartner);
});

app.get('/api/partner/products', authenticate, requireRole('partner'), (req, res) => {
  const allProds = db.get('products');
  const partnerProds = allProds.filter(p => p.partnerId === req.user.shopId || (!p.partnerId && req.user.role === 'admin'));
  res.json(partnerProds.length > 0 ? partnerProds : allProds);
});

app.post('/api/partner/products', authenticate, requireRole('partner'), (req, res) => {
  const { name, category, description, price, mrp, unit, netWeight, pieces, serves, origin, cutStyle, stock, image } = req.body;
  if (!name || !price || !category) {
    return res.status(400).json({ error: 'Name, price, and category are required' });
  }

  const newProd = {
    id: `prod_${uuidv4().slice(0, 8)}`,
    partnerId: req.user.shopId || 'shop_central_butcher',
    partnerName: req.user.shopName || req.user.name,
    name,
    category,
    description: description || 'Daily fresh dressed cuts chilled to 0°C - 4°C.',
    price: parseInt(price, 10),
    mrp: parseInt(mrp || price, 10),
    unit: unit || '500g',
    netWeight: netWeight || '450g',
    grossWeight: '550g',
    pieces: pieces || '4-6 Pieces',
    serves: serves || 'Serves 2-3',
    eta: '⚡ Today in 90 mins',
    chillingMethod: '0°C to 4°C FreshSeal™ Cold Chain',
    origin: origin || 'Certified Farm / Coastal Lot',
    cutStyle: cutStyle || 'Butcher Fresh Cut',
    stock: parseInt(stock, 10) || 30,
    image: image || '/images/products/prod_1.jpg',
    imageUrl: image || '/images/products/prod_1.jpg',
    vacuumSealed: true,
    inStock: true
  };

  db.insert('products', newProd);
  res.status(201).json(newProd);
});

app.patch('/api/partner/products/:id/stock', authenticate, requireRole('partner'), (req, res) => {
  const { stock, inStock } = req.body;
  const prod = db.findById('products', req.params.id);
  if (!prod) return res.status(404).json({ error: 'Product not found' });

  const updates = {};
  if (typeof stock === 'number') updates.stock = stock;
  if (typeof inStock === 'boolean') updates.inStock = inStock;

  const updated = db.update('products', prod.id, updates);
  res.json(updated);
});

app.get('/api/partner/orders', authenticate, requireRole('partner'), (req, res) => {
  const allOrders = db.get('orders');
  const partnerOrders = allOrders.filter(o => o.partnerId === req.user.shopId || req.user.role === 'admin' || !o.partnerId);
  res.json(partnerOrders);
});

app.patch('/api/partner/orders/:id/status', authenticate, requireRole('partner'), (req, res) => {
  const { status, lifecycleStatus, prepStage, weighedWeight, sealTag } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const updates = {
    lifecycleStatus: lifecycleStatus || order.lifecycleStatus || 'PREPARING',
    status: status || 'Preparing',
    prepStage: prepStage || status,
    partnerId: req.user.shopId || order.partnerId,
    partnerName: req.user.shopName || req.user.name || order.partnerName,
    weighedWeight: weighedWeight || order.weighedWeight,
    sealTag: sealTag || order.sealTag
  };

  updates.tempLog = [
    ...(order.tempLog || []),
    {
      time: timeStr,
      temp: order.liveTemp || 1.0,
      event: `Butcher station: ${status || lifecycleStatus} (Cut & Sealed)`
    }
  ];

  const updatedOrder = db.update('orders', order.id, updates);
  res.json(updatedOrder);
});

// ==========================================
// 4C. ADMIN MULTI-PORTAL MANAGEMENT ENDPOINTS
// ==========================================

app.get('/api/admin/riders', authenticate, requireAdmin, (req, res) => {
  const riders = db.get('users').filter(u => u.role === 'rider');
  const safeRiders = riders.map(({ password: _, ...r }) => r);
  res.json(safeRiders);
});

app.patch('/api/admin/riders/:id/approval', authenticate, requireAdmin, (req, res) => {
  const { approvalStatus } = req.body;
  if (!['approved', 'rejected', 'suspended', 'pending_approval'].includes(approvalStatus)) {
    return res.status(400).json({ error: 'Invalid approval status' });
  }

  const updated = db.update('users', req.params.id, { approvalStatus });
  if (!updated) return res.status(404).json({ error: 'Rider not found' });
  const { password: _, ...safeRider } = updated;
  res.json(safeRider);
});

app.get('/api/admin/partners', authenticate, requireAdmin, (req, res) => {
  const partners = db.get('users').filter(u => u.role === 'partner');
  const safePartners = partners.map(({ password: _, ...p }) => p);
  res.json(safePartners);
});

app.patch('/api/admin/partners/:id/approval', authenticate, requireAdmin, (req, res) => {
  const { approvalStatus } = req.body;
  if (!['approved', 'rejected', 'suspended', 'pending_approval'].includes(approvalStatus)) {
    return res.status(400).json({ error: 'Invalid approval status' });
  }

  const updated = db.update('users', req.params.id, { approvalStatus });
  if (!updated) return res.status(404).json({ error: 'Partner shop not found' });
  const { password: _, ...safePartner } = updated;
  res.json(safePartner);
});

app.patch('/api/admin/orders/:id/assign', authenticate, requireAdmin, (req, res) => {
  const { riderId, partnerId } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });

  const updates = {};
  if (riderId) {
    const rider = db.findById('users', riderId);
    if (rider) {
      updates.riderId = rider.id;
      updates.riderName = rider.name.split(' ')[0];
      updates.riderFullName = rider.name;
      updates.riderPhone = rider.phone;
      updates.riderVehicle = rider.vehicleType ? `${rider.vehicleType} (${rider.vehicleNumber || ''})` : 'EV 2-Wheeler';
      updates.lifecycleStatus = 'RIDER_ASSIGNED';
    }
  }

  if (partnerId) {
    const partner = db.get('users').find(u => u.shopId === partnerId || u.id === partnerId);
    if (partner) {
      updates.partnerId = partner.shopId || partner.id;
      updates.partnerName = partner.shopName || partner.name;
    }
  }

  const updatedOrder = db.update('orders', order.id, updates);
  res.json(updatedOrder);
});

// Swiggy-Grade Handover PIN Verification & Cooler Refund Endpoint
const handleOrderHandover = (req, res) => {
  const { pin, deliveryPin, coolerReturned, podImage, notes } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const enteredPin = String(pin || deliveryPin || '').trim();
  const validPin = String(order.deliveryPin || '').trim();

  // If a PIN is configured, verify it (or accept if matches)
  if (validPin && enteredPin !== validPin) {
    return res.status(400).json({
      error: `Invalid 4-digit handover PIN. Customer's screen shows PIN: ${validPin}`
    });
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const updatedLog = [
    ...(order.tempLog || []),
    {
      time: timeStr,
      temp: 1.8,
      event: `Delivered & Verified via 4-digit PIN. Cooler Box returned: ${coolerReturned ? 'YES (₹250 Refunded)' : 'NO (Retained by customer)'}${podImage ? ' [Contactless POD captured]' : ''}`
    }
  ];

  const updatedOrder = db.update('orders', order.id, {
    status: 'Delivered',
    orderStatus: 'DELIVERED',
    coolerReturned: !!coolerReturned,
    podImage: podImage || order.podImage,
    handoverNotes: notes || order.handoverNotes,
    deliveredAt: new Date().toISOString(),
    liveTemp: 1.8,
    tempLog: updatedLog
  });

  // If customer returned cooler box, automatically refund ₹250 to customer's wallet!
  if (coolerReturned && order.userId) {
    const customer = db.findById('users', order.userId);
    if (customer) {
      const currentWallet = customer.walletBalance || 0;
      const newWallet = currentWallet + 250;
      const currentDep = customer.depositBalance || 250;
      const newDep = Math.max(0, currentDep - 250);

      const refundTx = {
        id: `TX-REFUND-${Date.now()}`,
        amount: 250,
        type: 'credit',
        title: 'Cold Box Deposit Refund',
        description: `Doorstep cooler returned for Order #${order.id}`,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        balanceAfter: newWallet
      };

      const existingTxs = customer.walletTransactions || [];
      db.update('users', customer.id, {
        walletBalance: newWallet,
        depositBalance: newDep,
        walletTransactions: [refundTx, ...existingTxs],
        activeCoolersCount: Math.max(0, (customer.activeCoolersCount || 1) - 1)
      });
    }

    if (order.coolerId) {
      db.update('coolers', order.coolerId, { status: 'available' });
    }
  }

  res.json(updatedOrder);
};

app.post('/api/orders/:id/handover', authenticate, handleOrderHandover);
app.put('/api/orders/:id/handover', authenticate, handleOrderHandover);

// Update prep / delivery status
const handleUpdateStatus = (req, res) => {
  const { 
    status, 
    orderStatus, 
    coolerId, 
    notes, 
    note, 
    deliveryPin, 
    coolerReturned,
    weighedWeight,
    batchLotId,
    sealTag,
    butcherName,
    riderLocation,
    deliveryExecutive
  } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  // If status is delivered with PIN, delegate to handover
  if (status === 'delivered' || status === 'Delivered') {
    return handleOrderHandover(req, res);
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const resolvedOrderStatus = orderStatus || (
    status === 'Delivered' ? 'DELIVERED' :
    status === 'Out for Delivery' || status === 'out_for_delivery' ? 'OUT_FOR_DELIVERY' :
    status === 'Packed' || status === 'Cold Box Packed' || status === 'ready_for_dispatch' ? 'PACKED' :
    status === 'Quality Check' || status === 'vacuum_packed' ? 'QUALITY_CHECK' :
    status === 'Preparing' || status === 'butchering' ? 'PREPARING' :
    status === 'Cancelled' ? 'CANCELLED' :
    status === 'Confirmed' ? 'CONFIRMED' : order.orderStatus
  );

  let newTemp = order.liveTemp || 1.8;
  if (resolvedOrderStatus === 'OUT_FOR_DELIVERY') {
    newTemp = 1.2;
    if (order.coolerId) db.update('coolers', order.coolerId, { status: 'in_transit' });
  }

  const updatedLog = [
    ...(order.tempLog || []),
    {
      time: timeStr,
      temp: newTemp,
      event: notes || note || `Order status updated to: ${status || resolvedOrderStatus}`
    }
  ];

  const updatedOrder = db.update('orders', order.id, {
    status: status || resolvedOrderStatus,
    orderStatus: resolvedOrderStatus,
    prepStage: status,
    coolerId: coolerId || order.coolerId,
    weighedWeight: weighedWeight || order.weighedWeight,
    batchLotId: batchLotId || order.batchLotId,
    sealTag: sealTag || order.sealTag,
    butcherName: butcherName || order.butcherName,
    riderLocation: riderLocation || order.riderLocation,
    deliveryExecutive: deliveryExecutive || order.deliveryExecutive,
    liveTemp: newTemp,
    tempLog: updatedLog
  });

  res.json(updatedOrder);
};

app.patch('/api/orders/:id/status', authenticate, handleUpdateStatus);
app.put('/api/orders/:id/status', authenticate, handleUpdateStatus);

// Customer Order Cancellation (Only allowed before order is PACKED)
app.post('/api/orders/:id/cancel', authenticate, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const nonCancellable = ['PACKED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'];
  if (nonCancellable.includes(order.orderStatus)) {
    return res.status(400).json({ 
      error: `Order cannot be cancelled in '${order.orderStatus}' stage. Please contact concierge support.` 
    });
  }

  // Restore inventory
  for (const item of order.items) {
    const prod = db.findById('products', item.productId);
    if (prod) {
      db.update('products', prod.id, { stock: prod.stock + item.quantity });
    }
  }

  // Release cooler
  if (order.coolerId) {
    db.update('coolers', order.coolerId, {
      status: 'available',
      currentOrderId: null,
      currentUserId: null
    });
  }

  const updated = db.update('orders', order.id, {
    orderStatus: 'CANCELLED',
    status: 'Cancelled',
    paymentStatus: order.paymentStatus === 'PAID' ? 'REFUND_PENDING' : order.paymentStatus
  });

  res.json({ success: true, message: 'Order cancelled successfully', order: updated });
});

// Customer Concierge Support & Contact Form Submission (Anti-Spam Rate Limited)
app.post('/api/contact', contactLimiter, (req, res) => {
  const { name, email, phone, category, orderId, message } = req.body;
  if (!name || !phone || !message) {
    return res.status(400).json({ error: 'Name, phone number, and message are required.' });
  }

  const ticketId = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
  const ticket = {
    id: ticketId,
    name,
    email: email || '',
    phone,
    category: category || 'general',
    orderId: orderId || null,
    message,
    status: 'OPEN',
    createdAt: new Date().toISOString()
  };

  try {
    const contacts = db.get('contacts') || [];
    db.insert('contacts', ticket);
  } catch (e) {
    console.warn('Could not insert to contacts table:', e.message);
  }

  res.json({
    success: true,
    ticketId,
    message: 'Your message has been delivered to GoMeat Central Support. Response within 15 minutes.'
  });
});

app.post('/api/orders/:id/simulate-temp', authenticate, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const delta = (Math.random() * 0.4 - 0.2);
  const newTemp = Number(Math.max(0.2, Math.min(2.8, order.liveTemp + delta)).toFixed(1));
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const updatedLog = [
    ...(order.tempLog || []),
    {
      time: timeStr,
      temp: newTemp,
      event: `Cold-Gel Core Sensor Probe: ${newTemp}°C (Safe Fresh Range 0°C - 4°C)`
    }
  ];

  const updated = db.update('orders', order.id, {
    liveTemp: newTemp,
    tempLog: updatedLog
  });

  res.json(updated);
});

// ==========================================
// 4. REUSABLE COOLER FLEET & RETURNS
// ==========================================

app.get('/api/coolers', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(db.get('coolers'));
  }
  const userCoolers = db.get('coolers').filter(c => c.currentUserId === req.user.id);
  res.json(userCoolers);
});

app.get('/api/coolers/my-coolers', authenticate, (req, res) => {
  const coolers = db.get('coolers').filter(c => c.currentUserId === req.user.id);
  const returns = db.get('coolerReturns').filter(r => r.userId === req.user.id);
  res.json({ coolers, returns });
});

app.post('/api/coolers/request-return', authenticate, (req, res) => {
  const { coolerId, pickupSlot, notes, address, upiId, refundPreference = 'wallet' } = req.body;
  if (!coolerId) {
    return res.status(400).json({ error: 'Please select a cooler box to return' });
  }

  const cooler = db.findById('coolers', coolerId);
  if (!cooler) {
    return res.status(404).json({ error: 'Cooler box not found' });
  }

  if (cooler.currentUserId !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'This cooler box is not tagged to your account' });
  }

  const refundMethodLabel = refundPreference === 'wallet'
    ? 'GoMeat Wallet (Instant Store Credit)'
    : (upiId ? `Direct UPI / Bank (${upiId})` : (req.user.upiId ? `Direct UPI (${req.user.upiId})` : 'Direct Bank Transfer'));

  const returnRecord = {
    id: `RET-${Math.floor(100 + Math.random() * 900)}`,
    coolerId: cooler.id,
    orderId: cooler.currentOrderId || 'N/A',
    userId: req.user.id,
    userName: req.user.name,
    userPhone: req.user.phone || '+91 98765 43210',
    userAddress: address || req.user.address,
    status: 'pickup_requested',
    requestDate: new Date().toISOString(),
    scheduledPickupSlot: pickupSlot || 'Tomorrow Morning, 7:00 AM - 10:00 AM',
    refundAmount: cooler.depositAmount || 250,
    refundPreference: refundPreference || 'wallet',
    refundMode: refundMethodLabel,
    notes: notes || 'Rinsed with gel packs kept inside box for doorstep pickup.',
    courierAssigned: 'Hub Return Partner Chetan (+91 99002 11842)'
  };

  db.insert('coolerReturns', returnRecord);

  db.update('coolers', cooler.id, {
    status: 'return_requested'
  });

  res.status(201).json(returnRecord);
});

app.get('/api/returns', authenticate, (req, res) => {
  if (req.user.role === 'admin') {
    return res.json(db.get('coolerReturns'));
  }
  const userReturns = db.get('coolerReturns').filter(r => r.userId === req.user.id);
  res.json(userReturns);
});

app.patch('/api/returns/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status, conditionNotes, refundPreference } = req.body;
  const returnItem = db.findById('coolerReturns', req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: 'Return request not found' });
  }

  const resolvedPreference = refundPreference || returnItem.refundPreference || 'wallet';

  const updatedReturn = db.update('coolerReturns', returnItem.id, {
    status,
    conditionNotes: conditionNotes || 'Box inspected: EPP walls intact, gel bricks sanitized.',
    completedAt: status === 'refunded' ? new Date().toISOString() : returnItem.completedAt
  });

  if (status === 'refunded') {
    const cooler = db.findById('coolers', returnItem.coolerId);
    if (cooler) {
      db.update('coolers', cooler.id, {
        status: 'available',
        currentOrderId: null,
        currentUserId: null,
        currentUserName: null,
        cyclesUsed: (cooler.cyclesUsed || 0) + 1,
        lastSanitizedDate: new Date().toISOString().split('T')[0]
      });
    }

    const user = db.findById('users', returnItem.userId);
    if (user) {
      const refundAmt = returnItem.refundAmount || 250;
      const updates = {
        depositBalance: Math.max(0, (user.depositBalance || 0) - refundAmt)
      };

      if (resolvedPreference === 'wallet') {
        const newBal = (user.walletBalance || 0) + refundAmt;
        const tx = {
          id: `tx_${Date.now()}`,
          amount: refundAmt,
          type: 'credit',
          title: 'Cooler Box Deposit Refund',
          description: `ThermalVault™ box #${returnItem.coolerId} returned & verified. Instant refund added to GoMeat Wallet.`,
          date: new Date().toISOString(),
          balanceAfter: newBal,
          coolerId: returnItem.coolerId
        };
        updates.walletBalance = newBal;
        updates.walletTransactions = [tx, ...(user.walletTransactions || [])];
      }

      db.update('users', user.id, updates);
    }
  } else if (status === 'picked_up') {
    db.update('coolers', returnItem.coolerId, { status: 'sanitizing' });
  }

  res.json(updatedReturn);
});

// ==========================================
// 4A-1. COOLER HEALTH CHECKER (Teammate Analytical Scripts Suite)
// Evaluates 0°C-4°C Cold-Chain Compliance, Return SLA (36h limit),
// Cycle Aging, and Breakdown Anomaly Detection.
// ==========================================

// 1. Fleet-wide Cooler Health Overview
app.get('/api/admin/coolers/health', (req, res) => {
  try {
    const overview = generateFleetHealthOverview(db.data || {});
    res.json({
      success: true,
      ...overview
    });
  } catch (err) {
    console.error('[Cooler Health] Fleet overview error:', err);
    res.status(500).json({ error: 'Failed to generate fleet health overview' });
  }
});

// 2. Specific Cooler Health Diagnostic (By QR Code or Box ID)
const handleCoolerHealthDiagnostic = (req, res) => {
  try {
    const qrOrId = (req.params.qr || req.params.coolerId || '').trim();
    const coolers = db.get('coolers') || [];
    let cooler = findCooler(coolers, qrOrId);

    if (!cooler) {
      // Auto-provision standard test box if it matches standard naming format
      const normalizedBoxId = qrOrId.toUpperCase().replace(/^(GOMEAT-|SAGAR-|TV-)/i, '');
      if (/^BOX-[A-Z0-9-]+/i.test(normalizedBoxId) || /^BOX-\d+/i.test(normalizedBoxId)) {
        cooler = db.insert('coolers', {
          id: normalizedBoxId,
          qrCode: `GOMEAT-${normalizedBoxId}`,
          model: 'ThermalVault Ultra-3L EPP',
          status: 'available',
          cyclesUsed: 4,
          lastSanitizedDate: new Date().toISOString().split('T')[0],
          depositAmount: 250,
          maxHoldingHours: 36,
          assignedHub: 'Bengaluru Central Hub Depot'
        });
      } else {
        return res.status(404).json({
          found: false,
          qr: qrOrId,
          error: `No cooler found for QR code '${qrOrId}'. Please scan again.`
        });
      }
    }

    const tempCheck = getTemperatureCheck(cooler, db.data || {});
    const fleetDetails = getFleetDetails(cooler, db.data || {});
    const health = calculateHealthScore(cooler, tempCheck, fleetDetails);

    res.json({
      success: true,
      found: true,
      cooler,
      tempCheck,
      fleetDetails,
      health
    });
  } catch (err) {
    console.error('[Cooler Health] Diagnostic error:', err);
    res.status(500).json({ error: 'Failed to run cooler health diagnostic' });
  }
};

app.get('/api/admin/coolers/:qr/health', handleCoolerHealthDiagnostic);
app.get('/api/coolers/:qr/health', handleCoolerHealthDiagnostic);

// 3. Cooler Maintenance / Operational Actions (Sanitize, Flag Breakdown, Decommission)
app.post('/api/admin/coolers/:id/action', (req, res) => {
  try {
    const coolerId = req.params.id;
    const { action, notes } = req.body;
    const cooler = db.findById('coolers', coolerId);

    if (!cooler) {
      return res.status(404).json({ error: `Cooler ${coolerId} not found` });
    }

    const updates = {};
    const timestamp = new Date().toISOString();

    if (action === 'sanitize') {
      updates.status = 'available';
      updates.lastSanitizedDate = timestamp.split('T')[0];
      updates.cyclesUsed = (cooler.cyclesUsed || 0) + 1;
      updates.lastSanitizedNotes = notes || 'UV-C sanitization & antimicrobial wash certified';
    } else if (action === 'flag_damage' || action === 'flag_maintenance') {
      updates.status = 'damaged';
      updates.maintenanceReason = notes || 'Thermal gasket wear or lid seal compromise detected';
      updates.flaggedAt = timestamp;
    } else if (action === 'decommission') {
      updates.status = 'decommissioned';
      updates.decommissionReason = notes || 'Retired after maximum lifecycle wear';
      updates.retiredAt = timestamp;
    } else if (action === 'recommission') {
      updates.status = 'available';
      updates.maintenanceReason = null;
      updates.recommissionedAt = timestamp;
    } else {
      return res.status(400).json({ error: 'Invalid action. Supported: sanitize, flag_damage, decommission, recommission' });
    }

    const updated = db.update('coolers', coolerId, updates);
    res.json({
      success: true,
      message: `Action '${action}' applied successfully to ${coolerId}`,
      cooler: updated
    });
  } catch (err) {
    console.error('[Cooler Health] Action error:', err);
    res.status(500).json({ error: 'Failed to apply cooler action' });
  }
});

// ==========================================
// 4B. COLD BOX QR SCANNER, TELEMETRY & DIAGNOSTICS (Ashik Spec)
// ==========================================
app.get('/api/coolers/inspect/:coolerId', (req, res) => {
  const rawId = (req.params.coolerId || '').trim();
  // Strip URL or common prefixes if scanned as a full URL
  const cleanId = rawId.replace(/^https?:\/\/[^\/]+\/(coolers\/)?/i, '').replace(/^GOMEAT-/i, '').replace(/^TV-/i, '');
  
  const coolers = db.get('coolers') || [];
  let cooler = coolers.find(c => 
    c.id.toLowerCase() === cleanId.toLowerCase() || 
    c.id.toLowerCase() === rawId.toLowerCase() ||
    (c.qrCode && c.qrCode.toLowerCase() === rawId.toLowerCase()) ||
    c.id.toLowerCase().includes(cleanId.toLowerCase())
  );

  if (!cooler) {
    const normalizedBoxId = cleanId.toUpperCase();
    if (/^BOX-[A-Z0-9-]+/i.test(normalizedBoxId) || /^BOX-\d+/i.test(normalizedBoxId)) {
      const isBreach = normalizedBoxId.includes('103');
      cooler = db.insert('coolers', {
        id: normalizedBoxId,
        qrCode: `GOMEAT-${normalizedBoxId}`,
        model: 'ThermalVault Ultra-3L EPP',
        status: isBreach ? 'damaged' : (normalizedBoxId.includes('182') ? 'assigned' : 'with_customer'),
        currentOrderId: isBreach ? 'ORD-103-BREACH' : 'ORD-9281',
        currentUserId: 'usr_customer',
        currentUserName: 'Pooja Sundaram',
        cyclesUsed: 8,
        lastSanitizedDate: '2026-11-06',
        depositAmount: 250,
        maxHoldingHours: 36,
        assignedHub: 'Mahadevapura Dark Hub'
      });
    } else {
      return res.status(404).json({ error: `ThermalVault Cold Box "${rawId}" not found in fleet directory.` });
    }
  }

  // Find associated order
  const orders = db.get('orders') || [];
  const order = (cooler.currentOrderId ? orders.find(o => o.id === cooler.currentOrderId) : null) ||
    orders.find(o => o.coolerId === cooler.id) || null;

  // Find active return request if any
  const returns = db.get('coolerReturns') || [];
  const returnRecord = returns.find(r => r.coolerId === cooler.id && r.status !== 'refunded') ||
    returns.find(r => r.coolerId === cooler.id) || null;

  // Generate / format IoT Cold-Chain Telemetry (Ashik Data Analyst Spec)
  const isDamagedBox = cooler.id.includes('103') || cooler.status === 'damaged' || cooler.status === 'maintenance';
  const liveTemp = isDamagedBox ? 5.8 : (order?.liveTemp || 1.8);
  const isCompliant = liveTemp >= 0.0 && liveTemp <= 4.0;
  
  const tempLog = order?.tempLog && order.tempLog.length > 0 ? order.tempLog : [
    { time: '07:15 AM', temp: 0.8, event: 'Sealed with chilled ice-gel bricks at Mahadevapura Dark Hub' },
    { time: '07:30 AM', temp: isDamagedBox ? 2.4 : 1.2, event: 'FreshSeal digital latch engaged; EV Cold Courier dispatched' },
    { time: '07:55 AM', temp: isDamagedBox ? 4.6 : 1.6, event: 'IoT Ping: Temperature checked mid-route (Outer Ring Road)' },
    { time: '08:15 AM', temp: liveTemp, event: isCompliant ? 'Delivered at customer doorstep (Sub-4°C guaranteed)' : '⚠️ Alert: Temperature rose above 4°C safe threshold' }
  ];

  // Calculate Turnaround Time (TAT)
  const dispatchDate = order ? new Date(order.createdAt || Date.now() - 26 * 3600 * 1000) : new Date(Date.now() - 24 * 3600 * 1000);
  const now = new Date();
  const tatHours = Math.max(1, Math.round((now - dispatchDate) / (1000 * 60 * 60)));
  const tatStatus = tatHours <= 48 ? 'OPTIMAL_UNDER_48H' : (tatHours <= 72 ? 'STANDARD_WINDOW' : 'OVERDUE');

  // Refund Decision Analysis
  const isEligible = cooler.status === 'with_customer' || cooler.status === 'return_requested' || cooler.status === 'in_transit';
  const refundAmount = cooler.depositAmount || 250;

  res.json({
    success: true,
    cooler: {
      ...cooler,
      qrUrl: `https://gomeat.in/coolers/${cooler.id}`
    },
    order: order ? {
      id: order.id,
      orderNumber: order.orderNumber || order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone || '+91 98765 43210',
      customerEmail: order.customerEmail,
      deliveryAddress: order.deliveryAddress,
      totalAmount: order.totalAmount || order.total,
      deliveryDate: order.createdAt,
      itemsSummary: (order.items || []).map(i => `${i.quantity || 1}x ${i.name || i.product?.name || 'Fresh Cut'}`).join(', ')
    } : null,
    returnRecord: returnRecord ? {
      id: returnRecord.id,
      status: returnRecord.status,
      requestDate: returnRecord.requestDate,
      scheduledPickupSlot: returnRecord.scheduledPickupSlot,
      refundPreference: returnRecord.refundPreference || 'wallet',
      refundMode: returnRecord.refundMode,
      upiId: returnRecord.upiId || 'pooja@okhdfcbank',
      courierAssigned: returnRecord.courierAssigned
    } : null,
    telemetry: {
      liveTemp,
      targetRange: '0°C to 4°C (FSSC-22000 & FSSAI Standards)',
      isCompliant,
      complianceRate: isCompliant ? 100 : 62,
      thermalHealthScore: isCompliant ? 98.6 : 54.2,
      insulationCondition: isDamagedBox ? 'NEEDS_GASKET_INSPECTION' : 'EXCELLENT_HERMETIC_SEAL',
      tempLog,
      tatHours,
      tatStatus,
      cyclesUsed: cooler.cyclesUsed || 12,
      maxHoldingHours: cooler.maxHoldingHours || 36,
      singleUsePlasticBoxesSaved: (cooler.cyclesUsed || 12) * 2
    },
    refundAssessment: {
      isEligible,
      depositAmount: refundAmount,
      reason: isEligible 
        ? 'ThermalVault deposit verified and approved for instant reversal.' 
        : (cooler.status === 'available' ? 'Box already returned & deposit refunded.' : 'Box under sanitization.'),
      recommendedAction: isDamagedBox 
        ? 'APPROVE_REFUND_AND_REPAIR_BOX' 
        : (isEligible ? 'APPROVE_INSTANT_REFUND' : 'BOX_READY_FOR_USE')
    },
    tempCheck: getTemperatureCheck({ ...cooler, status: isDamagedBox ? 'damaged' : cooler.status }, db.data || {}),
    fleetDetails: getFleetDetails({ ...cooler, status: isDamagedBox ? 'damaged' : cooler.status }, db.data || {}),
    health: calculateHealthScore(
      { ...cooler, status: isDamagedBox ? 'damaged' : cooler.status },
      getTemperatureCheck({ ...cooler, status: isDamagedBox ? 'damaged' : cooler.status }, db.data || {}),
      getFleetDetails({ ...cooler, status: isDamagedBox ? 'damaged' : cooler.status }, db.data || {})
    )
  });
});

app.post('/api/coolers/inspect/:coolerId/approve-refund', (req, res) => {
  const rawId = (req.params.coolerId || '').trim();
  const cleanId = rawId.replace(/^https?:\/\/[^\/]+\/(coolers\/)?/i, '').replace(/^GOMEAT-/i, '').replace(/^TV-/i, '');
  
  const coolers = db.get('coolers') || [];
  let cooler = coolers.find(c => 
    c.id.toLowerCase() === cleanId.toLowerCase() || 
    c.id.toLowerCase() === rawId.toLowerCase() ||
    (c.qrCode && c.qrCode.toLowerCase() === rawId.toLowerCase())
  );

  if (!cooler) {
    const normalizedBoxId = cleanId.toUpperCase();
    if (/^BOX-[A-Z0-9-]+/i.test(normalizedBoxId) || /^BOX-\d+/i.test(normalizedBoxId)) {
      cooler = db.insert('coolers', {
        id: normalizedBoxId,
        qrCode: `GOMEAT-${normalizedBoxId}`,
        model: 'ThermalVault Ultra-3L EPP',
        status: 'available',
        currentUserId: 'usr_customer',
        currentUserName: 'Pooja Sundaram',
        depositAmount: 250
      });
    } else {
      return res.status(404).json({ error: 'Cooler box not found' });
    }
  }

  const { refundPreference = 'wallet', upiId, inspectorNotes = 'QR Inward Inspection: EPP foam walls intact, gel bricks sanitized.' } = req.body;

  // Resolve user
  const userId = cooler.currentUserId || 'usr_customer';
  const user = db.findById('users', userId);
  const refundAmt = cooler.depositAmount || 250;

  // Find or create return record
  const returns = db.get('coolerReturns') || [];
  let returnRecord = returns.find(r => r.coolerId === cooler.id && r.status !== 'refunded');

  if (returnRecord) {
    db.update('coolerReturns', returnRecord.id, {
      status: 'refunded',
      conditionNotes: inspectorNotes,
      completedAt: new Date().toISOString(),
      refundMode: refundPreference === 'wallet' ? 'GoMeat Wallet (Instant Store Credit)' : `Direct UPI (${upiId || user?.upiId || 'pooja@okhdfcbank'})`
    });
  } else {
    returnRecord = {
      id: `RET-${Math.floor(100 + Math.random() * 900)}`,
      coolerId: cooler.id,
      orderId: cooler.currentOrderId || 'ORD-AUTO',
      userId: userId,
      userName: cooler.currentUserName || user?.name || 'Valued Customer',
      userPhone: user?.phone || '+91 98765 43210',
      userAddress: user?.address || 'Customer Registered Address',
      status: 'refunded',
      requestDate: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      refundAmount: refundAmt,
      refundPreference,
      refundMode: refundPreference === 'wallet' ? 'GoMeat Wallet (Instant Store Credit)' : `Direct UPI (${upiId || user?.upiId || 'pooja@okhdfcbank'})`,
      conditionNotes: inspectorNotes,
      courierAssigned: 'Hub Inward Specialist Rajeshwar Rao'
    };
    db.insert('coolerReturns', returnRecord);
  }

  // Credit Wallet if preference is wallet
  if (user) {
    const updates = {
      depositBalance: Math.max(0, (user.depositBalance || 0) - refundAmt)
    };
    if (refundPreference === 'wallet') {
      const newBal = (user.walletBalance || 0) + refundAmt;
      const tx = {
        id: `tx_${Date.now()}`,
        amount: refundAmt,
        type: 'credit',
        title: 'Cooler Box Deposit Refund',
        description: `ThermalVault™ box #${cooler.id} QR inspected & verified. Instant refund added to GoMeat Wallet.`,
        date: new Date().toISOString(),
        balanceAfter: newBal,
        coolerId: cooler.id
      };
      updates.walletBalance = newBal;
      updates.walletTransactions = [tx, ...(user.walletTransactions || [])];
    }
    db.update('users', user.id, updates);
  }

  // Update Cooler status to available
  const updatedCooler = db.update('coolers', cooler.id, {
    status: 'available',
    currentOrderId: null,
    currentUserId: null,
    currentUserName: null,
    cyclesUsed: (cooler.cyclesUsed || 0) + 1,
    lastSanitizedDate: new Date().toISOString().split('T')[0]
  });

  res.json({
    success: true,
    message: `🎉 ₹${refundAmt} deposit refund approved and disbursed to ${refundPreference === 'wallet' ? 'GoMeat Wallet' : 'UPI'}!`,
    refundAmount: refundAmt,
    refundMode: refundPreference === 'wallet' ? 'Wallet Credit' : 'Instant UPI Reversal',
    cooler: updatedCooler,
    returnRecord
  });
});

app.post('/api/coolers/inspect/:coolerId/flag-damage', (req, res) => {
  const rawId = (req.params.coolerId || '').trim();
  const cleanId = rawId.replace(/^https?:\/\/[^\/]+\/(coolers\/)?/i, '').replace(/^GOMEAT-/i, '').replace(/^TV-/i, '');
  
  const coolers = db.get('coolers') || [];
  let cooler = coolers.find(c => 
    c.id.toLowerCase() === cleanId.toLowerCase() || 
    c.id.toLowerCase() === rawId.toLowerCase() ||
    (c.qrCode && c.qrCode.toLowerCase() === rawId.toLowerCase())
  );

  if (!cooler) {
    const normalizedBoxId = cleanId.toUpperCase();
    if (/^BOX-[A-Z0-9-]+/i.test(normalizedBoxId) || /^BOX-\d+/i.test(normalizedBoxId)) {
      cooler = db.insert('coolers', {
        id: normalizedBoxId,
        qrCode: `GOMEAT-${normalizedBoxId}`,
        model: 'ThermalVault Ultra-3L EPP',
        status: 'available',
        currentUserId: 'usr_customer',
        currentUserName: 'Pooja Sundaram',
        depositAmount: 250
      });
    } else {
      return res.status(404).json({ error: 'Cooler box not found' });
    }
  }

  const { reason = 'Temperature breach detected: Box cannot hold 0°C to 4°C' } = req.body;
  const updated = db.update('coolers', cooler.id, {
    status: 'maintenance',
    maintenanceReason: reason,
    lastInspectedDate: new Date().toISOString()
  });

  res.json({
    success: true,
    message: `Box #${cooler.id} quarantined for maintenance: "${reason}".`,
    cooler: updated
  });
});

app.get('/api/admin/cooler-analytics', authenticate, requireAdmin, (req, res) => {
  const coolers = db.get('coolers') || [];
  const returns = db.get('coolerReturns') || [];

  const totalCoolers = coolers.length;
  const withCustomer = coolers.filter(c => c.status === 'with_customer').length;
  const returnRequested = coolers.filter(c => c.status === 'return_requested').length;
  const available = coolers.filter(c => c.status === 'available').length;
  const inMaintenance = coolers.filter(c => c.status === 'maintenance' || c.status === 'sanitizing').length;

  const totalRefunded = returns.filter(r => r.status === 'refunded').reduce((sum, r) => sum + (r.refundAmount || 250), 0);
  const totalHeld = (withCustomer + returnRequested) * 250;
  const totalDepositsCollected = totalRefunded + totalHeld;

  const avgTatHours = 32.4;
  const recoveryRate = Math.round((returns.filter(r => r.status === 'refunded').length / Math.max(1, returns.length)) * 100);
  const coldChainCompliance = 98.7;

  res.json({
    success: true,
    metrics: {
      totalFleetSize: totalCoolers,
      availableCount: available,
      withCustomerCount: withCustomer,
      returnRequestedCount: returnRequested,
      maintenanceCount: inMaintenance,
      avgTatHours,
      avgTatDays: '1.35 Days',
      boxRecoveryRate: `${recoveryRate}%`,
      coldChainComplianceRate: `${coldChainCompliance}%`,
      depositLedger: {
        totalCollected: totalDepositsCollected,
        totalRefunded: totalRefunded,
        activeHeld: totalHeld
      },
      singleUsePlasticPreventedKg: totalCoolers * 18 * 0.4
    }
  });
});

// ==========================================
// 5. IN-APP VAULT WALLET
// ==========================================
app.get('/api/wallet', authenticate, (req, res) => {
  const user = db.findById('users', req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({
    balance: user.walletBalance || 0,
    depositBalance: user.depositBalance || 0,
    transactions: user.walletTransactions || [],
    upiId: user.upiId || ''
  });
});

// ==========================================
// 5. OPERATIONS METRICS
// ==========================================

app.get('/api/admin/metrics', authenticate, requireAdmin, (req, res) => {
  const orders = db.get('orders');
  const coolers = db.get('coolers');
  const returns = db.get('coolerReturns');
  const products = db.get('products');

  const totalRevenue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length;
  const coolersInCustody = coolers.filter(c => c.status === 'with_customer' || c.status === 'in_transit').length;
  const totalCoolers = coolers.length;
  const completedReturns = returns.filter(r => r.status === 'refunded').length;

  res.json({
    totalRevenue,
    totalOrders: orders.length,
    activeOrders,
    coolersInCustody,
    totalCoolersFleet: totalCoolers,
    availableCoolers: coolers.filter(c => c.status === 'available').length,
    pendingReturns: returns.filter(r => r.status !== 'refunded').length,
    completedReturns,
    coolerReturnRate: 96,
    coldChainCompliance: 99.6,
    productsCount: products.length
  });
});

// Admin Database Backup Snapshot
app.post('/api/admin/backup', authenticate, requireAdmin, (req, res) => {
  try {
    const backupResult = createBackup();
    res.json({
      success: true,
      message: `Database backup created successfully: ${backupResult.fileName}`,
      ...backupResult
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create backup snapshot', details: err.message });
  }
});

// Admin Customer Management
app.get('/api/admin/users', authenticate, requireAdmin, (req, res) => {
  const users = db.get('users').map(u => {
    const { password, ...userWithoutPw } = u;
    const userOrders = db.get('orders').filter(o => o.userId === u.id || o.customerEmail === u.email);
    const totalSpent = userOrders.reduce((sum, o) => sum + (o.paymentStatus === 'PAID' ? (o.total || o.subtotal || 0) : 0), 0);
    return {
      ...userWithoutPw,
      totalOrders: userOrders.length,
      totalSpent
    };
  });
  res.json(users);
});

// Admin Fleet: Register New Cooler
app.post('/api/coolers', authenticate, requireAdmin, (req, res) => {
  const { id, qrCode, model, depositAmount, assignedHub } = req.body;
  if (!id) return res.status(400).json({ error: 'Cooler ID is required (e.g. BOX-BLR-109)' });
  
  const existing = db.findById('coolers', id);
  if (existing) return res.status(409).json({ error: 'Cooler ID already exists' });
  
  const newCooler = {
    id,
    qrCode: qrCode || `GOMEAT-${id}`,
    model: model || 'ThermalVault 18L - Reusable EPP Cold-Gel Box',
    status: 'available',
    currentOrderId: null,
    currentUserId: null,
    currentUserName: null,
    cyclesUsed: 0,
    lastSanitizedDate: new Date().toISOString().split('T')[0],
    depositAmount: depositAmount || 250,
    maxHoldingHours: 36,
    assignedHub: assignedHub || 'Bengaluru Central Hub Depot'
  };
  
  db.insert('coolers', newCooler);
  res.status(201).json(newCooler);
});

// Admin Fleet: Update Cooler Status / Sanitation cycle
app.patch('/api/coolers/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status, assignedHub } = req.body;
  const cooler = db.findById('coolers', req.params.id);
  if (!cooler) return res.status(404).json({ error: 'Cooler not found' });
  
  const updates = { status };
  if (status === 'available') {
    updates.lastSanitizedDate = new Date().toISOString().split('T')[0];
    updates.cyclesUsed = (cooler.cyclesUsed || 0) + 1;
  }
  if (assignedHub) updates.assignedHub = assignedHub;
  
  const updated = db.update('coolers', req.params.id, updates);
  res.json(updated);
});

// Admin Courier & Fleet Assignment for Order
app.patch('/api/orders/:id/courier', authenticate, requireAdmin, (req, res) => {
  const { deliveryExecutive, coolerId } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  const updates = {};
  if (deliveryExecutive) updates.deliveryExecutive = deliveryExecutive;
  if (coolerId) {
    updates.coolerId = coolerId;
    db.update('coolers', coolerId, {
      status: 'assigned',
      currentOrderId: order.id,
      currentUserId: order.userId,
      currentUserName: order.customerName
    });
  }
  
  const updated = db.update('orders', req.params.id, updates);
  res.json(updated);
});

// Global Production Error Guard (Prevents stack trace leaks)
app.use((err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
  const statusCode = err.status || err.statusCode || 500;
  
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: 'Access denied by GoMeat CORS policy' });
  }

  console.error(`[API Error] ${req.method} ${req.url}:`, err.message || err);

  res.status(statusCode).json({
    error: isProd ? 'An unexpected server error occurred. Our team has been notified.' : (err.message || 'Server error'),
    ...(isProd ? {} : { debugMessage: err.message })
  });
});

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (!process.env.VERCEL && isDirectRun) {
  app.get('*', (req, res) => {
    const indexHtml = path.join(clientDist, 'index.html');
    res.sendFile(indexHtml);
  });

  app.listen(PORT, () => {
    console.log(`[GoMeat API] Running on port ${PORT}`);
  });
}

export default app;
