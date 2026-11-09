import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

async function generatePdf() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const executablePath = fs.existsSync(edgePath) ? edgePath : chromePath;

  console.log('[PDF] Using browser at:', executablePath);

  const browser = await puppeteer.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });

  const htmlPath = path.resolve('presentation.html');
  console.log('[PDF] Loading HTML:', htmlPath);
  await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

  const outputPath = path.resolve('GoMeat_Full_Production_Presentation.pdf');
  console.log('[PDF] Printing to PDF:', outputPath);

  await page.pdf({
    path: outputPath,
    width: '1920px',
    height: '1080px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  // Also copy to client/public so it's accessible via web
  const publicPdf = path.resolve('client/public/GoMeat_Full_Production_Presentation.pdf');
  fs.copyFileSync(outputPath, publicPdf);

  await browser.close();
  console.log('[SUCCESS] Generated PDF presentation:', outputPath);
}

generatePdf().catch(err => {
  console.error('[ERROR] Failed generating PDF:', err);
  process.exit(1);
});
