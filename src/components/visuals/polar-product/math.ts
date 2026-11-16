export type Point = { x: number; y: number };

export type Polygon = Point[];

export type Matrix2 = readonly [number, number, number, number];

export const PARAMETERS = { seed: 87, cloudTrials: 1500, modulus: 2147483647, multiplier: 16807 } as const;

const SPINE_VERTICES = [
  { x: 1, y: 0 }, { x: .55, y: .8 }, { x: -.35, y: .95 },
  { x: -1, y: 0 }, { x: -.55, y: -.8 }, { x: .35, y: -.95 },
] as const;

const TAU = 2 * Math.PI;

function cross(a: Point, b: Point, c: Point): number {
  return (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x);
}

export function convexHull(points: readonly Point[]): Polygon {
  const sorted = points.map(point => ({ x: point.x, y: point.y })).sort((a, b) => a.x - b.x || a.y - b.y);
  const unique: Polygon = [];

  for (const point of sorted) {
    const previous = unique.at(-1);

    if (!previous || point.x !== previous.x || point.y !== previous.y) unique.push(point);
  }

  if (unique.length < 3) return unique;

  const lower: Polygon = [];
  const upper: Polygon = [];

  for (const point of unique) {
    while (lower.length >= 2) {
      const a = lower.at(-2);
      const b = lower.at(-1);

      if (!a || !b) throw new Error('Each hull turn needs its two preceding points.');
      if (cross(a, b, point) > 1e-12) break;

      lower.pop();
    }

    lower.push(point);
  }

  for (let index = unique.length - 1; index >= 0; index--) {
    const point = unique[index];

    if (!point) throw new Error('Every sorted hull point must exist.');

    while (upper.length >= 2) {
      const a = upper.at(-2);
      const b = upper.at(-1);

      if (!a || !b) throw new Error('Each hull turn needs its two preceding points.');
      if (cross(a, b, point) > 1e-12) break;

      upper.pop();
    }

    upper.push(point);
  }

  lower.pop();
  upper.pop();

  return [...lower, ...upper];
}

function signedArea(polygon: readonly Point[]): number {
  let sum = 0;

  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length];

    if (!b) throw new Error('Each polygon edge needs its endpoint.');

    sum += a.x * b.y - a.y * b.x;
  }

  return sum / 2;
}

export function area(polygon: readonly Point[]): number {
  return Math.abs(signedArea(polygon));
}

export function polar(polygon: readonly Point[]): Polygon {
  if (polygon.length < 3) throw new RangeError('A bounded polar polygon needs a two-dimensional body with the origin inside.');

  const orientation = Math.sign(signedArea(polygon));
  const result: Polygon = [];

  for (const [index, a] of polygon.entries()) {
    const b = polygon[(index + 1) % polygon.length];

    if (!b) throw new Error('Each polar vertex needs its primal edge.');

    const nx = orientation * (b.y - a.y);
    const ny = orientation * (a.x - b.x);
    const support = nx * a.x + ny * a.y;

    if (!(support > 0) || !Number.isFinite(support)) throw new RangeError('Every polygon edge must support a body with the origin strictly inside.');

    result.push({ x: nx / support, y: ny / support });
  }

  return result;
}

export function linearMap(polygon: readonly Point[], matrix: Matrix2): Polygon {
  const [a, b, c, d] = matrix;
  const determinant = a * d - b * c;

  if (!matrix.every(Number.isFinite) || determinant === 0) throw new RangeError('The illustrated linear map must be finite and invertible.');

  const result = polygon.map(point => ({ x: a * point.x + b * point.y, y: c * point.x + d * point.y }));

  if (determinant < 0) result.reverse();

  return result;
}

export function regularPolygon(sides: number, radius = 1): Polygon {
  if (!Number.isInteger(sides) || sides < 3 || !(radius > 0) || !Number.isFinite(radius)) throw new RangeError('A regular polygon needs at least three sides and a finite positive radius.');

  return Array.from({ length: sides }, (_, index) => ({ x: radius * Math.cos(TAU * index / sides), y: radius * Math.sin(TAU * index / sides) }));
}

export function cornerCut(c: number): Polygon {
  if (!Number.isFinite(c) || c < 1 || c > 2) throw new RangeError('The corner-cut family uses 1 ≤ c ≤ 2.');

  const points: Polygon = [];

  for (const sx of [-1, 1]) {
    for (const sy of [-1, 1]) points.push({ x: sx, y: sy * (c - 1) }, { x: sx * (c - 1), y: sy });
  }

  return convexHull(points);
}

export function product(polygon: readonly Point[]): number {
  return area(polygon) * area(polar(polygon));
}

function canonical(polygon: readonly Point[]): Polygon {
  if (polygon.length < 3) throw new RangeError('A convex morph needs two-dimensional polygons.');

  let start = 0;

  for (const [index, point] of polygon.entries()) {
    const current = polygon[start];

    if (!current) throw new Error('A convex polygon needs its first vertex.');
    if (point.y < current.y || point.y === current.y && point.x < current.x) start = index;
  }

  const direction = signedArea(polygon) > 0 ? 1 : -1;

  return Array.from({ length: polygon.length }, (_, index) => {
    const point = polygon[(start + direction * index + polygon.length) % polygon.length];

    if (!point) throw new Error('Every canonical convex vertex must exist.');

    return point;
  });
}

