import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: false },
  role: { type: String, enum: ['customer', 'admin', 'rider'], default: 'customer' },
  phone: { type: String, required: false, default: '' },
  city: { type: String, default: 'Bengaluru' },
  address: { type: String, default: '' },
  depositBalance: { type: Number, default: 0 },
  upiId: { type: String, default: '' },
  googleId: { type: String, sparse: true, index: true },
  avatar: { type: String, default: '' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  emailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: Date.now }
}, {
  timestamps: true,
  strict: false
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);
