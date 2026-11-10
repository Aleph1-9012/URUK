import data from './data.json';

export type Point = { x: number; y: number };

export type Triangle = readonly [Point, Point, Point];

export type Isometry = { a: number; b: number; c: number; d: number; x: number; y: number };

export const IDENTITY: Isometry = { a: 1, b: 0, c: 0, d: 1, x: 0, y: 0 };

export type TableKey = 'irrational' | 'equilateral' | 'right_isosceles';

export type Hit = { kind: 'hit'; point: Point; distance: number; side: number; outgoing: Point };

export type Corner = { kind: 'corner'; point: Point; distance: number; vertex: number; reason: string };

export type Stalled = { kind: 'stalled'; reason: string };

type RunPath = { points: Point[]; directions: number[]; lengths: number[]; times: number[]; sides: number[]; endHeading: number };

export type BilliardRun = (RunPath & { kind: 'complete' }) | (RunPath & { kind: 'corner' | 'stalled'; reason: string });

export type PackedBilliardRun = {
  kind: BilliardRun['kind'];
  coordinates: Float64Array<ArrayBuffer>;
  times: Float64Array<ArrayBuffer>;
  directions: Float64Array<ArrayBuffer>;
  endHeading: number;
  reason: string | null;
};

export type ComputedTable = {
  run: PackedBilliardRun;
  bounces: number;
  stats: ReturnType<typeof directionStats>;
  shares: { bounces: number; share: number }[];
  areaShare: number;
};

export type BounceExperiment = Record<TableKey, ComputedTable>;

export type ComputationState = { kind: 'pending' } | { kind: 'ready'; cases: BounceExperiment } | { kind: 'failed'; reason: string };

export const START = { x: .31, y: .12 };

export const HEADING = .37;

export const DIVIDER_X = .4;

export function barycentric(point: Point, triangle: Triangle): Point {
  const [a, b, c] = triangle;
  const bx = b.x - a.x;
  const by = b.y - a.y;
  const cx = c.x - a.x;
  const cy = c.y - a.y;
  const determinant = bx * cy - by * cx;

  if (Math.abs(determinant) < 1e-15) throw new RangeError('Barycentric coordinates need a nondegenerate triangle.');

  const x = point.x - a.x;
  const y = point.y - a.y;

  return { x: (x * cy - y * cx) / determinant, y: (bx * y - by * x) / determinant };
}

export function fromBarycentric(point: Point, triangle: Triangle): Point {
  const [a, b, c] = triangle;

  return { x: a.x + point.x * (b.x - a.x) + point.y * (c.x - a.x), y: a.y + point.x * (b.y - a.y) + point.y * (c.y - a.y) };
}

export function apply(map: Isometry, point: Point): Point {
  return { x: map.a * point.x + map.b * point.y + map.x, y: map.c * point.x + map.d * point.y + map.y };
}

export function reflection(a: Point, b: Point): Isometry {
  const length = Math.hypot(b.x - a.x, b.y - a.y);

  if (length < 1e-15) throw new RangeError('A reflection axis needs two distinct points.');

  const x = (b.x - a.x) / length;
  const y = (b.y - a.y) / length;
  const aa = 2 * x * x - 1;
  const bb = 2 * x * y;
  const dd = 2 * y * y - 1;

  return { a: aa, b: bb, c: bb, d: dd, x: a.x - aa * a.x - bb * a.y, y: a.y - bb * a.x - dd * a.y };
}

export function compose(first: Isometry, second: Isometry): Isometry {
  return {
    a: first.a * second.a + first.b * second.c,
    b: first.a * second.b + first.b * second.d,
    c: first.c * second.a + first.d * second.c,
    d: first.c * second.b + first.d * second.d,
    x: first.a * second.x + first.b * second.y + first.x,
    y: first.c * second.x + first.d * second.y + first.y,
  };
}

export function collisionSide(triangle: Triangle, point: Point): number {
  let nearest = Infinity;
  let selected = -1;

  for (let side = 0; side < 3; side++) {
    const a = triangle[side];
    const b = triangle[(side + 1) % 3];

    if (!a || !b) throw new Error('An unfolding side has two vertices.');

    const distance = Math.abs((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x)) / Math.hypot(b.x - a.x, b.y - a.y);

    if (distance < nearest) {
      nearest = distance;
      selected = side;
    }
  }

  if (selected < 0 || nearest > 1e-6) throw new Error('The unfolded collision belongs to a triangle side.');

  return selected;
}

