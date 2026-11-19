export type Point = { x: number; y: number };

export type NetCurve = { kind: 'circle' | 'ray'; parameter: number; runs: Point[][] };

export type CountableDisc = { k: number; centre: number; radius: number };

export type CantorDisc = { id: string; parentId: string | null; left: number; right: number; centre: number; radius: number };

export type CantorStage = { k: number; holes: number; discs: CantorDisc[] };

type CantorInterval = Pick<CantorDisc, 'id' | 'parentId' | 'left' | 'right'>;

export const PARAMETERS = { R: 1.4, centre: 2.3, radius: .6 } as const;

const NET_RADII = [1.7, 2.1, 2.6, 3.4, 4.4] as const;

const STEP_PARAMETERS = [0, .25, .5, .75, 1] as const;

const TAU = 2 * Math.PI;

function parameterCheck(t: number): void {
  if (!Number.isFinite(t) || t < 0 || t > 1) throw new RangeError('The illustrated Joukowski family uses 0 ≤ t ≤ 1.');
}

export function joukowski(point: Point, t: number): Point {
  parameterCheck(t);

  if (t === 0) return { x: point.x, y: point.y };

  const squared = point.x * point.x + point.y * point.y;

  if (squared === 0) throw new RangeError('The Joukowski map has a pole at zero when t > 0.');

  return { x: point.x + t * point.x / squared, y: point.y - t * point.y / squared };
}

export function inverseJoukowski(point: Point, t: number): Point {
  parameterCheck(t);
  const real = point.x * point.x - point.y * point.y - 4 * t;
  const imaginary = 2 * point.x * point.y;
  const norm = Math.hypot(real, imaginary);
  const rootX = Math.sqrt(Math.max(0, (norm + real) / 2));
  const rootY = (imaginary < 0 ? -1 : 1) * Math.sqrt(Math.max(0, (norm - real) / 2));
  const first = { x: (point.x + rootX) / 2, y: (point.y + rootY) / 2 };
  const second = { x: (point.x - rootX) / 2, y: (point.y - rootY) / 2 };

  return Math.hypot(first.x, first.y) >= Math.hypot(second.x, second.y) ? first : second;
}

export function derivativeAt(point: Point, t: number): Point {
  parameterCheck(t);
  const squared = point.x * point.x + point.y * point.y;

  if (squared === 0) throw new RangeError('The illustrated derivative is evaluated away from zero.');

  return { x: 1 - t * (point.x * point.x - point.y * point.y) / (squared * squared), y: 2 * t * point.x * point.y / (squared * squared) };
}

export function circlePoints(centre: Point, radius: number, count = 240): Point[] {
  if (!(radius > 0) || !Number.isInteger(count) || count < 3) throw new RangeError('A sampled circle has a positive radius and at least three points.');

  return Array.from({ length: count }, (_, index) => {
    const angle = TAU * index / count;

    return { x: centre.x + radius * Math.cos(angle), y: centre.y + radius * Math.sin(angle) };
  });
}

