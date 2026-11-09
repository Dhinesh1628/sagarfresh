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

  await page.goto('http://localhost:5173', { waitUntil: 'networkidle2' });

  // Sign in by typing into the actual login modal or via API
  console.log('Testing api.getCurrentUser with token...');
  const res = await page.evaluate(async () => {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'ops@gomeat.in', password: 'admin123' })
    });
    const data = await loginRes.json();
    localStorage.setItem('frost_token', data.token);

    // Now test getCurrentUser
    const meRes = await fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${data.token}` }
    });
    const meData = await meRes.json();
    return { loginToken: data.token, meData };
  });
  console.log('Auth check result:', res);

  // Reload page
  await page.goto('http://localhost:5173/#admin', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const stateInfo = await page.evaluate(() => {
    return {
      bodyText: document.body.innerText.slice(0, 300),
      buttons: Array.from(document.querySelectorAll('button')).map(b => b.innerText.trim()).filter(Boolean),
      hash: window.location.hash
    };
  });
  console.log('State Info:', JSON.stringify(stateInfo, null, 2));

  await browser.close();
})();
