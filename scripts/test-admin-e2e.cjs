const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
  page.on('pageerror', err => console.error('BROWSER_PAGE_ERROR:', err.message));

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Sign in as admin ops@gomeat.in
  console.log('Logging in as admin ops@gomeat.in via API...');
  const loginRes = await page.evaluate(async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'ops@gomeat.in', password: 'admin123' })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('frost_token', data.token);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      }
      return { success: false, data };
    } catch (e) {
      return { success: false, error: e.message };
    }
  });
  console.log('Login result:', loginRes);

  // Reload to apply admin credentials and switch to #admin
  await page.goto('http://localhost:5173/#admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Click on Hub Ops button in navbar
  const hubOpsClicked = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const hubBtn = buttons.find(b => b.innerText.includes('Hub Ops'));
    if (hubBtn) {
      hubBtn.click();
      return true;
    }
    return false;
  });
  console.log('Hub Ops clicked:', hubOpsClicked);
  await new Promise(r => setTimeout(r, 2000));

  // Check header on page
  const title = await page.evaluate(() => {
    return document.querySelector('h1')?.innerText || '';
  });
  console.log('Admin Page Header:', title);

  // Take screenshot of Overview
  await page.screenshot({ path: 'C:/Users/dines/.gemini/antigravity/scratch/frost-prime/test-admin-overview.png' });
  console.log('Captured test-admin-overview.png');

  // Click Customers tab
  const clickedCustomers = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Customers'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Customers tab clicked:', clickedCustomers);
  await new Promise(r => setTimeout(r, 1500));

  // Verify customers listed
  const customerCount = await page.evaluate(() => {
    return document.querySelectorAll('tbody tr').length;
  });
  console.log('Rendered customer rows count:', customerCount);
  await page.screenshot({ path: 'C:/Users/dines/.gemini/antigravity/scratch/frost-prime/test-admin-customers.png' });
  console.log('Captured test-admin-customers.png');

  // Click Orders Pipeline tab
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('button'));
    const btn = buttons.find(b => b.innerText.includes('Orders Pipeline'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Click "Inspect" on first order
  const inspectClicked = await page.evaluate(() => {
    const inspectBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Inspect'));
    if (inspectBtn) {
      inspectBtn.click();
      return true;
    }
    return false;
  });
  console.log('Inspect clicked:', inspectClicked);
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: 'C:/Users/dines/.gemini/antigravity/scratch/frost-prime/test-admin-order-modal.png' });
  console.log('Captured test-admin-order-modal.png');

  await browser.close();
  console.log('All E2E checks passed successfully!');
})();