export function triangleFromAngles(alpha: number, beta: number): Triangle {
  if (!(alpha > 0 && beta > 0 && alpha + beta < Math.PI)) throw new RangeError('A triangle needs three positive angles.');

  const gamma = Math.PI - alpha - beta;
  const side = Math.sin(beta) / Math.sin(gamma);

  return [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: side * Math.cos(alpha), y: side * Math.sin(alpha) }];
}

export function insideTriangle(triangle: Triangle, point: Point, tolerance = 1e-10): boolean {
  for (let side = 0; side < 3; side++) {
    const a = triangle[side];
    const b = triangle[(side + 1) % 3];

    if (!a || !b) throw new Error('Every triangle side has two endpoints.');
    if ((b.x - a.x) * (point.y - a.y) - (b.y - a.y) * (point.x - a.x) < -tolerance) return false;
  }

  return true;
}

export function nextCollision(triangle: Triangle, position: Point, direction: Point, lastSide = -1): Hit | Corner | Stalled {
  let best = Infinity;
  let hitSide = -1;
  let edgeFraction = 0;

  for (let side = 0; side < 3; side++) {
    if (side === lastSide) continue;

    const a = triangle[side];
    const b = triangle[(side + 1) % 3];

    if (!a || !b) throw new Error('Every triangle side has two endpoints.');

    const ex = b.x - a.x;
    const ey = b.y - a.y;
    const denominator = direction.x * ey - direction.y * ex;

    if (Math.abs(denominator) < 1e-15) continue;

    const wx = a.x - position.x;
    const wy = a.y - position.y;
    const travel = (wx * ey - wy * ex) / denominator;
    const fraction = (wx * direction.y - wy * direction.x) / denominator;

    if (travel > 1e-12 && fraction >= -1e-12 && fraction <= 1 + 1e-12 && travel < best) {
      best = travel;
      hitSide = side;
      edgeFraction = fraction;
    }
  }

  if (hitSide < 0) return { kind: 'stalled', reason: 'NO FORWARD COLLISION: THE COMPUTED PATH STOPS HERE' };

  const point = { x: position.x + best * direction.x, y: position.y + best * direction.y };

  if (edgeFraction < 1e-10 || edgeFraction > 1 - 1e-10) {
    return { kind: 'corner', point, distance: best, vertex: edgeFraction < .5 ? hitSide : (hitSide + 1) % 3, reason: 'CORNER HIT: SPECULAR CONTINUATION IS UNDEFINED' };
  }

  const a = triangle[hitSide];
  const b = triangle[(hitSide + 1) % 3];

  if (!a || !b) throw new Error('The selected collision side exists.');

  const length = Math.hypot(b.x - a.x, b.y - a.y);
  const ex = (b.x - a.x) / length;
  const ey = (b.y - a.y) / length;
  const parallel = direction.x * ex + direction.y * ey;

  return { kind: 'hit', point, distance: best, side: hitSide, outgoing: { x: 2 * parallel * ex - direction.x, y: 2 * parallel * ey - direction.y } };
}

export function runBilliard(triangle: Triangle, start: Point = START, heading = HEADING, bounces = 400): BilliardRun {
  if (!Number.isInteger(bounces) || bounces < 0 || bounces > 1_000_000) throw new RangeError('The computed path supports zero through one million bounces.');

  const points = [{ ...start }];
  const directions: number[] = [];
  const lengths: number[] = [];
  const times = [0];
  const sides: number[] = [];
  let position = { ...start };
  let direction = { x: Math.cos(heading), y: Math.sin(heading) };
  let lastSide = -1;
  let elapsed = 0;

  if (!insideTriangle(triangle, start)) return { kind: 'stalled', reason: 'THE START IS OUTSIDE THIS TABLE', points, directions, lengths, times, sides, endHeading: heading };

  for (let bounce = 0; bounce < bounces; bounce++) {
    const collision = nextCollision(triangle, position, direction, lastSide);

    if (collision.kind === 'stalled') return { kind: 'stalled', reason: collision.reason, points, directions, lengths, times, sides, endHeading: Math.atan2(direction.y, direction.x) };

    const length = Math.hypot(collision.point.x - position.x, collision.point.y - position.y);
    directions.push(Math.atan2(direction.y, direction.x));
    lengths.push(length);
    elapsed += length;
    times.push(elapsed);
    points.push(collision.point);

    if (collision.kind === 'corner') return { kind: 'corner', reason: collision.reason, points, directions, lengths, times, sides, endHeading: Math.atan2(direction.y, direction.x) };

    sides.push(collision.side);
    position = collision.point;
    direction = collision.outgoing;
    lastSide = collision.side;
  }

  return { kind: 'complete', points, directions, lengths, times, sides, endHeading: Math.atan2(direction.y, direction.x) };
}

