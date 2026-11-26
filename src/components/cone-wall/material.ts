import type {} from './entry-types';
import { destinationSeed, noise, type Head } from './layout';
import { conePacks } from './arrival-packs';

export const PAPER = '#e7e5e0';

export interface Disc { x: number; y: number; rx: number; ry: number }
export interface Letter { value: string; x: number; width: number }

/** Canvas artwork uses the pixel box supplied by layout, including browser zoom. */
export function blankLayout() {
  const width = document.documentElement.clientWidth;
  const height = innerHeight;
  const dpr = devicePixelRatio;
  const { density, pack } = conePacks(width, dpr, window.urukConePixels);
  const fontSize = pack / density;
  // Use the approved wall's layout for every label. Only the central inscription varies.
  return { width, height, density, dpr, seed: destinationSeed('/how-we-check/'),
    centre: Math.round(height / 2), fontSize, pack };
}

export type BlankLayout = ReturnType<typeof blankLayout>;
export type FaceLayout = BlankLayout & { baseline: number; letters: Letter[] };
export type Material = BlankLayout & { heads: Head[] };

export const pitch = 9;
export const rowHeight = pitch * Math.sqrt(3) / 2;

export function paperCone(row: number, col: number, seed: number): Disc {
  const x = (col + (row & 1) / 2) * pitch + 1.4 * (noise(col, row, seed) - 0.5);
  const y = row * rowHeight + 1.2 * (noise(row, col, seed + 11) - 0.5);
  return { x, y, rx: 7.95 + noise(col, row, seed + 7) * 0.6, ry: 7.85 + noise(col, row, seed + 13) * 0.6 };
}

export function backing(head: Head): Disc {
  const w = head.width / 3;
  const h = head.height / 3;
  return { x: head.x + w / 2, y: head.y + h / 2, rx: w * 0.71 + 1, ry: h * 0.71 + 1 };
}
