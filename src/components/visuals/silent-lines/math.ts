import {
  DRAWN_MODES, GROWTH_ANGLES, GROWTH_RADII, GROWTH_RATIO, OFFSET_X, OFFSET_Y,
  REFERENCE_GRID, SCATTER, type Mode, type ModeReference,
} from './data';

export type { Mode, ModeSign, ModeReference, ScatterRow } from './data';

export type Point = { x: number; y: number };

export type Contour = {
  mode: Mode;
  grid: number;
  /** Flat ax,ay,bx,by records, in plate coordinates. */
  segments: Float64Array;
  /** Connected xy polylines, with the first point repeated on a closed path. */
  paths: Float64Array[];
  length: number;
};

type Crossing = Point & { key: number };

const REFERENCES = new Map<string, ModeReference>();

function modeKey(mode: Mode): string {
  return `${mode.m},${mode.n},${mode.sign}`;
}

export function modeValue(mode: Mode, x: number, y: number): number {
  const first = Math.cos(mode.m * Math.PI * x) * Math.cos(mode.n * Math.PI * y);

  if (mode.sign === 0) return first;

  return first + mode.sign * Math.cos(mode.n * Math.PI * x) * Math.cos(mode.m * Math.PI * y);
}

export function modeGradient(mode: Mode, x: number, y: number): Point {
  const m = mode.m * Math.PI;
  const n = mode.n * Math.PI;

  return {
    x: -m * Math.sin(m * x) * Math.cos(n * y) - mode.sign * n * Math.sin(n * x) * Math.cos(m * y),
    y: -n * Math.cos(m * x) * Math.sin(n * y) - mode.sign * m * Math.cos(n * x) * Math.sin(m * y),
  };
}

export function frequency(mode: Mode): number {
  return Math.PI * Math.hypot(mode.m, mode.n);
}

export function measuredRatio(mode: Mode, length: number): number {
  return length / frequency(mode);
}

function analyticContour(mode: Mode, grid: number): Contour | undefined {
  const paths: Float64Array[] = [];

  if (mode.sign === 0) {
    for (let zero = 0; zero < mode.m; zero++) {
      const x = (zero + .5) / mode.m;
      paths.push(new Float64Array([x, 0, x, 1]));
    }

    for (let zero = 0; zero < mode.n; zero++) {
      const y = (zero + .5) / mode.n;
      paths.push(new Float64Array([0, y, 1, y]));
    }
  } else if (mode.m + mode.n === 1) {
    paths.push(new Float64Array(mode.sign === -1 ? [0, 0, 1, 1] : [0, 1, 1, 0]));
  } else {
    return;
  }

  const segments = new Float64Array(paths.length * 4);
  let length = 0;

  for (const [index, path] of paths.entries()) {
    segments.set(path, index * 4);
    length += Math.hypot((path[2] ?? 0) - (path[0] ?? 0), (path[3] ?? 0) - (path[1] ?? 0));
  }

  return { mode, grid, segments, paths, length };
}

function connectedPaths(ends: readonly (readonly [number, number])[], points: ReadonlyMap<number, Point>): Float64Array[] {
  const adjacency = new Map<number, number[]>();

  for (const [index, edge] of ends.entries()) {
    for (const key of edge) {
      const incident = adjacency.get(key);

      if (incident) incident.push(index);
      else adjacency.set(key, [index]);
    }
  }

  const paths: Float64Array[] = [];
  const used = new Uint8Array(ends.length);
  const trace = (start: number): void => {
    const coordinates: number[] = [];
    let current = start;

    while (true) {
      const point = points.get(current);

      if (!point) break;

      coordinates.push(point.x, point.y);
      const index = adjacency.get(current)?.find(edge => !used[edge]);

      if (index === undefined) break;

      const edge = ends[index];

      if (!edge) break;

      used[index] = 1;
      current = edge[0] === current ? edge[1] : edge[0];
    }

    if (coordinates.length >= 4) paths.push(Float64Array.from(coordinates));
  };

  for (const [point, incident] of adjacency) {
    if (incident.length === 1 && !used[incident[0] ?? -1]) trace(point);
  }

  for (const [index, edge] of ends.entries()) {
    if (!used[index]) trace(edge[0]);
  }

  return paths;
}

