export type TableKind = 'ellipse' | 'wobble';

export type PeriodicQ = 3 | 4 | 5;

export type Point = { x: number; y: number };

export type OrbitData = {
  epsilon: number;
  launchT: number;
  launchDelta: number;
  coords: Float64Array<ArrayBuffer>;
  phase: Float64Array<ArrayBuffer>;
  parameters: Float64Array<ArrayBuffer>;
  deltas: Float64Array<ArrayBuffer>;
  caustic: number | null;
};

export type PhasePortrait = {
  points: Float32Array<ArrayBuffer>;
  orbitOffsets: Uint32Array<ArrayBuffer>;
  launches: Float64Array<ArrayBuffer>;
};

export type PeriodicFamily = {
  epsilon: number;
  q: PeriodicQ;
  starts: number;
  parameters: Float64Array<ArrayBuffer>;
  coords: Float64Array<ArrayBuffer>;
  lengths: Float64Array<ArrayBuffer>;
  maxGradient: number;
  startResiduals: Float64Array<ArrayBuffer>;
};

export type PeriodicPath = {
  parameters: Float64Array<ArrayBuffer>;
  coords: Float64Array<ArrayBuffer>;
  length: number;
  startResidual: number;
};

export type Bounce = { t: number; delta: number; from: Point; point: Point; direction: Point; reflected: Point; distance: number };

export const TAU = Math.PI * 2;

export const SEMI_MAJOR = 1.4;

export const SEMI_MINOR = 1;

export const FOCUS = Math.sqrt(SEMI_MAJOR ** 2 - SEMI_MINOR ** 2);

export const LAUNCH_DELTAS = [.45, .25, .12] as const;

function wrap(value: number): number {
  return (value % TAU + TAU) % TAU;
}

export function boundaryPoint(epsilon: number, t: number): Point {
  const radius = 1 + epsilon * Math.cos(3 * t);

  return { x: SEMI_MAJOR * radius * Math.cos(t), y: SEMI_MINOR * radius * Math.sin(t) };
}

export function boundaryVelocity(epsilon: number, t: number): Point {
  const radius = 1 + epsilon * Math.cos(3 * t);
  const derivative = -3 * epsilon * Math.sin(3 * t);

  return { x: SEMI_MAJOR * (derivative * Math.cos(t) - radius * Math.sin(t)), y: SEMI_MINOR * (derivative * Math.sin(t) + radius * Math.cos(t)) };
}

export function boundaryAcceleration(epsilon: number, t: number): Point {
  const radius = 1 + epsilon * Math.cos(3 * t);
  const derivative = -3 * epsilon * Math.sin(3 * t);
  const second = -9 * epsilon * Math.cos(3 * t);

  return { x: SEMI_MAJOR * ((second - radius) * Math.cos(t) - 2 * derivative * Math.sin(t)), y: SEMI_MINOR * ((second - radius) * Math.sin(t) + 2 * derivative * Math.cos(t)) };
}

export class BilliardTable {
  readonly perimeter: number;
  private readonly arc: Float64Array<ArrayBuffer>;

  constructor(readonly epsilon: number, readonly arcSamples = 8192) {
    this.arc = new Float64Array(arcSamples + 1);
    const dt = TAU / arcSamples;
    const first = boundaryVelocity(epsilon, 0);
    let speed = Math.hypot(first.x, first.y);
    let total = 0;

    for (let index = 1; index <= arcSamples; index++) {
      const next = boundaryVelocity(epsilon, index * dt);
      const nextSpeed = Math.hypot(next.x, next.y);
      total += (speed + nextSpeed) * dt / 2;
      this.arc[index] = total;
      speed = nextSpeed;
    }

    this.perimeter = total;
  }

  point(t: number): Point {
    return boundaryPoint(this.epsilon, t);
  }

  velocity(t: number): Point {
    return boundaryVelocity(this.epsilon, t);
  }

  curvature(t: number): number {
    const velocity = this.velocity(t);
    const acceleration = boundaryAcceleration(this.epsilon, t);

    return (velocity.x * acceleration.y - velocity.y * acceleration.x) / Math.hypot(velocity.x, velocity.y) ** 3;
  }

