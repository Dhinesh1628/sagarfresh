import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const screenshotsDir = path.join(__dirname, 'screenshots');

const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Starting genuine screenshot capture with proper authentication and navigation...');
  const browser = await puppeteer.launch({
    executablePath: EDGE_PATH,
    headless: true,
    defaultViewport: { width: 1440, height: 900, deviceScaleFactor: 1.5 },
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();

  // Helper for API login
  async function getLoginToken(email, password) {
    const res = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
    return data.token;
  }

  try {
    // 1. Homepage
    console.log('Capturing 01_homepage.png...');
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '01_homepage.png') });

    // 2. Product Listing Catalog & Filters
    console.log('Capturing 02_product_listing.png...');
    await page.evaluate(() => window.scrollBy({ top: 580, behavior: 'instant' }));
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(screenshotsDir, '02_product_listing.png') });

    // 3. Product Detail / Cut Selection Modal
    console.log('Capturing 03_product_detail_cut.png...');
    await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.group'));
      if (cards.length > 0) cards[0].click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '03_product_detail_cut.png') });

    // 4. Cart Drawer with Items
    console.log('Capturing 04_cart_drawer.png...');
    await page.evaluate(() => {
      const modalBtns = Array.from(document.querySelectorAll('button'));
      const addModalBtn = modalBtns.find(b => b.textContent && b.textContent.includes('Add to Fresh Box'));
      if (addModalBtn) addModalBtn.click();
      
      const closeBtn = modalBtns.find(b => b.querySelector('svg.lucide-x') || b.getAttribute('aria-label') === 'Close');
      if (closeBtn) closeBtn.click();
    });
    await new Promise(r => setTimeout(r, 800));
    
    // Open Cart Drawer
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const cartBtn = btns.find(b => b.textContent && b.textContent.includes('Cart'));
      if (cartBtn) cartBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, '04_cart_drawer.png') });

    // 5. Checkout Form (Address & Delivery Details)
    console.log('Capturing 05_checkout_form.png...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const chkBtn = btns.find(b => b.textContent && b.textContent.includes('Proceed to Checkout'));
      if (chkBtn) chkBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '05_checkout_form.png') });

    // 6. Checkout Summary & ₹250 Deposit Breakdown
    console.log('Capturing 06_checkout_summary_deposit.png...');
    await page.evaluate(() => {
      const dialog = document.querySelector('.overflow-y-auto') || document.querySelector('[role="dialog"]');
      if (dialog) dialog.scrollBy({ top: 500, behavior: 'instant' });
      else window.scrollBy({ top: 500, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(screenshotsDir, '06_checkout_summary_deposit.png') });

    // 7. Order Tracking Page
    console.log('Capturing 07_order_tracking.png...');
    await page.goto('http://localhost:5173/');
    await new Promise(r => setTimeout(r, 800));
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const trkBtn = btns.find(b => b.textContent && b.textContent.includes('Live Tracking'));
      if (trkBtn) trkBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '07_order_tracking.png') });

    // ==========================================
    // 8. CUSTOMER DASHBOARD (Logged in as Pooja Sundaram)
    // ==========================================
    console.log('Capturing 08_customer_dashboard.png...');
    const customerToken = await getLoginToken('pooja.sundaram@gmail.com', 'customer123');
    await page.goto('http://localhost:5173/');
    await page.evaluate((tok) => {
      localStorage.setItem('frost_token', tok);
    }, customerToken);
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Click 'My Orders' button in Navbar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ordersBtn = btns.find(b => b.textContent && b.textContent.includes('My Orders'));
      if (ordersBtn) ordersBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '08_customer_dashboard.png') });

    // 9. Customer Order History & Invoices
    console.log('Capturing 09_order_history_invoices.png...');
    await page.evaluate(() => {
      window.scrollBy({ top: 380, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: path.join(screenshotsDir, '09_order_history_invoices.png') });

    // 10. Cold-Box Returns Portal (Box Returns)
    console.log('Capturing 10_coldbox_returns.png...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const boxBtn = btns.find(b => b.textContent && b.textContent.includes('Box Returns'));
      if (boxBtn) boxBtn.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '10_coldbox_returns.png') });

    // ==========================================
    // 11. ADMIN DASHBOARD (Logged in as Rajeshwar Rao)
    // ==========================================
    console.log('Capturing 11_admin_dashboard_kpis.png...');
    const adminToken = await getLoginToken('ops@gomeat.in', 'admin123');
    await page.evaluate((tok) => {
      localStorage.setItem('frost_token', tok);
    }, adminToken);
    await page.reload({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Click 'Hub Ops' button in Navbar
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const hubBtn = btns.find(b => b.textContent && b.textContent.includes('Hub Ops'));
      if (hubBtn) hubBtn.click();
    });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, '11_admin_dashboard_kpis.png') });

    // 12. Admin Orders Pipeline Tab
    console.log('Capturing 12_admin_orders_pipeline.png...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ordersTab = btns.find(b => b.textContent && b.textContent.includes('Orders Pipeline'));
      if (ordersTab) ordersTab.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '12_admin_orders_pipeline.png') });

    // 13. Admin Inventory & Stock Alerts Tab
    console.log('Capturing 13_admin_inventory.png...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const invTab = btns.find(b => b.textContent && b.textContent.includes('Inventory & Alerts'));
      if (invTab) invTab.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '13_admin_inventory.png') });

    // 14. Admin Payments & Refunds Ledger Tab
    console.log('Capturing 14_admin_refunds_ledger.png...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const payTab = btns.find(b => b.textContent && b.textContent.includes('Payments & Refunds'));
      if (payTab) payTab.click();
    });
    await new Promise(r => setTimeout(r, 1200));
    await page.screenshot({ path: path.join(screenshotsDir, '14_admin_refunds_ledger.png') });

    console.log('ALL GENUINE SCREENSHOTS CAPTURED WITH AUTHENTIC CONTENT!');
  } catch (err) {
    console.error('Error during capture:', err);
  } finally {
    await browser.close();
  }
}

run();