/** Offset marching squares, matching the reference midpoint inclusion and four-edge decider. */
export function computeContour(mode: Mode, grid = REFERENCE_GRID): Contour {
  if (!Number.isInteger(grid) || grid < 2) throw new RangeError('A contour grid needs at least two cells.');
  if (!Number.isInteger(mode.m) || !Number.isInteger(mode.n) || mode.m < 0 || mode.n < 0 || mode.m + mode.n === 0 || mode.sign === -1 && mode.m === mode.n) throw new RangeError('Use a nonzero Laplace mode with nonnegative integer frequencies.');

  const exact = analyticContour(mode, grid);

  if (exact) return exact;

  const nodes = grid + 2;
  const h = 1 / grid;
  const mx = new Float64Array(nodes);
  const nx = new Float64Array(nodes);
  const my = new Float64Array(nodes);
  const ny = new Float64Array(nodes);

  for (let index = 0; index < nodes; index++) {
    const x = (index - 1 + OFFSET_X) / grid;
    const y = (index - 1 + OFFSET_Y) / grid;
    mx[index] = Math.cos(mode.m * Math.PI * x);
    nx[index] = Math.cos(mode.n * Math.PI * x);
    my[index] = Math.cos(mode.m * Math.PI * y);
    ny[index] = Math.cos(mode.n * Math.PI * y);
  }

  const field = new Float64Array(nodes * nodes);

  for (let x = 0; x < nodes; x++) {
    for (let y = 0; y < nodes; y++) field[x * nodes + y] = (mx[x] ?? 0) * (ny[y] ?? 0) + mode.sign * (nx[x] ?? 0) * (my[y] ?? 0);
  }

  const coordinates: number[] = [];
  const ends: [number, number][] = [];
  const points = new Map<number, Point>();
  let length = 0;
  const append = (a: Crossing, b: Crossing): void => {
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;

    if (midX < 0 || midX >= 1 || midY < 0 || midY >= 1) return;

    coordinates.push(a.x, a.y, b.x, b.y);
    ends.push([a.key, b.key]);
    points.set(a.key, a);
    points.set(b.key, b);
    length += Math.hypot(b.x - a.x, b.y - a.y);
  };

  for (let i = 0; i <= grid; i++) {
    for (let j = 0; j <= grid; j++) {
      const f00 = field[i * nodes + j] ?? 0;
      const f10 = field[(i + 1) * nodes + j] ?? 0;
      const f01 = field[i * nodes + j + 1] ?? 0;
      const f11 = field[(i + 1) * nodes + j + 1] ?? 0;
      const x = (i - 1 + OFFSET_X) / grid;
      const y = (j - 1 + OFFSET_Y) / grid;
      const bottom = f00 * f10 < 0 ? { key: 2 * (i * nodes + j), x: x + f00 / (f00 - f10) * h, y } : undefined;
      const top = f01 * f11 < 0 ? { key: 2 * (i * nodes + j + 1), x: x + f01 / (f01 - f11) * h, y: y + h } : undefined;
      const left = f00 * f01 < 0 ? { key: 2 * (i * nodes + j) + 1, x, y: y + f00 / (f00 - f01) * h } : undefined;
      const right = f10 * f11 < 0 ? { key: 2 * ((i + 1) * nodes + j) + 1, x: x + h, y: y + f10 / (f10 - f11) * h } : undefined;

      if (!bottom && !top && !left && !right) continue;

      if (bottom && top && left && right) {
        const same = Math.sign((f00 + f10 + f11 + f01) / 4) === Math.sign(f00);

        if (same) {
          append(bottom, right);
          append(top, left);
        } else {
          append(bottom, left);
          append(top, right);
        }
      } else {
        const crossings: Crossing[] = [];

        if (bottom) crossings.push(bottom);
        if (top) crossings.push(top);
        if (left) crossings.push(left);
        if (right) crossings.push(right);

        if (crossings.length === 2 && crossings[0] && crossings[1]) append(crossings[0], crossings[1]);
      }
    }
  }

  return { mode, grid, segments: Float64Array.from(coordinates), paths: connectedPaths(ends, points), length };
}

