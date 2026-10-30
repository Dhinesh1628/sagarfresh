import React, { useState } from 'react';
import { X, Plus, Minus, Zap } from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose
}) => {
  const { items, addItem, updateQuantity } = useCart();
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  if (!product) return null;

  const currentCutStyle = selectedStyle || product.cutStyle;
  const existingItem = items.find(i => i.product.id === product.id);
  const currentQuantity = existingItem ? existingItem.quantity : 1;

  const handleAddToCart = () => {
    addItem(product, 1, currentCutStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      <div onClick={onClose} className="fixed inset-0 bg-black/60" />

      <div className="relative w-full max-w-xl bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden text-gray-800 z-10 flex flex-col md:flex-row">
        
        {/* Left: Image */}
        <div className="md:w-1/2 bg-gray-100 relative h-60 md:h-auto">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover" 
          />
          <div className="absolute top-2 left-2 bg-white px-2 py-0.5 rounded text-[10px] font-bold text-gray-800 shadow-2xs flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
            <span>{product.eta || '⚡ 90 Mins Delivery'}</span>
          </div>
          {product.netWeight && (
            <div className="absolute bottom-2 left-2 bg-black/75 px-2 py-0.5 rounded text-[10px] text-white">
              Net: {product.netWeight} {product.grossWeight ? `| Gross: ${product.grossWeight}` : ''}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="p-5 md:w-1/2 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase text-[#d11243]">
                {product.category}
              </span>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h2 className="text-base font-bold text-gray-900 leading-snug">
                {product.name}
              </h2>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-black text-gray-950">₹{product.price}</span>
                {product.mrp && (
                  <span className="text-xs text-gray-400 line-through">₹{product.mrp}</span>
                )}
                <span className="text-xs text-gray-500">/ {product.unit}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Pieces & Serves Pill */}
            <div className="bg-gray-50 p-2.5 rounded-lg border border-gray-100 text-xs space-y-1">
              <div className="flex justify-between text-gray-600">
                <span>Portion Size:</span>
                <span className="font-semibold text-gray-900">{product.pieces || '4-6 Pieces'} ({product.serves || 'Serves 2-3'})</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Source Origin:</span>
                <span className="font-medium text-gray-900">{product.origin}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Cold Chain Protocol:</span>
                <span className="font-semibold text-emerald-800">{product.chillingMethod}</span>
              </div>
            </div>

            {/* Cut style selection */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                Custom Cut Specification:
              </label>
              <select
                value={currentCutStyle}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs text-gray-800 focus:outline-none focus:border-[#d11243]"
              >
                <option value={product.cutStyle}>{product.cutStyle} (Recommended)</option>
                <option value="Curry Cut with Bone">Curry Cut with Bone</option>
                <option value="Boneless Fillet Pieces">Boneless Fillet Pieces</option>
                <option value="Thin Tawa Fry Steaks">Thin Tawa Fry Steaks</option>
              </select>
            </div>
          </div>

          {/* Action */}
          <div className="pt-3 border-t border-gray-100">
            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-4 bg-[#d11243] hover:bg-[#b80f3b] text-white font-bold text-xs rounded-lg text-center cursor-pointer shadow-xs transition"
            >
              Add to Cold Box (₹{product.price})
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