type DirectedEdge = { x: number; y: number; angle: number };

function edges(polygon: readonly Point[]): DirectedEdge[] {
  return polygon.map((point, index) => {
    const next = polygon[(index + 1) % polygon.length];

    if (!next) throw new Error('Each Minkowski edge needs its next vertex.');

    const x = next.x - point.x;
    const y = next.y - point.y;
    const angle = Math.atan2(y, x);

    return { x, y, angle: angle < 0 ? angle + TAU : angle };
  });
}

// This is (1-amount)K + amount L. Merging their ordered edge directions keeps
// the whole path convex, unlike interpolating unrelated radial samples.
export function mixPolygons(from: Polygon, to: Polygon, amount: number): Polygon {
  if (!Number.isFinite(amount) || amount < 0 || amount > 1) throw new RangeError('A convex morph uses an amount between zero and one.');
  if (amount === 0) return from;
  if (amount === 1) return to;

  const a = canonical(from);
  const b = canonical(to);
  const firstA = a[0];
  const firstB = b[0];

  if (!firstA || !firstB) throw new Error('Both Minkowski polygons need a first vertex.');

  const aEdges = edges(a);
  const bEdges = edges(b);
  let ia = 0;
  let ib = 0;
  let current = { x: (1 - amount) * firstA.x + amount * firstB.x, y: (1 - amount) * firstA.y + amount * firstB.y };
  const result = [current];

  while (ia < aEdges.length || ib < bEdges.length) {
    const edgeA = aEdges[ia];
    const edgeB = bEdges[ib];
    const takeA = !!edgeA && (!edgeB || edgeA.angle <= edgeB.angle + 1e-12);
    const takeB = !!edgeB && (!edgeA || edgeB.angle <= edgeA.angle + 1e-12);
    let dx = 0;
    let dy = 0;

    if (takeA && edgeA) {
      dx += (1 - amount) * edgeA.x;
      dy += (1 - amount) * edgeA.y;
      ia++;
    }

    if (takeB && edgeB) {
      dx += amount * edgeB.x;
      dy += amount * edgeB.y;
      ib++;
    }

    current = { x: current.x + dx, y: current.y + dy };

    if (ia < aEdges.length || ib < bEdges.length) result.push(current);
  }

  return result;
}

export function parkMiller(seed: number): () => number {
  if (!Number.isInteger(seed) || seed <= 0 || seed >= PARAMETERS.modulus) throw new RangeError('The portable generator needs a nonzero seed below its modulus.');

  let state = seed;

  return () => {
    state = state * PARAMETERS.multiplier % PARAMETERS.modulus;

    return state / PARAMETERS.modulus;
  };
}

export function generateCloud(seed: number = PARAMETERS.seed, trials: number = PARAMETERS.cloudTrials) {
  if (!Number.isInteger(trials) || trials < 1) throw new RangeError('The polygon cloud needs a positive integer trial count.');

  const random = parkMiller(seed);
  const products: number[] = [];
  const vertexCounts: number[] = [];
  let parallelograms = 0;
  let min = Infinity;
  let max = -Infinity;

  for (let trial = 0; trial < trials; trial++) {
    const count = 2 + Math.floor(6 * random());
    const points: Polygon = [];

    for (let index = 0; index < count; index++) {
      const radius = Math.sqrt(random());
      const angle = TAU * random();
      const x = radius * Math.cos(angle);
      const y = radius * Math.sin(angle);
      points.push({ x, y }, { x: -x, y: -y });
    }

    const polygon = convexHull(points);
    const value = product(polygon);
    products.push(value);
    vertexCounts.push(polygon.length);

    if (polygon.length === 4) parallelograms++;

    min = Math.min(min, value);
    max = Math.max(max, value);
  }

  return { products, vertexCounts, parallelograms, min, max, trials };
}

export function buildPolarModel() {
  const spine = convexHull(SPINE_VERTICES);
  const disk1000 = regularPolygon(1000);
  const hexagon = regularPolygon(6);
  const square = cornerCut(2);
  const cutdata = Array.from({ length: 11 }, (_, index) => {
    const c = 2 - index / 10;
    const polygon = cornerCut(c);
    const dual = polar(polygon);
    const areaK = area(polygon);
    const areaPolar = area(dual);

    return { c, polygon, polar: dual, areaK, areaPolar, product: areaK * areaPolar };
  });

  let factorial = 1;
  const dimensionTable = [1, 2, 3, 4].map(n => {
    factorial *= n;

    return { n, cube: 2 ** n, crossPolytope: 2 ** n / factorial, product: 4 ** n / factorial, productFraction: n <= 2 ? String(4 ** n / factorial) : '32/3', known: n <= 3 };
  });

  return { spine, disk1000, hexagon, square, cutdata, cloud: generateCloud(), dimensionTable };
}

export type PolarModel = ReturnType<typeof buildPolarModel>;
