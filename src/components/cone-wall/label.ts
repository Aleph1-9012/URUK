import type { BlankLayout } from './material';
import { loadPack } from './pack';
import { typePack } from './type-pack';
export { inscription } from './type-pack';
const urls = import.meta.glob<string>('./data/packs/type-*.lz4', { eager: true, import: 'default', query: '?url&no-inline' });

export async function prepareType(layout: BlankLayout) {
  const url = urls['./data/packs/type-' + layout.pack + '.lz4'];
  if (!url) throw new Error('Missing native type size');
  const { metadata, alpha } = await loadPack(url);
  return typePack(metadata, alpha, layout.pack);
}