function circleRun(radius: number, from: number, to: number): Point[] {
  const segments = Math.max(1, Math.ceil((to - from) / TAU * 240));

  return Array.from({ length: segments + 1 }, (_, index) => {
    const angle = from + (to - from) * index / segments;

    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
}

function rayRun(angle: number, from: number, to: number): Point[] {
  const segments = Math.max(1, Math.ceil((to - from) / (5 - PARAMETERS.R) * 60));

  return Array.from({ length: segments + 1 }, (_, index) => {
    const radius = from + (to - from) * index / segments;

    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
}

function netCurves(clipped: boolean): NetCurve[] {
  const curves: NetCurve[] = [];
  const { R, centre, radius } = PARAMETERS;

  for (const rho of NET_RADII) {
    const cosine = (rho * rho + centre * centre - radius * radius) / (2 * rho * centre);
    const cut = clipped && cosine < 1 ? Math.acos(Math.max(-1, cosine)) : 0;
    curves.push({ kind: 'circle', parameter: rho, runs: [circleRun(rho, cut, TAU - cut)] });
  }

  for (let index = 0; index < 16; index++) {
    const angle = TAU * index / 16;
    const projection = centre * Math.cos(angle);
    const discriminant = radius * radius - centre * centre * Math.sin(angle) ** 2;
    const runs: Point[][] = [];

    if (clipped && discriminant > 0) {
      const reach = Math.sqrt(discriminant);
      const before = Math.max(R, projection - reach);
      const after = Math.min(5, projection + reach);

      if (before < 5 && after > R && before < after) {
        if (before > R) runs.push(rayRun(angle, R, before));
        if (after < 5) runs.push(rayRun(angle, after, 5));
      } else runs.push(rayRun(angle, R, 5));
    } else runs.push(rayRun(angle, R, 5));

    curves.push({ kind: 'ray', parameter: angle, runs });
  }

  return curves;
}

export function countableHoles(count = 12): CountableDisc[] {
  if (!Number.isInteger(count) || count < 1) throw new RangeError('A finite countable-domain picture shows a positive integer number of discs.');

  return Array.from({ length: count }, (_, index) => {
    const k = index + 1;

    return { k, centre: 1 / k, radius: 1 / (3 * k * (k + 1)) };
  });
}

export function cantorStage(k: number): CantorStage {
  if (!Number.isInteger(k) || k < 0 || k > 7) throw new RangeError('The illustrated Cantor stages are the integers from zero through seven.');

  let intervals: CantorInterval[] = [{ id: '', parentId: null, left: 0, right: 1 }];

  for (let level = 0; level < k; level++) {
    const next: typeof intervals = [];

    for (const interval of intervals) {
      const third = (interval.right - interval.left) / 3;
      next.push({ id: interval.id + '0', parentId: interval.id, left: interval.left, right: interval.left + third });
      next.push({ id: interval.id + '1', parentId: interval.id, left: interval.right - third, right: interval.right });
    }

    intervals = next;
  }

  const discs = intervals.map(interval => ({ ...interval, centre: (interval.left + interval.right) / 2, radius: (interval.right - interval.left) / 4 }));

  return { k, holes: discs.length, discs };
}

export function radialSpread(boundary: readonly Point[], t: number): number {
  if (boundary.length === 0) throw new RangeError('Roundness uses a nonempty sampled boundary.');

  const mapped = boundary.map(point => joukowski(point, t));
  const centre = { x: 0, y: 0 };

  for (const point of mapped) {
    centre.x += point.x / mapped.length;
    centre.y += point.y / mapped.length;
  }

  let least = Infinity;
  let greatest = 0;
  let total = 0;

  for (const point of mapped) {
    const distance = Math.hypot(point.x - centre.x, point.y - centre.y);
    least = Math.min(least, distance);
    greatest = Math.max(greatest, distance);
    total += distance;
  }

  return (greatest - least) / (total / mapped.length);
}

function audit(net: readonly NetCurve[], hole1: readonly Point[], hole2: readonly Point[]): { maxInverseError: number; worstAngleError: number; minDerivativeMagnitude: number } {
  let maxInverseError = 0;
  let worstAngleError = 0;
  let minDerivativeMagnitude = Infinity;
  const h = 1e-6;

  for (const t of STEP_PARAMETERS) {
    for (const curve of net) {
      for (const run of curve.runs) {
        for (const point of run) {
          const restored = inverseJoukowski(joukowski(point, t), t);
          maxInverseError = Math.max(maxInverseError, Math.hypot(restored.x - point.x, restored.y - point.y));
        }
      }
    }

    for (const boundary of [hole1, hole2]) {
      for (const point of boundary) {
        const derivative = derivativeAt(point, t);
        minDerivativeMagnitude = Math.min(minDerivativeMagnitude, Math.hypot(derivative.x, derivative.y));
      }
    }

    for (const rho of NET_RADII) {
      for (let index = 0; index < 16; index++) {
        const theta = TAU * index / 16;
        const x = rho * Math.cos(theta);
        const y = rho * Math.sin(theta);

        if (Math.hypot(x - PARAMETERS.centre, y) < PARAMETERS.radius + .05) continue;

        const a = joukowski({ x: rho * Math.cos(theta + h), y: rho * Math.sin(theta + h) }, t);
        const b = joukowski({ x: rho * Math.cos(theta - h), y: rho * Math.sin(theta - h) }, t);
        const c = joukowski({ x: x * (1 + h), y: y * (1 + h) }, t);
        const d = joukowski({ x: x * (1 - h), y: y * (1 - h) }, t);
        const tangent = { x: a.x - b.x, y: a.y - b.y };
        const radial = { x: c.x - d.x, y: c.y - d.y };
        const cosine = (tangent.x * radial.x + tangent.y * radial.y) / (Math.hypot(tangent.x, tangent.y) * Math.hypot(radial.x, radial.y));
        const angle = Math.acos(Math.max(-1, Math.min(1, cosine)));
        worstAngleError = Math.max(worstAngleError, Math.abs(angle - Math.PI / 2));
      }
    }
  }

  return { maxInverseError, worstAngleError, minDerivativeMagnitude };
}

export function createHoleModel() {
  const hole1 = circlePoints({ x: 0, y: 0 }, PARAMETERS.R);
  const hole2 = circlePoints({ x: PARAMETERS.centre, y: 0 }, PARAMETERS.radius);
  const net = netCurves(true);
  const fullNet = netCurves(false);

  return {
    parameters: PARAMETERS,
    hole1,
    hole2,
    net,
    fullNet,
    roundness: STEP_PARAMETERS.map(t => ({ t, spread: radialSpread(hole2, t) })),
    audit: audit(net, hole1, hole2),
    countable: countableHoles(),
    cantor: Array.from({ length: 8 }, (_, k) => cantorStage(k)),
  };
}
