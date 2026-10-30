import mongoose from 'mongoose';

const coolerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  coolerCode: { type: String, required: true, unique: true },
  rfidTag: { type: String, required: true },
  status: {
    type: String,
    enum: ['available', 'assigned', 'in_transit', 'with_customer', 'pickup_scheduled', 'sanitizing', 'retired'],
    default: 'available'
  },
  model: { type: String, default: 'ChillingTech™ EPP-Gel Reusable Unit' },
  hubLocation: { type: String, default: 'Central Cold Hub Mahadevapura' },
  currentTemp: { type: Number, default: 1.5 },
  batteryLevel: { type: Number, default: 98 },
  cyclesCompleted: { type: Number, default: 0 },
  maxSafeCycles: { type: Number, default: 150 },
  currentOrderId: { type: String, default: null },
  currentUserId: { type: String, default: null },
  depositHeld: { type: Number, default: 250 },
  lastSanitizedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export const Cooler = mongoose.models.Cooler || mongoose.model('Cooler', coolerSchema);
