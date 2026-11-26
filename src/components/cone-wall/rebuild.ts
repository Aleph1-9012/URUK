import { blankLayout } from './material';
import { printedHeads } from './layout';
import { printHeads } from './print';
import { readPack, shades } from './pack';
import type { Print } from './raster';
import { typePack, inscription } from './type-pack';

interface ArtPack { width: number; height: number; prints?: Print[] }
interface RebuildWindow extends Window {
  urukConeParts: string[];
  urukConeName: string;
  urukRebuiltCone?: { pixels: ImageData; layout: ReturnType<typeof inscription>['layout'] };
}
declare const window: RebuildWindow;

const layout = blankLayout();
const [heads, glyphs] = window.urukConeParts.map(text => readPack(Uint8Array.fromBase64(text)));
if (!heads || !glyphs) throw new Error('The cone artwork is incomplete');
const metadata: ArtPack = JSON.parse(heads.metadata);
const width = Math.round(layout.width * layout.density);
const height = Math.round(layout.height * layout.density);
const alpha = new Uint8Array(width * height);
const prints = new Map(metadata.prints?.map(entry => [entry[0], entry]));
const print = printHeads(alpha, width, height, layout.density, heads.alpha, metadata.width, prints);
for (const head of printedHeads(layout.width, layout.height, Math.ceil(layout.fontSize * 1.65), layout.seed)) print(head);
const type = typePack(glyphs.metadata, glyphs.alpha, layout.pack);
const strip = { x: 0, y: 0, width, height, alpha };
const { layout: named, strike } = inscription(window.urukConeName, layout, [], strip, type);
for (let y = 0; y < strike.height; y++) {
  alpha.set(strike.alpha.subarray(y * strike.width, (y + 1) * strike.width), (y + strike.y) * width + strike.x);
}
const pixels = new Uint32Array(alpha.length);
for (let i = 0; i < pixels.length; i++) pixels[i] = shades[alpha[i]!]!;
window.urukRebuiltCone = { layout: named, pixels: new ImageData(new Uint8ClampedArray(pixels.buffer), width, height) };
window.urukConeParts.length = 0;
