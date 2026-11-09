import { patterns, type Pattern } from '../../../lib/engraving-patterns';

export type Point = { x: number; y: number };

export type ClassId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type Pigment = { id: ClassId; hex: string; tint: string; pattern: Pattern; numeral: 'ink' | 'paper' };

export const INK = '#1c1a17';

export const PAPER = '#e7e5e0';

function channels(hex: string): readonly [number, number, number] {
  return [Number.parseInt(hex.slice(1, 3), 16), Number.parseInt(hex.slice(3, 5), 16), Number.parseInt(hex.slice(5, 7), 16)];
}

function pigment(id: ClassId, hex: string, pattern: Pattern, numeral: 'ink' | 'paper'): Pigment {
  const paper = channels(PAPER);
  const color = channels(hex);
  const tint = '#' + color.map((value, index) => Math.round(.45 * value + .55 * (paper[index] ?? 0)).toString(16).padStart(2, '0')).join('');

  return { id, hex, tint, pattern, numeral };
}

export const PALETTE = [
  pigment(1, '#9e3a2b', 'h', 'paper'),
  pigment(2, '#b8891f', 'd', 'ink'),
  pigment(3, '#3f6b39', 'o', 'paper'),
  pigment(4, '#206e6a', 'v', 'paper'),
  pigment(5, '#6e4b2e', 'a', 'paper'),
  pigment(6, '#5d6670', 'x', 'paper'),
  pigment(7, '#f6f4ef', 'blank', 'ink'),
] as const;

export const SPINDLE_ANGLE = 2 * Math.asin(1 / (2 * Math.sqrt(3)));

function ray(angle: number, distance = 1): Point {
  return { x: distance * Math.cos(angle), y: distance * Math.sin(angle) };
}

export const SPINDLE = [
  { x: 0, y: 0 },
  ray(-Math.PI / 6),
  ray(Math.PI / 6),
  ray(0, Math.sqrt(3)),
  ray(SPINDLE_ANGLE - Math.PI / 6),
  ray(SPINDLE_ANGLE + Math.PI / 6),
  ray(SPINDLE_ANGLE, Math.sqrt(3)),
] as const;

export const TRIANGLE = [SPINDLE[0], SPINDLE[1], SPINDLE[2]] as const;

export type Edge = readonly [number, number];

export function unitPairs(points: readonly Point[]): Edge[] {
  const edges: Edge[] = [];

  for (let a = 0; a < points.length; a++) {
    for (let b = a + 1; b < points.length; b++) {
      const p = points[a];
      const q = points[b];

      if (p && q && Math.abs(Math.hypot(p.x - q.x, p.y - q.y) - 1) < 1e-12) edges.push([a, b]);
    }
  }

  return edges;
}

export const SPINDLE_EDGES = unitPairs(SPINDLE);

export const FORCED_COLOURS = [1, 2, 3, 1, 2, 3, 1] as const;

export function properColouringCount(vertexCount: number, edges: readonly Edge[], classes: number): number {
  const labels = Array.from({ length: vertexCount }, () => 0);

  function extend(vertex: number): number {
    if (vertex === vertexCount) return 1;

    let count = 0;

    for (let color = 1; color <= classes; color++) {
      let allowed = true;

      for (const [a, b] of edges) {
        if ((a === vertex && b < vertex && labels[b] === color) || (b === vertex && a < vertex && labels[a] === color)) {
          allowed = false;
          break;
        }
      }

      if (allowed) {
        labels[vertex] = color;
        count += extend(vertex + 1);
      }
    }

    return count;
  }

  return extend(0);
}

export const HEX_RADIUS = 2 / 5;

export const SAME_CENTER_DISTANCE = Math.sqrt(21) * HEX_RADIUS;

export const SAME_HEX_GAP = Math.sqrt(7) * HEX_RADIUS;

export const QUOTED_HEX_GAP = (Math.sqrt(21) - 2) * HEX_RADIUS;

export type HexCell = { q: number; r: number };

export function hexCentre(q: number, r: number): Point {
  return { x: Math.sqrt(3) * HEX_RADIUS * (q + r / 2), y: 1.5 * HEX_RADIUS * r };
}

export function hexVertices(q: number, r: number): Point[] {
  const center = hexCentre(q, r);

  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + index * Math.PI / 3;

    return { x: center.x + HEX_RADIUS * Math.cos(angle), y: center.y + HEX_RADIUS * Math.sin(angle) };
  });
}

