// Canonical 237-checks/saw.json, with rounded coordinates recovered as exact lattice vertices.
// Subwalk starts come from the same seed-237 run, instrumented without consuming extra randomness.
import data from './data.json';

export type Point = { x: number; y: number };

export type Vertex = { i: number; j: number; sub: 0 | 1 };

export type Crossing = { bottom: number; top: number; startIndex: number; endIndex: number; points: Point[] };

export const MU = Math.sqrt(2 + Math.sqrt(2));

export const RHO = 1 / MU;

const ROOT_THREE = Math.sqrt(3);

const DIRECTIONS = Array.from({ length: 90 }, (_, index) => ({ x: Math.cos(index * Math.PI / 90), y: Math.sin(index * Math.PI / 90) }));

export function position(vertex: Vertex): Point {
  return { x: 1.5 * vertex.i + vertex.sub, y: ROOT_THREE * (vertex.i / 2 + vertex.j) };
}

export function neighbours(vertex: Vertex): Vertex[] {
  const { i, j, sub } = vertex;

  return sub === 0
    ? [{ i, j, sub: 1 }, { i: i - 1, j, sub: 1 }, { i: i - 1, j: j + 1, sub: 1 }]
    : [{ i, j, sub: 0 }, { i: i + 1, j, sub: 0 }, { i: i + 1, j: j - 1, sub: 0 }];
}

export function snap(point: Point): Vertex {
  for (const sub of [0, 1] as const) {
    const i = Math.round((point.x - sub) / 1.5);
    const j = Math.round(point.y / ROOT_THREE - i / 2);
    const candidate = { i, j, sub };
    const exact = position(candidate);

    // The reference rounds coordinates to four decimals; lattice vertices are a unit apart.
    if (Math.hypot(exact.x - point.x, exact.y - point.y) < .0001) return candidate;
  }

  throw new RangeError('The point is not a rounded unit-honeycomb vertex.');
}

function requireLength(length: number, limit: number): void {
  if (!Number.isInteger(length) || length < 0 || length > limit) throw new RangeError(`The walk length must be an integer from zero through ${limit}.`);
}

export function exactCounts(maxLength: number): number[] {
  requireLength(maxLength, 24);
  const side = maxLength * 2 + 3;
  const offset = maxLength + 1;
  const visited = new Uint8Array(side * side * 2);
  const counts = new Array<number>(maxLength + 1).fill(0);
  const key = (i: number, j: number, sub: number) => ((i + offset) * side + j + offset) * 2 + sub;
  visited[key(0, 0, 0)] = 1;

  function visit(i: number, j: number, sub: 0 | 1, length: number): void {
    const count = counts[length];

    if (count === undefined) throw new Error('The enumerated length has an initialized count.');

    counts[length] = count + 1;

    if (length === maxLength) return;

    const adjacent = sub === 0 ? [[i, j], [i - 1, j], [i - 1, j + 1]] : [[i, j], [i + 1, j], [i + 1, j - 1]];
    const nextSub = sub === 0 ? 1 : 0;

    for (const pair of adjacent) {
      const nextI = pair[0];
      const nextJ = pair[1];

      if (nextI === undefined || nextJ === undefined) throw new Error('Each honeycomb neighbour has two integer coordinates.');

      const next = key(nextI, nextJ, nextSub);

      if (visited[next]) continue;

      visited[next] = 1;
      visit(nextI, nextJ, nextSub, length + 1);
      visited[next] = 0;
    }
  }

  visit(0, 0, 0, 0);

  return counts;
}

export function enumerateWalks(length: number): Point[][] {
  requireLength(length, 12);
  const result: Point[][] = [];
  const path: Vertex[] = [{ i: 0, j: 0, sub: 0 }];
  const seen = new Set(['0,0,0']);

  function visit(vertex: Vertex): void {
    if (path.length === length + 1) {
      result.push(path.map(position));

      return;
    }

    for (const next of neighbours(vertex)) {
      const key = `${next.i},${next.j},${next.sub}`;

      if (seen.has(key)) continue;

      seen.add(key);
      path.push(next);
      visit(next);
      path.pop();
      seen.delete(key);
    }
  }

  visit({ i: 0, j: 0, sub: 0 });

  return result;
}

// The reference's 90-direction width differs from the true diameter by at most 1 − cos(π/180).
export function diameter(points: readonly Point[]): number {
  if (points.length === 0) throw new RangeError('A diameter needs at least one point.');

  let largest = 0;

  for (const direction of DIRECTIONS) {
    let low = Infinity;
    let high = -Infinity;

    for (const point of points) {
      const projection = point.x * direction.x + point.y * direction.y;
      low = Math.min(low, projection);
      high = Math.max(high, projection);
    }

    largest = Math.max(largest, high - low);
  }

  return largest;
}

