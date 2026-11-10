import data from './data.json';

export type Point = { x: number; y: number };

export type Vector = { x: number; y: number; z: number };

export type Triangle = readonly [Point, Point, Point];

export type Cell = { column: number; row: number };

export type NeedlePose = { a: Point; b: Point; leg: number; directionDegrees: number };

export const SIDE = 2 / Math.sqrt(3);

export const TRIANGLE_AREA = SIDE / 2;

export const DELTA = 1 / 32;

const ANCHORS = [{ x: 0, y: 0 }, { x: SIDE / 2, y: 1 }, { x: SIDE, y: 0 }] as const;

const START_ANGLES = [0, 240, 120] as const;

export function needlePose(fraction: number): NeedlePose {
  const clock = Math.max(0, Math.min(1, fraction)) * 15;
  const part = Math.min(2, Math.floor(clock / 5));
  const local = clock - part * 5;
  const sliding = local >= 4;
  const anchor = ANCHORS[part];
  const start = START_ANGLES[part];

  if (!anchor || start === undefined) throw new Error('Every needle turn has an anchor and angle.');

  const turn = sliding ? 60 : local * 15;
  const angle = (start + turn) * Math.PI / 180;
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  const distance = sliding ? (SIDE - 1) * (local - 4) : 0;
  const near = { x: anchor.x + distance * dx, y: anchor.y + distance * dy };
  const far = { x: near.x + dx, y: near.y + dy };

  // Reversing the parameterization at the top corner preserves the physical endpoint identities.
  return { a: part === 1 ? far : near, b: part === 1 ? near : far, leg: part * 2 + Number(sliding), directionDegrees: part * 60 + turn };
}

export function insideTriangle(point: Point, tolerance = 1e-10): boolean {
  return point.y >= -tolerance && Math.sqrt(3) * point.x - point.y >= -tolerance && Math.sqrt(3) * (SIDE - point.x) - point.y >= -tolerance;
}

export function sliverStages(k = 8, alpha = .84): number[][] {
  if (!Number.isInteger(k) || k < 0 || k > 12 || !(alpha > 0 && alpha <= 1)) throw new RangeError('Sliver stages need 0 ≤ k ≤ 12 and 0 < alpha ≤ 1.');

  const count = 2 ** k;
  const shifts = new Array<number>(count).fill(0);
  const result = [shifts.slice()];

  for (let stage = 1; stage <= k; stage++) {
    const group = 2 ** (stage - 1);
    const base = alpha ** (stage - 1) * group * SIDE / count;

    for (let pair = 0; pair < count / (2 * group); pair++) {
      const from = 2 * pair * group;
      const centre = from + group;
      const until = centre + group;
      const left = alpha ** (stage - 1) * 2 * pair * group * SIDE / count;

      for (let index = from; index < until; index++) {
        const previous = shifts[index];

        if (previous === undefined) throw new Error('Every sliver starts with an initialized shift.');

        shifts[index] = previous + (alpha - 1) * left - (index >= centre ? 2 * (1 - alpha) * base : 0);
      }
    }

    result.push(shifts.slice());
  }

  return result;
}

export function treeTriangles(shifts: readonly number[]): Triangle[] {
  const count = shifts.length;

  if (count === 0) throw new RangeError('The fan needs at least one sliver.');

  return shifts.map((shift, index) => [
    { x: index * SIDE / count + shift, y: 0 },
    { x: (index + 1) * SIDE / count + shift, y: 0 },
    { x: SIDE / 2 + shift, y: 1 },
  ]);
}

export function treeUnionArea(shifts: readonly number[], rows = 2048): number {
  if (!Number.isInteger(rows) || rows < 1 || shifts.length < 1) throw new RangeError('Area needs slivers and a positive number of slice rows.');

  const left = new Float64Array(shifts.length);
  let area = 0;

  for (let row = 0; row < rows; row++) {
    const y = (row + .5) / rows;
    const width = (1 - y) * SIDE / shifts.length;

    for (const [index, shift] of shifts.entries()) left[index] = (1 - y) * index * SIDE / shifts.length + y * SIDE / 2 + shift;

    left.sort();
    let reach = -Infinity;
    let covered = 0;

    for (const from of left) {
      const until = from + width;
      covered += Math.max(0, until - Math.max(from, reach));
      reach = Math.max(reach, until);
    }

    area += covered / rows;
  }

  return area;
}