export function classOf(q: number, r: number): ClassId {
  const residue = ((q + 3 * r) % 7 + 7) % 7;

  switch (residue) {
    case 1: return 1;
    case 2: return 2;
    case 3: return 3;
    case 4: return 4;
    case 5: return 5;
    case 6: return 6;
    default: return 7;
  }
}

export function cellAt(point: Point): HexCell {
  const q = (Math.sqrt(3) / 3 * point.x - point.y / 3) / HEX_RADIUS;
  const r = 2 * point.y / (3 * HEX_RADIUS);
  const s = -q - r;
  let roundedQ = Math.round(q);
  let roundedR = Math.round(r);
  const roundedS = Math.round(s);
  const dq = Math.abs(roundedQ - q);
  const dr = Math.abs(roundedR - r);
  const ds = Math.abs(roundedS - s);

  if (dq > dr && dq > ds) roundedQ = -roundedR - roundedS;
  else if (dr > ds) roundedR = -roundedQ - roundedS;

  return { q: roundedQ, r: roundedR };
}

export function classAt(point: Point): ClassId {
  const cell = cellAt(point);

  return classOf(cell.q, cell.r);
}

export type HexTile = HexCell & { center: Point; vertices: Point[]; classId: ClassId; pattern: Pattern };

export function hexTiles(extent = 6): HexTile[] {
  const tiles: HexTile[] = [];

  for (let q = -extent; q <= extent; q++) {
    for (let r = -extent; r <= extent; r++) {
      const classId = classOf(q, r);
      tiles.push({ q, r, center: hexCentre(q, r), vertices: hexVertices(q, r), classId, pattern: patterns[classId % 7] ?? 'blank' });
    }
  }

  return tiles;
}

export type Ruler = { start: Point; end: Point; angle: number };

// The tiling is a proper colouring for every unit segment. These samples choose
// one bounded, continuous route, and each frame reconstructs its exact unit length.
export const RULER_SAMPLES = Array.from({ length: 211 }, (_, index) => {
  const progress = index / 210;
  const angle = -.5 + progress * Math.PI * 1.2;
  const start = { x: -.7 + .7 * Math.sin(progress * Math.PI * 2), y: -.3 + .5 * Math.sin(progress * Math.PI * 1.5) };

  return { start, angle };
});

export function rulerAt(time: number): Ruler {
  const position = Math.max(0, Math.min(1, (time - 34000) / 10500)) * (RULER_SAMPLES.length - 1);
  const index = Math.min(RULER_SAMPLES.length - 2, Math.floor(position));
  const from = RULER_SAMPLES[index];
  const to = RULER_SAMPLES[index + 1];

  if (!from || !to) throw new Error('The unit ruler requires two neighbouring path samples.');

  const amount = position - index;
  const start = { x: from.start.x + (to.start.x - from.start.x) * amount, y: from.start.y + (to.start.y - from.start.y) * amount };
  const angle = from.angle + (to.angle - from.angle) * amount;

  return { start, end: { x: start.x + Math.cos(angle), y: start.y + Math.sin(angle) }, angle };
}

function luminance(hex: string): number {
  const linear = channels(hex).map(value => {
    const channel = value / 255;

    return channel <= .04045 ? channel / 12.92 : ((channel + .055) / 1.055) ** 2.4;
  });

  return .2126 * (linear[0] ?? 0) + .7152 * (linear[1] ?? 0) + .0722 * (linear[2] ?? 0);
}

export function contrast(left: string, right: string): number {
  const a = luminance(left);
  const b = luminance(right);

  return (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
}

function pointSegmentDistance(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const parameter = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / (dx * dx + dy * dy)));

  return Math.hypot(point.x - a.x - parameter * dx, point.y - a.y - parameter * dy);
}

export function polygonGap(left: readonly Point[], right: readonly Point[]): number {
  let closest = Infinity;

  for (let index = 0; index < left.length; index++) {
    const a = left[index];
    const b = left[(index + 1) % left.length];

    if (!a || !b) continue;

    for (const point of right) closest = Math.min(closest, pointSegmentDistance(point, a, b));
  }

  for (let index = 0; index < right.length; index++) {
    const a = right[index];
    const b = right[(index + 1) % right.length];

    if (!a || !b) continue;

    for (const point of left) closest = Math.min(closest, pointSegmentDistance(point, a, b));
  }

  return closest;
}
