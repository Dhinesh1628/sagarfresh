import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'admin', 'rider'], default: 'customer' },
  phone: { type: String, required: true },
  city: { type: String, default: 'Bengaluru' },
  address: { type: String, default: '' },
  depositBalance: { type: Number, default: 0 },
  upiId: { type: String, default: '' }
}, {
  timestamps: true
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