function slice(triangle: Triangle, y: number): { low: number; high: number } | undefined {
  let low = Infinity;
  let high = -Infinity;

  for (const [a, b] of [[triangle[0], triangle[1]], [triangle[1], triangle[2]], [triangle[2], triangle[0]]] as const) {
    if (a.y === b.y) continue;

    const amount = (y - a.y) / (b.y - a.y);

    if (amount < 0 || amount > 1) continue;

    const x = a.x + amount * (b.x - a.x);
    low = Math.min(low, x);
    high = Math.max(high, x);
  }

  return Number.isFinite(low) ? { low, high } : undefined;
}

export function unionArea(triangles: readonly Triangle[], rows = 2048): number {
  let bottom = Infinity;
  let top = -Infinity;

  for (const triangle of triangles) {
    for (const point of triangle) {
      bottom = Math.min(bottom, point.y);
      top = Math.max(top, point.y);
    }
  }

  if (!Number.isFinite(bottom) || !Number.isInteger(rows) || rows < 1) throw new RangeError('Area needs triangles and a positive number of rows.');

  let area = 0;

  for (let row = 0; row < rows; row++) {
    const y = bottom + (row + .5) / rows * (top - bottom);
    const intervals: { low: number; high: number }[] = [];

    for (const triangle of triangles) {
      const interval = slice(triangle, y);

      if (interval) intervals.push(interval);
    }

    intervals.sort((a, b) => a.low - b.low);
    let reach = -Infinity;

    for (const interval of intervals) {
      area += Math.max(0, interval.high - Math.max(interval.low, reach)) * (top - bottom) / rows;
      reach = Math.max(reach, interval.high);
    }
  }

  return area;
}

export function squareCells(triangles: readonly Triangle[], delta: number, origin: Point = { x: 0, y: 0 }): Cell[] {
  if (!(delta > 0)) throw new RangeError('The square side must be positive.');

  let top = origin.y;

  for (const triangle of triangles) {
    for (const point of triangle) top = Math.max(top, point.y);
  }

  const rows = Math.ceil((top - origin.y) / delta - 1e-12);
  const marks = new Set<string>();
  const cells: Cell[] = [];

  for (let row = 0; row < rows; row++) {
    const bottom = origin.y + row * delta;
    const until = bottom + delta;

    for (const triangle of triangles) {
      let low = Infinity;
      let high = -Infinity;

      for (const point of triangle) {
        if (point.y < bottom || point.y > until) continue;

        low = Math.min(low, point.x);
        high = Math.max(high, point.x);
      }

      for (const y of [bottom, until]) {
        const interval = slice(triangle, y);

        if (!interval) continue;

        low = Math.min(low, interval.low);
        high = Math.max(high, interval.high);
      }

      if (!Number.isFinite(low)) continue;

      const first = Math.floor((low - origin.x) / delta);
      const last = Math.max(first, Math.floor((high - origin.x) / delta - 1e-12));

      for (let column = first; column <= last; column++) {
        const key = `${column},${row}`;

        if (marks.has(key)) continue;

        marks.add(key);
        cells.push({ column, row });
      }
    }
  }

  return cells;
}

export function rotateTriangles(triangles: readonly Triangle[], radians: number, centre: Point): Triangle[] {
  const c = Math.cos(radians);
  const s = Math.sin(radians);
  const rotate = (point: Point): Point => ({ x: centre.x + c * (point.x - centre.x) - s * (point.y - centre.y), y: centre.y + s * (point.x - centre.x) + c * (point.y - centre.y) });

  return triangles.map(triangle => [rotate(triangle[0]), rotate(triangle[1]), rotate(triangle[2])]);
}

export function fibonacciDirections(count = 2442): Vector[] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('A direction net needs a positive integer count.');

  return Array.from({ length: count }, (_, index) => {
    const i = index + .5;
    const z = 1 - i / count;
    const phi = i * Math.PI * (3 - Math.sqrt(5));
    const radius = Math.sqrt(1 - z * z);

    return { x: radius * Math.cos(phi), y: radius * Math.sin(phi), z };
  });
}