/** The polar midpoint quadrature uses unnormalized disk integrals, as in the paper. */
export function growthAt(mode: Mode, q: number, xCell: number, yCell: number, R = GROWTH_RATIO, nr = GROWTH_RADII, nt = GROWTH_ANGLES): number {
  const centre = { x: (xCell + .5) / q, y: (yCell + .5) / q };
  const normSquared = (radius: number): number => {
    let integral = 0;

    for (let radial = 0; radial < nr; radial++) {
      const r = (radial + .5) / nr * radius;

      for (let angular = 0; angular < nt; angular++) {
        const angle = (angular + .5) / nt * Math.PI * 2;
        const value = modeValue(mode, centre.x + r * Math.cos(angle), centre.y + r * Math.sin(angle));
        integral += value * value * r;
      }
    }

    return integral * (radius / nr) * (Math.PI * 2 / nt);
  };

  return Math.log(normSquared(R / q) / normSquared(1 / q)) / 2;
}

/** The symmetric polar rule integrates the cosine expansion once per disk, then translates it to every square. */
function growthGrid(mode: Mode, q: number): Float64Array {
  const diskKernel = (radius: number): ((a: number, b: number) => number) => {
    const kernels = new Map<string, number>();

    return (a: number, b: number): number => {
      const key = `${Math.min(Math.abs(a), Math.abs(b))},${Math.max(Math.abs(a), Math.abs(b))}`;
      const previous = kernels.get(key);

      if (previous !== undefined) return previous;

      let integral = 0;

      for (let radial = 0; radial < GROWTH_RADII; radial++) {
        const r = (radial + .5) / GROWTH_RADII * radius;

        for (let angular = 0; angular < GROWTH_ANGLES; angular++) {
          const angle = (angular + .5) / GROWTH_ANGLES * Math.PI * 2;
          integral += Math.cos(a * Math.PI * r * Math.cos(angle)) * Math.cos(b * Math.PI * r * Math.sin(angle)) * r;
        }
      }

      const result = integral * (radius / GROWTH_RADII) * (Math.PI * 2 / GROWTH_ANGLES);
      kernels.set(key, result);

      return result;
    };
  };
  const norms = (radius: number): Float64Array => {
    const kernel = diskKernel(radius);
    const area = kernel(0, 0);
    const mAxis = kernel(2 * mode.m, 0);
    const nAxis = kernel(2 * mode.n, 0);
    const product = kernel(2 * mode.m, 2 * mode.n);
    const difference = mode.m - mode.n;
    const sum = mode.m + mode.n;
    const low = kernel(difference, difference);
    const mixed = kernel(difference, sum);
    const high = kernel(sum, sum);
    const result = new Float64Array(q * q);

    for (let x = 0; x < q; x++) {
      const cx = (x + .5) / q * Math.PI;

      for (let y = 0; y < q; y++) {
        const cy = (y + .5) / q * Math.PI;
        const mx = Math.cos(2 * mode.m * cx);
        const nx = Math.cos(2 * mode.n * cx);
        const my = Math.cos(2 * mode.m * cy);
        const ny = Math.cos(2 * mode.n * cy);
        const first = (area + mx * mAxis + ny * nAxis + mx * ny * product) / 4;
        const second = mode.sign ** 2 * (area + nx * nAxis + my * mAxis + nx * my * product) / 4;
        const dx = Math.cos(difference * cx);
        const sx = Math.cos(sum * cx);
        const dy = Math.cos(difference * cy);
        const sy = Math.cos(sum * cy);
        const cross = mode.sign / 2 * (dx * dy * low + (dx * sy + sx * dy) * mixed + sx * sy * high);
        result[x * q + y] = first + second + cross;
      }
    }

    return result;
  };
  const small = norms(1 / q);
  const large = norms(GROWTH_RATIO / q);
  const growth = new Float64Array(q * q);

  for (let index = 0; index < growth.length; index++) growth[index] = Math.log((large[index] ?? 0) / (small[index] ?? 0)) / 2;

  return growth;
}

