import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  cutStyle: { type: String, default: 'Standard Curry Cut' },
  unit: { type: String, default: '500g' },
  netWeight: { type: String, default: '450g' },
  imageUrl: { type: String, default: '' },
  image: { type: String, default: '' }
}, { _id: false });

const tempLogSchema = new mongoose.Schema({
  time: { type: String, required: true },
  temp: { type: Number, required: true },
  event: { type: String, default: '' }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderNumber: { type: String, default: function() { return this.id || `ORD-${Date.now()}`; } },
  userId: { type: String, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerPhone: { type: String, required: true },
  items: [orderItemSchema],
  
  // Pricing breakdown
  subtotal: { type: Number, required: true },
  discountAmount: { type: Number, default: 0 },
  couponCode: { type: String, default: null },
  coolerDeposit: { type: Number, default: 250 },
  deliveryFee: { type: Number, default: 0 },
  total: { type: Number, required: true },
  totalAmount: { type: Number, default: function() { return this.total || 0; } },

  // Delivery & Address details
  deliveryAddress: { type: String, required: true },
  addressDetails: {
    fullName: { type: String },
    phone: { type: String },
    email: { type: String },
    flatNo: { type: String },
    building: { type: String },
    street: { type: String },
    city: { type: String, default: 'Bengaluru' },
    state: { type: String, default: 'Karnataka' },
    pincode: { type: String },
    instructions: { type: String }
  },
  deliverySlot: { type: String, default: '⚡ Express Delivery in 90 Mins' },
  city: { type: String, default: 'Bengaluru' },
  deliveryNotes: { type: String, default: '' },

  // Order Pipeline Status (Independent from Payment Status)
  orderStatus: {
    type: String,
    enum: [
      'PENDING',
      'CONFIRMED',
      'PREPARING',
      'QUALITY_CHECK',
      'PACKED',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED'
    ],
    default: 'CONFIRMED'
  },
  // Legacy status string for backward compatibility with existing views
  status: { type: String, default: 'Order Confirmed' },

  // Payment Tracking
  paymentMethod: { type: String, default: 'razorpay' },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING'
  },
  razorpayOrderId: { type: String, default: '' },
  razorpayPaymentId: { type: String, default: '' },
  razorpaySignature: { type: String, default: '' },
  paymentDetails: {
    method: { type: String },
    bank: { type: String },
    wallet: { type: String },
    vpa: { type: String },
    paidAt: { type: Date }
  },

  // Cold-Box & Deposit Management
  coolerId: { type: String, required: true },
  coolerModel: { type: String, default: 'ThermalVault 18L - Reusable EPP Cold-Gel Box' },
  coldBoxRefundStatus: {
    type: String,
    enum: ['NOT_REQUESTED', 'REQUESTED', 'APPROVED', 'REFUND_PROCESSING', 'REFUNDED', 'REJECTED'],
    default: 'NOT_REQUESTED'
  },
  refundId: { type: String, default: '' },
  refundTxnId: { type: String, default: '' },
  refundProcessedAt: { type: Date },

  // Cold-Chain Telemetry
  liveTemp: { type: Number, default: 1.8 },
  tempLog: [tempLogSchema],
  temperatureLog: [tempLogSchema],
  trackingCode: { type: String, default: '' },
  etaMinutes: { type: Number, default: 35 },
  deliveryExecutive: { type: String, default: 'Sunil Gowda (EV Delivery #14)' }
}, {
  timestamps: true,
  strict: false
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
