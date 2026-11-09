import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES = {
  prod_1: "https://images.unsplash.com/photo-1763062550082-2c9f94096abb?auto=format&fit=crop&w=800&q=80",
  prod_2: "https://images.unsplash.com/photo-1757904257581-7d07669faddb?auto=format&fit=crop&w=800&q=80",
  prod_3: "https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80",
  prod_4: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80",
  prod_5: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
  prod_6: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
  prod_7: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&w=800&q=80",
  prod_8: "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=800&q=80"
};

const targetDir = path.join(__dirname, 'client', 'public', 'images', 'products');

async function downloadAll() {
  for (const [id, url] of Object.entries(IMAGES)) {
    console.log(`Downloading ${id}...`);
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buffer = await res.arrayBuffer();
      const dest = path.join(targetDir, `${id}.jpg`);
      fs.writeFileSync(dest, Buffer.from(buffer));
      console.log(`✓ Saved ${dest} (${(buffer.byteLength / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.error(`Failed ${id}:`, e.message);
    }
  }
}

downloadAll();
