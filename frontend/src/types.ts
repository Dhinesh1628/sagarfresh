export interface WalletTransaction {
  id: string;
  amount: number;
  type: 'credit' | 'debit';
  title: string;
  description: string;
  date: string;
  balanceAfter: number;
  orderId?: string;
  coolerId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin' | 'rider' | 'partner' | 'delivery';
  approvalStatus?: 'approved' | 'rejected' | 'suspended' | 'pending_approval';
  shopId?: string;
  shopName?: string;
  vehicleType?: string;
  vehicleNumber?: string;
  licenseNumber?: string;
  online?: boolean;
  earningsToday?: number;
  deliveriesToday?: number;
  rating?: number;
  fssaiNumber?: string;
  phone?: string;
  city?: string;
  address?: string;
  depositBalance?: number;
  walletBalance?: number;
  walletTransactions?: WalletTransaction[];
  activeCoolersCount?: number;
  upiId?: string;
  avatar?: string;
  googleId?: string;
  authProvider?: 'local' | 'google';
  emailVerified?: boolean;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
}

export interface WeightOption {
  weight: string; // '500g' | '800g' | '1kg'
  label: string;
  price: number; // GoMeat discounted price (less than market)
  mrp: number;   // Local market price
  discountPercent: number;
  savings: number;
  netWeight: string;
  grossWeight: string;
  pieces?: string;
  serves?: string;
  badge?: string;
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
  partnerId?: string;
  partnerName?: string;
  inStock?: boolean;
  weightOptions?: WeightOption[];
  priceUpdatedAt?: string;
}

export interface CartItem {
  id?: string;
  product: Product;
  quantity: number;
  selectedCutStyle?: string;
  selectedWeight?: string;
  unitPrice?: number;
  unitMrp?: number;
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
  chillingMethod?: string;
  cutStyle?: string;
  image?: string;
  imageUrl?: string;
}

export interface AddressDetails {
  fullName?: string;
  phone?: string;
  email?: string;
  flatNo?: string;
  building?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  instructions?: string;
}

export interface DeliveryAddress {
  id: string;
  tag: 'Home' | 'Work' | 'Other';
  flatNo: string;
  building?: string;
  street: string;
  area: string;
  city: string;
  state?: string;
  pincode: string;
  formattedAddress: string;
}

export type OrderPipelineStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'QUALITY_CHECK'
  | 'PACKED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'REFUND_PENDING';

export type ColdBoxRefundStatus = 
  | 'NOT_REQUESTED'
  | 'REQUESTED'
  | 'APPROVED'
  | 'REFUND_PROCESSING'
  | 'REFUNDED'
  | 'REJECTED';

export interface Order {
  id: string;
  orderNumber?: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  addressDetails?: AddressDetails;
  city: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount?: number;
  couponCode?: string | null;
  coolerDeposit: number;
  shippingFee: number;
  walletDeduction?: number;
  walletPaid?: boolean;
  total: number;
  totalAmount?: number;
  status: string;
  orderStatus?: OrderPipelineStatus;
  paymentMethod: string;
  paymentStatus?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  coolerId: string;
  coolerModel: string;
  coldBoxRefundStatus?: ColdBoxRefundStatus;
  refundId?: string;
  refundTxnId?: string;
  refundProcessedAt?: string;
  liveTemp: number;
  deliveryExecutive?: string;
  tempLog: TempLogEntry[];
  deliverySlot: string;
  trackingCode: string;
  createdAt: string;
  deliveryNotes?: string;
  tipAmount?: number;
  deliveryPin?: string;
  coolerReturned?: boolean;
  coolerDetails?: Cooler;
  weighedWeight?: string;
  batchLotId?: string;
  sealTag?: string;
  butcherName?: string;
  podImage?: string;
  handoverNotes?: string;
  deliveredAt?: string;
  riderId?: string;
  riderName?: string;
  riderFullName?: string;
  riderPhone?: string;
  riderVehicle?: string;
  riderEta?: string;
  partnerId?: string;
  partnerName?: string;
  lifecycleStatus?: string;
  assignedRider?: {
    firstName: string;
    riderId: string;
    vehicle: string;
    status: string;
    estimatedArrival: string;
    maskedPhone: string;
    secureCall: boolean;
    profilePhoto?: string;
  };
  riderLocation?: {
    lat: number;
    lng: number;
    heading?: number;
  };
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
  refundPreference?: 'wallet' | 'upi';
  upiId?: string;
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
