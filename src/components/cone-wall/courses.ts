import type { Preparation } from './preparation';
import { noise, type Head } from './layout';
import { backing, paperCone, pitch, rowHeight, type Disc, type Material } from './material';

export const COURSE = 12;
const LANES = 3;

export function courseEdge(x: number, seed: number): number {
  return 12 * Math.sin((x + seed % 109) / 55) + 6 * Math.sin((x - seed % 79) / 25);
}

interface Clump {
  x: number;
  y: number;
  lane: number;
  first: number;
  discs: Disc[];
  heads: Head[];
}

// Each site in the staggered lattice owns its nearest cone heads. Cache the sites once per viewport.
export async function courses(scene: Pick<Material, 'width' | 'height' | 'seed' | 'heads'>, work: Preparation) {
  const stride = Math.ceil(scene.width / 26) + 10;
  const sites: (Clump | undefined)[] = [];
  const ordered: Clump[] = [];

  function site(col: number, row: number): Clump {
    const key = (row + 4) * stride + col + 4;
    const found = sites[key];
    if (found) return found;

    const random = noise(col, row, scene.seed);
    const clump = {
      x: 26 * (col + (row & 1) / 2) + 10 * (random - 0.5),
      y: 16 * row + 7 * (noise(row, col, scene.seed + 11) - 0.5),
      lane: Math.floor(random * LANES), first: Infinity, discs: [], heads: [],
    };
    sites[key] = clump;
    ordered.push(clump);
    return clump;
  }

  function attach(disc: Disc, head?: Head): void {
    const base = Math.floor(disc.y / 16);
    let closest: Clump | undefined;
    let best = Infinity;
    for (let row = base - 1; row <= base + 1; row++) {
      const col = Math.floor(disc.x / 26 - (row & 1) / 2);
      for (let c = col - 1; c <= col + 1; c++) {
        const candidate = site(c, row);
        const dx = candidate.x - disc.x;
        const dy = candidate.y - disc.y;
        const distance = dx * dx + dy * dy;
        if (distance >= best) continue;
        best = distance;
        closest = candidate;
      }
    }
    if (!closest) return;
    closest.first = Math.min(closest.first, disc.y - disc.ry - courseEdge(disc.x, scene.seed));
    closest.discs.push(disc);
    if (head) closest.heads.push(head);
  }

  for (let row = -1; row <= scene.height / rowHeight + 1; row++) {
    if (work.due()) await work.yieldTask();
    for (let col = -2; col <= scene.width / pitch + 1; col++) attach(paperCone(row, col, scene.seed));
  }
  for (const head of scene.heads) {
    if (work.due()) await work.yieldTask();
    attach(backing(head), head);
  }

  const groups = new Map<number, Clump>();
  for (const clump of ordered) {
    if (work.due()) await work.yieldTask();
    if (!clump.discs.length) continue;
    const beat = Math.floor(clump.first / COURSE);
    const key = beat * LANES + clump.lane;
    const existing = groups.get(key);
    if (existing) {
      existing.discs.push(...clump.discs);
      existing.heads.push(...clump.heads);
    } else {
      clump.first = beat * COURSE;
      groups.set(key, clump);
    }
  }
  return Array.from(groups.values()).sort((a, b) => b.first - a.first);
}