  arclength(t: number): number {
    const position = wrap(t) / TAU * this.arcSamples;
    const index = Math.floor(position);
    const first = this.arc[index] ?? 0;
    const second = this.arc[index + 1] ?? this.perimeter;

    return first + (second - first) * (position - index);
  }

  bounce(t0: number, delta: number): Bounce {
    if (delta <= 0 || delta >= Math.PI) throw new RangeError('The outgoing angle must be between zero and pi.');

    const start = wrap(t0);
    const from = this.point(start);
    const velocity = this.velocity(start);
    const speed = Math.hypot(velocity.x, velocity.y);
    const tangent = { x: velocity.x / speed, y: velocity.y / speed };
    const inward = { x: -tangent.y, y: tangent.x };
    const direction = { x: Math.cos(delta) * tangent.x + Math.sin(delta) * inward.x, y: Math.cos(delta) * tangent.y + Math.sin(delta) * inward.y };
    let low = start + 1e-9;
    let high = start + TAU - 1e-9;

    // A strictly convex rim meets this line only at the starting point and
    // one further point. Its oriented cross product changes from minus to
    // plus across the latter, so one full turn brackets it without a scan.
    for (let iteration = 0; iteration < 54; iteration++) {
      const middle = (low + high) / 2;
      const point = this.point(middle);
      const cross = direction.x * (point.y - from.y) - direction.y * (point.x - from.x);

      if (cross > 0) high = middle;
      else low = middle;
    }

    const t = wrap((low + high) / 2);
    const point = this.point(t);
    const nextVelocity = this.velocity(t);
    const nextSpeed = Math.hypot(nextVelocity.x, nextVelocity.y);
    const nextTangent = { x: nextVelocity.x / nextSpeed, y: nextVelocity.y / nextSpeed };
    const normal = { x: -nextTangent.y, y: nextTangent.x };
    const normalPart = direction.x * normal.x + direction.y * normal.y;
    const reflected = { x: direction.x - 2 * normalPart * normal.x, y: direction.y - 2 * normalPart * normal.y };
    const nextDelta = Math.atan2(reflected.x * normal.x + reflected.y * normal.y, reflected.x * nextTangent.x + reflected.y * nextTangent.y);
    const distance = Math.hypot(point.x - from.x, point.y - from.y);

    if (distance < 1e-8 || nextDelta <= 0 || nextDelta >= Math.PI) throw new Error('The reflected ray did not produce a forward interior flight.');

    return { t, delta: nextDelta, from, point, direction, reflected, distance };
  }
}

export function causticParameter(first: Point, second: Point): number {
  const a = second.y - first.y;
  const b = first.x - second.x;
  const c = a * first.x + b * first.y;

  return (SEMI_MAJOR ** 2 * a * a + SEMI_MINOR ** 2 * b * b - c * c) / (a * a + b * b);
}

export function traceOrbit(table: BilliardTable, t0: number, delta0: number, bounces: number): OrbitData {
  const coords = new Float64Array((bounces + 1) * 2);
  const phase = new Float64Array((bounces + 1) * 2);
  const parameters = new Float64Array(bounces + 1);
  const deltas = new Float64Array(bounces + 1);
  let t = wrap(t0);
  let delta = delta0;

  for (let index = 0; index <= bounces; index++) {
    const point = table.point(t);
    coords[index * 2] = point.x;
    coords[index * 2 + 1] = point.y;
    phase[index * 2] = table.arclength(t) / table.perimeter;
    phase[index * 2 + 1] = delta;
    parameters[index] = t;
    deltas[index] = delta;

    if (index === bounces) break;

    const next = table.bounce(t, delta);
    t = next.t;
    delta = next.delta;
  }

  const first = { x: coords[0] ?? 0, y: coords[1] ?? 0 };
  const second = { x: coords[2] ?? 0, y: coords[3] ?? 0 };

  return { epsilon: table.epsilon, launchT: wrap(t0), launchDelta: delta0, coords, phase, parameters, deltas, caustic: table.epsilon === 0 ? causticParameter(first, second) : null };
}

