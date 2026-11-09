// A full picture takes over a tenth of a second, so it is drawn off the page's thread.
import { draftQuality, drawOrbits, fullQuality, type Canvas } from './orbits';

export type OrbitJob = { k: number; canvas: Canvas; draft: boolean };

export type OrbitPicture = { width: number; height: number; pixels: Uint8ClampedArray<ArrayBuffer> };

addEventListener('message', (event: MessageEvent<OrbitJob>) => {
  const { k, canvas, draft } = event.data;
  const pixels = drawOrbits(k, canvas, draft ? draftQuality : fullQuality);
  const picture: OrbitPicture = { width: canvas.width, height: canvas.height, pixels };

  postMessage(picture, { transfer: [pixels.buffer] });
});
