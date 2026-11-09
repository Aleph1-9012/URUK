import { patterns, type Pattern } from '../../../lib/engraving-patterns';

// Isbell's seven-colouring of the plane, the 158 page's Plate I, with each colour drawn as an engraving pattern.
// The paper's version: hexagons of circumradius 2/5 of the unit, colours assigned by an index-seven sublattice of the centres.
export const VIEW = { width: 760, height: 560 } as const;

export const RADIUS = 46;

export const UNIT = 2.5 * RADIUS;

// Where hexagon (0, 0) sits, so the plate opens on the same crop as the approved drawing.
const ORIGIN = { x: -120, y: -30 } as const;
const ROOT3 = Math.sqrt(3);

export type Point = { x: number; y: number };

export type Cell = { q: number; r: number };

export function centre({ q, r }: Cell): Point {
  return { x: ROOT3 * RADIUS * (q + r / 2) + ORIGIN.x, y: 1.5 * RADIUS * r + ORIGIN.y };
}

export function patternOf({ q, r }: Cell): Pattern {
  const index = (((q + 3 * r) % 7) + 7) % 7;

  return patterns[index] ?? 'blank';
}

// The hexagon holding a point: axial coordinates rounded through cube coordinates. A point on a shared edge goes to one side;
// either side is a valid colouring, because closed hexagons of one pattern are still more than a unit apart.
export function cellAt(point: Point): Cell {
  const px = point.x - ORIGIN.x;
  const py = point.y - ORIGIN.y;
  const q = ((ROOT3 / 3) * px - py / 3) / RADIUS;
  const r = ((2 / 3) * py) / RADIUS;
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);

  if (dq > dr && dq > ds) {
    rq = -rr - rs;
  } else if (dr > ds) {
    rr = -rq - rs;
  }

  return { q: rq, r: rr };
}

function corners(cell: Cell): Point[] {
  const middle = centre(cell);

  return Array.from({ length: 6 }, (_, index) => {
    const angle = Math.PI / 6 + (index * Math.PI) / 3;

    return { x: middle.x + RADIUS * Math.cos(angle), y: middle.y + RADIUS * Math.sin(angle) };
  });
}

export type Tile = { cell: Cell; pattern: Pattern; points: string };

export function tiles(): Tile[] {
  const found: Tile[] = [];

  for (let r = -4; r < 12; r += 1) {
    for (let q = -8; q < 16; q += 1) {
      const cell = { q, r };
      const middle = centre(cell);

      if (middle.x > -RADIUS && middle.x < VIEW.width + RADIUS && middle.y > -RADIUS && middle.y < VIEW.height + RADIUS) {
        const points = corners(cell).map((corner) => `${corner.x.toFixed(2)},${corner.y.toFixed(2)}`).join(' ');
        found.push({ cell, pattern: patternOf(cell), points });
      }
    }
  }

  return found;
}

// The ruler is one end and a direction; the other end is always one unit away.
export type Ruler = { start: Point; angle: number };

export const START_RULER: Ruler = { start: { x: 300, y: 300 }, angle: (-24 * Math.PI) / 180 };

export function rulerEnd({ start, angle }: Ruler): Point {
  return { x: start.x + UNIT * Math.cos(angle), y: start.y + UNIT * Math.sin(angle) };
}

const MARGIN = 12;

export function inside(point: Point): boolean {
  return point.x >= MARGIN && point.x <= VIEW.width - MARGIN && point.y >= MARGIN && point.y <= VIEW.height - MARGIN;
}

export function fits(ruler: Ruler): boolean {
  return inside(ruler.start) && inside(rulerEnd(ruler));
}
