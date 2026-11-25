// Run from the repository root using bun. The font is rendered here once, at
// publishing time. Visitors download just the native-size mask pack they use.
import { chromium } from 'playwright-core';
import { compressBlock, compressBound } from 'lz4js';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dir = fileURLToPath(new URL('./packs/', import.meta.url));
await mkdir(dir, { recursive: true });
const sizes = [24, 28, 32, 36, 38, 42, 48, 56, 64, 72, 76, 84, 96, 108, 114, 128, 144, 152, 192, 228];
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /-';

async function save(name, metadata, pixels) {
  const header = Buffer.from(JSON.stringify(metadata));
  const raw = Buffer.alloc(4 + header.length + pixels.length);
  raw.writeUInt32LE(header.length);
  header.copy(raw, 4);
  raw.set(pixels, 4 + header.length);
  const bytes = Buffer.alloc(compressBound(raw.length) + 4);
  bytes.writeUInt32LE(raw.length);
  const length = compressBlock(raw, bytes.subarray(4), 0, raw.length, new Uint32Array(65536));
  if (!length) throw new Error('The artwork pack was empty');
  await writeFile(dir + name + '.lz4', bytes.subarray(0, 4 + length));
}

const { data, info } = await sharp(new URL('heads.webp', import.meta.url).pathname).extractChannel('alpha').raw().toBuffer({ resolveWithObject: true });
await save('heads', { width: info.width, height: info.height }, data);

const browser = await chromium.launch({ executablePath: '/usr/bin/chromium' });
try {
  const page = await browser.newPage();
  await page.evaluate(async data => {
    const font = new FontFace('Uruk type', Uint8Array.fromBase64(data));
    document.fonts.add(await font.load());
  }, (await readFile('public/fonts/special-elite-regular.woff2')).toString('base64'));
  const data = JSON.parse(await readFile(new URL('heads.json', import.meta.url), 'utf8'));
  const entries = Object.values(data).flatMap(plate => plate.heads);
  const atlas = (await readFile(new URL('heads.webp', import.meta.url))).toString('base64');
  for (const density of [1, 2, 3]) {
    const result = await page.evaluate(async ({ entries, atlas, density }) => {
      const image = new Image();
      image.src = 'data:image/webp;base64,' + atlas;
      await image.decode();
      const canvas = document.createElement('canvas');
      canvas.width = 192; canvas.height = 192;
      const ctx = canvas.getContext('2d', { willReadFrequently: false });
      const pieces = [], catalog = [];
      const known = new Map();
      let offset = 0;
      // Every plate position is on a third of a CSS pixel horizontally. Course
      // centres add a half-pixel vertically. Preprint exactly those phases.
      for (const [, , sx, sy, sw, sh] of entries) {
        const positions = [];
        const w = Math.ceil(sw * density / 3) + 2, h = Math.ceil(sh * density / 3) + 2;
        for (let py = 0; py < 6; py++) for (let px = 0; px < 3; px++) {
          if ((density === 3 && (px !== 0 || py % 3 !== 0)) || (density === 2 && py % 2 !== 0)) {
            positions.push(-1);
            continue;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.setTransform(density, 0, 0, density, 0, 0);
          ctx.drawImage(image, sx, sy, sw, sh, (16 + px / 3) / density, (16 + py / 6) / density, sw / 3, sh / 3);
          ctx.resetTransform();
          const rgba = ctx.getImageData(16, 16, w, h).data, mask = new Uint8Array(w * h);
          for (let i = 0; i < mask.length; i++) mask[i] = rgba[4 * i + 3];
          const key = mask.toBase64();
          if (!known.has(key)) {
            known.set(key, offset);
            pieces.push(key);
            offset += mask.length;
          }
          positions.push(known.get(key));
        }
        catalog.push([sx + sy * image.width, w, h, positions]);
      }
      return { catalog, pieces };
    }, { entries, atlas, density });
    await save('print-' + density, { width: info.width, height: info.height, prints: result.catalog },
      Buffer.concat(result.pieces.map(piece => Buffer.from(piece, 'base64'))));
  }
  for (const size of sizes) {
    const { metadata, masks } = await page.evaluate(({ size, alphabet }) => {
      const glyphs = [];
      const masks = [];
      let offset = 0;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size * 3;
      const brush = canvas.getContext('2d', { willReadFrequently: true });
      for (const letter of alphabet) {
        brush.font = '1000px "Uruk type"';
        const advance = brush.measureText(letter).width / 1000;
        brush.font = size + 'px "Uruk type"';
        const metrics = brush.measureText(letter);
        const x = -Math.ceil(metrics.actualBoundingBoxLeft) - 1;
        const y = -Math.ceil(metrics.actualBoundingBoxAscent) - 1;
        const w = Math.max(1, Math.ceil(metrics.actualBoundingBoxRight) - x + 3);
        const h = Math.max(1, Math.ceil(metrics.actualBoundingBoxDescent) - y + 2);
        const vertical = [];
        for (const density of [1, 2, 3, 4]) {
          brush.font = (size / density) + 'px "Uruk type"';
          const m = brush.measureText(letter);
          vertical.push([m.actualBoundingBoxAscent, m.actualBoundingBoxDescent]);
        }
        brush.font = size + 'px "Uruk type"';
        glyphs.push({ letter, vertical, advance, x, y, w, h, offset, ascent: metrics.actualBoundingBoxAscent, descent: metrics.actualBoundingBoxDescent });
        for (let phase = 0; phase < 4; phase++) {
          brush.clearRect(0, 0, canvas.width, canvas.height);
          brush.fillText(letter, phase / 4 - x, -y);
          const rgba = brush.getImageData(0, 0, w, h).data;
          const alpha = new Uint8Array(w * h);
          for (let i = 0; i < alpha.length; i++) alpha[i] = rgba[i * 4 + 3];
          masks.push(alpha.toBase64());
          offset += alpha.length;
        }
      }
      return { metadata: { size, glyphs }, masks };
    }, { size, alphabet });
    await save('type-' + size, metadata, Buffer.concat(masks.map(mask => Buffer.from(mask, 'base64'))));
  }
} finally { await browser.close(); }
