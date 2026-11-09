const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const pngPath = path.join(__dirname, '../frontend/public/images/logo.png');
const outPath = path.join(__dirname, '../frontend/public/images/logo-dark.png');

const buf = fs.readFileSync(pngPath);

// PNG signature: 89 50 4E 47 0D 0A 1A 0A
if (buf.readUInt32BE(0) !== 0x89504E47) {
  console.error('Not a PNG');
  process.exit(1);
}

let pos = 8;
let width = 0, height = 0, bitDepth = 0, colorType = 0;
const idatChunks = [];

while (pos < buf.length) {
  const len = buf.readUInt32BE(pos);
  const type = buf.toString('ascii', pos + 4, pos + 8);
  const data = buf.subarray(pos + 8, pos + 8 + len);
  if (type === 'IHDR') {
    width = data.readUInt32BE(0);
    height = data.readUInt32BE(4);
    bitDepth = data.readUInt8(8);
    colorType = data.readUInt8(9);
    console.log(`PNG IHDR: ${width}x${height}, depth=${bitDepth}, colorType=${colorType}`);
  } else if (type === 'IDAT') {
    idatChunks.push(data);
  }
  pos += 8 + len + 4; // length + type + data + crc
}

console.log('IDAT chunks count:', idatChunks.length);
const compressed = Buffer.concat(idatChunks);
const decompressed = zlib.inflateSync(compressed);

const bytesPerPixel = colorType === 6 ? 4 : (colorType === 2 ? 3 : 0);
console.log('bytesPerPixel:', bytesPerPixel, 'decompressed len:', decompressed.length);

if (bytesPerPixel === 4 && bitDepth === 8) {
  const stride = width * 4 + 1;
  const newRaw = Buffer.from(decompressed);

  // Unfilter and process
  // In PNG: each scanline starts with filter type byte (0: None, 1: Sub, 2: Up, 3: Average, 4: Paeth)
  // To avoid unfiltering complexity if we only want to invert black/dark gray text to crisp white:
  // Let's rebuild scanlines by unfiltering to raw RGBA buffer
  const rawRgba = Buffer.alloc(width * height * 4);

  function paeth(a, b, c) {
    const p = a + b - c;
    const pa = Math.abs(p - a);
    const pb = Math.abs(p - b);
    const pc = Math.abs(p - c);
    if (pa <= pb && pa <= pc) return a;
    if (pb <= pc) return b;
    return c;
  }

  for (let y = 0; y < height; y++) {
    const filterType = decompressed[y * stride];
    const lineStart = y * stride + 1;
    for (let x = 0; x < width * 4; x++) {
      const cur = decompressed[lineStart + x];
      const left = x >= 4 ? rawRgba[(y * width * 4) + x - 4] : 0;
      const up = y > 0 ? rawRgba[((y - 1) * width * 4) + x] : 0;
      const upLeft = (y > 0 && x >= 4) ? rawRgba[((y - 1) * width * 4) + x - 4] : 0;

      let val = cur;
      if (filterType === 1) val = (cur + left) & 0xff;
      else if (filterType === 2) val = (cur + up) & 0xff;
      else if (filterType === 3) val = (cur + Math.floor((left + up) / 2)) & 0xff;
      else if (filterType === 4) val = (cur + paeth(left, up, upLeft)) & 0xff;

      rawRgba[(y * width * 4) + x] = val;
    }
  }

  // Now in rawRgba, inspect pixels:
  // If r, g, b are dark (black "Go" text and dark gray "Freshness we can trust.")
  // and alpha is non-zero, change (r, g, b) to (255, 255, 255)!
  // But preserve the RED cleaver and red "Meat" (where r > 120 and r > g * 1.5 && r > b * 1.5)!
  let transformed = 0;
  for (let i = 0; i < rawRgba.length; i += 4) {
    const r = rawRgba[i];
    const g = rawRgba[i + 1];
    const b = rawRgba[i + 2];
    const a = rawRgba[i + 3];

    if (a > 20) {
      const isRed = (r > 120 && r > g * 1.4 && r > b * 1.4);
      if (!isRed) {
        // This is the black "Go" text or gray "Freshness we can trust."!
        // Make it bright crisp white!
        rawRgba[i] = 255;
        rawRgba[i + 1] = 255;
        rawRgba[i + 2] = 255;
        transformed++;
      }
    }
  }
  console.log(`Transformed ${transformed} black/gray text pixels to crisp white!`);

  // Now re-encode with filter type 0 (None)
  const newDecompressed = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    newDecompressed[y * stride] = 0; // Filter 0
    rawRgba.copy(newDecompressed, y * stride + 1, y * width * 4, (y + 1) * width * 4);
  }

  const newIdatData = zlib.deflateSync(newDecompressed);

  // Write new PNG
  const parts = [];
  parts.push(buf.subarray(0, 8)); // PNG signature

  function writeChunk(type, data) {
    const chunk = Buffer.alloc(8 + data.length + 4);
    chunk.writeUInt32BE(data.length, 0);
    chunk.write(type, 4, 4, 'ascii');
    data.copy(chunk, 8);
    // calculate crc32
    // We can use built-in or simple crc
    const crc = crc32(chunk.subarray(4, 8 + data.length));
    chunk.writeUInt32BE(crc >>> 0, 8 + data.length);
    parts.push(chunk);
  }

  // Simple CRC32 table
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8);
  ihdrData.writeUInt8(6, 9);
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  writeChunk('IHDR', ihdrData);

  // IDAT
  writeChunk('IDAT', newIdatData);

  // IEND
  writeChunk('IEND', Buffer.alloc(0));

  fs.writeFileSync(outPath, Buffer.concat(parts));
  console.log(`Saved logo-dark.png successfully (${fs.statSync(outPath).size} bytes)`);
}
