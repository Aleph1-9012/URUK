export function readPack(raw: Uint8Array) {
  const size = new DataView(raw.buffer, raw.byteOffset, raw.byteLength).getUint32(0, true);
  if (size > raw.length - 4) throw new Error('Incomplete cone artwork');
  return { metadata: new TextDecoder().decode(raw.subarray(4, 4 + size)), alpha: raw.subarray(4 + size) };
}

// ImageData uses native little-endian RGBA on the supported browser targets.
export const paper = 0xffe0e5e7;
export const shades = Uint32Array.from({ length: 256 }, (_, a) => {
  const mix = (ink: number, ground: number) => Math.round(ink * a / 255) + ((ground * (256 - a)) >> 8);
  return (0xff000000 | mix(23, 224) << 16 | mix(26, 229) << 8 | mix(28, 231)) >>> 0;
});
