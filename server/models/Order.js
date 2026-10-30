import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  cutStyle: { type: String },
  unit: { type: String },
  imageUrl: { type: String }
}, { _id: false });

const tempLogSchema = new mongoose.Schema({
  time: { type: String, required: true },
  temp: { type: Number, required: true }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userPhone: { type: String, required: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  coolerDeposit: { type: Number, default: 250 },
  deliveryFee: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['Blast-Chilling', 'Packed in Reusable Cooler', 'Out for Delivery (Chilled)', 'Delivered', 'Cancelled'],
    default: 'Blast-Chilling'
  },
  deliveryAddress: { type: String, required: true },
  deliverySlot: { type: String, default: 'Within 90 Mins' },
  etaMinutes: { type: Number, default: 35 },
  paymentMethod: { type: String, default: 'UPI' },
  upiTransactionId: { type: String, default: '' },
  coolerId: { type: String, required: true },
  coolerRfid: { type: String, default: '' },
  hubOrigin: { type: String, default: 'Sagar Fresh Central Cold Hub, Mahadevapura' },
  currentTemp: { type: Number, default: 1.8 },
  temperatureLog: [tempLogSchema],
  deliveryPartner: {
    name: { type: String, default: 'Raghavendra M.' },
    phone: { type: String, default: '+91 98440 22319' },
    vehicle: { type: String, default: 'EV Insulated Delivery Pod' }
  }
}, {
  timestamps: true,
  strict: false
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