export function sampleRunByDistance(run: BilliardRun, distance: number) {
  const lastTime = run.times.at(-1);
  const lastPoint = run.points.at(-1);

  if (lastTime === undefined || !lastPoint) throw new Error('A computed run has its initial time and point.');

  const travel = Math.max(0, Math.min(lastTime, distance));

  if (travel === lastTime) return { point: lastPoint, heading: run.endHeading, bounce: run.directions.length, fraction: 1 };

  let low = 0;
  let high = run.times.length - 1;

  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    const at = run.times[middle];

    if (at === undefined) throw new Error('The event-time search selects an existing collision.');

    if (at <= travel) low = middle;
    else high = middle;
  }

  const from = run.points[low];
  const until = run.points[low + 1];
  const fromTime = run.times[low];
  const length = run.lengths[low];
  const heading = run.directions[low];

  if (!from || !until || fromTime === undefined || length === undefined || heading === undefined) throw new Error('A sampled segment has two points, a start time, length and heading.');

  const fraction = (travel - fromTime) / length;

  return { point: { x: from.x + fraction * (until.x - from.x), y: from.y + fraction * (until.y - from.y) }, heading, bounce: low, fraction };
}

export function timeShareLeft(run: BilliardRun, divider = DIVIDER_X, bounces = run.lengths.length): number {
  let left = 0;
  let total = 0;

  for (let index = 0; index < Math.min(bounces, run.lengths.length); index++) {
    const a = run.points[index];
    const b = run.points[index + 1];
    const length = run.lengths[index];

    if (!a || !b || length === undefined) throw new Error('Every timed segment has two endpoints and its length.');

    const low = Math.min(a.x, b.x);
    const high = Math.max(a.x, b.x);
    const fraction = high - low < 1e-15 ? Number(a.x < divider) : Math.max(0, Math.min(1, (divider - low) / (high - low)));
    left += length * fraction;
    total += length;
  }

  if (total === 0) throw new RangeError('A time share needs at least one positive-length segment.');

  return left / total;
}

function polygonArea(points: readonly Point[]): number {
  let twice = 0;

  for (const [index, point] of points.entries()) {
    const next = points[(index + 1) % points.length];

    if (!next) throw new Error('A polygon edge has its next endpoint.');

    twice += point.x * next.y - point.y * next.x;
  }

  return Math.abs(twice) / 2;
}

export function areaShareLeft(triangle: Triangle, divider = DIVIDER_X): number {
  const clipped: Point[] = [];

  for (let side = 0; side < 3; side++) {
    const a = triangle[side];
    const b = triangle[(side + 1) % 3];

    if (!a || !b) throw new Error('Each clipping side has two endpoints.');

    if (a.x < divider) clipped.push(a);

    if ((a.x < divider) !== (b.x < divider)) {
      const amount = (divider - a.x) / (b.x - a.x);
      clipped.push({ x: divider, y: a.y + amount * (b.y - a.y) });
    }
  }

  return polygonArea(clipped) / polygonArea(triangle);
}

export function directionStats(directions: readonly number[], sectors = 24) {
  if (!Number.isInteger(sectors) || sectors < 1) throw new RangeError('The direction circle needs a positive whole number of sectors.');

  const bins = new Array<number>(sectors).fill(0);
  const distinct = new Set<number>();
  const headings: number[] = [];

  for (const radians of directions) {
    const degrees = (radians * 180 / Math.PI % 360 + 360) % 360;
    const rounded = Math.round(degrees * 1e6) / 1e6;

    if (!distinct.has(rounded)) headings.push(radians);

    distinct.add(rounded);
    const bin = Math.min(sectors - 1, Math.floor(degrees / 360 * sectors));
    const previous = bins[bin];

    if (previous === undefined) throw new Error('The heading belongs to an initialized direction sector.');

    bins[bin] = previous + 1;
  }

  return { distinct: distinct.size, headings, bins, empty: bins.reduce((sum, count) => sum + Number(count === 0), 0) };
}

