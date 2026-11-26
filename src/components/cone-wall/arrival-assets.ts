import type { conePacks } from './arrival-packs';

/** Shared by the classic entry script and the inlined arrival boot. */
export function coneArrivalScripts(data: string, choosePacks: typeof conePacks, rebuild: boolean): string[] {
  const manifest: Record<string, string | undefined> = JSON.parse(data);
  const { head } = manifest;
  if (!head) return [];
  if (!rebuild) return [head];

  const { pack, print } = choosePacks(document.documentElement.clientWidth, devicePixelRatio, window.urukConePixels);
  return [print, `type-${pack}`, 'rebuild'].map(name => `/cone-data/${manifest[name]}/${name}.js`).concat(head);
}