export function computePortrait(table: BilliardTable): PhasePortrait {
  const count = 44;
  const bounces = 700;
  const points = new Float32Array(count * bounces * 2);
  const orbitOffsets = new Uint32Array(count + 1);
  const launches = new Float64Array(count);

  for (let index = 0; index < count; index++) {
    const delta = .04 + index / (count - 1) * 1.51;
    const orbit = traceOrbit(table, .37 + .11 * index, delta, bounces);
    launches[index] = delta;
    orbitOffsets[index] = index * bounces;
    points.set(orbit.phase.subarray(2), index * bounces * 2);
  }

  orbitOffsets[count] = count * bounces;

  return { points, orbitOffsets, launches };
}

function pathGradient(epsilon: number, parameters: ArrayLike<number>): { gradient: number[]; length: number; startResidual: number } {
  const count = parameters.length;
  const points: Point[] = [];
  const directions: Point[] = [];
  let length = 0;

  for (let index = 0; index < count; index++) points.push(boundaryPoint(epsilon, parameters[index] ?? 0));

  for (let index = 0; index < count; index++) {
    const first = points[index];
    const second = points[(index + 1) % count];

    if (!first || !second) continue;

    const distance = Math.hypot(second.x - first.x, second.y - first.y);
    directions.push({ x: (second.x - first.x) / distance, y: (second.y - first.y) / distance });
    length += distance;
  }

  const gradient: number[] = [];
  let startResidual = 0;

  for (let index = 0; index < count; index++) {
    const previous = directions[(index + count - 1) % count];
    const next = directions[index];
    const velocity = boundaryVelocity(epsilon, parameters[index] ?? 0);

    if (!previous || !next) continue;

    const value = (previous.x - next.x) * velocity.x + (previous.y - next.y) * velocity.y;

    if (index === 0) startResidual = value;
    else gradient.push(value);
  }

  return { gradient, length, startResidual };
}

function solveLinear(matrix: number[][], right: number[]): number[] | null {
  const count = right.length;
  const rows = matrix.map((row, index) => [...row, right[index] ?? 0]);

  for (let column = 0; column < count; column++) {
    let pivot = column;

    for (let row = column + 1; row < count; row++) {
      if (Math.abs(rows[row]?.[column] ?? 0) > Math.abs(rows[pivot]?.[column] ?? 0)) pivot = row;
    }

    const first = rows[column];
    const chosen = rows[pivot];

    if (!first || !chosen || Math.abs(chosen[column] ?? 0) < 1e-13) return null;

    rows[column] = chosen;
    rows[pivot] = first;
    const divisor = chosen[column] ?? 1;

    for (let entry = column; entry <= count; entry++) chosen[entry] = (chosen[entry] ?? 0) / divisor;

    for (let row = 0; row < count; row++) {
      if (row === column) continue;

      const current = rows[row];
      const factor = current?.[column] ?? 0;

      if (!current) continue;

      for (let entry = column; entry <= count; entry++) current[entry] = (current[entry] ?? 0) - factor * (chosen[entry] ?? 0);
    }
  }

  return rows.map(row => row[count] ?? 0);
}

