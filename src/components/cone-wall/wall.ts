import type { Preparation } from './preparation';
import { noise, printedHeads, type Head } from './layout';
import { backing, type BlankLayout, paperCone, pitch, rowHeight, type Disc } from './material';

const BEATS = 48;

export function strikeAt(x: number, y: number, { width, height, seed }: BlankLayout): number {
  const up = (height - y) / height;
  const course = (height - y) / 54;
  const zig = 2 * Math.abs(course - Math.floor(course + 0.5));
  // Neighbouring cones travel in two- or three-head clumps. The nearest centres
  // are staggered and irregular, so the edge of a clump is never a rectangular tile.
  const row = Math.floor(y / 15);
  let best = Infinity;
  let drift = 0;
  for (let r = row - 1; r <= row + 1; r++) {
    const column = Math.floor(x / 20 - (r & 1) / 2);
    for (let c = column - 1; c <= column + 1; c++) {
      const random = noise(c, r, seed);
      const dx = x - (20 * (c + (r & 1) / 2) + 6 * (random - 0.5));
      const dy = y - (15 * r + 6 * (noise(r, c, seed + 5) - 0.5));
      const distance = dx * dx + dy * dy;
      if (distance < best) {
        best = distance;
        drift = random - 0.5;
      }
    }
  }
  return Math.max(0, Math.min(BEATS - 1, Math.floor(BEATS * (0.55 * up + 0.44 * x / width + 0.05 * (zig - 0.5) + 0.064 * drift))));
}


interface Strike { discs: Disc[]; heads: Head[] }

export async function strikeOrder(layout: BlankLayout, work: Preparation) {
  const { width, height, seed, centre, fontSize } = layout;
  const strikes = Array.from({ length: BEATS }, (): Strike => ({ discs: [], heads: [] }));
  const band: { x: number; beat: number }[] = [];
  const stride = Math.ceil(width / pitch) + 12;
  const rows = Math.ceil(height / rowHeight) + 10;
  const earliest = new Uint8Array(stride * rows).fill(47);
  const apron = 19;
  const lattice: Disc[] = [];
  const beatAt = (d: Disc) => strikeAt(d.x, d.y, layout);

  for (let row = 0; row < rows; row++) {
    if (work.due()) await work.yieldTask();
    for (let col = 0; col < stride; col++) {
      const d = paperCone(row - 1, col - 2, seed);
      lattice.push(d);
      const beat = beatAt(d);
      earliest[row * stride + col] = beat;
      if (Math.abs(d.y - centre) < fontSize * 0.68) band.push({ x: d.x, beat });
    }
  }

  for (const head of printedHeads(width, height, Math.ceil(fontSize * 1.65), seed)) {
    if (work.due()) await work.yieldTask();
    const seat = backing(head);
    const beat = beatAt(seat);
    const group = strikes[beat]!;
    group.heads.push(head);
    group.discs.push(seat);
    const right = head.x + head.width / 3;
    const bottom = head.y + head.height / 3;
    for (let row = Math.max(-1, Math.floor((head.y - apron) / rowHeight)); row <= Math.ceil((bottom + apron) / rowHeight); row++) {
      for (let col = Math.max(-2, Math.floor((head.x - apron) / pitch) - 1); col <= Math.ceil((right + apron) / pitch); col++) {
        const at = (row + 1) * stride + col + 2;
        const d = lattice[at];
        if (!d || earliest[at]! <= beat) continue;
        const dx = Math.max(head.x - d.x, 0, d.x - right);
        const dy = Math.max(head.y - d.y, 0, d.y - bottom);
        if (dx * dx + dy * dy <= apron * apron) earliest[at] = beat;
      }
    }
  }
  for (let i = 0; i < lattice.length; i++) strikes[earliest[i]!]!.discs.push(lattice[i]!);
  return { strikes, band };
}