export function minimumSeparation(directions: readonly Vector[]): number {
  let largestDot = 0;

  for (let first = 0; first < directions.length; first++) {
    const a = directions[first];

    if (!a) throw new Error('Every net direction exists.');

    for (let second = first + 1; second < directions.length; second++) {
      const b = directions[second];

      if (!b) throw new Error('Every net direction exists.');

      largestDot = Math.max(largestDot, Math.abs(a.x * b.x + a.y * b.y + a.z * b.z));
    }
  }

  return Math.acos(Math.min(1, largestDot));
}

export function coveringRadiusBound(directions: readonly Vector[], polarSteps = 96, azimuthSteps = 384): number {
  let sampled = 0;

  for (let row = 0; row <= polarSteps; row++) {
    const theta = row / polarSteps * Math.PI / 2;

    for (let column = 0; column < azimuthSteps; column++) {
      const phi = column / azimuthSteps * Math.PI * 2;
      const point = { x: Math.sin(theta) * Math.cos(phi), y: Math.sin(theta) * Math.sin(phi), z: Math.cos(theta) };
      let nearestDot = 0;

      for (const direction of directions) nearestDot = Math.max(nearestDot, Math.abs(point.x * direction.x + point.y * direction.y + point.z * direction.z));

      sampled = Math.max(sampled, Math.acos(Math.min(1, nearestDot)));
    }
  }

  // Every upper-hemisphere point is at most these half-grid polar/azimuth distances from a probe.
  return sampled + Math.PI / (4 * polarSteps) + Math.PI / azimuthSteps;
}

export function bushUnionBounds(lambda: number, delta = DELTA, directions = 2442) {
  const totalVolume = directions * Math.PI * delta ** 2;
  const unionLow = Math.PI / 6 * lambda ** 3;
  const unionHigh = 4 * Math.PI / 3 * ((lambda / 2) ** 2 + delta ** 2) ** 1.5;

  return { lambda, unionLow, unionHigh, shadedTotal: lambda * totalVolume, shareLow: unionLow / totalVolume, shareHigh: unionHigh / totalVolume };
}

export function createKakeyaModel() {
  const stages = sliverStages();
  const final = stages.at(-1);

  if (!final) throw new Error('The sprouting construction has a final stage.');

  const slivers = treeTriangles(final);
  const centre = { x: 0, y: 0 };

  for (const triangle of slivers) {
    for (const point of triangle) {
      centre.x += point.x / (slivers.length * 3);
      centre.y += point.y / (slivers.length * 3);
    }
  }

  const whole: Triangle[] = [[{ x: 0, y: 0 }, { x: SIDE, y: 0 }, { x: SIDE / 2, y: 1 }]];
  const squares = [1 / 8, 1 / 16].map(delta => ({ delta, needle: Math.round(1 / delta), tree: squareCells(slivers, delta).length, triangle: squareCells(whole, delta).length }));

  for (const row of data.largeSquares) squares.push(row);

  const net = fibonacciDirections(data.bush.directions);
  const drawnDirections = Array.from({ length: 60 }, (_, index) => {
    const direction = net[Math.floor(index * net.length / 60)];

    if (!direction) throw new Error('The drawn Fibonacci subset selects an existing direction.');

    return direction;
  });

  return {
    side: SIDE, triangleArea: TRIANGLE_AREA, discArea: Math.PI / 4,
    stages, slivers, centre, stageShares: data.stageShares, threeArea: data.threeTrees.union_area, squares,
    net, drawnDirections, ladder: data.ladder, best: data.best,
    bush: {
      delta: data.bush.delta, directions: data.bush.directions, totalVolume: data.bush.total_volume,
      closestPairOverDelta: data.bush.closest_pair_over_delta, coveringRadiusOverDelta: data.bush.covering_radius_over_delta,
      rows: data.bush.rows.map(row => ({ lambda: row.lambda, unionLow: row.union_low, unionHigh: row.union_high, shadedTotal: row.shaded_total, shareLow: row.share_low, shareHigh: row.share_high })),
    },
  };
}

export type KakeyaModel = ReturnType<typeof createKakeyaModel>;
