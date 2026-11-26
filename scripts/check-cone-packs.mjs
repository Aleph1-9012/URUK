import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import { decompressBlock } from 'lz4js';
import { readPack } from '../src/components/cone-wall/pack.ts';

const source = new URL('../src/components/cone-wall/data/packs/', import.meta.url);
const built = new URL('../dist/cone-data/', import.meta.url);
const wrappers = new Map();
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');

for (const file of await readdir(built, { recursive: true })) {
  const name = /^([0-9a-f]{20})\/((?:heads|print-\d+|type-\d+)\.js)$/.exec(file)?.[2];
  if (!name) continue;
  assert.ok(!wrappers.has(name), `Duplicate wrapper for ${name}`);
  wrappers.set(name, file);
}

const packs = (await readdir(source)).filter(file => file.endsWith('.lz4'));
assert.ok(packs.length > 0);
assert.equal(wrappers.size, packs.length);

for (const file of packs) {
  const packed = await readFile(new URL(file, source));
  const reference = Buffer.alloc(packed.readUInt32LE(0));
  assert.equal(decompressBlock(packed, reference, 4, packed.length - 4, 0), reference.length, file);
  const metadataEnd = 4 + reference.readUInt32LE(0);
  const wrapper = wrappers.get(file.replace(/\.lz4$/, '.js'));
  assert.ok(wrapper, `Missing arrival wrapper for ${file}`);
  const script = await readFile(new URL(wrapper, built), 'utf8');
  const parts = [];

  new Function('window', script)({ urukConeParts: parts });
  assert.equal(parts.length, 1, file);
  const { metadata, alpha } = readPack(Uint8Array.fromBase64(parts[0]));
  assert.equal(sha256(metadata), sha256(reference.subarray(4, metadataEnd)), `${file} metadata`);
  assert.equal(sha256(alpha), sha256(reference.subarray(metadataEnd)), `${file} alpha`);
}

console.log(`Built raw arrival packs match the metadata and alpha SHA-256 of all ${packs.length} LZ4 masters`);
