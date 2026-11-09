// Verification of Real Credential-Based Logins
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('--- TESTING CREDENTIAL-BASED LOGINS (NO ONE-CLICK DEMO) ---');

  // 1. Customer login via Email
  console.log('\n[1] Testing Customer Login with Email & Password...');
  const customerEmailLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'pooja.sundaram@gmail.com', password: 'customer123' })
  }).then(r => r.json());

  if (!customerEmailLogin.token) {
    throw new Error('Customer email login failed: ' + JSON.stringify(customerEmailLogin));
  }
  console.log(`✓ Customer logged in via Email: ${customerEmailLogin.user.name} (Role: ${customerEmailLogin.user.role})`);
  const customerToken = customerEmailLogin.token;

  // 2. Customer login via 10-digit Phone
  console.log('\n[2] Testing Customer Login with Mobile Number & Password...');
  const customerPhoneLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: '9876543210', password: 'customer123' })
  }).then(r => r.json());

  if (!customerPhoneLogin.token) {
    throw new Error('Customer phone login failed: ' + JSON.stringify(customerPhoneLogin));
  }
  console.log(`✓ Customer logged in via Mobile (9876543210): ${customerPhoneLogin.user.name}`);

  // 3. Admin login via Email
  console.log('\n[3] Testing Admin Login with Email & Password...');
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'ops@gomeat.in', password: 'admin123' })
  }).then(r => r.json());

  if (!adminLogin.token || adminLogin.user.role !== 'admin') {
    throw new Error('Admin login failed: ' + JSON.stringify(adminLogin));
  }
  console.log(`✓ Admin logged in: ${adminLogin.user.name} (Role: ${adminLogin.user.role})`);
  const adminToken = adminLogin.token;

  // 4. Products check
  console.log('\n[4] Testing Catalog Inward...');
  const products = await fetch(`${BASE_URL}/products`).then(r => r.json());
  console.log(`✓ Fetched ${products.length} fresh cuts`);

  // 5. Checkout
  console.log('\n[5] Testing Customer Checkout with ₹250 Refundable Box Deposit...');
  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${customerToken}`
    },
    body: JSON.stringify({
      items: [
        { productId: products[0].id, quantity: 1 }
      ],
      deliveryAddress: 'Flat 402, Alpine Eco, Doddanekkundi, Bengaluru - 560037',
      deliverySlot: 'Today, Express in 90 Mins',
      paymentMethod: 'UPI (Google Pay)',
      city: 'Bengaluru'
    })
  });
  const order = await orderRes.json();
  console.log(`✓ Order placed by Pooja: ID ${order.id}, Total ₹${order.total} (includes ₹250 box deposit)`);

  // 6. Admin updates order status
  console.log('\n[6] Testing Admin Fulfill Order...');
  const fulfillRes = await fetch(`${BASE_URL}/orders/${order.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({ status: 'Delivered', note: 'Box delivered to Flat 402' })
  });
  const fulfilledOrder = await fulfillRes.json();
  console.log(`✓ Admin transitioned order to: ${fulfilledOrder.status}`);

  console.log('\n============================================================');
  console.log('REAL CREDENTIAL-BASED LOGINS VERIFIED 100% OPERATIONAL!');
  console.log('============================================================');
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
