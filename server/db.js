import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Product, Order, Cooler, CoolerReturn } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const DATA_FILE = isVercel ? path.join('/tmp', 'sagar_data.json') : path.join(__dirname, 'data.json');

const getModel = (collection) => {
  switch (collection) {
    case 'users': return User;
    case 'products': return Product;
    case 'orders': return Order;
    case 'coolers': return Cooler;
    case 'coolerReturns': return CoolerReturn;
    default: return null;
  }
};

const hashPassword = (pw) => bcrypt.hashSync(pw, 10);

const INITIAL_DATA = {
  users: [
    {
      id: "usr_admin",
      name: "Rajeshwar Rao (Operations Head)",
      email: "ops@sagarfresh.in",
      password: hashPassword("admin123"),
      role: "admin",
      phone: "+91 98450 12890",
      city: "Bengaluru",
      address: "Sagar Fresh Fulfillment Center, Outer Ring Road, Mahadevapura, Bengaluru 560048",
      depositBalance: 0,
      upiId: "ops@icici",
      createdAt: "2026-01-15T08:00:00.000Z"
    },
    {
      id: "usr_customer",
      name: "Pooja Sundaram",
      email: "pooja.sundaram@gmail.com",
      password: hashPassword("customer123"),
      role: "customer",
      phone: "+91 98765 43210",
      city: "Bengaluru",
      address: "Flat 402, Alpine Eco Apartments, Doddanekkundi, Marathahalli, Bengaluru 560037",
      depositBalance: 500,
      upiId: "pooja@okhdfcbank",
      createdAt: "2026-02-10T11:20:00.000Z"
    }
  ],
  products: [
    {
      id: "prod_1",
      name: "Seer Fish / Surmai (Large Steaks)",
      category: "Fish & Seafood",
      description: "Center-cut neat steaks from daily fresh catches off the Mangalore-Malabar coast. Shucked, scale-scraped, cleaned in RO water, and immediately blast-chilled to 0°C - 2°C.",
      price: 799,
      mrp: 899,
      unit: "500g",
      netWeight: "450g",
      grossWeight: "650g",
      pieces: "4-6 Steaks",
      serves: "Serves 3-4",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "0°C to 4°C FreshSeal™ Cold Chain",
      catchDate: "Daily 4:00 AM Harbor Catch",
      origin: "Mangalore Old Port Jetty, Karnataka",
      cutStyle: "Curry Cut & Tawa Fry Steaks",
      stock: 40,
      image: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_2",
      name: "White Pomfret (Paplet) - Whole Cleaned",
      category: "Fish & Seafood",
      description: "Whole cleaned pristine silver-scaled pomfret. Degilled, gutted and scored with neat diamond slits on both sides. Ideal for tawa fry or rechado masala.",
      price: 689,
      mrp: 749,
      unit: "400g",
      netWeight: "380g",
      grossWeight: "500g",
      pieces: "2 Whole Fish",
      serves: "Serves 2-3",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "0°C to 4°C Chilled, Never Frozen",
      catchDate: "Daily Inward",
      origin: "Ratnagiri Jetty, Maharashtra",
      cutStyle: "Whole Cleaned with Diamond Slits",
      stock: 35,
      image: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_3",
      name: "Sea Tiger Prawns (Jumbo Cleaned & Deveined)",
      category: "Fish & Seafood",
      description: "Large sea prawns peeled and completely deveined with tail-on. Crisp sweet bite, fresh from daily trawlers.",
      price: 599,
      mrp: 679,
      unit: "350g",
      netWeight: "300g",
      grossWeight: "500g",
      pieces: "14-18 Pieces",
      serves: "Serves 2-3",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "Cold Plate Chilled (0°C - 4°C)",
      catchDate: "Night Trawl Harvest",
      origin: "Visakhapatnam Deep Sea, Andhra Pradesh",
      cutStyle: "Peeled & Deveined (Tail On)",
      stock: 50,
      image: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_4",
      name: "Rich Tender Goat (Biryani & Rogan Josh Cut)",
      category: "Tender Mutton",
      description: "Young pasture-grazed tender goat (under 9 months). Balanced mix of succulent bone-in shoulder, ribs, and marrow pieces. Bone-dust washed in chilled water.",
      price: 549,
      mrp: 599,
      unit: "500g",
      netWeight: "450g",
      grossWeight: "600g",
      pieces: "12-16 Pieces",
      serves: "Serves 3-4",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "0°C to 4°C Temperature Regulated",
      catchDate: "Dressed Fresh at 5:00 AM",
      origin: "Bannur & Mandya Pastures, Karnataka",
      cutStyle: "Biryani & Rogan Josh Cut",
      stock: 60,
      image: "https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_5",
      name: "Fresh Chicken Breast (Boneless Fillets)",
      category: "Fresh Chicken",
      description: "Tender boneless chicken breast fillets trimmed of all excess fat. Bio-secured farm chicken, 100% antibiotic residue-free.",
      price: 289,
      mrp: 320,
      unit: "450g",
      netWeight: "450g",
      grossWeight: "480g",
      pieces: "3-4 Fillets",
      serves: "Serves 3",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "FreshSeal™ 0°C to 4°C Chilled",
      catchDate: "Daily Morning Farm Batch",
      origin: "Coimbatore Bio-Secured Poultry Farm",
      cutStyle: "Boneless Breast Fillet",
      stock: 75,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_6",
      name: "Country Chicken / Nati Koli (Curry Cut)",
      category: "Fresh Chicken",
      description: "Free-range desi country chicken with firm meat and rich yellow skin fat. Skin-on, thoroughly singed and cleaned for authentic village broth flavor.",
      price: 389,
      mrp: 429,
      unit: "600g",
      netWeight: "550g",
      grossWeight: "700g",
      pieces: "14-18 Pieces",
      serves: "Serves 3-4",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "Hygienic Chilled Pack (2°C)",
      catchDate: "Fresh Morning Batch",
      origin: "Chittoor Free-Range Poultry Co-op",
      cutStyle: "Medium Bone-In Curry Pieces",
      stock: 45,
      image: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: false
    },
    {
      id: "prod_7",
      name: "Amritsari Fish Tikka (Ready to Cook)",
      category: "Ready to Cook",
      description: "Fresh boneless fish cubes marinated in crushed ajwain, roasted besan, mustard oil, and Punjabi spices. Pan-sear or air-fry in 8 minutes.",
      price: 369,
      mrp: 399,
      unit: "350g",
      netWeight: "350g",
      grossWeight: "380g",
      pieces: "8-10 Pieces",
      serves: "Serves 2-3",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "Chilled Ready to Cook (0°C - 4°C)",
      catchDate: "Fresh Chef Marinade Batch",
      origin: "Sagar Fresh Master Kitchen",
      cutStyle: "Marinated Boneless Cubes",
      stock: 30,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: false
    },
    {
      id: "prod_8",
      name: "Weekend Coastal Feast Box (Fish + Prawns + Mutton)",
      category: "Combo Box",
      description: "The ultimate Sunday banquet pack: 500g Seer Fish Steaks + 350g Sea Tiger Prawns + 500g Tender Goat Biryani Cut. Delivered inside an extra-capacity reusable cold box.",
      price: 1799,
      mrp: 2049,
      unit: "1.35kg Pack",
      netWeight: "1.25kg",
      grossWeight: "1.55kg",
      pieces: "Assorted Family Feast",
      serves: "Serves 5-6",
      eta: "⚡ Today in 90 mins",
      chillingMethod: "Dual Gel Cold-Vault Pack (0°C - 2°C)",
      catchDate: "Today's Coordinated Inward",
      origin: "Certified Coastal & Mandya Farm Partners",
      cutStyle: "Curated Feast Selection",
      stock: 20,
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
      vacuumSealed: true,
      featured: true
    }
  ],
  coolers: [
    {
      id: "BOX-BLR-101",
      qrCode: "SAGAR-BOX-101",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "with_customer",
      currentOrderId: "ord_101",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 11,
      lastSanitizedDate: "2026-10-28",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Bengaluru East (Mahadevapura Hub)"
    },
    {
      id: "BOX-BLR-102",
      qrCode: "SAGAR-BOX-102",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "return_requested",
      currentOrderId: "ord_098",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 19,
      lastSanitizedDate: "2026-10-22",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Bengaluru East (Mahadevapura Hub)"
    },
    {
      id: "BOX-BLR-103",
      qrCode: "SAGAR-BOX-103",
      model: "ThermalVault 24L - Dual Phase ColdGel Box",
      status: "in_transit",
      currentOrderId: "ord_102",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 7,
      lastSanitizedDate: "2026-10-29",
      depositAmount: 250,
      maxHoldingHours: 48,
      assignedHub: "Bengaluru Central (Indiranagar Hub)"
    },
    {
      id: "BOX-BLR-104",
      qrCode: "SAGAR-BOX-104",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "available",
      currentOrderId: null,
      currentUserId: null,
      currentUserName: null,
      cyclesUsed: 14,
      lastSanitizedDate: "2026-10-30",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Bengaluru Central Hub Depot"
    },
    {
      id: "BOX-BLR-105",
      qrCode: "SAGAR-BOX-105",
      model: "ThermalVault 14L - Compact ColdGel Box",
      status: "available",
      currentOrderId: null,
      currentUserId: null,
      currentUserName: null,
      cyclesUsed: 4,
      lastSanitizedDate: "2026-10-30",
      depositAmount: 250,
      maxHoldingHours: 24,
      assignedHub: "Bengaluru Central Hub Depot"
    },
    {
      id: "BOX-BLR-106",
      qrCode: "SAGAR-BOX-106",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "sanitizing",
      currentOrderId: null,
      currentUserId: null,
      currentUserName: null,
      cyclesUsed: 26,
      lastSanitizedDate: "2026-10-29",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Wash & UV Sanitization Bay"
    }
  ],
  orders: [
    {
      id: "ORD-9281",
      userId: "usr_customer",
      customerName: "Pooja Sundaram",
      customerEmail: "pooja.sundaram@gmail.com",
      customerPhone: "+91 98765 43210",
      deliveryAddress: "Flat 402, Alpine Eco Apartments, Doddanekkundi, Marathahalli, Bengaluru 560037",
      city: "Bengaluru",
      items: [
        {
          productId: "prod_1",
          name: "Seer Fish / Surmai (Large Steaks)",
          price: 799,
          quantity: 1,
          unit: "500g",
          netWeight: "450g",
          chillingMethod: "0°C to 4°C FreshSeal™ Cold Chain"
        },
        {
          productId: "prod_4",
          name: "Rich Tender Goat (Biryani & Rogan Josh Cut)",
          price: 549,
          quantity: 1,
          unit: "500g",
          netWeight: "450g",
          chillingMethod: "0°C to 4°C Temperature Regulated"
        }
      ],
      subtotal: 1348,
      coolerDeposit: 250,
      shippingFee: 0,
      total: 1598,
      status: "Out for Delivery",
      coolerId: "BOX-BLR-103",
      coolerModel: "ThermalVault 24L - Dual Phase ColdGel Box",
      liveTemp: 1.2,
      deliveryExecutive: "Sunil Gowda (EV Delivery #14, +91 97412 88301)",
      tempLog: [
        { time: "06:15", temp: 0.2, event: "Cuts packed with chilled gel bricks at Mahadevapura Hub" },
        { time: "07:00", temp: 0.8, event: "Loaded onto insulated delivery electric vehicle" },
        { time: "07:45", temp: 1.2, event: "Delivery partner en route near Marathahalli" }
      ],
      deliverySlot: "Today, Express in 90 Mins",
      trackingCode: "SAGAR-TRK-4412",
      paymentMethod: "UPI (Google Pay)",
      createdAt: "2026-10-30T01:30:00.000Z",
      deliveryNotes: "Leave at security desk or ring Flat 402 doorbell."
    }
  ],
  coolerReturns: [
    {
      id: "RET-702",
      coolerId: "BOX-BLR-102",
      orderId: "ORD-8890",
      userId: "usr_customer",
      userName: "Pooja Sundaram",
      userPhone: "+91 98765 43210",
      userAddress: "Flat 402, Alpine Eco Apartments, Doddanekkundi, Marathahalli, Bengaluru 560037",
      status: "pickup_requested",
      requestDate: "2026-10-29T16:00:00.000Z",
      scheduledPickupSlot: "Tomorrow Morning, 7:00 AM - 10:00 AM",
      refundAmount: 250,
      refundMode: "UPI (pooja@okhdfcbank)",
      notes: "Empty box rinsed with gel packs kept inside the building security reception.",
      courierAssigned: "Return Partner Chetan (+91 99002 11842)"
    }
  ]
};

