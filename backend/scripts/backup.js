/**
 * GoMeat Database Snapshot Backup Utility
 * Exports JSON snapshots of all collections: users, products, orders, coolers, coolerReturns, and contacts
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.resolve(__dirname, '../data.json');
const BACKUPS_DIR = path.resolve(__dirname, '../backups');

export function createBackup() {
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    if (!fs.existsSync(DATA_FILE)) {
      console.error(`[Backup Error] Source data file not found: ${DATA_FILE}`);
      return null;
    }

    const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(rawData);

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFileName = `gomeat_backup_${timestamp}.json`;
    const targetPath = path.join(BACKUPS_DIR, backupFileName);

    const payload = {
      meta: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        platform: 'GoMeat Technologies',
        counts: {
          users: parsed.users?.length || 0,
          products: parsed.products?.length || 0,
          orders: parsed.orders?.length || 0,
          coolers: parsed.coolers?.length || 0,
          coolerReturns: parsed.coolerReturns?.length || 0,
          contacts: parsed.contacts?.length || 0
        }
      },
      data: parsed
    };

    fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[Backup Success] Created snapshot: ${backupFileName} (${(fs.statSync(targetPath).size / 1024).toFixed(2)} KB)`);
    return {
      fileName: backupFileName,
      path: targetPath,
      meta: payload.meta
    };
  } catch (err) {
    console.error('[Backup Error] Failed to generate backup snapshot:', err);
    throw err;
  }
}

// Direct execution from CLI
if (process.argv[1] && process.argv[1].endsWith('backup.js')) {
  createBackup();
}
