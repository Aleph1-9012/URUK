// The film's computed maps: ζ over the strip it shows, and L(s, χ₋₄), the cousin that counts primes 4k + 1 against 4k + 3.
import { pack, phaseLines, sample, sizeLines, type Grid, type Lines, type Samples } from './contours';
import { lValue, minusFour, principal, type Character, type Complex } from './lfunctions';

export type MapId = 'zeta' | 'minus-four';

export type Band = Lines & { bottom: number; top: number };

export type MapData = {
  id: MapId;
  grid: Grid;
  bands: Band[];
  // Size lines where |L| is small, rings closing in on each zero: there 1/L is large.
  rings: Lines;
  // Zeros found on the grid with 0 < Im s; ζ's come from Odlyzko's table instead.
  zeros: Complex[];
};

type Plan = { grid: Grid; directions: number; character: Character; rings: boolean; zeros: boolean };

// Grids sit a fraction of a cell off round numbers so that no node lands on the pole at s = 1.
export const ZETA_GRID: Grid = { left: -0.4137, right: 1.4137, bottom: -3.0213, top: 64.0213, columns: 150, rows: 840 };

export const COUSIN_GRID: Grid = { left: -0.3137, right: 1.3137, bottom: -1.0213, top: 30.0213, columns: 110, rows: 330 };

export const RING_LEVELS = [-1.6, -2.4, -3.2, -4] as const;

const BAND_HEIGHT = 4;

export const PLANS: Record<MapId, Plan> = {
  zeta: { grid: ZETA_GRID, directions: 4, character: principal, rings: true, zeros: false },
  'minus-four': { grid: COUSIN_GRID, directions: 4, character: minusFour, rings: false, zeros: true },
};

type Bucket = { lines: number[][]; bottom: number; top: number };

export function bandsOf(grid: Grid, lines: Lines): Band[] {
  const buckets: Bucket[] = [];
  const bandOf = (y: number) => Math.max(0, Math.floor((y - grid.bottom) / BAND_HEIGHT));
  const count = lines.points.length / 2;
  const add = (band: number, line: number[]) => {
    const bucket = buckets[band] ?? { lines: [], bottom: Infinity, top: -Infinity };

    for (let index = 1; index < line.length; index += 2) {
      bucket.bottom = Math.min(bucket.bottom, line[index] ?? 0);
      bucket.top = Math.max(bucket.top, line[index] ?? 0);
    }

    bucket.lines.push(line);
    buckets[band] = bucket;
  };

  for (const [line, first] of lines.starts.entries()) {
    const end = lines.starts[line + 1] ?? count;
    let band = bandOf(lines.points[2 * first + 1] ?? 0);
    let piece: number[] = [];

    for (let index = first; index < end; index += 1) {
      const x = lines.points[2 * index] ?? 0;
      const y = lines.points[2 * index + 1] ?? 0;
      piece.push(x, y);
      const here = bandOf(y);

      if (here !== band && index < end - 1) {
        add(band, piece);
        band = here;
        piece = [x, y];
      }
    }

    if (piece.length >= 4) add(band, piece);
  }

  const bands: Band[] = [];

  for (const bucket of buckets) {
    if (bucket) bands.push({ ...pack(bucket.lines), bottom: bucket.bottom, top: bucket.top });
  }

  return bands;
}

function wrap(angle: number): number {
  return angle - 2 * Math.PI * Math.round(angle / (2 * Math.PI));
}

// Zeros with 0 < Im s: cells around which the value's direction turns once, then refined by Newton's method.
export function findZeros(grid: Grid, values: Samples, evaluate: (real: number, imaginary: number) => Complex): Complex[] {
  const width = grid.columns + 1;
  const phase = (node: number) => Math.atan2(values[2 * node + 1] ?? 0, values[2 * node] ?? 0);
  const stepX = (grid.right - grid.left) / grid.columns;
  const stepY = (grid.top - grid.bottom) / grid.rows;
  const zeros: Complex[] = [];

  for (let row = 0; row < grid.rows; row += 1) {
    for (let column = 0; column < grid.columns; column += 1) {
      const a = row * width + column;
      const corners = [a, a + 1, a + width + 1, a + width];
      let turn = 0;

      for (let index = 0; index < 4; index += 1) {
        turn += wrap(phase(corners[(index + 1) % 4] ?? a) - phase(corners[index] ?? a));
      }

      if (Math.round(turn / (2 * Math.PI)) !== 1) continue;

      let point: Complex = { re: grid.left + (column + 0.5) * stepX, im: grid.bottom + (row + 0.5) * stepY };

      for (let iteration = 0; iteration < 12; iteration += 1) {
        const value = evaluate(point.re, point.im);
        const h = 1e-6;
        const ahead = evaluate(point.re + h, point.im);
        const slope = { re: (ahead.re - value.re) / h, im: (ahead.im - value.im) / h };
        const size = slope.re * slope.re + slope.im * slope.im;

        if (size === 0) break;

        point = {
          re: point.re - (value.re * slope.re + value.im * slope.im) / size,
          im: point.im - (value.im * slope.re - value.re * slope.im) / size,
        };
      }

      if (point.im > 0 && !zeros.some((zero) => Math.hypot(zero.re - point.re, zero.im - point.im) < 1e-6)) {
        zeros.push(point);
      }
    }
  }

  return zeros.sort((first, second) => first.im - second.im);
}

export function computeMap(id: MapId): MapData {
  const plan = PLANS[id];
  const evaluate = (real: number, imaginary: number) => lValue(plan.character, real, imaginary);
  const values = sample(plan.grid, evaluate);

  return {
    id,
    grid: plan.grid,
    bands: bandsOf(plan.grid, phaseLines(plan.grid, values, plan.directions)),
    rings: plan.rings ? sizeLines(plan.grid, values, RING_LEVELS) : pack([]),
    zeros: plan.zeros ? findZeros(plan.grid, values, evaluate) : [],
  };
}
