import mongoose from 'mongoose';

const coolerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  qrCode: { type: String },
  coolerCode: { type: String },
  rfidTag: { type: String },
  model: { type: String, default: 'ThermalVault Reusable ColdGel Box' },
  status: { type: String, default: 'available' },
  currentOrderId: { type: String, default: null },
  currentUserId: { type: String, default: null },
  currentUserName: { type: String, default: null },
  cyclesUsed: { type: Number, default: 0 },
  lastSanitizedDate: { type: String },
  depositAmount: { type: Number, default: 250 },
  maxHoldingHours: { type: Number, default: 48 },
  assignedHub: { type: String }
}, {
  timestamps: true,
  strict: false
});

export const Cooler = mongoose.models.Cooler || mongoose.model('Cooler', coolerSchema);
