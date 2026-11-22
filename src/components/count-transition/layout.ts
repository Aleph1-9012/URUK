import { decomposeNumberSigns } from '../number-signs/decompose';

export type SignUnit = 60 | 10 | 1;

/** A sign's box in case units, measured from the case's top left. */
export interface PlacedSign {
  unit: SignUnit;
  x: number;
  y: number;
  width: number;
  height: number;
  /** The row of the case it belongs to, counted across all clusters in reading order. */
  row: number;
}

export interface CountLayout {
  width: number;
  height: number;
  signs: PlacedSign[];
}

// The 404 tablet's sign sizes and spacing: a case unit is one of its desktop pixels.
const signs = {
  60: { width: 52, height: 42, column: 58, row: 47 },
  10: { width: 35.7, height: 35.7, column: 42, row: 41 },
  1: { width: 38.25, height: 29.75, column: 43, row: 35 },
} as const;

const units: SignUnit[] = [60, 10, 1];
const padding = { x: 24, y: 20 };
const clusterGap = 20;

// A hand pressing signs does not land them on a grid: each sign drifts by up to 1.3 units, the same on every visit.
function drift(index: number): [number, number] {
  return [1.3 * Math.sin(2.4 * index + 0.7), 1.3 * Math.sin(3.7 * index + 1.9)];
}

/** One row up to three signs, then two rows with the longer one on top, as on the tablets. */
export function signRows(count: number): number[] {
  if (count === 0) return [];
  if (count <= 3) return [count];

  return [Math.ceil(count / 2), Math.floor(count / 2)];
}

/** The family number counted in sixties, tens and ones, highest first, left to right. */
export function countLayout(family: number): CountLayout {
  const counts = decomposeNumberSigns(family);
  const clusters = units.flatMap((unit) => {
    const rows = signRows(unit === 60 ? counts.sixties : unit === 10 ? counts.tens : counts.ones);
    const size = signs[unit];

    if (rows.length === 0) return [];

    return [{
      unit,
      rows,
      width: (Math.max(...rows) - 1) * size.column + size.width,
      height: (rows.length - 1) * size.row + size.height,
    }];
  });
  const inner = Math.max(...clusters.map((cluster) => cluster.height));
  const placed: PlacedSign[] = [];
  let left = padding.x;
  let row = 0;

  for (const cluster of clusters) {
    const size = signs[cluster.unit];
    const top = padding.y + (inner - cluster.height) / 2;

    for (const [line, length] of cluster.rows.entries()) {
      for (let column = 0; column < length; column += 1) {
        const [dx, dy] = drift(placed.length);

        placed.push({
          unit: cluster.unit,
          x: left + column * size.column + dx,
          y: top + line * size.row + dy,
          width: size.width,
          height: size.height,
          row,
        });
      }

      row += 1;
    }

    left += cluster.width + clusterGap;
  }

  return {
    width: left - clusterGap + padding.x,
    height: inner + 2 * padding.y,
    signs: placed,
  };
}

/**
 * When each sign is pressed, in ms after the first. A wide screen counts sign by sign, never faster than two frames
 * a sign; a phone presses a row at a time.
 */
export function pressTimes(layout: CountLayout): { wide: number[]; phone: number[] } {
  const beat = Math.min(60, Math.max(33, 440 / layout.signs.length));

  return {
    wide: layout.signs.map((_, index) => Math.round(index * beat)),
    phone: layout.signs.map((sign) => sign.row * 45),
  };
}
