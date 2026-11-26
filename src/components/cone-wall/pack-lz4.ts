import { compressBlock, compressBound, decompressBlock } from 'lz4js';
import { readPack } from './pack';

export function expandPack(bytes: Uint8Array) {
  const raw = new Uint8Array(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getUint32(0, true));
  if (decompressBlock(bytes, raw, 4, bytes.byteLength - 4, 0) !== raw.length) {
    throw new Error('Incomplete cone artwork');
  }
  return raw;
}

export async function loadPack(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Missing cone artwork');
  return readPack(expandPack(new Uint8Array(await response.arrayBuffer())));
}

export function packPixels(bytes: Uint8Array) {
  const packed = new Uint8Array(compressBound(bytes.length));
  const length = compressBlock(bytes, packed, 0, bytes.length, new Uint32Array(65536));
  if (!length) throw new Error('Cannot pack the cone artwork');
  return packed.slice(0, length);
}
