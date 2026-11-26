import type { coneArrivalScripts } from './arrival-assets';
import type { conePacks } from './arrival-packs';

/** Inlined in the document head, so a storage-backed arrival still needs only head.js. */
export function startConeArrival(choosePacks: typeof conePacks, scripts: typeof coneArrivalScripts): void {
  const script = document.currentScript;

  if (!(script instanceof HTMLScriptElement) || !script.dataset.coneAssets) return;

  const { coneAssets } = script.dataset;
  const include = (url: string) => document.write('<script blocking="render" src="' + url + '"><' + '/script>');

  if (window.urukConeName) {
    window.urukConeParts = [];
    scripts(coneAssets, choosePacks, true).forEach(include);

    return;
  }

  try {
    const saved = sessionStorage.getItem('uruk:cone-destination');

    if (saved) {
      window.urukConeIntent = saved;
      scripts(coneAssets, choosePacks, false).forEach(include);
    }
  } catch {}
}
