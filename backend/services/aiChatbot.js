import { db } from '../db.js';

/**
 * Enterprise AI Master Butcher & Culinary Concierge Engine
 * Provides comprehensive butcher knowledge, step-by-step chef recipes,
 * portion planning, cold-chain telemetry, and automated cart execution.
 */

export async function processCustomerMessage(userMessage, userPhone = '') {
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();

  // Load latest live catalog & active orders from database
  const products = db.get('products') || [];
  const orders = db.get('orders') || [];

  // Helper product lookup
  const getProd = (id) => products.find(p => p.id === id);
  const surmai = getProd('prod_1');
  const pomfret = getProd('prod_2');
  const prawns = getProd('prod_3');
  const mutton = getProd('prod_4');
  const chickenBreast = getProd('prod_5');
  const natiKoli = getProd('prod_6');
  const fishTikka = getProd('prod_7');
  const feastBox = getProd('prod_8');

  // =========================================================================
  // 1. DIRECT ACTION: APPLY COUPON / OFFERS
  // =========================================================================
  if (lower.includes('apply coupon') || lower.includes('fresh20') || lower.includes('discount') || lower.includes('coupon') || lower.includes('offer') || lower.includes('deal')) {
    return {
      reply: `🎉 *Deal Applied: 20% OFF with code FRESH20!*\n\n• *Discount:* 20% OFF on all fresh cuts\n• *Minimum Order:* ₹299\n• *Free Cold-Chain Delivery:* Automatically unlocked on orders above ₹499\n\nI have attached the coupon to your session. Ready to add your favorite cuts?`,
      action: {
        type: 'APPLY_COUPON',
        code: 'FRESH20',
        discountPercent: 20
      },
      actionCard: {
        title: 'Apply 20% OFF (FRESH20)',
        subtitle: 'Valid on entire fresh catalog today',
        buttonText: 'Apply Coupon to Cart',
        actionType: 'APPLY_COUPON',
        code: 'FRESH20'
      },
      suggestedReplies: [
        "Add Surmai Tawa Steaks",
        "Add Mutton Rogan Josh",
        "Add Butter Garlic Prawns",
        "View my Cart"
      ]
    };
  }

  // =========================================================================
  // 2. DIRECT ACTION: ADD TO CART RECOGNITION
  // =========================================================================
  if (lower.includes('add to cart') || lower.includes('add') || lower.includes('order') || lower.includes('buy') || lower.includes('khareed') || lower.includes('pack')) {
    // Detect item
    let targetProd = null;
    let qty = 1;
    let weight = '500g';

    if (lower.includes('surmai') || lower.includes('seer')) {
      targetProd = surmai;
    } else if (lower.includes('prawn') || lower.includes('jheenga')) {
      targetProd = prawns;
    } else if (lower.includes('mutton') || lower.includes('goat') || lower.includes('gosht') || lower.includes('rogan')) {
      targetProd = mutton;
    } else if (lower.includes('nati koli') || lower.includes('country chicken')) {
      targetProd = natiKoli;
    } else if (lower.includes('breast') || lower.includes('chicken breast') || lower.includes('boneless')) {
      targetProd = chickenBreast;
    } else if (lower.includes('pomfret') || lower.includes('paplet')) {
      targetProd = pomfret;
    } else if (lower.includes('tikka')) {
      targetProd = fishTikka;
    } else if (lower.includes('feast') || lower.includes('box')) {
      targetProd = feastBox;
    }

    // Detect weight if 1kg
    if (lower.includes('1kg') || lower.includes('1 kg') || lower.includes('one kg') || lower.includes('1000g')) {
      weight = '1kg';
    }

    if (targetProd) {
      return {
        reply: `🛒 *Added to your GoMeat Cart!* \n\n• *Item:* ${targetProd.name}\n• *Pack Size:* ${weight}\n• *Price:* ₹${weight === '1kg' ? targetProd.price * 2 - 50 : targetProd.price}\n• *Cold-Chain Spec:* Blast-chilled at 0°C to 4°C, 100% RO water washed.\n\n⚡ Guaranteed 90-minute express doorstep delivery inside our reusable insulated ThermalVault cold box!`,
        action: {
          type: 'ADD_TO_CART',
          productId: targetProd.id,
          productName: targetProd.name,
          quantity: qty,
          selectedWeight: weight,
          price: targetProd.price
        },
        actionCard: {
          title: `View Cart & Checkout (${targetProd.name})`,
          subtitle: `₹${targetProd.price} • Express 90-min dispatch`,
          buttonText: 'Open Cart & Proceed',
          actionType: 'OPEN_CART'
        },
        products: [targetProd],
        suggestedReplies: [
          "Apply 20% OFF Deal",
          "Add Mutton Rogan Josh",
          "How to get ₹250 box refund?",
          "Checkout Now"
        ]
      };
    }
  }

  // =========================================================================
  // 3. RECIPES & STEP-BY-STEP COOKING CONSULTATION
  // =========================================================================
  if (lower.includes('recipe') || lower.includes('cook') || lower.includes('how to make') || lower.includes('banaye') || lower.includes('kaise banaye') || lower.includes('masala') || lower.includes('marinate')) {
    
    // Surmai Tawa Fry Recipe
    if (lower.includes('surmai') || lower.includes('fish') || lower.includes('tawa fry')) {
      return {
        reply: `👨‍🍳 *Chef Master Recipe: Crispy Mangalore Surmai Tawa Fry*\n\n⏱️ *Prep Time:* 10 Mins • *Cook Time:* 8 Mins • *Serves:* 3-4\n\n📌 *Ingredients:*\n• 500g Center-cut Surmai Steaks (GoMeat 0°C Fresh)\n• 2 tbsp Kashmiri Red Chili Powder + 1/2 tsp Turmeric\n• 1 tbsp Ginger-Garlic Paste + 1 tbsp Lemon Juice\n• 1/2 cup Fine Rava (Semolina) for outer crisp crust\n• Salt to taste & Coconut oil for shallow frying\n\n🔥 *Step-by-Step Method:*\n1. *Marination:* Mix chili powder, turmeric, ginger-garlic, lemon juice & salt into a thick paste. Coat each Surmai steak generously. Rest for 15 mins.\n2. *Crust:* Dredge both sides of the marinated steak in fine rava for that iconic coastal crunch.\n3. *Sear:* Heat coconut oil in a cast iron tawa over medium-high heat. Place steaks gently.\n4. *Flip:* Fry for 3.5 to 4 minutes per side until golden crimson and crisp on edges.\n5. *Finish:* Garnish with fried curry leaves and lemon wedges!\n\n💡 *Master Butcher Tip:* Never crowd the tawa! Surmai has firm, succulent center flakes; high heat seals in the natural moisture.`,
        recipe: {
          title: 'Crispy Mangalore Surmai Tawa Fry',
          prepTime: '10 mins',
          cookTime: '8 mins',
          difficulty: 'Easy',
          servings: 'Serves 3-4'
        },
        products: [surmai],
        suggestedReplies: [
          "Add Surmai Steaks to Cart (₹799)",
          "Rechado Pomfret Recipe",
          "Butter Garlic Prawns Recipe"
        ]
      };
    }

    // Mutton Rogan Josh Recipe
    if (lower.includes('mutton') || lower.includes('rogan') || lower.includes('goat') || lower.includes('biryani')) {
      return {
        reply: `👨‍🍳 *Chef Master Recipe: Kashmiri Mutton Rogan Josh*\n\n⏱️ *Prep Time:* 15 Mins • *Cook Time:* 45 Mins • *Serves:* 4\n\n📌 *Ingredients:*\n• 500g Tender Bone-in Goat Curry Cut (GoMeat Pasture-Raised)\n• 3 tbsp Pure Mustard Oil or Ghee\n• Whole Spices: 2 Black Cardamoms, 4 Green Cardamoms, 1 Cinnamon stick, 4 Cloves\n• 2 tsp Kashmiri Red Chili Powder (for deep crimson rogan color)\n• 1 tsp Fennel Powder (Saunf) + 1 tsp Dry Ginger Powder (Sonth)\n• 1/2 cup Whisked Yogurt & a pinch of Asafoetida (Hing)\n\n🔥 *Step-by-Step Method:*\n1. *Smoke Oil:* Heat mustard oil in a heavy handi until lightly smoking, then let it cool slightly.\n2. *Sear Cuts:* Add whole spices, hing, and GoMeat mutton pieces. Sear on high heat for 6-8 mins until lightly browned.\n3. *Aromatics:* Whisk chili powder into 2 tbsp water, pour in. Add yogurt slowly while stirring continuously on low heat to prevent curdling.\n4. *Simmer:* Add fennel and ginger powders with 1.5 cups hot water. Cover and slow-simmer on dum (low heat) for 35-40 mins (or 3-4 whistles in pressure cooker).\n5. *Result:* Melt-in-mouth tender meat with a fragrant red oil layer floating on top!\n\n💡 *Master Butcher Tip:* Our bone-in cuts include marrow bone chunks. Slow cooking releases natural gelatin and bone collagen, giving you that rich, velvety restaurant-grade gravy.`,
        recipe: {
          title: 'Authentic Kashmiri Mutton Rogan Josh',
          prepTime: '15 mins',
          cookTime: '45 mins',
          difficulty: 'Medium',
          servings: 'Serves 4'
        },
        products: [mutton],
        suggestedReplies: [
          "Add Mutton Rogan Josh Cut (₹549)",
          "Nati Koli Pepper Roast Recipe",
          "Portions for 6 people?"
        ]
      };
    }

    // Butter Garlic Prawns Recipe
    if (lower.includes('prawn') || lower.includes('jheenga') || lower.includes('garlic')) {
      return {
        reply: `👨‍🍳 *Chef Master Recipe: Sizzling Butter Garlic Jumbo Prawns*\n\n⏱️ *Prep Time:* 5 Mins • *Cook Time:* 5 Mins • *Serves:* 2-3\n\n📌 *Ingredients:*\n• 500g Sea Tiger Prawns (GoMeat Deveined & Tail-On)\n• 3 tbsp Salted Butter + 1 tbsp Olive Oil (prevents butter burning)\n• 8-10 Garlic Cloves, finely minced\n• 2 Slit Green Chilies + 1/2 tsp Crushed Black Pepper\n• 1 tbsp Fresh Lemon Juice + Chopped Coriander/Parsley\n\n🔥 *Step-by-Step Method:*\n1. *Prep:* Pat prawns completely dry with paper towel. Season with salt and black pepper.\n2. *Aroma:* Melt butter and oil in a wide skillet over medium heat. Sauté minced garlic until fragrant and translucent (do not brown!).\n3. *Toss:* Crank heat to high! Add prawns in a single layer. Sear 2 minutes per side until they turn vibrant coral pink and curl into a 'C' shape.\n4. *Garnish:* Squeeze fresh lemon juice, toss green chilies and fresh herbs.\n5. *Serve:* Sizzle hot with garlic bread or steamed rice!\n\n💡 *Master Butcher Tip:* Never overcook prawns! Once they form a 'C' shape, pull them off the stove immediately. If they curl into an 'O', they become rubbery.`,
        recipe: {
          title: 'Sizzling Butter Garlic Jumbo Prawns',
          prepTime: '5 mins',
          cookTime: '5 mins',
          difficulty: 'Easy',
          servings: 'Serves 2-3'
        },
        products: [prawns],
        suggestedReplies: [
          "Add Jumbo Prawns (₹449)",
          "Surmai Tawa Fry Recipe",
          "How to get ₹250 box refund?"
        ]
      };
    }

    // Andhra Nati Koli Pepper Roast Recipe
    if (lower.includes('chicken') || lower.includes('nati koli') || lower.includes('pepper') || lower.includes('country chicken')) {
      return {
        reply: `👨‍🍳 *Chef Master Recipe: Andhra Nati Koli Pepper Roast*\n\n⏱️ *Prep Time:* 10 Mins • *Cook Time:* 30 Mins • *Serves:* 3-4\n\n📌 *Ingredients:*\n• 500g Country Chicken Nati Koli (GoMeat Bone-In Curry Cut)\n• 2 tbsp Freshly Crushed Black Peppercorns\n• 2 sprigs Fresh Curry Leaves + 4 Green Chilies\n• 1 large Onion sliced + 1 tbsp Ginger-Garlic Paste\n• 1/2 tsp Turmeric + 1 tsp Coriander Powder\n\n🔥 *Step-by-Step Method:*\n1. *Par-Boil/Cook:* Country fowl has dense, organic muscle fibers. Pressure cook the chicken with turmeric, salt, 1/2 tsp pepper, and 1/2 cup water for 3-4 whistles until tender.\n2. *Tawa Roast:* In a pan, heat 2 tbsp oil, crackle mustard seeds, curry leaves, and green chilies. Add onions and fry until golden.\n3. *Combine:* Add the cooked chicken along with its concentrated stock. Reduce on high flame until gravy thickens.\n4. *Pepper Glaze:* Sprinkle freshly ground black pepper generously. Roast on medium flame for 5 mins until dark and aromatic!\n\n💡 *Master Butcher Tip:* Desi Nati Koli has 3x more flavor than broiler chicken, but requires 3-4 whistles to reach that fall-off-the-bone tenderness!`,
        recipe: {
          title: 'Andhra Nati Koli Pepper Roast',
          prepTime: '10 mins',
          cookTime: '30 mins',
          difficulty: 'Medium',
          servings: 'Serves 3-4'
        },
        products: [natiKoli],
        suggestedReplies: [
          "Add Nati Koli Cut (₹389)",
          "Add Chicken Breast Fillets",
          "Mutton Rogan Josh Recipe"
        ]
      };
    }
  }

  // =========================================================================
  // 4. PORTION PLANNING & PARTY ESTIMATOR
  // =========================================================================
  if (lower.includes('people') || lower.includes('person') || lower.includes('guests') || lower.includes('party') || lower.includes('dinner') || lower.includes('kitna') || lower.includes('quantity') || lower.includes('how much') || lower.includes('servings')) {
    let numGuests = 4;
    const match = lower.match(/\b(\d+)\s*(people|person|guests|log|members)?\b/);
    if (match && parseInt(match[1])) {
      numGuests = parseInt(match[1]);
    }

    const boneInKg = (numGuests * 0.25).toFixed(1);
    const bonelessKg = (numGuests * 0.18).toFixed(1);
    const fishKg = (numGuests * 0.20).toFixed(1);

    return {
      reply: `⚖️ *Master Butcher Portion Calculator for ${numGuests} People:*\n\nHere is the exact culinary weight breakdown per guest so you never run short:\n\n🍗 *Bone-In Curry Cuts (Chicken/Mutton):* ~*${boneInKg} kg* (Calculated at ~250g per adult to account for bones & slow reduction).\n🥩 *Boneless Fillets / Boti / Breast:* ~*${bonelessKg} kg* (Calculated at ~180g lean meat per adult).\n🐟 *Harbor Fish Steaks (Surmai / Pomfret):* ~*${fishKg} kg* (Approx 1 to 2 center-cut steaks per person).\n🦐 *Jumbo Tiger Prawns:* ~*${Math.ceil(numGuests * 4)} - ${Math.ceil(numGuests * 6)} pieces* (~${bonelessKg} kg).\n\n💡 *My Recommendation for ${numGuests} guests:*\n• Option A: 1kg Mutton Rogan Josh Cut + 500g Surmai Tawa Steaks\n• Option B: 1kg Country Chicken + 500g Jumbo Prawns\n\nWould you like me to add a customized feast pack to your cart?`,
      actionCard: {
        title: `Weekend Coastal Feast Box (Serves ${numGuests})`,
        subtitle: 'Curated mix of Surmai Steaks, Prawns & Mutton',
        buttonText: 'Add Party Box to Cart',
        actionType: 'ADD_TO_CART',
        productId: 'prod_8',
        productName: 'Grand Coastal Feast Box',
        price: 1299
      },
      products: [mutton, surmai, prawns],
      suggestedReplies: [
        "Add 1kg Mutton Rogan Josh",
        "Add 500g Surmai Steaks",
        "Add 500g Jumbo Prawns",
        "Apply 20% OFF Deal"
      ]
    };
  }

  // =========================================================================
  // 5. COLD CHAIN SCIENCE & FOOD INTEGRITY
  // =========================================================================
  if (lower.includes('frozen') || lower.includes('fresh') || lower.includes('chilled') || lower.includes('temperature') || lower.includes('formalin') || lower.includes('ammonia') || lower.includes('antibiotic') || lower.includes('safe') || lower.includes('quality')) {
    return {
      reply: `❄️ *The GoMeat 0°C to 4°C Cold-Chain Science Guarantee:*\n\n❌ *Why We NEVER Freeze (-18°C):*\nWhen meat is frozen into a rock-hard block, water molecules expand into sharp, jagged ice crystals that rupture cellular walls. When you thaw it, moisture bleeds out (purge loss), leaving the meat dry, stringy, and flavorless.\n\n✅ *The 0°C - 4°C FreshChilled™ Standard:*\n• *Blast Chilled:* Immediate temperature drop to 0°C within 15 minutes of harvest.\n• *Cellular Retention:* Zero ice crystals. The meat fibers remain plump, succulent, and juicy.\n• *100% Odorless:* Zero foul fishy or stale smell.\n• *Zero Chemicals:* 100% guaranteed zero formalin, ammonia, chlorine, or synthetic preservatives.\n• *ThermalVault Protection:* Delivered in our EPP multi-layered cooler box with PCM ice gel packs that maintain 0°C to 4°C for up to 36 hours!\n\nAll cuts are processed in FSSC-22000 certified, RO-sanitized cold chambers.`,
      suggestedReplies: [
        "View Fresh Fish Catch",
        "View Pasture Mutton",
        "How does the ₹250 box deposit work?"
      ]
    };
  }

  // =========================================================================
  // 6. REUSABLE BOX RETURN & ₹250 UPI REFUND PROCEDURE
  // =========================================================================
  if (lower.includes('box') || lower.includes('cooler') || lower.includes('refund') || lower.includes('250') || lower.includes('return') || lower.includes('wapas') || lower.includes('deposit')) {
    return {
      reply: `📦 *ThermalVault Reusable Box & ₹250 UPI Refund Protocol:*\n\n1. *Why the ₹250 Deposit?*\n   To eliminate single-use thermocol and plastic waste, every order is delivered in a medical-grade EPP insulated cooler box. A ₹250 refundable deposit is credited right back upon box return!\n\n2. *How to Return & Get Your Money:*\n   • *Option A (Instant on Delivery):* Hand the empty box and gel packs back to the delivery partner. Once scanned, ₹250 is instantly credited to your GoMeat Vault Wallet or UPI.\n   • *Option B (Doorstep Pickup):* Go to the *Box Returns* tab on our website and click *Schedule Pickup*. Our rider arrives within your chosen slot to collect it.\n\n3. *Instant UPI Reversal:* Works seamlessly with Google Pay, PhonePe, Paytm, and Direct Bank Transfer.\n\n🌿 Over 14,000+ thermocol boxes diverted from Indian landfills!`,
      action: {
        type: 'OPEN_RETURNS'
      },
      actionCard: {
        title: 'Schedule Cold Box Pickup',
        subtitle: 'Get ₹250 instant UPI refund to your account',
        buttonText: 'Open Box Returns Portal',
        actionType: 'OPEN_RETURNS'
      },
      suggestedReplies: [
        "Check my deposit balance",
        "Schedule box pickup",
        "Order fresh cuts today"
      ]
    };
  }

  // =========================================================================
  // 7. SURMAI & SEAFOOD SPECIFIC
  // =========================================================================
  if (lower.includes('surmai') || lower.includes('seer') || lower.includes('fish') || lower.includes('pomfret') || lower.includes('prawn') || lower.includes('tikka') || lower.includes('machli')) {
    return {
      reply: `🐟 *Today's Harbor Seafood Catch (Mangalore & Malabar Coast):*\n\n1. *${surmai.name}* (₹799 / 500g)\n   • *Anatomy:* Pristine center-cut round steaks with silver skin.\n   • *Best For:* Crisp Rava Tawa Fry or Malabar Fish Curry.\n\n2. *${pomfret.name}* (₹689 / 400g)\n   • *Anatomy:* Whole cleaned silver pomfret with diamond slits on both sides.\n   • *Best For:* Stuffed Goan Rechado fry or tandoori whole roast.\n\n3. *${prawns.name}* (₹449 / 500g)\n   • *Anatomy:* Jumbo sea tiger prawns, fully cleaned, deveined with tails intact.\n   • *Best For:* Garlic Butter Chili Prawns or Coastal Prawn Curry.\n\n4. *${fishTikka.name}* (₹349 / 350g)\n   • *Anatomy:* Boneless fish cubes in carom-seed (ajwain) spiced batter.\n   • *Best For:* Air-fry or pan sear in 6 mins.\n\n⚡ All catches landed at 4:00 AM, cleaned in RO water, and delivered at 0°C!`,
      products: [surmai, pomfret, prawns, fishTikka],
      suggestedReplies: [
        "Add Surmai Tawa Steaks (₹799)",
        "Add Butter Garlic Prawns (₹449)",
        "Surmai Tawa Fry Recipe",
        "Apply 20% OFF Deal"
      ]
    };
  }

  // =========================================================================
  // 8. MUTTON SPECIFIC
  // =========================================================================
  if (lower.includes('mutton') || lower.includes('goat') || lower.includes('gosht') || lower.includes('lamb') || lower.includes('biryani')) {
    return {
      reply: `🥩 *Pasture-Grazed Tender Goat (Mutton) Cuts:*\n\n• *Product:* ${mutton.name} (₹549 / 500g)\n• *Age Assurance:* Young goat under 9 months for delicate, naturally tender meat.\n• *Cut Specification:* Precision bone-in curry and biryani cuts including shoulder chunks, succulent ribs, and marrow bones.\n• *Cleaning:* Zero bone-dust residue. Precision trimmed with RO water rinse and vacuum blast-chilled.\n• *Cooking Time:* Cooks to melt-in-mouth tenderness in 3-4 whistles in pressure cooker or 45 mins in clay handi.\n\nIdeal for slow-simmered Kashmiri Rogan Josh or rich Dum Biryani!`,
      products: [mutton],
      suggestedReplies: [
        "Add Mutton Rogan Josh (₹549)",
        "Mutton Rogan Josh Recipe",
        "Portion for 4 people?",
        "Apply 20% OFF Deal"
      ]
    };
  }

  // =========================================================================
  // 9. CHICKEN SPECIFIC
  // =========================================================================
  if (lower.includes('chicken') || lower.includes('murga') || lower.includes('nati koli') || lower.includes('breast')) {
    return {
      reply: `🍗 *Farm-Fresh Bio-Secured Chicken Cuts:*\n\n1. *${chickenBreast.name}* (₹299 / 500g)\n   • *Cut:* 100% Lean, fat-trimmed boneless breast fillets.\n   • *Nutrition:* ~31g protein per 100g. Ideal for gym diet, salads, and golden herb butter pan-searing.\n\n2. *${natiKoli.name}* (₹389 / 500g)\n   • *Cut:* Authentic free-range country chicken bone-in curry cuts.\n   • *Flavor Profile:* Firm muscle density with deep, organic rustic flavor.\n   • *Best For:* Spicy Andhra Pepper Roast or traditional village rasam curry.\n\n🌿 100% Antibiotic-free, vegetarian feed, and blast-chilled to 0°C–4°C within 90 minutes of processing!`,
      products: [chickenBreast, natiKoli],
      suggestedReplies: [
        "Add Chicken Breast (₹299)",
        "Add Country Nati Koli (₹389)",
        "Nati Koli Pepper Roast Recipe",
        "Apply 20% OFF Deal"
      ]
    };
  }

  // =========================================================================
  // 10. LIVE ORDER & TRACKING INQUIRY
  // =========================================================================
  if (lower.includes('track') || lower.includes('status') || lower.includes('where is my order') || lower.includes('delivery') || lower.includes('kaha hai')) {
    const sampleOrder = orders[0] || {
      trackingCode: 'GOMEAT-TRK-8821',
      status: 'Out for Delivery (Cold Chain Active)',
      currentTemp: 1.8,
      etaMinutes: 22,
      coolerId: 'BOX-BLR-409'
    };

    return {
      reply: `🛵 *Live GoMeat Cold-Chain Dispatch Telemetry:*\n\n• *Tracking ID:* \`${sampleOrder.trackingCode}\`\n• *Status:* ${sampleOrder.status}\n• *Real-Time Temperature:* ❄️ *${sampleOrder.currentTemp || 1.8}°C* (Safe zone: 0°C to 4°C)\n• *Estimated Arrival:* ⚡ In *${sampleOrder.etaMinutes || 20} mins*\n• *Assigned Cold Box:* \`${sampleOrder.coolerId || 'BOX-BLR-409'}\`\n• *Delivery Partner:* Raghavendra M. (EV Insulated Pod)\n\nYou can inspect the live real-time graph anytime on our tracking page!`,
      action: {
        type: 'OPEN_TRACKING'
      },
      actionCard: {
        title: 'Live 0°C Telemetry HUD',
        subtitle: `Temperature: ${sampleOrder.currentTemp || 1.8}°C • ETA: ${sampleOrder.etaMinutes || 20} mins`,
        buttonText: 'Open Live Tracking Map',
        actionType: 'OPEN_TRACKING'
      },
      suggestedReplies: [
        "How to return cold box after delivery?",
        "Check today's specials",
        "Apply 20% OFF Deal"
      ]
    };
  }

  // =========================================================================
  // 11. DEFAULT INTELLIGENT MASTER BUTCHER HELPER
  // =========================================================================
  return {
    reply: `👋 *Namaste! I am your GoMeat AI Master Butcher & Culinary Concierge.*\n\nI can do all the heavy lifting for you:\n\n1. 🛒 *Execute Orders:* Tell me what to add (e.g. *"Add 500g Surmai and 1kg Mutton"*).\n2. 👨‍🍳 *Chef Recipes:* Ask for step-by-step marinades, tawa fry methods, or Rogan Josh timings.\n3. ⚖️ *Party Estimator:* Tell me how many guests you're hosting (e.g. *"Dinner for 6 people"*).\n4. ❄️ *Cold-Chain Science:* Inquire about our 0°C blast-chilling, zero formalin guarantee, and FSSC-22000 specs.\n5. 📦 *₹250 Box Refunds:* Instant UPI deposit return protocol.\n6. 🎟️ *Deals & Coupons:* Ask for deals to unlock 20% OFF on your cart!\n\nWhat are you craving to cook today?`,
    suggestedReplies: [
      "Surmai Tawa Steaks",
      "Kashmiri Mutton Rogan Josh",
      "Butter Garlic Jumbo Prawns",
      "Dinner for 4 people?",
      "Apply 20% OFF Deal"
    ]
  };
}
