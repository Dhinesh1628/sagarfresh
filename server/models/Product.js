import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  unit: { type: String, required: true },
  netWeight: { type: String, required: true },
  grossWeight: { type: String, required: true },
  pieces: { type: String, default: 'Custom' },
  serves: { type: String, default: 'Serves 2-3' },
  eta: { type: String, default: '⚡ Today in 90 mins' },
  chillingMethod: { type: String, default: '0°C to 4°C FreshSeal™ Cold Chain' },
  catchDate: { type: String, default: 'Daily Harbor Catch' },
  origin: { type: String, default: 'Indian Coast' },
  cutStyle: { type: String, default: 'Neat Curry Cut' },
  stock: { type: Number, default: 20 },
  rating: { type: Number, default: 4.8 },
  reviewsCount: { type: Number, default: 120 },
  badge: { type: String, default: '' },
  imageUrl: { type: String, default: '' }
}, {
  timestamps: true,
  strict: false
});

export const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
