export type Point = { x: number; y: number };

export type Term = { x: number; y: number; coefficient: number };

export type Curve = readonly Term[];

export type Segment = { from: Point; to: Point };

export const PINS = [
  { x: -0.8, y: 0.5 },
  { x: -0.3, y: 0.85 },
  { x: 0.4, y: 0.7 },
  { x: 0.85, y: 0.2 },
  { x: 0.6, y: -0.55 },
  { x: 0.0, y: -0.8 },
  { x: -0.65, y: -0.4 },
  { x: -0.15, y: 0.1 },
  { x: 0.3, y: -0.15 },
  { x: -0.45, y: -0.05 },
] as const;

// Coefficients were solved over the rationals from the displayed pins, then rounded once.
export const CURVES = {
  conic: [
    { x: 0, y: 0, coefficient: -0.7047844117826432 },
    { x: 0, y: 1, coefficient: -0.31668597914252605 },
    { x: 1, y: 0, coefficient: -0.114572787705068 },
    { x: 0, y: 2, coefficient: 1.359882905409526 },
    { x: 1, y: 1, coefficient: 0.5212538879063243 },
    { x: 2, y: 0, coefficient: 1.0 },
  ],
  cubic: [
    { x: 0, y: 0, coefficient: 0.02963579600268648 },
    { x: 0, y: 1, coefficient: -1.4420866056136024 },
    { x: 1, y: 0, coefficient: -0.7769503003959101 },
    { x: 0, y: 2, coefficient: -0.15601446326580906 },
    { x: 1, y: 1, coefficient: -0.0848425056833868 },
    { x: 2, y: 0, coefficient: -0.14007108896613174 },
    { x: 0, y: 3, coefficient: 2.1161246562567393 },
    { x: 1, y: 2, coefficient: 1.8014031037122662 },
    { x: 2, y: 1, coefficient: 2.4135137989974043 },
    { x: 3, y: 0, coefficient: 1.0 },
  ],
  nodal: [
    { x: 0, y: 0, coefficient: 0.005137535480380083 },
    { x: 0, y: 1, coefficient: -0.3027988155057596 },
    { x: 1, y: 0, coefficient: -0.13439220059005258 },
    { x: 0, y: 2, coefficient: 0.7339332415018343 },
    { x: 1, y: 1, coefficient: -0.40575954280643617 },
    { x: 2, y: 0, coefficient: -0.3820546255163998 },
    { x: 0, y: 3, coefficient: 1.4005739500901595 },
    { x: 1, y: 2, coefficient: -2.1231041197135427 },
    { x: 2, y: 1, coefficient: -0.4694269470970563 },
    { x: 3, y: 0, coefficient: 1.0 },
  ],
} as const;

export const MINIMUM_DEGREES = [4, 7, 10, 13, 16, 20, 23, 26] as const;

export const RANK_PRIME = 67108859;

// Full column rank modulo this prime certifies full rank over Q.
// At each listed first degree, columns exceed conditions, guaranteeing a curve.
export const RANK_CERTIFICATES = [
  { m: 1, excludedDegree: 3, columns: 10, rank: 10, firstDegree: 4, conditions: 10, firstColumns: 15 },
  { m: 2, excludedDegree: 6, columns: 28, rank: 28, firstDegree: 7, conditions: 30, firstColumns: 36 },
  { m: 3, excludedDegree: 9, columns: 55, rank: 55, firstDegree: 10, conditions: 60, firstColumns: 66 },
  { m: 4, excludedDegree: 12, columns: 91, rank: 91, firstDegree: 13, conditions: 100, firstColumns: 105 },
  { m: 5, excludedDegree: 15, columns: 136, rank: 136, firstDegree: 16, conditions: 150, firstColumns: 153 },
  { m: 6, excludedDegree: 19, columns: 210, rank: 210, firstDegree: 20, conditions: 210, firstColumns: 231 },
  { m: 7, excludedDegree: 22, columns: 276, rank: 276, firstDegree: 23, conditions: 280, firstColumns: 300 },
  { m: 8, excludedDegree: 25, columns: 351, rank: 351, firstDegree: 26, conditions: 360, firstColumns: 378 },
] as const;

export function coefficientCount(degree: number): number {
  return (degree + 1) * (degree + 2) / 2;
}

