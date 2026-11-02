export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
  phone?: string;
  city?: string;
  address?: string;
  depositBalance?: number;
  activeCoolersCount?: number;
  upiId?: string;
  avatar?: string;
  googleId?: string;
  authProvider?: 'local' | 'google';
  emailVerified?: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number; // in INR ₹
  mrp?: number;
  unit: string;
  netWeight?: string;
  grossWeight?: string;
  pieces?: string;
  serves?: string;
  eta?: string;
  chillingMethod: string;
  catchDate: string;
  origin: string;
  cutStyle: string;
  stock: number;
  image?: string;
  imageUrl?: string;
  vacuumSealed?: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedCutStyle?: string;
}

export interface TempLogEntry {
  time: string;
  temp: number;
  event: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  netWeight?: string;
  chillingMethod: string;
  cutStyle?: string;
  image?: string;
}

export interface Order {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string;
  coolerDeposit: number;
  shippingFee: number;
  total: number;
  status: 'Cold Box Packed' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  coolerId: string;
  coolerModel: string;
  liveTemp: number;
  deliveryExecutive?: string;
  tempLog: TempLogEntry[];
  deliverySlot: string;
  trackingCode: string;
  paymentMethod: string;
  createdAt: string;
  deliveryNotes?: string;
  coolerDetails?: Cooler;
}

export interface Cooler {
  id: string;
  qrCode: string;
  model: string;
  status: 'available' | 'assigned' | 'in_transit' | 'with_customer' | 'return_requested' | 'returned' | 'sanitizing';
  currentOrderId?: string | null;
  currentUserId?: string | null;
  currentUserName?: string | null;
  cyclesUsed: number;
  lastSanitizedDate: string;
  depositAmount: number; // ₹250
  maxHoldingHours: number;
  assignedHub: string;
}

export interface CoolerReturn {
  id: string;
  coolerId: string;
  orderId: string;
  userId: string;
  userName: string;
  userPhone: string;
  userAddress: string;
  status: 'pickup_requested' | 'courier_assigned' | 'picked_up' | 'inspected' | 'refunded';
  requestDate: string;
  scheduledPickupSlot: string;
  refundAmount: number;
  refundMode: string;
  notes?: string;
  courierAssigned?: string;
  conditionNotes?: string;
  completedAt?: string;
}

export interface AdminMetrics {
  totalRevenue: number;
  totalOrders: number;
  activeOrders: number;
  coolersInCustody: number;
  totalCoolersFleet: number;
  availableCoolers: number;
  pendingReturns: number;
  completedReturns: number;
  coolerReturnRate: number;
  coldChainCompliance: number;
  productsCount: number;
}
