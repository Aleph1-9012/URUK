export type Point = { x: number; y: number };

export type Point3 = Point & { z: number };

export type Matrix = number[][];

export type DiscCut = {
  normal: Point;
  direction: Point;
  offset: number;
  chord: [Point, Point];
  witness: { a: Point; b: Point; rimIndices: [number, number] | null; side: 'lower' | 'upper'; margin: number };
};

export const RING_ANGLES_DEGREES = [0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165] as const;

export const RING_ANGLES = RING_ANGLES_DEGREES.map(angle => angle * Math.PI / 180);

export const RIM_POINTS = [
  ...RING_ANGLES.map(theta => ({ x: Math.cos(theta), y: Math.sin(theta) })),
  ...RING_ANGLES.map(theta => ({ x: -Math.cos(theta), y: -Math.sin(theta) })),
];

function unitVector(input: readonly number[]): number[] {
  if (input.length === 0 || input.some(value => !Number.isFinite(value))) throw new RangeError('A projector line needs a finite nonzero vector.');

  const norm = Math.hypot(...input);

  if (!(norm > 0) || !Number.isFinite(norm)) throw new RangeError('A projector line needs a finite positive vector norm.');

  return input.map(value => value / norm);
}

export function projector(input: readonly number[]): Matrix {
  const vector = unitVector(input);

  return vector.map(a => vector.map(b => a * b));
}

export function frobeniusDistance(a: readonly (readonly number[])[], b: readonly (readonly number[])[]): number {
  if (a.length !== b.length || a.some(row => row.length !== a.length) || b.some(row => row.length !== b.length)) throw new RangeError('Frobenius distance needs square matrices of the same order.');

  let squared = 0;

  for (let row = 0; row < a.length; row++) {
    const left = a[row];
    const right = b[row];

    if (!left || !right) throw new Error('Each matrix distance needs both rows.');

    for (let column = 0; column < a.length; column++) {
      const x = left[column];
      const y = right[column];

      if (x === undefined || y === undefined) throw new Error('Each matrix distance needs both entries.');

      squared += (x - y) ** 2;
    }
  }

  return Math.sqrt(squared);
}

export function angleBetweenLines(u: readonly number[], v: readonly number[]): number {
  if (u.length !== v.length) throw new RangeError('Both lines must belong to the same vector space.');

  const first = unitVector(u);
  const second = unitVector(v);
  let product = 0;

  for (const [index, value] of first.entries()) {
    const other = second[index];

    if (other === undefined) throw new Error('The line angle needs all coordinates of both unit vectors.');

    product += value * other;
  }

  return Math.acos(Math.min(1, Math.max(0, Math.abs(product))));
}

export function lineDistance(theta: number): number {
  if (!Number.isFinite(theta)) throw new RangeError('The projector distance needs a finite angle in radians.');

  return Math.SQRT2 * Math.abs(Math.sin(theta));
}

export function projectorCirclePoint(theta: number): Point {
  if (!Number.isFinite(theta)) throw new RangeError('The projector circle needs a finite line angle in radians.');

  return { x: Math.cos(2 * theta) / Math.SQRT2, y: Math.sin(2 * theta) / Math.SQRT2 };
}

export function sectorDiameter(opening: number, radius = 1): number {
  if (!Number.isFinite(opening) || opening < 0 || opening > 2 * Math.PI || !Number.isFinite(radius) || radius <= 0) throw new RangeError('A closed disc sector needs an opening from zero to2π and a positive finite radius.');

  return radius * Math.max(1, 2 * Math.sin(Math.min(opening, Math.PI) / 2));
}

export function discCut(phi: number, offset: number): DiscCut {
  if (!Number.isFinite(phi) || !Number.isFinite(offset) || Math.abs(offset) > 1) throw new RangeError('A unit-disc cut needs a finite normal angle and an offset in[-1,1].');

  const normal = { x: Math.cos(phi), y: Math.sin(phi) };
  const direction = { x: -normal.y, y: normal.x };
  const halfChord = Math.sqrt(Math.max(0, 1 - offset ** 2));
  const center = { x: offset * normal.x, y: offset * normal.y };
  let best = 0;
  let smallest = Infinity;

  for (let index = 0; index < 12; index++) {
    const point = RIM_POINTS[index];

    if (!point) throw new Error('Every disc witness candidate needs its carried rim point.');

    const projection = Math.abs(point.x * normal.x + point.y * normal.y);

    if (projection < smallest) {
      smallest = projection;
      best = index;
    }
  }

  let a = direction;
  let b = { x: -direction.x, y: -direction.y };
  let rimIndices: [number, number] | null = null;
  let margin = Math.abs(offset);

  if (smallest <= Math.abs(offset)) {
    const first = RIM_POINTS[best];
    const second = RIM_POINTS[best + 12];

    if (!first || !second) throw new Error('The selected disc witness needs both opposite carried rim points.');

    a = first;
    b = second;
    rimIndices = [best, best + 12];
    margin -= smallest;
  }

  return {
    normal,
    direction,
    offset,
    chord: [
      { x: center.x + halfChord * direction.x, y: center.y + halfChord * direction.y },
      { x: center.x - halfChord * direction.x, y: center.y - halfChord * direction.y },
    ],
    witness: { a, b, rimIndices, side: offset >= 0 ? 'lower' : 'upper', margin },
  };
}

export function traceOneDimension(k: number): number {
  if (!Number.isInteger(k) || k < 1) throw new RangeError('The symmetric matrix order must be a positive integer.');

  return k * (k + 1) / 2 - 1;
}

export function orthogonalSimplex() {
  const axes = Array.from({ length: 4 }, (_, axis) => Array.from({ length: 4 }, (_, coordinate) => coordinate === axis ? 1 : 0));
  const projectors = axes.map(projector);
  const vertices: Point3[] = [{ x: .5, y: .5, z: .5 }, { x: .5, y: -.5, z: -.5 }, { x: -.5, y: .5, z: -.5 }, { x: -.5, y: -.5, z: .5 }];
  const edges: { a: number; b: number; distance: number }[] = [];

  for (let a = 0; a < projectors.length; a++) {
    for (let b = a + 1; b < projectors.length; b++) {
      const first = projectors[a];
      const second = projectors[b];

      if (!first || !second) throw new Error('Each simplex edge needs both axis projectors.');

      edges.push({ a, b, distance: frobeniusDistance(first, second) });
    }
  }

  return { axes, projectors, vertices, edges, affineDimension: 3, ambientDimension: traceOneDimension(4) };
}

export function buildProjectorModel() {
  return {
    rim: RIM_POINTS,
    ring: RING_ANGLES.map(theta => {
      const vector = [Math.cos(theta), Math.sin(theta), 0, 0];

      return { theta, vector, projector: projector(vector), point: projectorCirclePoint(theta) };
    }),
    sectors: Array.from({ length: 3 }, (_, index) => ({ start: index * 2 * Math.PI / 3, end: (index + 1) * 2 * Math.PI / 3, diameter: sectorDiameter(2 * Math.PI / 3) })),
    dimensions: [2, 3, 4].map(k => ({ k, ambient: traceOneDimension(k), intrinsic: k - 1 })),
    simplex: orthogonalSimplex(),
    diameter: Math.SQRT2,
  };
}