export function exactDiameter(points: readonly Point[]): number {
  let largestSquared = 0;

  for (let a = 0; a < points.length; a++) {
    const first = points[a];

    if (!first) throw new Error('Every indexed point exists.');

    for (let b = a + 1; b < points.length; b++) {
      const second = points[b];

      if (!second) throw new Error('Every indexed point exists.');

      largestSquared = Math.max(largestSquared, (first.x - second.x) ** 2 + (first.y - second.y) ** 2);
    }
  }

  return Math.sqrt(largestSquared);
}

export function countInBall(points: readonly Point[], centre: Point, radius: number): number {
  if (!(radius >= 0)) throw new RangeError('A ball radius must be nonnegative.');

  let count = 0;

  for (const point of points) {
    if ((point.x - centre.x) ** 2 + (point.y - centre.y) ** 2 <= radius ** 2 + 1e-9) count++;
  }

  return count;
}

export function crossingBand(points: readonly Point[], height = 20, bottom = 0): Crossing {
  if (!(height > 0)) throw new RangeError('A crossing band must have positive height.');

  const top = bottom + height;
  let entry: { index: number; point: Point } | undefined;

  for (let index = 1; index < points.length; index++) {
    const first = points[index - 1];
    const second = points[index];

    if (!first || !second) throw new Error('A crossing tests consecutive walk vertices.');

    if (first.y <= bottom + 1e-10 && second.y > bottom + 1e-10) {
      const amount = (bottom - first.y) / (second.y - first.y);
      entry = { index: index - 1, point: { x: first.x + amount * (second.x - first.x), y: bottom } };
    }

    if (second.y <= bottom + 1e-10) entry = undefined;
    if (!entry || second.y < top - 1e-10) continue;

    const amount = (top - first.y) / (second.y - first.y);
    const exit = { x: first.x + amount * (second.x - first.x), y: top };
    const inside = points.slice(entry.index + 1, index);

    return { bottom, top, startIndex: entry.index, endIndex: index, points: [entry.point, ...inside, exit] };
  }

  throw new Error('The shown walk does not cross the requested band from bottom to top.');
}

function vertexFromTuple(tuple: readonly number[]): Vertex {
  const [i, j, sub] = tuple;

  if (i === undefined || j === undefined || !Number.isInteger(i) || !Number.isInteger(j) || (sub !== 0 && sub !== 1)) throw new Error('Stored walk coordinates are exact honeycomb vertices.');

  return { i, j, sub };
}

function rod(length: number): Point[] {
  const points: Point[] = [];

  for (let index = 0; index <= length; index++) points.push(position({ i: Math.floor(index / 2), j: 0, sub: index % 2 === 0 ? 0 : 1 }));

  return points;
}

function ordinarySample(length: number, seed: number): Point[] {
  let state = seed;
  let vertex: Vertex = { i: 0, j: 0, sub: 0 };
  const result = [position(vertex)];

  for (let index = 0; index < length; index++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const next = neighbours(vertex)[Math.floor(state / 4294967296 * 3)];

    if (!next) throw new Error('The seeded choice selects one of three neighbours.');

    vertex = next;
    result.push(position(vertex));
  }

  return result;
}

export function createPolymerModel() {
  const walk = data.walkVertices.map(tuple => position(vertexFromTuple(tuple)));
  const closeWalk = data.closeVertices.map(tuple => position(vertexFromTuple(tuple)));
  const rodWalk = rod(1024);
  const ordinaryWalk = ordinarySample(1024, 237);
  const first = closeWalk[0];
  const last = closeWalk[closeWalk.length - 1];

  if (!first || !last) throw new Error('The close-ends sample has two endpoints.');

  const chart = data.saw.map((row, index) => {
    const [length, saw, samples, acceptance] = row;
    const ordinary = data.ordinary[index]?.[1];

    if (length === undefined || saw === undefined || samples === undefined || acceptance === undefined || ordinary === undefined) throw new Error('Each sample length has both diameter means.');

    return { length, saw, ordinary, rod: diameter(rod(length)), samples, acceptance };
  });
  const ballAverages = data.mass.map(row => {
    const [radius, mass] = row;

    if (radius === undefined || mass === undefined) throw new Error('Every measured ball row has radius and mean mass.');

    return { radius, mass };
  });
  const subwalks = data.subwalks.map(row => {
    const [start, length, span] = row;

    if (start === undefined || length === undefined || span === undefined) throw new Error('Each measured subwalk has start, length and diameter.');

    return { start, length, diameter: span, ratio: length / (1 + span) ** (4 / 3) };
  });

  return {
    mu: MU, rho: RHO, counts: exactCounts(12), chart, ballAverages, subwalks,
    walk, closeWalk, rodWalk, ordinaryWalk, crossing: crossingBand(walk),
    walkDiameter: diameter(walk), closeDiameter: diameter(closeWalk), ordinaryDiameter: diameter(ordinaryWalk),
    closeGap: Math.hypot(last.x - first.x, last.y - first.y),
  };
}

export type PolymerModel = ReturnType<typeof createPolymerModel>;
