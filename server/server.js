import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'sagar-cuts-india-secret-2026';

app.use(cors());
app.use(express.json());

// Serve static frontend in production
const clientDist = path.join(__dirname, '../client/dist');
app.use(express.static(clientDist));

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

const createToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ==========================================
// 1. AUTHENTICATION (Real Login with Email / Phone & Password)
// ==========================================

app.post('/api/auth/register', (req, res) => {
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
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const input = (email || '').toLowerCase().trim();
  if (!input || !password) {
    return res.status(400).json({ error: 'Please enter your email or mobile number, and password' });
  }

  // Find user by email or by phone number match
  const cleanPhone = input.replace(/[^0-9]/g, '');
  const user = db.get('users').find(u => {
    if (u.email && u.email.toLowerCase() === input) return true;
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

// ==========================================
// 2. PRODUCTS
// ==========================================

app.get('/api/products', (req, res) => {
  const { category, search } = req.query;
  let products = db.get('products');

  if (category && category !== 'All') {
    products = products.filter(p => p.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.origin.toLowerCase().includes(q)
    );
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
  const { items, deliveryAddress, deliverySlot, deliveryNotes, paymentMethod, city } = req.body;

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
      cutStyle: prod.cutStyle,
      image: prod.image
    });
  }

  const COOLER_DEPOSIT = 250;
  const shippingFee = subtotal >= 799 ? 0 : 40;
  const total = subtotal + COOLER_DEPOSIT + shippingFee;

  let assignedCooler = db.get('coolers').find(c => c.status === 'available');
  if (!assignedCooler) {
    const newBoxNumber = Math.floor(100 + Math.random() * 900);
    const newId = `BOX-BLR-${newBoxNumber}`;
    assignedCooler = {
      id: newId,
      qrCode: `SAGAR-${newId}`,
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
    userId: req.user.id,
    customerName: req.user.name,
    customerEmail: req.user.email,
    customerPhone: req.user.phone || '+91 98765 43210',
    deliveryAddress: deliveryAddress || req.user.address,
    city: city || req.user.city || 'Bengaluru',
    items: processedItems,
    subtotal,
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
    trackingCode: `SAGAR-TRK-${Math.floor(1000 + Math.random() * 9000)}`,
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
  if (req.user.role !== 'admin') {
    orders = orders.filter(o => o.userId === req.user.id);
  }
  res.json(orders);
});

app.get('/api/orders/:id', authenticate, (req, res) => {
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  if (req.user.role !== 'admin' && order.userId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const cooler = db.findById('coolers', order.coolerId);
  res.json({ ...order, coolerDetails: cooler });
});

app.patch('/api/orders/:id/status', authenticate, requireAdmin, (req, res) => {
  const { status, note } = req.body;
  const order = db.findById('orders', req.params.id);
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  let newTemp = order.liveTemp;
  if (status === 'Out for Delivery') {
    newTemp = 1.2;
    if (order.coolerId) {
      db.update('coolers', order.coolerId, { status: 'in_transit' });
    }
  } else if (status === 'Delivered') {
    newTemp = 1.8;
    if (order.coolerId) {
      db.update('coolers', order.coolerId, { status: 'with_customer' });
    }
  }

  const updatedLog = [
    ...(order.tempLog || []),
    {
      time: timeStr,
      temp: newTemp,
      event: note || `Order status updated to: ${status}`
    }
  ];

  const updatedOrder = db.update('orders', order.id, {
    status,
    liveTemp: newTemp,
    tempLog: updatedLog
  });

  res.json(updatedOrder);
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
  const { coolerId, pickupSlot, notes, address, upiId } = req.body;
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
    refundMode: upiId ? `UPI (${upiId})` : (req.user.upiId ? `UPI (${req.user.upiId})` : 'Source Account Refund'),
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
  const { status, conditionNotes } = req.body;
  const returnItem = db.findById('coolerReturns', req.params.id);
  if (!returnItem) {
    return res.status(404).json({ error: 'Return request not found' });
  }

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
    if (user && user.depositBalance >= returnItem.refundAmount) {
      db.update('users', user.id, {
        depositBalance: user.depositBalance - returnItem.refundAmount
      });
    }
  } else if (status === 'picked_up') {
    db.update('coolers', returnItem.coolerId, { status: 'sanitizing' });
  }

  res.json(updatedReturn);
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

app.get('*', (req, res) => {
  const indexHtml = path.join(clientDist, 'index.html');
  res.sendFile(indexHtml);
});

app.listen(PORT, () => {
  console.log(`[Sagar Cuts API] Running on port ${PORT}`);
});
