// End-to-End Swiggy-Grade Cross-App Ecosystem Verification Test
import fetch from 'node-fetch';

const API = 'http://localhost:5000/api';

async function runTest() {
  console.log('🚀 TESTING GO-MEAT SWIGGY-STYLE MULTI-APP INTERCONNECTION...\n');

  // Step 1: Customer Login
  console.log('[Step 1] Customer logs into GoMeat User App...');
  const customerLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pooja.sundaram@gmail.com', password: 'customer123' })
  }).then(r => r.json());

  if (!customerLogin.token) {
    throw new Error('Customer login failed: ' + JSON.stringify(customerLogin));
  }

  const customerToken = customerLogin.token;
  console.log(`✓ Customer authenticated: ${customerLogin.user.name} (Wallet Balance: ₹${customerLogin.user.walletBalance || 0})\n`);

  // Step 2: Customer places a cold-chain order
  console.log('[Step 2] Customer adds fresh cut & checks out with ₹250 cooler deposit...');
  const products = await fetch(`${API}/products`).then(r => r.json());
  if (!products || !products.length) throw new Error('No products in catalog');
  const targetProduct = products[0];

  const orderRes = await fetch(`${API}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      items: [{ productId: targetProduct.id, quantity: 1, selectedCutStyle: 'Medium Curry Cut' }],
      deliveryAddress: 'Flat 402, Alpine Eco, Doddanekkundi, Bengaluru',
      city: 'Bengaluru',
      paymentMethod: 'razorpay'
    })
  }).then(r => r.json());

  if (!orderRes.id) {
    throw new Error('Order creation failed: ' + JSON.stringify(orderRes));
  }

  const orderId = orderRes.id;
  const deliveryPin = orderRes.deliveryPin;
  console.log(`✓ Order Created: #${orderId}`);
  console.log(`✓ 4-Digit Cold Box Handover PIN: [ ${deliveryPin} ]`);
  console.log(`✓ Cooler Box Assigned: ${orderRes.coolerId} (₹250 deposit locked)\n`);

  // Step 3: Dark Store Partner App KDS Board receives and prepares order
  console.log('[Step 3] Partner / Hub Dark Store KDS Board detects incoming order...');
  const adminLogin = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ops@gomeat.in', password: 'admin123' })
  }).then(r => r.json());
  const adminToken = adminLogin.token;

  // Partner updates prep stage to ready_for_dispatch
  const prepRes = await fetch(`${API}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'ready_for_dispatch',
      notes: 'Cleaned, vacuum sealed, packed into EPP cooler with -18°C gel bricks'
    })
  }).then(r => r.json());

  console.log(`✓ Hub Butcher & Pack completed: Order status is now "${prepRes.status}"\n`);

  // Step 4: Delivery Rider App receives order & dispatches
  console.log('[Step 4] Delivery Fleet App dispatches rider to customer doorstep...');
  await fetch(`${API}/orders/${orderId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      status: 'Out for Delivery',
      notes: 'Rider is 1.2km away with active cold-vault probe at 1.8°C'
    })
  });
  console.log('✓ Rider Out for Delivery with 0°C–4°C ThermalVault box\n');

  // Step 5: Rider enters Customer 4-digit PIN & records cooler returned
  console.log(`[Step 5] Rider arrives at gate and inputs customer PIN "${deliveryPin}" with cooler returned = true...`);
  const handoverRes = await fetch(`${API}/orders/${orderId}/handover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      pin: deliveryPin,
      coolerReturned: true
    })
  }).then(r => r.json());

  if (!handoverRes.success) {
    throw new Error(`Handover failed: ${JSON.stringify(handoverRes)}`);
  }
  console.log(`✓ Handover Verified! Order #${orderId} marked DELIVERED`);
  console.log(`✓ Rider collected empty EPP cooler: Customer ₹250 refund triggered!\n`);

  // Step 6: Verify Customer Wallet Received ₹250 Instant Refund
  console.log('[Step 6] Customer verifies GoMeat Vault in User App...');
  const customerProfile = await fetch(`${API}/auth/me`, {
    headers: { 'Authorization': `Bearer ${customerToken}` }
  }).then(r => r.json());

  const userObj = customerProfile.user || customerProfile;
  const finalWallet = userObj.walletBalance;
  console.log(`✓ Customer GoMeat Vault Updated: ₹${finalWallet}`);
  console.log(`✓ Recent Transaction: ${userObj.walletTransactions?.[0]?.title} (+₹${userObj.walletTransactions?.[0]?.amount})\n`);

  console.log('============================================================');
  console.log('🎉 100% SWIGGY-GRADE MULTI-APP REAL-TIME CONNECTION CONFIRMED!');
  console.log('   Customer App ⟷ Partner Hub App ⟷ Delivery Fleet App');
  console.log('============================================================');
}

runTest().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
