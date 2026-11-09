import type { Product, WeightOption } from './types';

/**
 * Returns standard weight options (500g, 800g, 1kg) for any product.
 * Prices are calibrated to be consistently lower than the local offline market price.
 * Bulk options (800g, 1kg) offer additional bulk value savings.
 */
export function getProductWeightOptions(product: Product): WeightOption[] {
  if (product.weightOptions && product.weightOptions.length > 0) {
    return product.weightOptions;
  }

  const basePrice = Number(product.price) || 200;
  // Local market price is typically 20-30% higher than GoMeat farm/harbor direct price
  const baseMrp = Number(product.mrp) > basePrice ? Number(product.mrp) : Math.round(basePrice * 1.25);

  const unitLower = (product.unit || '').toLowerCase();

  // Special case: Eggs
  if (unitLower.includes('egg') || product.category?.toLowerCase() === 'eggs') {
    return [
      {
        weight: '6 Eggs',
        label: '6 Eggs (Trial Pack)',
        price: basePrice,
        mrp: baseMrp,
        discountPercent: Math.round(((baseMrp - basePrice) / baseMrp) * 100),
        savings: baseMrp - basePrice,
        netWeight: '6 Eggs',
        grossWeight: '6 Eggs',
        pieces: '6 Farm Fresh Eggs',
        serves: 'Serves 1-2'
      },
      {
        weight: '12 Eggs',
        label: '12 Eggs (Regular Pack)',
        price: Math.round(basePrice * 1.9), // Extra discount
        mrp: Math.round(baseMrp * 2),
        discountPercent: Math.round((((baseMrp * 2) - Math.round(basePrice * 1.9)) / (baseMrp * 2)) * 100),
        savings: (baseMrp * 2) - Math.round(basePrice * 1.9),
        netWeight: '12 Eggs',
        grossWeight: '12 Eggs',
        pieces: '12 Farm Fresh Eggs',
        serves: 'Serves 2-4',
        badge: 'Popular'
      },
      {
        weight: '30 Eggs',
        label: '30 Eggs (Value Tray)',
        price: Math.round(basePrice * 4.4), // Maximum bulk discount
        mrp: Math.round(baseMrp * 5),
        discountPercent: Math.round((((baseMrp * 5) - Math.round(basePrice * 4.4)) / (baseMrp * 5)) * 100),
        savings: (baseMrp * 5) - Math.round(basePrice * 4.4),
        netWeight: '30 Eggs',
        grossWeight: '30 Eggs',
        pieces: '30 Farm Fresh Eggs (Crate)',
        serves: 'Family Monthly Value',
        badge: 'Best Value 🔥'
      }
    ];
  }

  // Standard Meat & Seafood: 500g, 800g, 1kg (As requested by Tanishqa)
  const netNum = parseInt(product.netWeight || '450', 10) || 450;
  const grossNum = parseInt(product.grossWeight || '500', 10) || 500;

  // 1. 500g Regular
  const p500 = basePrice;
  const mrp500 = baseMrp;
  const disc500 = Math.round(((mrp500 - p500) / mrp500) * 100);

  // 2. 800g Family Pack (1.6x multiplier, but GoMeat gives extra discount at 1.52x)
  const p800 = Math.round(basePrice * 1.52);
  const mrp800 = Math.round(baseMrp * 1.6);
  const disc800 = Math.round(((mrp800 - p800) / mrp800) * 100);

  // 3. 1kg Value Pack (2.0x multiplier, but GoMeat gives extra discount at 1.85x)
  const p1000 = Math.round(basePrice * 1.85);
  const mrp1000 = Math.round(baseMrp * 2.0);
  const disc1000 = Math.round(((mrp1000 - p1000) / mrp1000) * 100);

  return [
    {
      weight: '500g',
      label: '500g',
      price: p500,
      mrp: mrp500,
      discountPercent: disc500,
      savings: mrp500 - p500,
      netWeight: `${netNum}g`,
      grossWeight: `${grossNum}g`,
      pieces: product.pieces || '4-6 cuts',
      serves: product.serves || 'Serves 2-3'
    },
    {
      weight: '800g',
      label: '800g',
      price: p800,
      mrp: mrp800,
      discountPercent: disc800,
      savings: mrp800 - p800,
      netWeight: `${Math.round(netNum * 1.6)}g`,
      grossWeight: '800g',
      pieces: '6-9 cuts',
      serves: 'Serves 3-4',
      badge: 'Family Pack'
    },
    {
      weight: '1kg',
      label: '1kg',
      price: p1000,
      mrp: mrp1000,
      discountPercent: disc1000,
      savings: mrp1000 - p1000,
      netWeight: `${Math.round(netNum * 2)}g`,
      grossWeight: '1000g (1kg)',
      pieces: '8-12 cuts',
      serves: 'Serves 4-6',
      badge: 'Best Value 🔥'
    }
  ];
}