/** Seed the renderer's cache with a trusted measurement delivered by its own worker. */
export function cacheReference(reference: ModeReference): void {
  REFERENCES.set(modeKey(reference.mode), reference);
}

export function referenceFor(mode: Mode, contour?: Contour): ModeReference {
  const existing = REFERENCES.get(modeKey(mode));

  if (existing) return existing;

  if (!DRAWN_MODES.some(row => row.m === mode.m && row.n === mode.n && row.sign === mode.sign)) throw new RangeError('Growth is measured for the six drawn modes.');
  if (contour && modeKey(contour.mode) !== modeKey(mode)) throw new RangeError('A measured contour must use the selected mode.');

  const lines = contour ?? computeContour(mode);
  const k = frequency(mode);
  const q = Math.ceil(k);
  const growth = growthGrid(mode, q);
  const perSquareLength = perSquareLengths(lines, q);
  let growthMin = Infinity;
  let growthMax = -Infinity;
  let total = 0;
  let argmin = 0;
  let argmax = 0;
  let localBound = 0;

  for (const [index, E] of growth.entries()) {
    total += E;
    localBound = Math.max(localBound, (perSquareLength[index] ?? 0) * q / (1 + E));

    // Reflection-related extrema tie mathematically; retain the first cell at numerical precision.
    if (E < growthMin - 1e-10) {
      argmin = index;
    }

    if (E > growthMax + 1e-10) {
      argmax = index;
    }

    growthMin = Math.min(growthMin, E);
    growthMax = Math.max(growthMax, E);
  }

  const growthMean = total / growth.length;
  let highSquares = 0;

  for (const E of growth) highSquares += Number(E > growthMean + 1);

  const reference: ModeReference = {
    mode, k, length: lines.length, q, growth, perSquareLength, growthMin, growthMean, growthMax,
    growthArgmin: [Math.floor(argmin / q), argmin % q],
    growthArgmax: [Math.floor(argmax / q), argmax % q],
    highSquares, localBound, totalBound: localBound * q * (1 + growthMean),
  };
  cacheReference(reference);

  return reference;
}

export function growthCell(mode: Mode, x: number, y: number): { centre: Point; E: number; length: number } {
  const reference = referenceFor(mode);
  const index = x * reference.q + y;
  const E = reference.growth[index];
  const length = reference.perSquareLength[index];

  if (E === undefined || length === undefined) throw new RangeError('The selected square must lie in the growth grid.');

  return { centre: { x: (x + .5) / reference.q, y: (y + .5) / reference.q }, E, length };
}

export function perSquareLengths(contour: Contour, q: number): Float64Array {
  const lengths = new Float64Array(q * q);

  for (let index = 0; index < contour.segments.length; index += 4) {
    const ax = contour.segments[index] ?? 0;
    const ay = contour.segments[index + 1] ?? 0;
    const bx = contour.segments[index + 2] ?? 0;
    const by = contour.segments[index + 3] ?? 0;
    const pieces = Math.max(1, Math.ceil(Math.max(Math.abs(bx - ax), Math.abs(by - ay)) * q));

    for (let piece = 0; piece < pieces; piece++) {
      const position = (piece + .5) / pieces;
      const x = Math.min(q - 1, Math.floor((ax + (bx - ax) * position) * q));
      const y = Math.min(q - 1, Math.floor((ay + (by - ay) * position) * q));
      const cell = x * q + y;
      lengths[cell] = (lengths[cell] ?? 0) + Math.hypot(bx - ax, by - ay) / pieces;
    }
  }

  return lengths;
}

export function wedgeBounds(): { lower: number; upper: number; upperMode: Mode } {
  let upper = 0;
  let upperMode: Mode = { m: 0, n: 1, sign: 0 };

  for (const [m, n, sign, k, length] of SCATTER) {
    if (length / k > upper) {
      upper = length / k;
      upperMode = { m, n, sign };
    }
  }

  return { lower: 1 / Math.PI, upper, upperMode };
}