function polish(epsilon: number, parameters: Float64Array<ArrayBuffer>, iterations: number): void {
  const count = parameters.length - 1;

  for (let iteration = 0; iteration < iterations; iteration++) {
    const current = pathGradient(epsilon, parameters);

    if (Math.max(...current.gradient.map(Math.abs)) < 3e-14) return;

    const hessian: number[][] = Array.from({ length: count }, () => new Array<number>(count).fill(0));
    const h = 1e-5;

    for (let column = 0; column < count; column++) {
      const value = parameters[column + 1] ?? 0;
      parameters[column + 1] = value + h;
      const plus = pathGradient(epsilon, parameters).gradient;
      parameters[column + 1] = value - h;
      const minus = pathGradient(epsilon, parameters).gradient;
      parameters[column + 1] = value;

      for (let row = 0; row < count; row++) {
        const destination = hessian[row];

        if (destination) destination[column] = ((plus[row] ?? 0) - (minus[row] ?? 0)) / (2 * h);
      }
    }

    const change = solveLinear(hessian, current.gradient.map(value => -value));

    if (!change) return;

    const candidate = parameters.slice();
    let accepted = false;

    for (let backtrack = 0; backtrack < 12; backtrack++) {
      const factor = 2 ** -backtrack;

      for (let index = 1; index < parameters.length; index++) candidate[index] = (parameters[index] ?? 0) + factor * (change[index - 1] ?? 0);

      let ordered = (candidate[candidate.length - 1] ?? 0) < (candidate[0] ?? 0) + TAU;

      for (let index = 1; index < candidate.length; index++) ordered &&= (candidate[index] ?? 0) > (candidate[index - 1] ?? 0);

      if (ordered && pathGradient(epsilon, candidate).length >= current.length - 1e-13) {
        parameters.set(candidate);
        accepted = true;
        break;
      }
    }

    if (!accepted) return;
  }
}

export function computePeriodicFamily(table: BilliardTable, q: PeriodicQ, starts = 96): PeriodicFamily {
  const parameters = new Float64Array(starts * q);
  const coords = new Float64Array(starts * q * 2);
  const lengths = new Float64Array(starts);
  const startResiduals = new Float64Array(starts);
  let maxGradient = 0;

  for (let start = 0; start < starts; start++) {
    const values = new Float64Array(q);
    const t0 = start / starts * TAU;

    for (let index = 0; index < q; index++) values[index] = t0 + index / q * TAU;

    for (let iteration = 0; iteration < 6000; iteration++) {
      const result = pathGradient(table.epsilon, values);
      let largest = 0;

      for (const [index, value] of result.gradient.entries()) {
        values[index + 1] = (values[index + 1] ?? 0) + .02 * value;
        largest = Math.max(largest, Math.abs(value));
      }

      if (largest < 1e-12) break;
    }

    polish(table.epsilon, values, 6);
    const result = pathGradient(table.epsilon, values);
    lengths[start] = result.length;
    startResiduals[start] = result.startResidual;

    for (const value of result.gradient) maxGradient = Math.max(maxGradient, Math.abs(value));

    parameters.set(values, start * q);

    for (let index = 0; index < q; index++) {
      const point = table.point(values[index] ?? 0);
      coords[(start * q + index) * 2] = point.x;
      coords[(start * q + index) * 2 + 1] = point.y;
    }
  }

  return { epsilon: table.epsilon, q, starts, parameters, coords, lengths, maxGradient, startResiduals };
}

export function periodicPath(family: PeriodicFamily, startFraction: number): PeriodicPath {
  const position = ((startFraction % 1 + 1) % 1) * family.starts;
  const first = Math.floor(position);
  const second = (first + 1) % family.starts;
  const amount = position - first;
  const parameters = new Float64Array(family.q);

  for (let index = 0; index < family.q; index++) {
    const a = family.parameters[first * family.q + index] ?? 0;
    const b = (family.parameters[second * family.q + index] ?? 0) + (second === 0 ? TAU : 0);
    parameters[index] = a + (b - a) * amount;
  }

  polish(family.epsilon, parameters, 5);
  const coords = new Float64Array(family.q * 2);

  for (let index = 0; index < family.q; index++) {
    const point = boundaryPoint(family.epsilon, parameters[index] ?? 0);
    coords[index * 2] = point.x;
    coords[index * 2 + 1] = point.y;
  }

  const result = pathGradient(family.epsilon, parameters);

  return { parameters, coords, length: result.length, startResidual: result.startResidual };
}

export function shotAt(time: number): { delta: number; impact: number } {
  if (time < 11300) return { delta: .45, impact: Math.min(40, Math.max(0, time / 200)) };
  if (time < 13300) return { delta: .25, impact: (time - 11300) / 50 };
  if (time < 15500) return { delta: .12, impact: (time - 13300) / 55 };
  if (time < 22500) return { delta: .45, impact: (time - 15500) / 175 };

  return { delta: .45, impact: Math.min(400, 40 + (time - 22500) / 45) };
}
