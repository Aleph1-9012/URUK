import { COLUMN_FIXTURE, POOL26 } from './data';

export type Point = { x: number; y: number };

export type Triple = readonly [number, number, number];

export type Triangle = { triple: Triple; determinant: number; area: number };

export type IntegerColumn = readonly [number, number, number];

export type ColumnTriple = readonly [IntegerColumn, IntegerColumn, IntegerColumn];

export type Alteration = {
  threshold: number;
  smallTriangles: Triple[];
  deletedIndices: number[];
  deletionOrder: number[];
  survivorIndices: number[];
  survivors: Point[];
};

export const BOUND_EXPONENTS = {
  heilbronn: -2,
  roth: -1,
  kps1981: -8 / 7,
  cpz2023: -8 / 7 - 1 / 2000,
  cpz2025: -7 / 6,
} as const;

export function triangleDeterminant(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function triangleArea(a: Point, b: Point, c: Point): number {
  return Math.abs(triangleDeterminant(a, b, c)) / 2;
}

/** Strict improvement preserves lexicographic order among exactly equal areas. */
export function smallestTriangle(points: readonly Point[]): Triangle {
  if (points.length < 3) throw new RangeError('A triangle needs at least three points.');

  let best: Triple = [0, 1, 2];
  let bestDeterminant = 0;
  let bestArea = Infinity;

  for (let i = 0; i < points.length - 2; i++) {
    for (let j = i + 1; j < points.length - 1; j++) {
      for (let k = j + 1; k < points.length; k++) {
        const a = points[i];
        const b = points[j];
        const c = points[k];

        if (!a || !b || !c) continue;

        const determinant = triangleDeterminant(a, b, c);
        const area = Math.abs(determinant) / 2;

        if (area < bestArea) {
          best = [i, j, k];
          bestDeterminant = determinant;
          bestArea = area;
        }
      }
    }
  }

  return { triple: best, determinant: bestDeterminant, area: bestArea };
}

export function gridSites(count = 13, side = 4): Point[] {
  return Array.from({ length: count }, (_, index) => ({ x: (index % side + .5) / side, y: (Math.floor(index / side) + .5) / side }));
}

export function integerParabola(prime = 13): Point[] {
  return Array.from({ length: prime }, (_, x) => ({ x, y: x * x % prime }));
}

export function parabolaPoints(prime = 13): Point[] {
  return integerParabola(prime).map(point => ({ x: point.x / prime, y: point.y / prime }));
}

/** Keep the integer tie before scaling; determinant is unscaled, while area is in the unit square. */
export function parabolaMinimum(prime = 13): Triangle & { numerator: number; denominator: number } {
  const minimum = smallestTriangle(integerParabola(prime));
  const numerator = Math.abs(minimum.determinant);
  const denominator = 2 * prime * prime;

  return { triple: minimum.triple, determinant: minimum.determinant, area: numerator / denominator, numerator, denominator };
}

/** Assign each carried point its nearest as-yet unassigned target, ties by index. */
export function nearestFreeMatch(from: readonly Point[], targets: readonly Point[]): number[] {
  if (from.length > targets.length) throw new RangeError('Each carried point needs a free target.');

  const used = new Uint8Array(targets.length);
  const assignment: number[] = [];

  for (const point of from) {
    let best = -1;
    let distance = Infinity;

    for (const [index, target] of targets.entries()) {
      if (used[index]) continue;

      const next = (point.x - target.x) ** 2 + (point.y - target.y) ** 2;

      if (next < distance) {
        best = index;
        distance = next;
      }
    }

    if (best < 0) throw new RangeError('Every carried point needs a finite target.');

    used[best] = 1;
    assignment.push(best);
  }

  return assignment;
}

export function interpolatePoints(from: readonly Point[], to: readonly Point[], amount: number): Point[] {
  if (from.length !== to.length) throw new RangeError('A carried point needs one destination.');

  return from.map((point, index) => {
    const target = to[index];

    if (!target) throw new RangeError('A carried point needs one destination.');

    return { x: point.x + (target.x - point.x) * amount, y: point.y + (target.y - point.y) * amount };
  });
}

/** Original bad-triple incidence counts stay fixed throughout the deletion. */
export function alteration(points: readonly Point[] = POOL26, threshold = 1 / (2 * 13 ** 2)): Alteration {
  const smallTriangles: Triple[] = [];
  const incident = new Uint16Array(points.length);

  for (let i = 0; i < points.length - 2; i++) {
    for (let j = i + 1; j < points.length - 1; j++) {
      for (let k = j + 1; k < points.length; k++) {
        const a = points[i];
        const b = points[j];
        const c = points[k];

        if (!a || !b || !c || triangleArea(a, b, c) >= threshold) continue;

        smallTriangles.push([i, j, k]);
        incident[i] = (incident[i] ?? 0) + 1;
        incident[j] = (incident[j] ?? 0) + 1;
        incident[k] = (incident[k] ?? 0) + 1;
      }
    }
  }

  const deleted = new Uint8Array(points.length);
  const deletionOrder: number[] = [];

  for (const triple of smallTriangles) {
    if (triple.some(vertex => deleted[vertex])) continue;

    let selected = triple[0];

    for (const vertex of triple) {
      const next = incident[vertex] ?? 0;
      const best = incident[selected] ?? 0;

      if (next > best || next === best && vertex > selected) selected = vertex;
    }

    deleted[selected] = 1;
    deletionOrder.push(selected);
  }

  const deletedIndices: number[] = [];
  const survivorIndices: number[] = [];
  const survivors: Point[] = [];

  for (const [index, point] of points.entries()) {
    if (deleted[index]) deletedIndices.push(index);
    else {
      survivorIndices.push(index);
      survivors.push(point);
    }
  }

  return { threshold, smallTriangles, deletedIndices, deletionOrder, survivorIndices, survivors };
}

export function projectedColumnPoints(columns: readonly IntegerColumn[] = COLUMN_FIXTURE): Point[] {
  return columns.map(([x, y, denominator]) => ({ x: x / denominator, y: y / denominator }));
}

export function columnDeterminant(columns: ColumnTriple = COLUMN_FIXTURE): number {
  const [a, b, c] = columns;

  return a[0] * (b[1] * c[2] - c[1] * b[2]) - b[0] * (a[1] * c[2] - c[1] * a[2]) + c[0] * (a[1] * b[2] - b[1] * a[2]);
}

export function columnArea(columns: ColumnTriple = COLUMN_FIXTURE): { determinant: number; numerator: number; denominator: number; area: number } {
  const determinant = columnDeterminant(columns);
  const rawNumerator = Math.abs(determinant);
  const rawDenominator = 2 * columns[0][2] * columns[1][2] * columns[2][2];
  let a = rawNumerator;
  let b = rawDenominator;

  while (b !== 0) [a, b] = [b, a % b];

  const divisor = a || 1;

  return { determinant, numerator: rawNumerator / divisor, denominator: rawDenominator / divisor, area: rawNumerator / rawDenominator };
}

function binomial(n: bigint, count: number): bigint {
  let result = 1n;

  for (let index = 1; index <= count; index++) result = result * (n - BigInt(index) + 1n) / BigInt(index);

  return result;
}

export function etaParameters(): { M: bigint; T: bigint; k: bigint; numerator: bigint; denominator: bigint; value: number; digitsForTwo: number; digitsToBeatLog: number } {
  const M = binomial(163n, 41);
  const T = binomial(M, 3);
  const k = T * T + 1n;
  const denominator = 45435n * k + 16n;
  const value = 2 / Number(denominator);
  const digitsForTwo = Math.log10(2) / value;
  let logN = 1 / value;

  for (let iteration = 0; iteration < 50; iteration++) logN = Math.log(logN) / value;

  return { M, T, k, numerator: 2n, denominator, value, digitsForTwo, digitsToBeatLog: logN / Math.LN10 };
}

export const ETA = etaParameters();
