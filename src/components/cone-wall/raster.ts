import type { BlankLayout, Disc } from './material';
import { printHeads } from './print';
import type { Preparation } from './preparation';
import { strikeOrder } from './wall';
import { paper, shades } from './pack';

interface Rect { x: number; y: number; width: number; height: number }
interface Patch extends Rect { offset: number }
export interface Band extends Rect { alpha: Uint8Array }
export interface Batch { patches: Patch[]; buffer: ArrayBuffer }

export function putPatches(context: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D, batch: Batch) {
  for (const patch of batch.patches) {
    const bytes = new Uint8ClampedArray(batch.buffer, patch.offset, patch.width * patch.height * 4);
    context.putImageData(new ImageData(bytes, patch.width, patch.height), patch.x, patch.y);
  }
}

export type Print = [key: number, width: number, height: number, offsets: number[]];

export async function raster(layout: BlankLayout, atlas: Uint8Array, atlasWidth: number, prints: Map<number, Print>, work: Preparation) {
  const { density } = layout;
  const width = Math.round(layout.width * density), height = Math.round(layout.height * density);
  const size = width * height;
  const alpha = new Uint8Array(size), ink = new Uint8Array(size).fill(47);
  const first = new Uint8Array(size).fill(47), full = new Uint8Array(size).fill(47), coverage = new Uint8Array(size);
  const { strikes, band } = await strikeOrder(layout, work);

  function disc(d: Disc, beat: number) {
    const cx = d.x * density, cy = d.y * density, rx = d.rx * density, ry = d.ry * density;
    for (let y = Math.max(0, Math.ceil(cy - ry - 0.5)); y < Math.min(height, cy + ry); y++) {
      const dy = (y + 0.5 - cy) / ry;
      const half = rx * Math.sqrt(Math.max(0, 1 - dy * dy));
      const left = Math.max(0, cx - half), right = Math.min(width, cx + half);
      if (right <= left) continue;
      const row = y * width, lo = Math.floor(left), hi = Math.ceil(right);
      first.fill(beat, row + lo, row + hi);
      full.fill(beat, row + Math.ceil(left), row + Math.floor(right));
      coverage.fill(255, row + lo, row + hi);
      if (left > lo) coverage[row + lo] = Math.round(255 * (1 + lo - left));
      if (right < hi) coverage[row + hi - 1] = Math.round(255 * (1 + right - hi));
    }
  }

  const print = printHeads(alpha, width, height, density, atlas, atlasWidth, prints, ink);

  for (let b = 47; b >= 0; b--) {
    for (const d of strikes[b]!.discs) {
      if (work.due()) await work.yieldTask();
      disc(d, b);
    }
  }
  for (const [b, group] of strikes.entries()) {
    for (const head of group.heads) {
      if (work.due()) await work.yieldTask();
      print(head, b);
    }
  }

  strikes.length = 0;
  prints.clear();
  atlas = new Uint8Array(0);

  // Only columns touched since the previous strike need a new display patch.
  const step = 96;
  const columns = Math.ceil(width / step);
  const lows = new Int32Array(48 * columns).fill(height), highs = new Int32Array(48 * columns);
  function dirty(beat: number, col: number, y: number) {
    const j = beat * columns + col;
    lows[j] = Math.min(lows[j]!, y);
    highs[j] = Math.max(highs[j]!, y + 1);
  }
  for (let y = 0; y < height; y++) {
    if (work.due()) await work.yieldTask();
    for (let col = 0; col < columns; col++) {
      const end = y * width + Math.min(width, (col + 1) * step);
      for (let i = y * width + col * step; i < end; i++) {
        dirty(first[i]!, col, y);
        if (first[i] !== full[i]) dirty(full[i]!, col, y);
        if (alpha[i]) dirty(ink[i]!, col, y);
      }
    }
  }

  let previous = -1;
  function paint(beat: number): Batch {
    const patches: Patch[] = [];
    let length = 0;
    for (let col = 0; col < columns; col++) {
      let top = height, bottom = 0;
      for (let b = previous + 1; b <= beat; b++) {
        const j = b * columns + col;
        top = Math.min(top, lows[j]!); bottom = Math.max(bottom, highs[j]!);
      }
      if (bottom <= top) continue;
      const x = col * step, w = Math.min(step, width - x);
      patches.push({ x, y: top, width: w, height: bottom - top, offset: length * 4 });
      length += w * (bottom - top);
    }
    const pixels = new Uint32Array(length);
    for (const p of patches) {
      let dst = p.offset / 4;
      for (let y = p.y; y < p.y + p.height; y++) {
        const start = y * width + p.x;
        for (let i = start; i < start + p.width; i++) {
          if (beat < first[i]!) { dst++; continue; }
          const color = beat >= ink[i]! ? shades[alpha[i]!]! : paper;
          pixels[dst++] = beat >= full[i]! ? color : (color & 0xffffff) | (coverage[i]! << 24);
        }
      }
    }
    previous = beat;
    return { patches, buffer: pixels.buffer };
  }

  function inscribe(p: Band, beat: number) {
    for (let y = 0; y < p.height; y++) {
      const start = (y + p.y) * width + p.x;
      for (let x = 0; x < p.width; x++) {
        const i = start + x, a = p.alpha[y * p.width + x]!;
        if (a === alpha[i]) continue;
        alpha[i] = a; ink[i] = beat;
        full[i] = Math.min(full[i]!, beat); first[i] = Math.min(first[i]!, beat);
        dirty(beat, Math.floor((x + p.x) / step), y + p.y);
      }
    }
  }

  const top = Math.max(0, Math.floor((layout.centre - layout.fontSize * 1.6) * density));
  const end = Math.min(height, Math.ceil((layout.centre + layout.fontSize * 1.6) * density));
  const strip: Band = { x: 0, y: top, width, height: end - top, alpha: alpha.slice(top * width, end * width) };
  return { alpha, band, strip, paint, inscribe, width, height };
}
