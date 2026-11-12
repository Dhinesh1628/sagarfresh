import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User, Product, Order, Cooler, CoolerReturn } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL === 'true';
const DATA_FILE = isVercel 
  ? (fs.existsSync(path.join('/tmp', 'gomeat_data.json')) ? path.join('/tmp', 'gomeat_data.json') : path.join('/tmp', 'sagar_data.json')) 
  : path.join(__dirname, 'data.json');

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
      email: "ops@gomeat.in",
      password: hashPassword("admin123"),
      role: "admin",
      phone: "+91 90000 00000",
      city: "Bengaluru",
      address: "GoMeat Fulfillment Center, Outer Ring Road, Mahadevapura, Bengaluru 560048",
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
    },
    {
      id: "usr_rider_1",
      name: "Suresh Patil",
      email: "rider@gomeat.in",
      password: hashPassword("rider123"),
      role: "rider",
      approvalStatus: "approved",
      phone: "+91 97412 88301",
      city: "Bengaluru",
      address: "B-22, Kodihalli, HAL 2nd Stage, Indiranagar, Bengaluru 560008",
      vehicleType: "EV 2-Wheeler (Ather 450X)",
      vehicleNumber: "KA-04-EV-819",
      licenseNumber: "KA0420220019281",
      idDocType: "Driving License (Smart Card)",
      assignedHub: "Bengaluru Central Hub Depot",
      isOnline: true,
      rating: 4.92,
      earningsToday: 480,
      totalDeliveries: 342,
      createdAt: "2026-03-01T08:00:00.000Z"
    },
    {
      id: "usr_rider_pending",
      name: "Mahesh Kumar",
      email: "mahesh.rider@gmail.com",
      password: hashPassword("rider123"),
      role: "rider",
      approvalStatus: "pending_approval",
      phone: "+91 98450 11223",
      city: "Bengaluru",
      address: "14/2, Whitefield Main Road, Bengaluru 560066",
      vehicleType: "Motorcycle (Hero Splendor Plus)",
      vehicleNumber: "KA-03-HA-4412",
      licenseNumber: "KA0320230099182",
      idDocType: "Aadhaar + DL",
      assignedHub: "Mahadevapura Dark Hub",
      isOnline: false,
      rating: 5.0,
      earningsToday: 0,
      totalDeliveries: 0,
      createdAt: "2026-11-10T09:00:00.000Z"
    },
    {
      id: "usr_partner_1",
      name: "Abdul Rahim (Master Butcher)",
      email: "partner@gomeat.in",
      password: hashPassword("partner123"),
      role: "partner",
      approvalStatus: "approved",
      phone: "+91 98860 33445",
      city: "Bengaluru",
      address: "12/A, 100 Feet Road, Indiranagar, Bengaluru 560038",
      shopId: "shop_central_butcher",
      shopName: "Halal Cuts & Coastal Harbor Station #14",
      shopAddress: "12/A, 100 Feet Road, Indiranagar, Bengaluru 560038",
      fssaiNumber: "FSSAI-11223344556677",
      operatingHours: "06:00 AM - 10:00 PM",
      categories: ["Fish & Seafood", "Mutton & Lamb", "Farm Fresh Chicken"],
      rating: 4.95,
      totalOrdersHandled: 890,
      createdAt: "2026-02-01T08:00:00.000Z"
    },
    {
      id: "usr_partner_pending",
      name: "Karthik Gowda (Owner)",
      email: "karthik.poultry@gmail.com",
      password: hashPassword("partner123"),
      role: "partner",
      approvalStatus: "pending_approval",
      phone: "+91 97310 99887",
      city: "Bengaluru",
      address: "NH 48, Nelamangala Rural, Bengaluru 562123",
      shopId: "shop_nelamangala_fresh",
      shopName: "Nelamangala Organic Broiler & Country Birds",
      shopAddress: "NH 48, Nelamangala Rural, Bengaluru 562123",
      fssaiNumber: "FSSAI-22446688001122",
      operatingHours: "07:00 AM - 09:00 PM",
      categories: ["Farm Fresh Chicken", "Eggs & Specialties"],
      rating: 5.0,
      totalOrdersHandled: 0,
      createdAt: "2026-11-10T10:30:00.000Z"
    }
  ],
  products: [
    {
      id: "prod_1",
      name: "Mangalore Surmai Tawa Fry (Large Steaks)",
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
      image: "/images/products/prod_1.jpg",
      imageUrl: "/images/products/prod_1.jpg",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_2",
      name: "Crispy Rechado White Pomfret (Whole Cleaned)",
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
      image: "/images/products/prod_2.jpg",
      imageUrl: "/images/products/prod_2.jpg",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_3",
      name: "Butter Garlic Jumbo Prawns (Cleaned & Deveined)",
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
      image: "/images/products/prod_3.jpg",
      imageUrl: "/images/products/prod_3.jpg",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_4",
      name: "Kashmiri Mutton Rogan Josh (Curry & Biryani Cut)",
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
      image: "/images/products/prod_4.jpg",
      imageUrl: "/images/products/prod_4.jpg",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_5",
      name: "Golden Herb Butter Chicken Breast (Boneless Fillets)",
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
      image: "/images/products/prod_5.jpg",
      imageUrl: "/images/products/prod_5.jpg",
      vacuumSealed: true,
      featured: true
    },
    {
      id: "prod_6",
      name: "Andhra Nati Koli Pepper Roast (Country Chicken Cut)",
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
      image: "/images/products/prod_6.jpg",
      imageUrl: "/images/products/prod_6.jpg",
      vacuumSealed: true,
      featured: false
    },
    {
      id: "prod_7",
      name: "Crispy Amritsari Fish Tikka (Ready to Cook)",
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
      origin: "GoMeat Master Kitchen",
      cutStyle: "Marinated Boneless Cubes",
      stock: 30,
      image: "/images/products/prod_7.jpg",
      imageUrl: "/images/products/prod_7.jpg",
      vacuumSealed: true,
      featured: false
    },
    {
      id: "prod_8",
      name: "Grand Coastal Feast Box (Surmai + Prawns + Mutton)",
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
      image: "/images/products/prod_8.jpg",
      imageUrl: "/images/products/prod_8.jpg",
      vacuumSealed: true,
      featured: true
    }
  ],
  coolers: [
    {
      id: "BOX-BLR-417",
      qrCode: "GOMEAT-BOX-417",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "with_customer",
      currentOrderId: "ORD-417-DELIVERED",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 14,
      lastSanitizedDate: "2026-11-05",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Mahadevapura Dark Hub"
    },
    {
      id: "BOX-BLR-182",
      qrCode: "GOMEAT-BOX-182",
      model: "ThermalVault 24L - Dual Phase ColdGel Box",
      status: "assigned",
      currentOrderId: "ORD-9281",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 8,
      lastSanitizedDate: "2026-11-06",
      depositAmount: 250,
      maxHoldingHours: 48,
      assignedHub: "Mahadevapura Dark Hub"
    },
    {
      id: "BOX-BLR-633",
      qrCode: "GOMEAT-BOX-633",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "available",
      currentOrderId: null,
      currentUserId: null,
      currentUserName: null,
      cyclesUsed: 22,
      lastSanitizedDate: "2026-11-08",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Bengaluru Central Hub Depot"
    },
    {
      id: "BOX-BLR-983",
      qrCode: "GOMEAT-BOX-983",
      model: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "with_customer",
      currentOrderId: "ORD-9281",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 12,
      lastSanitizedDate: "2026-11-04",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Bengaluru Central Hub Depot"
    },
    {
      id: "BOX-BLR-103",
      qrCode: "GOMEAT-BOX-BLR-103",
      coolerCode: "GOMEAT-BOX-BLR-103",
      model: "ThermalVault 24L - Dual Phase ColdGel Box",
      status: "damaged",
      currentOrderId: "ORD-103-BREACH",
      currentUserId: "usr_customer",
      currentUserName: "Pooja Sundaram",
      cyclesUsed: 19,
      lastSanitizedDate: "2026-10-24",
      depositAmount: 250,
      maxHoldingHours: 36,
      assignedHub: "Bengaluru Central (Indiranagar Hub)",
      maintenanceReason: "Worn silicone gasket seal • Thermal breach excursion (5.8°C > 4.0°C safe limit)"
    },
    {
      id: "BOX-BLR-101",
      qrCode: "GOMEAT-BOX-101",
      qrCode: "GOMEAT-BOX-101",
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
      qrCode: "GOMEAT-BOX-102",
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
      qrCode: "GOMEAT-BOX-103",
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
      qrCode: "GOMEAT-BOX-104",
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
      qrCode: "GOMEAT-BOX-105",
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
      qrCode: "GOMEAT-BOX-106",
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
      lifecycleStatus: "OUT_FOR_DELIVERY",
      partnerId: "shop_central_butcher",
      partnerName: "Halal Cuts & Coastal Harbor Station #14",
      riderId: "usr_rider_1",
      riderName: "Suresh",
      riderFullName: "Suresh Patil",
      riderPhone: "+91 97412 •••01",
      riderVehicle: "EV 2-Wheeler (KA-04-EV-819)",
      riderEta: "20–30 minutes",
      coolerId: "BOX-BLR-103",
      coolerModel: "ThermalVault 24L - Dual Phase ColdGel Box",
      liveTemp: 1.2,
      deliveryExecutive: "Suresh Patil (EV Fleet #14, +91 97412 88301)",
      tempLog: [
        { time: "06:15", temp: 0.2, event: "Cuts packed with chilled gel bricks at Halal Cuts Station" },
        { time: "07:00", temp: 0.8, event: "Loaded onto insulated delivery electric vehicle" },
        { time: "07:45", temp: 1.2, event: "Delivery partner Suresh en route near Marathahalli" }
      ],
      deliverySlot: "Today, Express in 90 Mins",
      trackingCode: "GOMEAT-TRK-4412",
      deliveryPin: "6314",
      paymentMethod: "UPI (Google Pay)",
      createdAt: "2026-10-30T01:30:00.000Z",
      deliveryNotes: "Leave at security desk or ring Flat 402 doorbell."
    },
    {
      id: "ORD-417-DELIVERED",
      orderNumber: "ORD-417-DELIVERED",
      userId: "usr_customer",
      customerName: "Pooja Sundaram",
      customerEmail: "pooja.sundaram@gmail.com",
      customerPhone: "+91 98765 43210",
      deliveryAddress: "Flat 402, Alpine Eco Apartments, Doddanekkundi, Marathahalli, Bengaluru 560037",
      city: "Bengaluru",
      coolerId: "BOX-BLR-417",
      coolerModel: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      status: "Delivered",
      orderStatus: "DELIVERED",
      lifecycleStatus: "DELIVERED",
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
          productId: "prod_3",
          name: "Tender Curry Cut Broiler Chicken (Skinless)",
          price: 249,
          quantity: 2,
          unit: "500g",
          netWeight: "900g",
          chillingMethod: "0°C to 4°C FreshSeal™ Cold Chain"
        }
      ],
      total: 1299,
      coolerDeposit: 250,
      createdAt: "2026-11-11T12:00:00.000Z",
      deliveredAt: "2026-11-11T14:30:00.000Z",
      tempLog: [
        { time: "08:00 AM", temp: 0.8, event: "Sealed with chilled ice-gel packs at Mahadevapura Dark Hub" },
        { time: "08:30 AM", temp: 1.2, event: "Dispatched with EV Cold-Chain Courier" },
        { time: "09:15 AM", temp: 1.8, event: "Delivered at customer doorstep (Sub-4C guaranteed)" }
      ]
    },
    {
      id: "ORD-7740",
      userId: "usr_customer",
      customerName: "Pooja Sundaram",
      customerEmail: "pooja.sundaram@gmail.com",
      customerPhone: "+91 98765 43210",
      deliveryAddress: "Flat 402, Alpine Eco Apartments, Doddanekkundi, Bengaluru 560037",
      city: "Bengaluru",
      items: [
        {
          productId: "prod_3",
          name: "Tender Curry Cut Broiler Chicken (Skinless)",
          price: 249,
          quantity: 1,
          unit: "500g",
          netWeight: "450g",
          chillingMethod: "0°C to 4°C FreshSeal™ Cold Chain"
        }
      ],
      subtotal: 249,
      coolerDeposit: 250,
      shippingFee: 40,
      total: 539,
      status: "Preparing",
      lifecycleStatus: "PREPARING",
      partnerId: "shop_central_butcher",
      partnerName: "Halal Cuts & Coastal Harbor Station #14",
      riderId: "usr_rider_1",
      riderName: "Suresh",
      riderFullName: "Suresh Patil",
      riderPhone: "+91 97412 •••01",
      riderVehicle: "EV 2-Wheeler (KA-04-EV-819)",
      riderEta: "Pending butcher packing",
      coolerId: "BOX-BLR-774",
      coolerModel: "ThermalVault 18L - Reusable EPP Cold-Gel Box",
      liveTemp: 1.0,
      tempLog: [
        { time: "06:15 AM", temp: 0.2, event: "Cuts packed with chilled gel bricks at Halal Cuts Station" }
      ],
      deliveryExecutive: "Suresh Patil (EV Fleet #14)",
      deliverySlot: "Today, Evening 5:00 PM - 7:00 PM",
      trackingCode: "GOMEAT-TRK-7740",
      deliveryPin: "4918",
      paymentMethod: "Razorpay (Credit Card)",
      createdAt: new Date().toISOString(),
      deliveryNotes: "Fresh cuts only. Please make medium bone-in pieces."
    },
    {
      id: "ORD-103-BREACH",
      orderNumber: "ORD-103-BREACH",
      userId: "usr_customer",
      customerName: "Pooja Sundaram",
      customerEmail: "pooja.sundaram@gmail.com",
      customerPhone: "+91 98765 43210",
      deliveryAddress: "Flat 402, Alpine Eco Apartments, Doddanekkundi, Marathahalli, Bengaluru 560037",
      city: "Bengaluru",
      coolerId: "BOX-BLR-103",
      coolerModel: "ThermalVault 24L - Dual Phase ColdGel Box",
      status: "Delivered",
      orderStatus: "DELIVERED",
      lifecycleStatus: "DELIVERED",
      items: [
        {
          productId: "prod_2",
          name: "Young Goat / Mutton Biryani Cut (Tender)",
          price: 549,
          quantity: 2,
          unit: "500g",
          netWeight: "1000g",
          chillingMethod: "0°C to 4°C FreshSeal™ Cold Chain"
        },
        {
          productId: "prod_4",
          name: "White Prawns / Jhinga (Cleaned & Deveined)",
          price: 499,
          quantity: 1,
          unit: "500g",
          netWeight: "450g",
          chillingMethod: "0°C to 4°C FreshSeal™ Cold Chain"
        }
      ],
      total: 1598,
      totalAmount: 1598,
      createdAt: "2026-11-08T09:00:00.000Z",
      deliveredAt: "2026-11-08T10:45:00.000Z",
      coolerReturned: false,
      deliveryExecutive: "Sunil Gowda (Fleet #09)",
      paymentMethod: "UPI (Google Pay)",
      tempLog: [
        { time: "09:00", temp: 1.4, event: "Cuts packed with chilled gel bricks at Halal Cuts Station" },
        { time: "09:30", temp: 3.2, event: "Dispatched with EV Chilled Courier" },
        { time: "10:15", temp: 5.4, event: "ALERT: Sensor rose above 4C safe threshold" },
        { time: "10:45", temp: 5.8, event: "Delivered at doorstep - Gasket seal compromised (5.8C)" }
      ]
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
        if (!this.data.coolers) this.data.coolers = [];
        if (!this.data.orders) this.data.orders = [];

        const box417 = this.data.coolers.find(c => c.id === 'BOX-BLR-417');
        if (!box417) {
          const init417 = INITIAL_DATA.coolers.find(c => c.id === 'BOX-BLR-417');
          if (init417) this.data.coolers.push({ ...init417 });
        } else {
          box417.currentOrderId = 'ORD-417-DELIVERED';
          box417.status = 'with_customer';
        }

        if (!this.data.orders.some(o => o.id === 'ORD-417-DELIVERED')) {
          const ord417 = INITIAL_DATA.orders.find(o => o.id === 'ORD-417-DELIVERED');
          if (ord417) this.data.orders.push({ ...ord417 });
        }

        // Clean any conflict where ORD-7740 took BOX-BLR-417
        const ord7740 = this.data.orders.find(o => o.id === 'ORD-7740');
        if (ord7740 && ord7740.coolerId === 'BOX-BLR-417') {
          ord7740.coolerId = 'BOX-BLR-774';
        }

        const box103 = this.data.coolers.find(c => c.id === 'BOX-BLR-103');
        if (!box103) {
          const init103 = INITIAL_DATA.coolers.find(c => c.id === 'BOX-BLR-103');
          if (init103) this.data.coolers.push({ ...init103 });
        } else {
          box103.currentOrderId = 'ORD-103-BREACH';
          box103.status = 'damaged';
          box103.maintenanceReason = 'Thermal gasket compromised • Sensor reached 5.8°C (>4.0°C safe limit)';
        }

        if (!this.data.orders.some(o => o.id === 'ORD-103-BREACH' || o.coolerId === 'BOX-BLR-103')) {
          const breachOrder = INITIAL_DATA.orders.find(o => o.id === 'ORD-103-BREACH');
          if (breachOrder) this.data.orders.push({ ...breachOrder });
        }

        // Guarantee every order in persistent database has non-empty items array
        this.data.orders.forEach(o => {
          if (!o.items || !Array.isArray(o.items) || o.items.length === 0) {
            const initOrd = INITIAL_DATA.orders.find(io => io.id === o.id);
            if (initOrd && initOrd.items && initOrd.items.length > 0) {
              o.items = JSON.parse(JSON.stringify(initOrd.items));
            } else {
              o.items = [
                {
                  productId: 'prod_1',
                  name: 'Mangalore Surmai Steaks (Chilled 0°C-4°C)',
                  price: o.total ? Math.max(199, o.total - 250) : 499,
                  quantity: 1,
                  unit: '500g'
                }
              ];
            }
          }
        });

        this.save();
        console.log('[DB] Loaded GoMeat database from persistence');
        return;
      }
      this.data = JSON.parse(JSON.stringify(INITIAL_DATA));
      this.save();
      console.log('[DB] Initialized GoMeat database');
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
        console.log('[MongoDB] Collections empty, auto-seeding GoMeat catalog into MongoDB...');
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
        const mongoItem = { ...item };
        if (collection === 'coolers' && !mongoItem.coolerCode) {
          mongoItem.coolerCode = mongoItem.qrCode || mongoItem.id;
        }
        if (collection === 'orders') {
          if (!mongoItem.orderNumber) mongoItem.orderNumber = mongoItem.id;
          if (mongoItem.totalAmount === undefined) mongoItem.totalAmount = mongoItem.total || 0;
        }
        Model.create(mongoItem).catch(err => console.error(`[MongoDB] Error inserting into ${collection}:`, err.message));
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
