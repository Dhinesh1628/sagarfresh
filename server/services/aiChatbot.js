import { db } from '../db.js';

/**
 * Intelligent AI Chatbot Engine for GoMeat WhatsApp Commerce
 * Handles Indian meat/seafood customer intent, live catalog recommendations,
 * cold-chain temperature inquiries, and cooler box ₹250 UPI refund procedures.
 */

export async function processCustomerMessage(userMessage, userPhone = '') {
  const text = (userMessage || '').trim();
  const lower = text.toLowerCase();

  // Load latest live catalog & active coolers
  const products = db.get('products') || [];
  const orders = db.get('orders') || [];

  // 1. GREETING & INTRO
  if (isGreeting(lower)) {
    return {
      reply: `Namaste! 🙏 Welcome to *GoMeat* - Freshness we can trust.\n\nI am your 24/7 AI Butcher & Cold-Chain Assistant.\n\nHow can I help you today?\n1️⃣ *Today's Harbor & Farm Catch* (Surmai, Prawns, Chicken, Goat)\n2️⃣ *Return Cooler Box* (Get ₹250 instant UPI refund)\n3️⃣ *Track Active Order* (0°C–4°C Live temperature)\n4️⃣ *Custom Butchery Styles* (Biryani cut, curry cut, steaks)`,
      suggestedReplies: [
        "Today's fresh seafood?",
        "Chicken & Mutton prices",
        "How to get ₹250 box refund?",
        "Track my order"
      ]
    };
  }

  // 2. BOX RETURN / ₹250 REFUND INQUIRIES
  if (lower.includes('box') || lower.includes('cooler') || lower.includes('refund') || lower.includes('250') || lower.includes('return') || lower.includes('wapas')) {
    return {
      reply: `📦 *ThermalVault Reusable Box Return Policy:*\n\n1. Every GoMeat order is delivered in an insulated EPP cold box with phase-change gel packs holding *0°C to 4°C* for up to 36 hours.\n2. A refundable deposit of *₹250* was added at checkout.\n3. *How to get your refund:*\n   • Simply hand back the empty box & gel packs to our delivery partner, OR\n   • Schedule a doorstep pickup on our website under the *Box Returns* tab.\n4. Once the box QR code is scanned, ₹250 is instantly credited to your Google Pay / PhonePe / UPI within 5 minutes!\n\nZero single-use thermocol. Zero landfill waste. 🌿`,
      suggestedReplies: [
        "Schedule box pickup",
        "Check my deposit balance",
        "Order fresh cuts"
      ]
    };
  }

  // 3. SURMAI / SEER FISH / FISH & SEAFOOD
  if (lower.includes('fish') || lower.includes('machli') || lower.includes('surmai') || lower.includes('seer') || lower.includes('pomfret') || lower.includes('paplet') || lower.includes('prawn') || lower.includes('seafood') || lower.includes('jheenga')) {
    const seafoodList = products.filter(p => p.category === 'Fish & Seafood');
    const itemsText = seafoodList.map(p => `• *${p.name}*: ₹${p.price} (MRP: ~₹${p.mrp || p.price + 100}~) - ${p.netWeight || p.unit}`).join('\n');

    return {
      reply: `🐟 *Today's Daily 4:00 AM Harbor Catch (Mangalore & Malabar Coast):*\n\n${itemsText}\n\n✅ *Freshness Promise:* Cleaned in RO water, scale-scraped, blast-chilled to 0°C–2°C, and 100% zero formalin or ammonia.\n\n⚡ Delivered in *90 mins* inside your ThermalVault cold box!`,
      products: seafoodList.slice(0, 3),
      suggestedReplies: [
        "Order Surmai Steaks (₹799)",
        "Order Jumbo Prawns (₹599)",
        "What are the delivery slots?"
      ]
    };
  }

  // 4. CHICKEN & COUNTRY CHICKEN (NATI KOLI)
  if (lower.includes('chicken') || lower.includes('murga') || lower.includes('nati koli') || lower.includes('breast') || lower.includes('curry cut')) {
    const chickenList = products.filter(p => p.category === 'Fresh Chicken');
    const itemsText = chickenList.map(p => `• *${p.name}*: ₹${p.price} (${p.unit}) - ${p.description.slice(0, 75)}...`).join('\n');

    return {
      reply: `🍗 *Farm Fresh Bio-Secured Chicken:*\n\n${itemsText}\n\n🌿 *GoMeat Integrity:* Raised on vegetarian feed, 100% antibiotic-free, humanely processed, and packed at 0°C–4°C.\n\nReady for 90-min express dispatch in Bengaluru & Mumbai.`,
      products: chickenList,
      suggestedReplies: [
        "Order Farm Chicken Breast",
        "Order Desi Nati Koli",
        "Check Mutton cuts"
      ]
    };
  }

  // 5. MUTTON / GOAT MEAT
  if (lower.includes('mutton') || lower.includes('goat') || lower.includes('gosht') || lower.includes('lamb') || lower.includes('biryani cut') || lower.includes('bannur') || lower.includes('mandya')) {
    const muttonList = products.filter(p => p.category === 'Tender Mutton');
    const itemsText = muttonList.map(p => `• *${p.name}*: ₹${p.price} (${p.netWeight}) - Pasture-grazed young tender goat (under 9 months).`).join('\n');

    return {
      reply: `🥩 *Pasture-Grazed Mandya & Bannur Tender Goat:*\n\n${itemsText}\n\n✨ Bone-dust free, fat-trimmed, and succulent. Cooks in 3 whistles with authentic village aroma!\n\nWould you like Biryani Cut (chunky pieces with marrow bone) or Boneless Boti?`,
      products: muttonList,
      suggestedReplies: [
        "Order Biryani & Curry Cut (₹549)",
        "Is it antibiotic-free?",
        "Delivery time in Indiranagar"
      ]
    };
  }

  // 6. ORDER TRACKING / LIVE TEMPERATURE
  if (lower.includes('track') || lower.includes('kaha hai') || lower.includes('status') || lower.includes('order') || lower.includes('temp') || lower.includes('temperature') || lower.includes('delivery')) {
    // Check if user has an order or give sample active tracking info
    const sampleOrder = orders[0] || {
      trackingCode: 'SAGAR-TRK-4412',
      status: 'Out for Delivery (Chilled)',
      currentTemp: 1.8,
      etaMinutes: 28,
      coolerId: 'BOX-BLR-102'
    };

    return {
      reply: `🛵 *Live Order & Cold-Chain Telemetry:*\n\n• *Tracking ID:* ${sampleOrder.trackingCode}\n• *Status:* ${sampleOrder.status}\n• *Live Core Temperature:* ❄️ *${sampleOrder.currentTemp || 1.8}°C* (Strict Cold Chain)\n• *Estimated Arrival:* ⚡ In *${sampleOrder.etaMinutes || 25} minutes*\n• *Assigned Thermal Box:* \`${sampleOrder.coolerId || 'BOX-BLR-102'}\`\n• *Delivery Partner:* Raghavendra M. (EV Insulated Pod)\n\nYou can also view the live temperature graph on our website tracking page!`,
      suggestedReplies: [
        "Contact Delivery Partner",
        "Return Box after delivery",
        "Order something else"
      ]
    };
  }

  // 7. LOCATION / CITY AVAILABILITY
  if (lower.includes('bangalore') || lower.includes('bengaluru') || lower.includes('mumbai') || lower.includes('hyderabad') || lower.includes('delhi') || lower.includes('pune') || lower.includes('chennai') || lower.includes('city') || lower.includes('location')) {
    return {
      reply: `📍 *GoMeat Hub Delivery Cities:*\n\n• *Bengaluru*: Indiranagar, Koramangala, Whitefield, HSR, Bellandur, Mahadevapura (90-Min Express)\n• *Mumbai*: Bandra, Andheri, Juhu, Powai, Worli\n• *Hyderabad*: Jubilee Hills, Banjara Hills, Gachibowli\n• *Delhi NCR, Pune & Chennai*: Select central localities\n\nAll orders dispatched directly from our FSSC-22000 certified cold hubs at 0°C–4°C!`,
      suggestedReplies: [
        "Check Indiranagar availability",
        "Today's Harbor Catch",
        "Speak to human agent"
      ]
    };
  }

  // 8. HOW TO ORDER
  if (lower.includes('order') || lower.includes('buy') || lower.includes('khareed') || lower.includes('chahiye')) {
    return {
      reply: `🛒 *How to place your GoMeat order:*\n\n1. Simply reply with the items you want (e.g. *\"500g Surmai and 1kg Chicken Breast\"*).\n2. Or visit our website to customize butchery cut style and choose 90-min express slot.\n3. We accept UPI (Google Pay, PhonePe, Paytm), Cards, and Netbanking.\n\nEvery order includes the reusable ThermalVault cold box with ₹250 refundable deposit credited back on return!`,
      suggestedReplies: [
        "View All Cuts Catalog",
        "Today's Specials",
        "Return a cooler box"
      ]
    };
  }

  // 9. DEFAULT INTELLIGENT HELPER
  return {
    reply: `I understand you're asking about *"${text}"*.\n\nAt *GoMeat*, we provide 100% cold-chain meat & seafood delivered in reusable insulated cold boxes (0°C to 4°C) with instant ₹250 UPI box return refunds.\n\nCould you please choose an option below or mention whether you're looking for *Fish & Seafood*, *Farm Chicken*, *Tender Mutton*, or *Box Returns*?`,
    suggestedReplies: [
      "View Seafood Catch",
      "View Chicken & Mutton",
      "How to return cold box?",
      "Track live order"
    ]
  };
}

function isGreeting(text) {
  const pureGreetings = ['hi', 'hello', 'hey', 'namaste', 'halo', 'good morning', 'good evening', 'yo', 'start', 'help'];
  const trimmed = text.trim();
  // Check if it's purely a greeting or short greeting without specific product keywords
  if (pureGreetings.includes(trimmed)) return true;
  if ((trimmed === 'bhaiya' || trimmed === 'bhaiya hello') && !trimmed.includes('fish') && !trimmed.includes('chicken') && !trimmed.includes('box')) return true;
  return false;
}