export function pointCost(multiplicity: number): number {
  return multiplicity * (multiplicity + 1) / 2;
}

export function evaluate(curve: Curve, x: number, y: number): number {
  let value = 0;

  for (const term of curve) value += term.coefficient * x ** term.x * y ** term.y;

  return value;
}

export function gradient(curve: Curve, x: number, y: number): Point {
  let dx = 0;
  let dy = 0;

  for (const term of curve) {
    if (term.x > 0) dx += term.coefficient * term.x * x ** (term.x - 1) * y ** term.y;
    if (term.y > 0) dy += term.coefficient * term.y * x ** term.x * y ** (term.y - 1);
  }

  return { x: dx, y: dy };
}

export type Field = (x: number, y: number) => number;

export const PLANE_BOUND = 1.08;

// The centre sign resolves the two ambiguous saddle cases. Adjacent cells share
// the same sampled endpoints, so the cached real zero sets join without cracks.
export function marchingSquares(field: Field, resolution = 160, bound = PLANE_BOUND): Segment[] {
  const segments: Segment[] = [];
  const step = 2 * bound / resolution;
  const values = Array.from({ length: resolution + 1 }, (_, row) =>
    Array.from({ length: resolution + 1 }, (_, column) => field(-bound + column * step, -bound + row * step)));

  for (let row = 0; row < resolution; row++) {
    for (let column = 0; column < resolution; column++) {
      const x = -bound + column * step;
      const y = -bound + row * step;
      const corners = [{ x, y }, { x: x + step, y }, { x: x + step, y: y + step }, { x, y: y + step }];
      const samples = [values[row]?.[column] ?? 0, values[row]?.[column + 1] ?? 0, values[row + 1]?.[column + 1] ?? 0, values[row + 1]?.[column] ?? 0];
      const crossings: Point[] = [];
      let code = 0;

      for (let edge = 0; edge < 4; edge++) {
        const first = samples[edge] ?? 0;
        const second = samples[(edge + 1) % 4] ?? 0;
        const from = corners[edge];
        const to = corners[(edge + 1) % 4];

        if (first > 0) code |= 1 << edge;
        if (!from || !to || (first > 0) === (second > 0)) continue;

        const t = first / (first - second);
        crossings.push({ x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t });
      }

      const append = (a: number, b: number): void => {
        const from = crossings[a];
        const to = crossings[b];

        if (from && to) segments.push({ from, to });
      };

      if (crossings.length === 2) append(0, 1);
      else if (crossings.length === 4) {
        const centerPositive = field(x + step / 2, y + step / 2) > 0;

        if ((code === 5) === centerPositive) {
          append(0, 1);
          append(2, 3);
        } else {
          append(0, 3);
          append(1, 2);
        }
      }
    }
  }

  return segments;
}

export const CURVE_SEGMENTS = {
  conic: marchingSquares((x, y) => evaluate(CURVES.conic, x, y)),
  cubic: marchingSquares((x, y) => evaluate(CURVES.cubic, x, y)),
  nodal: marchingSquares((x, y) => evaluate(CURVES.nodal, x, y)),
};

// Joins the unordered marching-squares segments into ordered pieces. Open pieces start at a loose end.
function chains(segments: readonly Segment[]): Point[][] {
  const key = (point: Point) => `${Math.round(point.x * 1e6)},${Math.round(point.y * 1e6)}`;
  const ends = new Map<string, number[]>();

  for (const [index, segment] of segments.entries()) {
    for (const point of [segment.from, segment.to]) {
      const list = ends.get(key(point));

      if (list) list.push(index);
      else ends.set(key(point), [index]);
    }
  }

  const used = new Set<number>();
  const loose = (point: Point) => ends.get(key(point))?.length === 1;

  const walk = (first: number, start: Point, next: Point): Point[] => {
    const points = [start, next];
    let tail = next;
    used.add(first);

    for (;;) {
      const following = ends.get(key(tail))?.find((index) => !used.has(index));
      const segment = following === undefined ? undefined : segments[following];

      if (following === undefined || !segment) return points;

      used.add(following);
      tail = key(segment.from) === key(tail) ? segment.to : segment.from;
      points.push(tail);
    }
  };

  const pieces: Point[][] = [];

  for (const [index, segment] of segments.entries()) {
    if (used.has(index)) continue;

    if (loose(segment.from)) pieces.push(walk(index, segment.from, segment.to));
    else if (loose(segment.to)) pieces.push(walk(index, segment.to, segment.from));
  }

  for (const [index, segment] of segments.entries()) {
    if (!used.has(index)) pieces.push(walk(index, segment.from, segment.to));
  }

  return pieces;
}