function tableCase(key: TableKey, alpha: number, beta: number, reference: typeof data.irrational) {
  const triangle = triangleFromAngles(alpha, beta);

  return {
    key, triangle, angles: [alpha, beta, Math.PI - alpha - beta], run: runBilliard(triangle), areaShare: areaShareLeft(triangle),
    reference: {
      directions: reference.directions, emptySectors: reference.direction_bins_empty, areaShare: reference.area_share_left,
      shares: (['100', '1000', '10000', '100000'] as const).map(at => ({ bounces: Number(at), share: reference.time_share_left[at] })),
    },
  };
}

export function createBounceModel(): BounceModel {
  return {
    start: START, heading: HEADING, divider: DIVIDER_X,
    cases: {
      irrational: tableCase('irrational', 1, 1.2, data.irrational),
      equilateral: tableCase('equilateral', Math.PI / 3, Math.PI / 3, data.equilateral),
      right_isosceles: tableCase('right_isosceles', Math.PI / 2, Math.PI / 4, data.right_isosceles),
    },
    coneAnglesDegrees: [2, 2.4, 2 * (Math.PI - 2.2)].map(angle => angle * 180 / Math.PI),
    computation: { kind: 'pending' },
  };
}

export type BounceCase = ReturnType<typeof tableCase>;

export type BounceModel = {
  start: Point;
  heading: number;
  divider: number;
  cases: Record<TableKey, BounceCase>;
  coneAnglesDegrees: number[];
  computation: ComputationState;
};

export function packedPoint(run: PackedBilliardRun, index: number): Point {
  const x = run.coordinates[2 * index];
  const y = run.coordinates[2 * index + 1];

  if (x === undefined || y === undefined) throw new RangeError('The requested packed collision point exists.');

  return { x, y };
}

export function samplePackedRunByDistance(run: PackedBilliardRun, distance: number) {
  const lastTime = run.times.at(-1);

  if (lastTime === undefined) throw new Error('A packed run has its initial event time.');

  const travel = Math.max(0, Math.min(lastTime, distance));

  if (travel === lastTime) return { point: packedPoint(run, run.times.length - 1), heading: run.endHeading, bounce: run.directions.length, fraction: 1 };

  let low = 0;
  let high = run.times.length - 1;

  while (high - low > 1) {
    const middle = Math.floor((low + high) / 2);
    const at = run.times[middle];

    if (at === undefined) throw new Error('The packed event-time search selects an existing collision.');

    if (at <= travel) low = middle;
    else high = middle;
  }

  const from = packedPoint(run, low);
  const until = packedPoint(run, low + 1);
  const fromTime = run.times[low];
  const untilTime = run.times[low + 1];
  const heading = run.directions[low];

  if (fromTime === undefined || untilTime === undefined || heading === undefined || untilTime <= fromTime) throw new Error('A packed segment has increasing times and a heading.');

  const fraction = (travel - fromTime) / (untilTime - fromTime);

  return { point: { x: from.x + fraction * (until.x - from.x), y: from.y + fraction * (until.y - from.y) }, heading, bounce: low, fraction };
}

function computeTable(triangle: Triangle): ComputedTable {
  const run = runBilliard(triangle, START, HEADING, 100000);
  const coordinates = new Float64Array(run.points.length * 2);

  for (const [index, point] of run.points.entries()) {
    coordinates[index * 2] = point.x;
    coordinates[index * 2 + 1] = point.y;
  }

  return {
    run: { kind: run.kind, coordinates, times: new Float64Array(run.times), directions: new Float64Array(run.directions), endHeading: run.endHeading, reason: run.kind === 'complete' ? null : run.reason },
    bounces: run.directions.length,
    stats: directionStats(run.directions),
    shares: [100, 1000, 10000, 100000].flatMap(bounces => bounces <= run.lengths.length ? [{ bounces, share: timeShareLeft(run, DIVIDER_X, bounces) }] : []),
    areaShare: areaShareLeft(triangle),
  };
}

export function computeBounceExperiment(): BounceExperiment {
  const model = createBounceModel();

  return {
    irrational: computeTable(model.cases.irrational.triangle),
    equilateral: computeTable(model.cases.equilateral.triangle),
    right_isosceles: computeTable(model.cases.right_isosceles.triangle),
  };
}

export function experimentBuffers(experiment: BounceExperiment): ArrayBuffer[] {
  const buffers: ArrayBuffer[] = [];

  for (const key of ['irrational', 'equilateral', 'right_isosceles'] as const) {
    const run = experiment[key].run;
    buffers.push(run.coordinates.buffer, run.times.buffer, run.directions.buffer);
  }

  return buffers;
}
