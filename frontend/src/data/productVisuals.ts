export interface ProductVisualMeta {
  rawImage: string;
  cookedImage: string;
  cookedDishName: string;
  cookedDescription: string;
  cookingTime: string;
  flavorProfile: string[];
}

export const PRODUCT_VISUALS_MAP: Record<string, ProductVisualMeta> = {
  prod_1: {
    rawImage: '/images/products/prod_1.jpg',
    cookedImage: '/images/products/cooked_surmai_tawa_fry.jpg',
    cookedDishName: 'Mangalore Surmai Tawa Fry',
    cookedDescription: 'Crispy rava-crusted Seer fish steaks sizzling with Byadagi chili, curry leaves, and lemon.',
    cookingTime: '8 mins pan fry',
    flavorProfile: ['Spicy', 'Tangy', 'Crisp Edge']
  },
  prod_2: {
    rawImage: '/images/products/prod_2.jpg',
    cookedImage: '/images/products/cooked_white_pomfret.jpg',
    cookedDishName: 'Rechado White Pomfret Fry',
    cookedDescription: 'Whole scored pomfret stuffed with tangy Konkani red rechado masala, pan-fried to crisp perfection.',
    cookingTime: '10 mins shallow fry',
    flavorProfile: ['Tangy', 'Rechado Spiced', 'Flaky White']
  },
  prod_3: {
    rawImage: '/images/products/prod_3.jpg',
    cookedImage: '/images/products/cooked_tiger_prawns.jpg',
    cookedDishName: 'Butter Garlic Jumbo Prawns',
    cookedDescription: 'Succulent jumbo tiger prawns wok-tossed in melted butter, roasted garlic, green chili & cilantro.',
    cookingTime: '5 mins quick toss',
    flavorProfile: ['Garlic Butter', 'Juicy Crunch', 'Mild Chili']
  },
  prod_4: {
    rawImage: '/images/products/prod_4.jpg',
    cookedImage: '/images/products/cooked_mutton_rogan_josh.jpg',
    cookedDishName: 'Kashmiri Mutton Rogan Josh',
    cookedDescription: 'Slow-simmered tender goat meat in rich aromatic crimson gravy infused with maval petals & fennel.',
    cookingTime: '45 mins dum simmer',
    flavorProfile: ['Rich Rogan', 'Melt-in-mouth', 'Aromatic']
  },
  prod_5: {
    rawImage: '/images/products/prod_5.jpg',
    cookedImage: '/images/products/cooked_chicken.jpg',
    cookedDishName: 'Golden Herb Butter Chicken Breast',
    cookedDescription: 'Juicy golden-brown seared chicken breast fillets with fresh rosemary, cracked pepper & lemon butter.',
    cookingTime: '6 mins skillet sear',
    flavorProfile: ['High Protein', 'Herb Butter', 'Juicy Center']
  },
  prod_6: {
    rawImage: '/images/products/prod_6.jpg',
    cookedImage: '/images/products/cooked_nati_koli.jpg',
    cookedDishName: 'Andhra Nati Koli Pepper Roast',
    cookedDescription: 'Traditional country chicken cooked in clay pot with roasted peppercorns, curry leaves & village spices.',
    cookingTime: '30 mins rustic simmer',
    flavorProfile: ['Fiery Pepper', 'Rustic Country', 'Robust']
  },
  prod_7: {
    rawImage: '/images/products/prod_7.jpg',
    cookedImage: '/images/products/cooked_fish_tikka.jpg',
    cookedDishName: 'Amritsari Crispy Fish Tikka',
    cookedDescription: 'Crispy carom-seed (ajwain) and gram flour coated succulent fish nuggets with mint chutney & chaat masala.',
    cookingTime: '7 mins crisp fry / air-fry',
    flavorProfile: ['Ajwain Spiced', 'Crunchy Crust', 'Street-Style']
  },
  prod_8: {
    rawImage: '/images/products/prod_8.jpg',
    cookedImage: '/images/products/cooked_tiger_prawns.jpg',
    cookedDishName: 'Grand Coastal Seafood Feast',
    cookedDescription: 'Sumptuous celebration spread of crispy Surmai tawa steaks, butter garlic prawns & fragrant curry.',
    cookingTime: 'Feast Ready',
    flavorProfile: ['Seafood Platter', 'Tawa Fry', 'Family Feast']
  }
};

export function getProductVisual(productId: string, fallbackRaw?: string): ProductVisualMeta {
  if (PRODUCT_VISUALS_MAP[productId]) {
    return PRODUCT_VISUALS_MAP[productId];
  }
  return {
    rawImage: fallbackRaw || `/images/products/${productId}.jpg`,
    cookedImage: '/images/products/cooked_surmai_tawa_fry.jpg',
    cookedDishName: 'Chef Special Preparation',
    cookedDescription: 'Farm-fresh cut ready for your favorite home-cooked recipe.',
    cookingTime: '15 mins',
    flavorProfile: ['Fresh', 'Tender']
  };
}