class Database {
  constructor() {
    this.data = null;
    this.init();
  }

  init() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        console.log('[DB] Loaded Sagar Fresh database from persistence');
        return;
      }
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
      console.log('[DB] Initialized Sagar Fresh Licious-grade database');
    } catch (err) {
      console.error('[DB] Error initializing data:', err);
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
    }
  }

  async syncWithMongo() {
    if (mongoose.connection.readyState !== 1) return;
    try {
      const prodCount = await Product.countDocuments();
      if (prodCount === 0) {
        console.log('[MongoDB] Collections empty, auto-seeding Sagar Fresh catalog into MongoDB...');
        await User.insertMany(INITIAL_DATA.users);
        await Product.insertMany(INITIAL_DATA.products);
        await Cooler.insertMany(INITIAL_DATA.coolers);
        await Order.insertMany(INITIAL_DATA.orders);
        await CoolerReturn.insertMany(INITIAL_DATA.coolerReturns);
        console.log('[MongoDB] Auto-seeding into MongoDB complete.');
      }

      // Sync from MongoDB collections
      const [users, products, coolers, orders, coolerReturns] = await Promise.all([
        User.find().lean(),
        Product.find().lean(),
        Cooler.find().lean(),
        Order.find().lean(),
        CoolerReturn.find().lean()
      ]);

      if (users.length) this.data.users = users;
      if (products.length) this.data.products = products;
      if (coolers.length) this.data.coolers = coolers;
      if (orders.length) this.data.orders = orders;
      if (coolerReturns.length) this.data.coolerReturns = coolerReturns;
      this.save();
      console.log('[MongoDB] Successfully synchronized cache with live MongoDB.');
    } catch (err) {
      console.error('[MongoDB] Error synchronizing with MongoDB:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error writing data file:', err);
    }
  }

  get(collection) {
    return this.data[collection] || [];
  }

  findById(collection, id) {
    return (this.data[collection] || []).find(item => item.id === id);
  }

  insert(collection, item) {
    if (!this.data[collection]) {
      this.data[collection] = [];
    }
    this.data[collection].unshift(item);
    this.save();

    // Persist to MongoDB asynchronously if connected
    if (mongoose.connection.readyState === 1) {
      const Model = getModel(collection);
      if (Model) {
        Model.create(item).catch(err => console.error(`[MongoDB] Error inserting into ${collection}:`, err.message));
      }
    }
    return item;
  }

  update(collection, id, updates) {
    const list = this.data[collection] || [];
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...updates };
      this.save();

      // Persist to MongoDB asynchronously if connected
      if (mongoose.connection.readyState === 1) {
        const Model = getModel(collection);
        if (Model) {
          Model.updateOne({ id }, { $set: updates }).catch(err => console.error(`[MongoDB] Error updating ${collection}:`, err.message));
        }
      }
      return list[idx];
    }
    return null;
  }

  delete(collection, id) {
    const list = this.data[collection] || [];
    const idx = list.findIndex(item => item.id === id);
    if (idx !== -1) {
      const removed = list.splice(idx, 1)[0];
      this.save();

      // Persist to MongoDB asynchronously if connected
      if (mongoose.connection.readyState === 1) {
        const Model = getModel(collection);
        if (Model) {
          Model.deleteOne({ id }).catch(err => console.error(`[MongoDB] Error deleting from ${collection}:`, err.message));
        }
      }
      return removed;
    }
    return null;
  }
}

export const db = new Database();
