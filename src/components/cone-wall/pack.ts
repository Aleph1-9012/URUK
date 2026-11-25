import { compressBlock, compressBound, decompressBlock } from 'lz4js';

export async function loadPack(url: string) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Missing cone artwork');
  return unpack(await response.arrayBuffer());
}

export function unpack(buffer: ArrayBuffer) {
  const raw = new Uint8Array(new DataView(buffer).getUint32(0, true));
  if (decompressBlock(new Uint8Array(buffer), raw, 4, buffer.byteLength - 4, 0) !== raw.length) {
    throw new Error('Incomplete cone artwork');
  }
  const size = new DataView(raw.buffer).getUint32(0, true);
  return { metadata: new TextDecoder().decode(raw.subarray(4, 4 + size)), alpha: raw.subarray(4 + size) };
}

export function packPixels(bytes: Uint8Array) {
  const packed = new Uint8Array(compressBound(bytes.length));
  const length = compressBlock(bytes, packed, 0, bytes.length, new Uint32Array(65536));
  if (!length) throw new Error('Cannot pack the cone artwork');
  return packed.slice(0, length);
}

// ImageData uses native little-endian RGBA on the supported browser targets.
export const paper = 0xffe0e5e7;
export const shades = Uint32Array.from({ length: 256 }, (_, a) => {
  const mix = (ink: number, ground: number) => Math.round(ink * a / 255) + ((ground * (256 - a)) >> 8);
  return (0xff000000 | mix(23, 224) << 16 | mix(26, 229) << 8 | mix(28, 231)) >>> 0;
});