export type CurveRun = { points: readonly Point[]; lengths: readonly number[] };

export function curveRun(points: readonly Point[]): CurveRun {
  const lengths = [0];
  let total = 0;

  for (let index = 1; index < points.length; index++) {
    const before = points[index - 1];
    const point = points[index];

    if (before && point) total += Math.hypot(point.x - before.x, point.y - before.y);

    lengths.push(total);
  }

  return { points, lengths };
}

// How each piece of a curve is drawn in: it starts at the first pin on it, then runs once round a closed
// piece towards its next pin, or both ways out to the frame on an open piece.
export function growthRuns(segments: readonly Segment[], pins: readonly Point[]): CurveRun[][] {
  return chains(segments).map((points) => {
    const first = points[0];
    const last = points[points.length - 1];
    const closed = first !== undefined && last !== undefined && Math.hypot(first.x - last.x, first.y - last.y) < 1e-6;
    const loop = closed ? points.slice(0, -1) : points;

    const onPiece = pins.flatMap((pin) => {
      let nearest = 0;
      let distance = Infinity;

      for (const [index, point] of loop.entries()) {
        const gap = Math.hypot(point.x - pin.x, point.y - pin.y);

        if (gap < distance) {
          nearest = index;
          distance = gap;
        }
      }

      return distance < .02 ? [nearest] : [];
    });

    const start = onPiece[0] ?? Math.floor(loop.length / 2);

    if (!closed) return [curveRun(points.slice(start)), curveRun(points.slice(0, start + 1).reverse())];

    const turned = [...loop.slice(start), ...loop.slice(0, start)];
    const toward = onPiece[1] === undefined ? 0 : (onPiece[1] - start + loop.length) % loop.length;
    const ordered = toward > loop.length / 2 ? [...turned.slice(0, 1), ...turned.slice(1).reverse()] : turned;

    return [curveRun([...ordered, ...ordered.slice(0, 1)])];
  });
}

export type PinchBranches = { oval: readonly Point[]; upper: readonly Point[]; lower: readonly Point[] };

export function pinchValue(x: number, y: number, epsilon: number): number {
  return y * y - x * x * x - x * x - epsilon;
}

function root(epsilon: number, left: number, right: number): number {
  let lo = left;
  let hi = right;
  const first = lo * lo * lo + lo * lo + epsilon;

  for (let iteration = 0; iteration < 48; iteration++) {
    const middle = (lo + hi) / 2;
    const value = middle * middle * middle + middle * middle + epsilon;

    if ((value > 0) === (first > 0)) lo = middle;
    else hi = middle;
  }

  return (lo + hi) / 2;
}

// Analytic branches remain continuous while the oval meets the other branch at
// the node. A cosine sample crowds points near the oval's vertical tangencies.
export function pinchBranches(progress: number, samples = 100): PinchBranches {
  const epsilon = -.06 * (1 - Math.max(0, Math.min(1, progress)));
  const left = epsilon === 0 ? -1 : root(epsilon, -1, -2 / 3);
  const middle = epsilon === 0 ? 0 : root(epsilon, -2 / 3, 0);
  const right = epsilon === 0 ? 0 : root(epsilon, 0, .5);
  const oval: Point[] = [];
  const upper: Point[] = [];
  const lower: Point[] = [];

  for (let index = 0; index <= samples * 2; index++) {
    const angle = Math.PI * index / samples;
    const x = (left + middle) / 2 - (middle - left) / 2 * Math.cos(angle);
    const y = Math.sqrt(Math.max(0, x * x * x + x * x + epsilon)) * (angle <= Math.PI ? 1 : -1);
    oval.push({ x, y });
  }

  for (let index = 0; index <= samples; index++) {
    const x = right + (1.1 - right) * (index / samples) ** 2;
    const y = Math.sqrt(Math.max(0, x * x * x + x * x + epsilon));
    upper.push({ x, y });
    lower.push({ x, y: -y });
  }

  return { oval, upper, lower };
}
