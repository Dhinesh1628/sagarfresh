import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const htmlPath = path.join(__dirname, 'brand_guidelines.html');
  const pdfPath = path.join(__dirname, 'SAGAR_FRESH_BRAND_GUIDELINES.pdf');
  const artifactPdfPath = 'C:\\Users\\dines\\.gemini\\antigravity\\brain\\099d1afc-5924-49f5-bd3a-3ed010f92bb9\\SAGAR_FRESH_BRAND_GUIDELINES.pdf';

  console.log('Launching browser to generate Brand Guidelines PDF...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600 });
  await page.goto(`file://${htmlPath.replace(/\\/g, '/')}`, { waitUntil: 'networkidle0' });

  console.log('Generating A4 Portrait PDF...');
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    landscape: false,
    printBackground: true,
    preferCSSPageSize: true,
    margin: {
      top: '12mm',
      bottom: '12mm',
      left: '14mm',
      right: '14mm'
    }
  });

  await browser.close();

  // Copy to artifact directory
  fs.copyFileSync(pdfPath, artifactPdfPath);

  const stats = fs.statSync(pdfPath);
  console.log(`✓ Brand Guidelines PDF successfully generated!`);
  console.log(`Path: ${pdfPath}`);
  console.log(`Size: ${(stats.size / 1024).toFixed(1)} KB`);
}

main().catch(err => {
  console.error('Error generating Brand Guidelines PDF:', err);
  process.exit(1);
});
