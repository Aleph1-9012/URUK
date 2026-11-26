import type { BlankLayout } from './material';
import { loadPack, packPixels } from './pack-lz4';
import { shades } from './pack';
import type { Band } from './raster';
import { typePack } from './type-pack';
export { inscription } from './type-pack';
const urls = import.meta.glob<string>('./data/packs/type-*.lz4', { eager: true, import: 'default', query: '?url&no-inline' });

export function encodeLabelPatch({ x, y, width, height, alpha }: Band) {
  const pixels = new Uint32Array(alpha.length);

  for (let i = 0; i < alpha.length; i++) pixels[i] = shades[alpha[i]!]!;

  return { x, y, width, height, text: packPixels(new Uint8Array(pixels.buffer)).toBase64() };
}

export async function prepareType(layout: BlankLayout) {
  const url = urls['./data/packs/type-' + layout.pack + '.lz4'];
  if (!url) throw new Error('Missing native type size');
  const { metadata, alpha } = await loadPack(url);
  return typePack(metadata, alpha, layout.pack);
}
